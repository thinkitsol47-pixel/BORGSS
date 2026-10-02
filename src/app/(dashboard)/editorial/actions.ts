"use server";

import { revalidatePath } from "next/cache";
import { db, isUuid } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/current-user";
import { recordAudit } from "@/lib/api/audit";
import {
  availableDecisions,
  decisionBlockedReason,
  getEditorialSubmissionById,
} from "@/lib/api/editorial";
import { decisionSchema } from "@/lib/validation/schemas";
import type { DecisionType } from "@/types";

/**
 * Editorial Server Actions.
 *
 * Phase 4: these write. The guard is repeated in each one — `/editorial/*`
 * pages call `requireGroup("editorial")`, but a Server Action is its own entry
 * point and can be invoked without the page ever loading.
 *
 * No email is sent from any of them. Mail works (since 2026-10-01), but the
 * decision letter, the reviewer invitation and the "a decision was reached"
 * notice have no templates or send calls yet; until they do, the screens say
 * the message goes out from the office by hand, and these actions only move
 * the database.
 */

/** Prisma's enums are camelCase; `src/types` and the forms use kebab-case. */
function kebabToCamel(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** The decision letter is stored as paragraphs; the form is one textarea. */
function toParagraphs(letter: string): string[] {
  return letter
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}

/* ================================================================== *
 * Recording a decision.
 * ================================================================== */

export type DecisionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  /** Echoed back so the outcome screen can name what was decided. */
  decision?: string;
};

function fieldErrors(error: {
  issues: { path: (string | number)[]; message: string }[];
}) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Where a decision moves the submission's status, and whether the round bumps. */
const DECISION_EFFECT: Record<
  DecisionType,
  { status: string; nextRound: boolean; revisionDue: boolean }
> = {
  accept: { status: "accepted", nextRound: false, revisionDue: false },
  "minor-revision": {
    status: "revisionRequested",
    nextRound: true,
    revisionDue: true,
  },
  "major-revision": {
    status: "revisionRequested",
    nextRound: true,
    revisionDue: true,
  },
  reject: { status: "rejected", nextRound: false, revisionDue: false },
  "desk-reject": { status: "deskRejected", nextRound: false, revisionDue: false },
};

/** The journal's default revision window. */
const REVISION_DAYS = 42;

export async function recordDecision(
  _prev: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  await requireGroup("editorial");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const submissionId = raw.submissionId ?? "";

  // A decision letter can be an hour's writing. Every failure path below echoes
  // it back — losing it to a bad submit would be unforgivable.
  const values: Record<string, string> = {
    decision: raw.decision ?? "",
    letter: raw.letter ?? "",
    internalNote: raw.internalNote ?? "",
  };

  const parsed = decisionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const submission = await getEditorialSubmissionById(submissionId);
  if (!submission) {
    return {
      status: "error",
      message: "That manuscript could not be found.",
      values,
    };
  }

  // The page guards on these too, but the form posts to this action directly.
  const blocked = decisionBlockedReason(submission);
  if (blocked) {
    return { status: "error", message: blocked, values };
  }

  const decision = parsed.data.decision as DecisionType;
  if (!availableDecisions(submission).includes(decision)) {
    return {
      status: "error",
      message: "That decision is not available for this manuscript at its current stage.",
      values,
    };
  }

  const effect = DECISION_EFFECT[decision];
  const user = await getCurrentUser();
  const decidedById = user && isUuid(user.id) ? user.id : null;
  if (!decidedById) {
    return {
      status: "error",
      message:
        "Your account could not be resolved. Sign in again before recording a decision.",
      values,
    };
  }

  const revisionDueAt = effect.revisionDue
    ? new Date(Date.now() + REVISION_DAYS * 86_400_000)
    : null;

  // One transaction: the decision row and the status move land together or not
  // at all. A half-recorded decision (letter stored, status unchanged) would
  // leave the queue lying about whose desk the manuscript is on.
  await db.$transaction(async (tx) => {
    await tx.submissionDecision.create({
      data: {
        submissionId: submission.id,
        type: kebabToCamel(decision) as never,
        round: submission.round,
        decidedById,
        letter: toParagraphs(parsed.data.letter),
        internalNote: parsed.data.internalNote || null,
      },
    });

    await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: effect.status as never,
        round: effect.nextRound ? { increment: 1 } : undefined,
        revisionDueAt: effect.revisionDue ? revisionDueAt : null,
      },
    });

    // Acceptance is the handover to production, and nothing performed it.
    // `productionJob.create` existed only in the seed, so every job in the
    // database arrived with the fixtures: a manuscript accepted through this
    // action became `accepted` and then appeared on no production screen at
    // all, because those screens are reached through a `ProductionJob` that
    // was never created. The editor saw a decision recorded; production saw
    // nothing arrive.
    //
    // Inside the same transaction as the decision, so a manuscript can never
    // be accepted without its job, or carry a job for a decision that rolled
    // back.
    if (effect.status === "accepted") {
      // `submissionId` is `@unique`. A second acceptance — a reopened
      // decision, a double submit — must not fail the whole transaction, and
      // must not produce a second job. The existing one is kept as it is:
      // it may already carry stages, galleys and corrections.
      const existingJob = await tx.productionJob.findUnique({
        where: { submissionId: submission.id },
        select: { id: true },
      });

      if (!existingJob) {
        const job = await tx.productionJob.create({
          data: { submissionId: submission.id },
        });

        // All three stages up front, each `notStarted`. The production queue
        // reads progress as "done of three" and `currentStage()` walks them
        // in order, so a job with no stage rows reads as finished rather than
        // as not started — the empty case and the complete case would be
        // indistinguishable.
        await tx.productionStageRecord.createMany({
          data: (["copyedit", "galleys", "proofread"] as const).map(
            (stage) => ({ jobId: job.id, stage }),
          ),
        });
      }
    }
  });

  await recordAudit({
    action: "decision.recorded",
    targetType: "submission",
    targetId: submission.id,
    detail: { reference: submission.reference, decision, round: submission.round },
  });

  revalidatePath("/editorial/queue");
  revalidatePath(`/editorial/${submission.id}`);
  revalidatePath(`/editorial/${submission.id}/decision`);
  revalidatePath("/dashboard");
  // An acceptance puts a new job on the production queue; without this the
  // production editor keeps seeing the list as it was before the handover.
  revalidatePath("/production");
  revalidatePath(`/editorial/${submission.id}/production`);

  return {
    status: "success",
    decision,
    message:
      "The decision is recorded and the manuscript's status has moved. No letter has been sent — the portal does not send decision letters yet, so it goes out from the editorial office by email.",
    values,
  };
}

