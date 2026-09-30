"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { isStorageConfigured, putFile } from "@/lib/storage";
import {
  MAX_FILE_BYTES,
  correctionAddSchema,
  correctionDeclineSchema,
  galleyUploadSchema,
  stageAssignSchema,
} from "@/lib/validation/schemas";
import type { ProductionStage, StageState } from "@/types";

/**
 * Production Server Actions.
 *
 * Phase 4/5: these write. Every one re-guards with `requireGroup("production")`
 * — the screens already guard, but a Server Action is its own entry point and
 * can be invoked without the page that renders its form ever loading. Same
 * reasoning as `recordDecision` in editorial.
 *
 * **No email is sent from any of them.** "Send to author" records that the
 * stage went out and when; the file itself still travels by email until the
 * journal owns a domain. The screens say so, and `sentToAuthorAt` is what the
 * queue ages the wait from — so the record is useful even while the message is
 * manual.
 */

export type ProductionState =
  | { status: "idle" }
  | { status: "error"; message: string; errors?: Record<string, string> }
  | { status: "success"; message: string };

const NOT_FOUND: ProductionState = {
  status: "error",
  message: "That manuscript is not in production, or the link is stale.",
};

/** Prisma's enums are camelCase; `src/types` uses kebab-case wire values. */
function toPrismaStage(stage: ProductionStage) {
  return stage === "copyedit"
    ? "copyedit"
    : stage === "galleys"
      ? "galleys"
      : "proofread";
}

function toPrismaState(state: StageState) {
  return state === "not-started"
    ? "notStarted"
    : state === "in-progress"
      ? "inProgress"
      : state === "with-author"
        ? "withAuthor"
        : "done";
}

const STAGES: ProductionStage[] = ["copyedit", "galleys", "proofread"];

function parseStage(value: string): ProductionStage | null {
  return STAGES.includes(value as ProductionStage)
    ? (value as ProductionStage)
    : null;
}

/**
 * The job for a submission id, or null.
 *
 * Every action re-reads it rather than trusting the id in the form — the same
 * rule `ownedDraft()` applies in the wizard. A stale tab holding a job that has
 * since been published must not be able to write to it.
 */
async function jobFor(submissionId: string) {
  if (!isUuid(submissionId)) return null;
  return db.productionJob.findUnique({
    where: { submissionId },
    select: { id: true, submissionId: true, submission: { select: { reference: true } } },
  });
}

/** The four paths every stage screen revalidates after a write. */
function revalidateJob(submissionId: string) {
  revalidatePath("/production");
  revalidatePath(`/production/${submissionId}/copyedit`);
  revalidatePath(`/production/${submissionId}/galleys`);
  revalidatePath(`/production/${submissionId}/proofread`);
}

/**
 * Move one stage to a new state.
 *
 * The single writer for every stage transition, because the transitions differ
 * only in which timestamp they set — writing five near-identical actions is how
 * `startedAt` ends up set on one path and forgotten on another.
 *
 * `upsert`, not `update`: a job's three stage rows are created lazily, so the
 * first thing that happens to a stage nobody has touched is its creation.
 * `@@unique([jobId, stage])` is what makes that safe under a double click.
 */
