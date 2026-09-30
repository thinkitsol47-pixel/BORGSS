"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { IssueState, Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { issueSchema } from "@/lib/validation/schemas";

/**
 * Issue planning — the write half of `/editorial/issues`.
 *
 * The readers in `lib/api/editorial.ts` have queried these two tables since
 * phase 3; until now nothing wrote to them. The guard is repeated in every
 * action for the reason given in `../actions.ts`: a Server Action is its own
 * entry point and can be invoked without the page that renders its form ever
 * loading.
 *
 * **Publishing an issue is not here, deliberately.** It mints a DOI for every
 * article it carries and the journal has no Crossref prefix, so `issueSchema`
 * does not accept `published` and no action sets it. An issue seeded as
 * published stays readable and its contents are locked from editing, which is
 * what the screens already do.
 *
 * **Two tables carry "which issue is this in", and both are kept in step.**
 * `IssuePlanItem` is the table of contents and its running order;
 * `ProductionJob.issueId` is what the production queue reads to show a job its
 * target date. Writing one without the other would leave a manuscript placed
 * in an issue whose production row shows no deadline — nothing breaks, but the
 * queue quietly stops answering the question it exists for. So every placement
 * and removal writes both, in one transaction.
 */

/* ------------------------------------------------------------------ *
 * Shared shapes.
 * ------------------------------------------------------------------ */

export type IssueFormState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

/** A placement control reports only success or one sentence of failure. */
export type PlacementState = { ok: true } | { ok: false; error: string };

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

/** Prisma's `IssueState` is camelCase; the form and `src/types` are kebab. */
function toPrismaState(state: "planned" | "in-production"): IssueState {
  return state === "in-production" ? IssueState.inProduction : IssueState.planned;
}

/**
 * Only these two statuses may be placed.
 *
 * Re-checked here rather than trusted from the form: the available list is
 * rendered by the page, but this action can be called without it.
 */
const PLACEABLE = ["accepted", "inProduction"] as const;

function isUniqueViolation(e: unknown): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

function revalidateIssue(issueId: string) {
  revalidatePath("/editorial/issues");
  revalidatePath(`/editorial/issues/${issueId}`);
}

/* ================================================================== *
 * Creating and editing an issue.
 * ================================================================== */

/**
 * Create an issue, or save changes to one.
 *
 * `issueId` in the form data decides which. Volume and number are unique
 * together, and that collision is reported against the fields rather than
 * thrown: an editor who types an existing pair has made an ordinary mistake,
 * not caused a server error.
 *
 * On success this redirects by returning `idle` with no message and letting
 * the caller navigate — the form does the `redirect()` so an error can be
 * rendered in place.
 */