/* ================================================================== *
 * Reviewer assignment.
 * ================================================================== */

export type AssignmentState = { ok: boolean; error?: string };

/**
 * Invite a reviewer to the manuscript's current round.
 *
 * No email — the invitation itself goes out from the office by hand. What this
 * records is that the reviewer was approached, with the due date and the
 * editor's note, so the reviewers page and the decision screen stay honest
 * about who is on the manuscript.
 */
export async function inviteReviewer(
  _prev: AssignmentState,
  formData: FormData,
): Promise<AssignmentState> {
  await requireGroup("editorial");

  const submissionId = String(formData.get("submissionId") ?? "");
  const reviewerId = String(formData.get("reviewerId") ?? "");
  const dueRaw = String(formData.get("dueAt") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const submission = await getEditorialSubmissionById(submissionId);
  if (!submission) return { ok: false, error: "That manuscript could not be found." };

  if (!isUuid(reviewerId)) return { ok: false, error: "Choose a reviewer to invite." };
  const reviewer = await db.user.findUnique({
    where: { id: reviewerId },
    include: { roles: true },
  });
  if (!reviewer || !reviewer.roles.some((r) => r.role === "reviewer")) {
    return { ok: false, error: "That person is not in the reviewer pool." };
  }

  // No double invitation in the same round. An earlier round, or a withdrawn
  // invitation, does not block a fresh one.
  const clash = await db.reviewAssignment.findFirst({
    where: {
      submissionId: submission.id,
      reviewerId,
      round: submission.round,
      status: { notIn: ["withdrawn"] },
    },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, error: "That reviewer is already assigned for this round." };
  }

  // Shared affiliation is the one conflict this can check — same limit the
  // matching screen states on the page.
  const authorAffiliations = new Set(
    submission.contributors.flatMap((c) =>
      c.affiliations.map((a) => a.name.toLowerCase()),
    ),
  );
  const reviewerAff = (reviewer.affiliation ?? "").toLowerCase();
  if (reviewerAff && authorAffiliations.has(reviewerAff)) {
    return {
      ok: false,
      error: "That reviewer shares an affiliation with an author.",
    };
  }

  const dueAt = dueRaw ? new Date(dueRaw) : null;
  if (dueRaw && Number.isNaN(dueAt!.getTime())) {
    return { ok: false, error: "That due date is not valid." };
  }

  // Label is the next free "Reviewer N" across the whole manuscript, not just
  // this round — a label has to mean the same person a year later, in a
  // decision letter, so it is never reused.
  const existing = await db.reviewAssignment.count({
    where: { submissionId: submission.id },
  });
  const label = `Reviewer ${existing + 1}`;

  await db.reviewAssignment.create({
    data: {
      submissionId: submission.id,
      reviewerId,
      label,
      round: submission.round,
      status: "invited",
      dueAt,
      invitationNote: note || null,
    },
  });

  await recordAudit({
    action: "review.invited",
    targetType: "submission",
    targetId: submission.id,
    detail: { reference: submission.reference, label, round: submission.round },
  });

  revalidatePath(`/editorial/${submission.id}/reviewers`);
  revalidatePath(`/editorial/${submission.id}`);
  return { ok: true };
}

/**
 * Withdraw an invitation or an accepted assignment.
 *
 * The row is kept and moved to `withdrawn`, not deleted: the next editor needs
 * to see the reviewer was approached and released. A reviewer who has already
 * reported cannot be withdrawn — the report is part of the record.
 */
export async function withdrawAssignment(
  _prev: AssignmentState,
  formData: FormData,
): Promise<AssignmentState> {
  await requireGroup("editorial");

  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!isUuid(assignmentId)) {
    return { ok: false, error: "That assignment could not be found." };
  }

  const assignment = await db.reviewAssignment.findUnique({
    where: { id: assignmentId },
    include: { submission: { select: { id: true, reference: true } }, report: { select: { id: true } } },
  });
  if (!assignment) {
    return { ok: false, error: "That assignment could not be found." };
  }
  if (assignment.report) {
    return {
      ok: false,
      error: "That reviewer has already returned a report, which stays on the record.",
    };
  }
  if (assignment.status === "withdrawn") {
    return { ok: false, error: "That invitation is already withdrawn." };
  }

  await db.reviewAssignment.update({
    where: { id: assignmentId },
    data: { status: "withdrawn" },
  });

  await recordAudit({
    action: "review.withdrawn",
    targetType: "submission",
    targetId: assignment.submission.id,
    detail: { reference: assignment.submission.reference, label: assignment.label },
  });

  revalidatePath(`/editorial/${assignment.submission.id}/reviewers`);
  revalidatePath(`/editorial/${assignment.submission.id}`);
  return { ok: true };
}