async function moveStage(params: {
  submissionId: string;
  stage: ProductionStage;
  state: StageState;
  assignedToId?: string | null;
  dueAt?: Date | null;
  action: string;
}): Promise<ProductionState> {
  const job = await jobFor(params.submissionId);
  if (!job) return NOT_FOUND;

  const now = new Date();
  const stage = toPrismaStage(params.stage);
  const state = toPrismaState(params.state);

  // Which timestamps this transition owns. Each is set only by the move that
  // makes it true, and `sentToAuthorAt` is cleared when the work comes back —
  // otherwise the queue would keep ageing a wait that has ended.
  const timestamps: Prisma.ProductionStageRecordUncheckedUpdateInput = {};
  if (params.state === "in-progress") {
    timestamps.startedAt = now;
    timestamps.sentToAuthorAt = null;
  }
  if (params.state === "with-author") timestamps.sentToAuthorAt = now;
  if (params.state === "done") timestamps.completedAt = now;
  if (params.state === "not-started") {
    // Reopening: the completion is undone, because it is no longer true.
    timestamps.completedAt = null;
    timestamps.sentToAuthorAt = null;
  }

  await db.productionStageRecord.upsert({
    where: { jobId_stage: { jobId: job.id, stage } },
    create: {
      jobId: job.id,
      stage,
      state,
      assignedToId: params.assignedToId ?? null,
      dueAt: params.dueAt ?? null,
      startedAt: params.state === "in-progress" ? now : null,
      sentToAuthorAt: params.state === "with-author" ? now : null,
      completedAt: params.state === "done" ? now : null,
      notes: [],
    },
    update: {
      state,
      ...(params.assignedToId !== undefined
        ? { assignedToId: params.assignedToId }
        : {}),
      ...(params.dueAt !== undefined ? { dueAt: params.dueAt } : {}),
      ...timestamps,
    },
  });

  await recordAudit({
    action: params.action,
    targetType: "production",
    targetId: job.submissionId,
    detail: {
      reference: job.submission.reference,
      stage: params.stage,
      state: params.state,
    },
  });

  revalidateJob(params.submissionId);
  return { status: "success", message: "" };
}

/* ------------------------------------------------------------------ *
 * Stage transitions.
 * ------------------------------------------------------------------ */

export async function assignStage(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = stageAssignSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose who is picking this up.",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  }

  const stage = parseStage(parsed.data.stage);
  if (!stage) return NOT_FOUND;

  // The assignee must be a real account, and one that does production work.
  // A free-text name would put a person on a stage who cannot open it.
  const assignee = await db.user.findFirst({
    where: {
      id: parsed.data.assignedToId,
      roles: {
        some: {
          role: {
            in: ["superAdmin", "admin", "journalManager", "copyeditor", "layoutEditor", "proofreader"],
          },
        },
      },
    },
    select: { id: true, name: true },
  });

  if (!assignee) {
    return {
      status: "error",
      message: "That account cannot hold a production stage.",
      errors: { assignedToId: "Choose someone from the production team." },
    };
  }

  const result = await moveStage({
    submissionId: parsed.data.submissionId,
    stage,
    state: "in-progress",
    assignedToId: assignee.id,
    dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    action: "production.stage.assigned",
  });

  if (result.status !== "success") return result;

  return {
    status: "success",
    message: `Assigned to ${assignee.name}. The stage has started.`,
  };
}

export async function sendStageToAuthor(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const submissionId = String(formData.get("submissionId") ?? "");
  const stage = parseStage(String(formData.get("stage") ?? ""));
  if (!stage) return NOT_FOUND;

  const result = await moveStage({
    submissionId,
    stage,
    state: "with-author",
    action: "production.stage.sentToAuthor",
  });

  if (result.status !== "success") return result;

  // Deliberately does not claim the author was emailed. The row records that
  // it went out and when; the message itself is still sent by hand.
  return {
    status: "success",
    message:
      "Recorded as with the author. No email was sent — send the file from the editorial office, quoting the reference.",
  };
}

export async function completeStage(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const submissionId = String(formData.get("submissionId") ?? "");
  const stage = parseStage(String(formData.get("stage") ?? ""));
  if (!stage) return NOT_FOUND;

  const result = await moveStage({
    submissionId,
    stage,
    state: "done",
    action: "production.stage.completed",
  });

  if (result.status !== "success") return result;
  return { status: "success", message: "Stage marked complete." };
}

/**
 * The author replied.
 *
 * Approval finishes the stage; requested changes send it back to whoever holds
 * it. Two outcomes through one action because they are the two answers to one
 * question, and a screen that offered them separately could record neither.
 */
export async function recordAuthorReply(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const submissionId = String(formData.get("submissionId") ?? "");
  const stage = parseStage(String(formData.get("stage") ?? ""));
  const approved = String(formData.get("reply") ?? "") === "approved";
  if (!stage) return NOT_FOUND;

  const result = await moveStage({
    submissionId,
    stage,
    state: approved ? "done" : "in-progress",
    action: approved
      ? "production.stage.authorApproved"
      : "production.stage.changesRequested",
  });

  if (result.status !== "success") return result;

  return {
    status: "success",
    message: approved
      ? "The author approved it. The stage is complete."
      : "Recorded. The stage is back with production.",
  };
}