export async function saveIssue(
  _prev: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  await requireGroup("editorial");

  const issueId = String(formData.get("issueId") ?? "").trim();
  const isEdit = issueId.length > 0;
  if (isEdit && !isUuid(issueId)) {
    return { status: "error", message: "That issue could not be found." };
  }

  const raw = {
    volume: String(formData.get("volume") ?? ""),
    number: String(formData.get("number") ?? ""),
    year: String(formData.get("year") ?? ""),
    title: String(formData.get("title") ?? ""),
    targetDate: String(formData.get("targetDate") ?? ""),
    plannedArticles: String(formData.get("plannedArticles") ?? ""),
    state: String(formData.get("state") ?? ""),
  };

  const parsed = issueSchema.safeParse({
    ...raw,
    // An empty optional number must not coerce to 0.
    plannedArticles: raw.plannedArticles === "" ? undefined : raw.plannedArticles,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the fields marked below.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const data = {
    volume: parsed.data.volume,
    number: parsed.data.number,
    year: parsed.data.year,
    title: parsed.data.title?.trim() ? parsed.data.title.trim() : null,
    targetDate: new Date(parsed.data.targetDate),
    plannedArticles: parsed.data.plannedArticles ?? null,
    state: toPrismaState(parsed.data.state),
  };

  const label = `Vol. ${data.volume}, No. ${data.number} (${data.year})`;

  /* Set inside the try, acted on after it. `redirect()` works by throwing, so
     calling it in there would hand Next's own control-flow exception to the
     `catch` below and be reported to the editor as a failed save. */
  let savedId: string | null = null;

  try {
    if (isEdit) {
      const existing = await db.editorialIssue.findUnique({
        where: { id: issueId },
        select: { state: true },
      });
      if (!existing) {
        return { status: "error", message: "That issue could not be found." };
      }
      // A published issue is a citation other people have already made. Its
      // identity cannot be edited from here, and nothing in the app unpublishes
      // one — the screens hide the controls, and this refuses in case they do not.
      if (existing.state === "published") {
        return {
          status: "error",
          message:
            "That issue is published. Its volume, number and year appear in every citation of every article it carries, so they cannot be changed here.",
          values: raw,
        };
      }

      await db.editorialIssue.update({ where: { id: issueId }, data });
      await recordAudit({
        action: "issue.updated",
        targetType: "issue",
        targetId: issueId,
        detail: { label, state: data.state },
      });
      revalidateIssue(issueId);
      savedId = issueId;
    } else {
      const created = await db.editorialIssue.create({
        data,
        select: { id: true },
      });
      await recordAudit({
        action: "issue.created",
        targetType: "issue",
        targetId: created.id,
        detail: { label, state: data.state },
      });
      revalidateIssue(created.id);
      savedId = created.id;
    }
  } catch (e) {
    if (isUniqueViolation(e)) {
      return {
        status: "error",
        message: `${label.replace(` (${data.year})`, "")} already exists. Every issue has its own volume and number.`,
        errors: {
          volume: "This volume and number pair is already taken.",
          number: "This volume and number pair is already taken.",
        },
        values: raw,
      };
    }
    throw e;
  }

  // The issue's own screen, not the list: after creating one the next thing an
  // editor does is place manuscripts into it, and after editing one they want
  // to see the change against its contents.
  redirect(`/editorial/issues/${savedId}`);
}

/* ================================================================== *
 * Placing, removing and reordering.
 * ================================================================== */

/**
 * Place an accepted manuscript at the end of an issue's running order.
 *
 * Position is `max + 1` rather than the row count, so a concurrent removal
 * cannot hand two manuscripts the same slot.
 */
export async function placeInIssue(
  _prev: PlacementState,
  formData: FormData,
): Promise<PlacementState> {
  await requireGroup("editorial");

  const issueId = String(formData.get("issueId") ?? "");
  const submissionId = String(formData.get("submissionId") ?? "");
  if (!isUuid(issueId) || !isUuid(submissionId)) {
    return { ok: false, error: "That manuscript could not be placed." };
  }

  const [issue, submission] = await Promise.all([
    db.editorialIssue.findUnique({
      where: { id: issueId },
      select: { id: true, state: true, volume: true, number: true, year: true },
    }),
    db.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, reference: true, status: true },
    }),
  ]);

  if (!issue) return { ok: false, error: "That issue could not be found." };
  if (!submission) {
    return { ok: false, error: "That manuscript could not be found." };
  }
  if (issue.state === "published") {
    return {
      ok: false,
      error: "That issue is published. Its contents are fixed.",
    };
  }
  if (!PLACEABLE.includes(submission.status as (typeof PLACEABLE)[number])) {
    return {
      ok: false,
      error:
        "Only an accepted manuscript can be placed in an issue. This one has not been accepted.",
    };
  }

  const last = await db.issuePlanItem.findFirst({
    where: { editorialIssueId: issueId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  try {
    await db.$transaction([
      db.issuePlanItem.create({
        data: {
          editorialIssueId: issueId,
          submissionId,
          position: (last?.position ?? 0) + 1,
        },
      }),
      // The production queue reads this to show the job its target date.
      db.productionJob.updateMany({
        where: { submissionId },
        data: { issueId },
      }),
    ]);
  } catch (e) {
    if (isUniqueViolation(e)) {
      // `IssuePlanItem.submissionId` is unique: one manuscript, one issue.
      const placed = await db.issuePlanItem.findUnique({
        where: { submissionId },
        select: {
          editorialIssue: { select: { volume: true, number: true, year: true } },
        },
      });
      const where = placed
        ? `Vol. ${placed.editorialIssue.volume}, No. ${placed.editorialIssue.number} (${placed.editorialIssue.year})`
        : "another issue";
      return {
        ok: false,
        error: `That manuscript is already in ${where}. Remove it from there first.`,
      };
    }
    throw e;
  }

  await recordAudit({
    action: "issue.item.placed",
    targetType: "issue",
    targetId: issueId,
    detail: {
      label: `Vol. ${issue.volume}, No. ${issue.number} (${issue.year})`,
      reference: submission.reference,
    },
  });

  revalidateIssue(issueId);
  revalidatePath("/production");
  return { ok: true };
}

/**
 * Take a manuscript back out of an issue.
 *
 * The remaining positions are closed up rather than left with a hole. A gap is
 * invisible on screen — the list renders in order either way — and it breaks
 * the reorder controls quietly, which is the worst way for it to break.
 */
export async function removeFromIssue(
  _prev: PlacementState,
  formData: FormData,
): Promise<PlacementState> {
  await requireGroup("editorial");

  const issueId = String(formData.get("issueId") ?? "");
  const submissionId = String(formData.get("submissionId") ?? "");
  if (!isUuid(issueId) || !isUuid(submissionId)) {
    return { ok: false, error: "That placement could not be found." };
  }

  const item = await db.issuePlanItem.findUnique({
    where: { submissionId },
    include: {
      editorialIssue: {
        select: { id: true, state: true, volume: true, number: true, year: true },
      },
      submission: { select: { reference: true } },
    },
  });
  if (!item || item.editorialIssueId !== issueId) {
    return { ok: false, error: "That placement could not be found." };
  }
  if (item.editorialIssue.state === "published") {
    return {
      ok: false,
      error: "That issue is published. Its contents are fixed.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.issuePlanItem.delete({ where: { id: item.id } });
    // Close the gap: everything after the removed row moves up one.
    await tx.issuePlanItem.updateMany({
      where: { editorialIssueId: issueId, position: { gt: item.position } },
      data: { position: { decrement: 1 } },
    });
    await tx.productionJob.updateMany({
      where: { submissionId },
      data: { issueId: null },
    });
  });

  await recordAudit({
    action: "issue.item.removed",
    targetType: "issue",
    targetId: issueId,
    detail: {
      label: `Vol. ${item.editorialIssue.volume}, No. ${item.editorialIssue.number} (${item.editorialIssue.year})`,
      reference: item.submission.reference,
    },
  });

  revalidateIssue(issueId);
  revalidatePath("/production");
  return { ok: true };
}

/**
 * Move a placement one step up or down the running order.
 *
 * The two rows swap positions inside a transaction, through a temporary
 * negative value: `position` is not unique in the schema, but a swap that
 * briefly duplicates a value would be a trap for whoever adds that constraint,
 * and the temporary costs one statement.
 */
export async function moveIssueItem(
  _prev: PlacementState,
  formData: FormData,
): Promise<PlacementState> {
  await requireGroup("editorial");

  const issueId = String(formData.get("issueId") ?? "");
  const submissionId = String(formData.get("submissionId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!isUuid(issueId) || !isUuid(submissionId)) {
    return { ok: false, error: "That placement could not be found." };
  }
  if (direction !== "up" && direction !== "down") {
    return { ok: false, error: "That placement could not be moved." };
  }

  const item = await db.issuePlanItem.findUnique({
    where: { submissionId },
    include: { editorialIssue: { select: { state: true } } },
  });
  if (!item || item.editorialIssueId !== issueId) {
    return { ok: false, error: "That placement could not be found." };
  }
  if (item.editorialIssue.state === "published") {
    return {
      ok: false,
      error: "That issue is published. Its contents are fixed.",
    };
  }

  // The neighbour is whichever row is nearest on that side, not
  // `position ± 1` — positions are kept contiguous, but a query that does not
  // depend on it cannot be broken by a row that slipped.
  const neighbour = await db.issuePlanItem.findFirst({
    where: {
      editorialIssueId: issueId,
      position:
        direction === "up" ? { lt: item.position } : { gt: item.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!neighbour) {
    // Already at the end it was asked to move towards. The buttons are
    // disabled there, so this is a stale page, not a mistake worth a message.
    return { ok: true };
  }

  await db.$transaction(async (tx) => {
    await tx.issuePlanItem.update({
      where: { id: item.id },
      data: { position: -1 },
    });
    await tx.issuePlanItem.update({
      where: { id: neighbour.id },
      data: { position: item.position },
    });
    await tx.issuePlanItem.update({
      where: { id: item.id },
      data: { position: neighbour.position },
    });
  });

  revalidateIssue(issueId);
  return { ok: true };
}