export async function reopenStage(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const submissionId = String(formData.get("submissionId") ?? "");
  const stage = parseStage(String(formData.get("stage") ?? ""));
  if (!stage) return NOT_FOUND;

  // Back to in-progress, not not-started: somebody still holds it, and the
  // record that it was once completed stays in the audit trail.
  const result = await moveStage({
    submissionId,
    stage,
    state: "in-progress",
    action: "production.stage.reopened",
  });

  if (result.status !== "success") return result;
  return {
    status: "success",
    message: "Stage reopened. The earlier completion stays in the audit log.",
  };
}

/* ------------------------------------------------------------------ *
 * Galleys.
 * ------------------------------------------------------------------ */

/**
 * Upload one galley.
 *
 * **The version is derived, never accepted from the form.** It is one higher
 * than the highest existing version for this job, computed here — letting a
 * client send it is how two files end up claiming to be version 2, which is
 * exactly what the versioning exists to prevent.
 *
 * The file goes to `putFile`, so it is `type: "authenticated"` like every
 * manuscript: a galley of an unpublished paper is as confidential as the
 * manuscript it was made from. Reads go through `/files/galley/<id>`.
 */
export async function uploadGalley(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  const parsed = galleyUploadSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose a format and a file.",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  }

  const job = await jobFor(parsed.data.submissionId);
  if (!job) return NOT_FOUND;

  if (!isStorageConfigured()) {
    return {
      status: "error",
      message:
        "File storage is not configured, so nothing was uploaded. Contact the editorial office.",
    };
  }

  const file = formData
    .getAll("file")
    .find((v): v is File => v instanceof File && v.size > 0);

  if (!file) {
    return {
      status: "error",
      message: "That file did not reach the server. Choose it again.",
      errors: { file: "No file was received." },
    };
  }

  // Re-checked server-side: the form warns first, but an action is reachable
  // without the form.
  if (file.size > MAX_FILE_BYTES) {
    return {
      status: "error",
      message: `${file.name} is over ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`,
      errors: { file: "Too large." },
    };
  }

  // Derived, under the unique constraint that backs it up.
  const highest = await db.productionGalley.findFirst({
    where: { jobId: job.id },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (highest?.version ?? 0) + 1;

  const put = await putFile({
    content: Buffer.from(await file.arrayBuffer()),
    folder: `submissions/${job.submissionId}/galleys`,
    // Deterministic and format-scoped, so a PDF and an XML of the same version
    // cannot overwrite one another.
    name: `${parsed.data.format}-v${version}`,
  });

  if (!put.ok) {
    return {
      status: "error",
      message: `${file.name} could not be uploaded. Please try again.`,
    };
  }

  await db.productionGalley.create({
    data: {
      jobId: job.id,
      format: parsed.data.format,
      version,
      storagePath: put.publicId,
      sizeBytes: BigInt(put.bytes),
    },
  });

  await recordAudit({
    action: "production.galley.uploaded",
    targetType: "production",
    targetId: job.submissionId,
    detail: {
      reference: job.submission.reference,
      format: parsed.data.format,
      version,
    },
  });

  revalidateJob(parsed.data.submissionId);

  return {
    status: "success",
    message: `Version ${version} uploaded and stored confidentially.`,
  };
}

/**
 * Mark one galley as the version that will be published.
 *
 * Only one galley per format can be final, so the others in that format are
 * cleared in the same transaction. Two finals is not a state anyone could
 * resolve later from the data alone.
 */
export async function markGalleyFinal(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const galleyId = String(formData.get("galleyId") ?? "");
  const submissionId = String(formData.get("submissionId") ?? "");
  if (!isUuid(galleyId)) return NOT_FOUND;

  const galley = await db.productionGalley.findUnique({
    where: { id: galleyId },
    select: { id: true, jobId: true, format: true, version: true },
  });
  if (!galley) return NOT_FOUND;

  await db.$transaction([
    db.productionGalley.updateMany({
      where: { jobId: galley.jobId, format: galley.format },
      data: { isFinal: false },
    }),
    db.productionGalley.update({
      where: { id: galley.id },
      data: { isFinal: true },
    }),
  ]);

  await recordAudit({
    action: "production.galley.markedFinal",
    targetType: "production",
    targetId: submissionId,
    detail: { format: galley.format, version: galley.version },
  });

  revalidateJob(submissionId);

  return {
    status: "success",
    message: `Version ${galley.version} is now the final ${galley.format.toUpperCase()}.`,
  };
}

/* ------------------------------------------------------------------ *
 * Proof corrections.
 * ------------------------------------------------------------------ */

/**
 * Raise a correction against the proof.
 *
 * `location` and `description` are separate columns as of
 * `20260914120000_proof_correction_fields`. They used to share one string,
 * which a form cannot safely re-encode — any description containing ": "
 * round-tripped wrong.
 */
export async function addCorrection(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = correctionAddSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  }

  const job = await jobFor(parsed.data.submissionId);
  if (!job) return NOT_FOUND;

  await db.proofCorrection.create({
    data: {
      jobId: job.id,
      location: parsed.data.location,
      description: parsed.data.description,
      raisedBy: parsed.data.raisedBy,
    },
  });

  await recordAudit({
    action: "production.correction.added",
    targetType: "production",
    targetId: job.submissionId,
    detail: {
      reference: job.submission.reference,
      location: parsed.data.location,
      raisedBy: parsed.data.raisedBy,
    },
  });

  revalidateJob(parsed.data.submissionId);
  return { status: "success", message: "Correction added." };
}

/**
 * The correction, and the job it belongs to.
 *
 * Read together so a correction id from one manuscript cannot be resolved
 * against another's screen — the same reason every other action here re-reads
 * rather than trusting the form.
 */
async function correctionFor(correctionId: string) {
  if (!isUuid(correctionId)) return null;
  return db.proofCorrection.findUnique({
    where: { id: correctionId },
    select: {
      id: true,
      location: true,
      applied: true,
      declinedReason: true,
      job: { select: { submissionId: true, submission: { select: { reference: true } } } },
    },
  });
}

/** Mark one correction applied. */
export async function applyCorrection(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const correctionId = String(formData.get("correctionId") ?? "");
  const submissionId = String(formData.get("submissionId") ?? "");

  const correction = await correctionFor(correctionId);
  if (!correction) return NOT_FOUND;

  await db.proofCorrection.update({
    where: { id: correction.id },
    // Clearing the reason matters: a correction that was declined and is now
    // being applied must not keep the refusal that no longer happened.
    data: { applied: true, declinedReason: null },
  });

  await recordAudit({
    action: "production.correction.applied",
    targetType: "production",
    targetId: correction.job.submissionId,
    detail: {
      reference: correction.job.submission.reference,
      location: correction.location,
    },
  });

  revalidateJob(submissionId || correction.job.submissionId);
  return { status: "success", message: "Marked applied." };
}

/**
 * Decline one correction, with its reason.
 *
 * The reason is required by the schema and has a floor. A refusal nobody can
 * explain later is not defensible against an author's query, and asking for
 * the reason afterwards means it never gets written.
 */
export async function declineCorrection(
  _prev: ProductionState,
  formData: FormData,
): Promise<ProductionState> {
  await requireGroup("production");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = correctionDeclineSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "A declined correction needs a reason.",
      errors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      ),
    };
  }

  const correction = await correctionFor(parsed.data.correctionId);
  if (!correction) return NOT_FOUND;

  await db.proofCorrection.update({
    where: { id: correction.id },
    data: { applied: false, declinedReason: parsed.data.reason },
  });

  await recordAudit({
    action: "production.correction.declined",
    targetType: "production",
    targetId: correction.job.submissionId,
    detail: {
      reference: correction.job.submission.reference,
      location: correction.location,
      reason: parsed.data.reason,
    },
  });

  revalidateJob(parsed.data.submissionId);
  return {
    status: "success",
    message: "Declined, with the reason recorded against the correction.",
  };
}

/*
 * No re-export of `GALLEY_FILE_TYPES` here, deliberately.
 *
 * This file carries `"use server"`, and such a module may export **async
 * functions only** — every export becomes a callable server endpoint, so a
 * string cannot be one. Re-exporting the constant threw
 * "A 'use server' file can only export async functions, found string" at
 * runtime.
 *
 * It was never needed: `production-actions.tsx` imports the constant straight
 * from `@/lib/validation/schemas`, which is where it lives.
 */
