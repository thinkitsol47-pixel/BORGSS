"use server";

import { revalidatePath } from "next/cache";
import { db, isUuid } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { reviewFormSchema, REVIEW_CRITERIA } from "@/lib/validation/schemas";

/**
 * Review Server Actions.
 *
 * Phase 4: these write. No email from either — the handling editor is not
 * notified of an accept, a decline, or a returned report; mail works, but
 * those notifications are not built — so the screens say the editor is told
 * by the office in the meantime and these actions only move the database.
 *
 * Every one loads the assignment and checks it belongs to the signed-in
 * reviewer. A Server Action is its own entry point; the page's `requireUser`
 * proves only that *someone* is signed in, not that this review is theirs.
 */

export type ReviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
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

/** Prisma's enums are camelCase; the form and `src/types` use kebab-case. */
function kebabToCamel(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Reviewer comments are stored as paragraphs; the form is one textarea each. */
function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}

/**
 * Load an assignment that belongs to the current user, or null.
 * The `report` is included so callers can tell a returned review from an open
 * one without a second query.
 */
async function ownAssignment(assignmentId: string) {
  if (!isUuid(assignmentId)) return null;
  const user = await requireUser();
  const row = await db.reviewAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      report: { select: { id: true } },
      submission: { select: { id: true, reference: true, round: true } },
    },
  });
  if (!row || row.reviewerId !== user.id) return null;
  return row;
}

/* ================================================================== *
 * Accept or decline an invitation.
 * ================================================================== */

export async function respondToInvitation(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  await requireUser();

  const assignmentId = String(formData.get("reviewId") ?? "");
  const response = String(formData.get("response") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (response !== "accept" && response !== "decline") {
    return { status: "error", message: "Choose whether to accept or decline." };
  }

  const assignment = await ownAssignment(assignmentId);
  if (!assignment) {
    return {
      status: "error",
      message: "That invitation could not be found.",
      values: { response, reason },
    };
  }
  if (assignment.status !== "invited") {
    return {
      status: "error",
      message:
        assignment.status === "declined"
          ? "You have already declined this invitation."
          : "This invitation has already been answered.",
      values: { response, reason },
    };
  }

  await db.reviewAssignment.update({
    where: { id: assignment.id },
    data: {
      status: response === "accept" ? "accepted" : "declined",
      respondedAt: new Date(),
      // A decline that names a better-placed colleague is worth far more to an
      // editor than a bare no. Never required.
      declineReason: response === "decline" ? reason || null : null,
    },
  });

  await recordAudit({
    action: response === "accept" ? "review.accepted" : "review.declined",
    targetType: "submission",
    targetId: assignment.submission.id,
    detail: { reference: assignment.submission.reference, label: assignment.label },
  });

  revalidatePath("/reviews");
  revalidatePath(`/reviews/${assignment.id}`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message:
      response === "accept"
        ? "You have accepted. Open the manuscript and start your report — the handling editor is told by the editorial office for now, not automatically."
        : "You have declined and the editorial office will be told. Thank you for responding quickly.",
    values: { response, reason },
  };
}

/* ================================================================== *
 * Submit the completed report.
 * ================================================================== */

export async function submitReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  await requireUser();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const assignmentId = String(raw.reviewId ?? "");

  // Echo the long text fields back; losing a written review to a validation
  // error would be unforgivable.
  const values: Record<string, string> = {
    ...raw,
    commentsToAuthor: raw.commentsToAuthor ?? "",
    commentsToEditor: raw.commentsToEditor ?? "",
    concernsRaised: raw.concernsRaised ?? "",
  };

  const parsed = reviewFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields — nothing has been lost.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const assignment = await ownAssignment(assignmentId);
  if (!assignment) {
    return {
      status: "error",
      message: "That review could not be found.",
      values,
    };
  }
  if (assignment.report) {
    return {
      status: "error",
      message: "You have already returned this report. It cannot be edited.",
      values,
    };
  }
  const overdue =
    assignment.status === "accepted" &&
    assignment.dueAt !== null &&
    assignment.dueAt < new Date();
  if (assignment.status !== "accepted" && !overdue) {
    return {
      status: "error",
      message:
        "This review is not open for a report — an invitation has to be accepted first.",
      values,
    };
  }

  const activeForm = await db.reviewForm.findFirst({
    where: { active: true },
    orderBy: { version: "desc" },
    select: { id: true },
  });
  if (!activeForm) {
    return {
      status: "error",
      message:
        "No review form is active. Contact the editorial office — this is a configuration problem, not something you did.",
      values,
    };
  }

  const d = parsed.data;
  const scores: Record<string, number> = {};
  for (const c of REVIEW_CRITERIA) {
    scores[c.id] = Number(d[c.id as keyof typeof d]);
  }

  // One transaction: the report, the assignment moving to `completed`, and —
  // when this is the last report of the round — the submission moving to
  // `awaiting-decision`. A half-written report that left the assignment
  // `accepted` would keep the manuscript in the reviewers' column forever.
  await db.$transaction(async (tx) => {
    await tx.reviewerReport.create({
      data: {
        assignmentId: assignment.id,
        submissionId: assignment.submission.id,
        reviewFormId: activeForm.id,
        round: assignment.round,
        scores,
        recommendation: kebabToCamel(d.recommendation) as never,
        commentsToAuthor: toParagraphs(d.commentsToAuthor),
        commentsToEditor: d.commentsToEditor ? toParagraphs(d.commentsToEditor) : [],
        concernsRaised: d.concernsRaised || null,
      },
    });

    await tx.reviewAssignment.update({
      where: { id: assignment.id },
      data: { status: "completed", completedAt: new Date() },
    });

    // Is every active reviewer for this round now in? An invited assignment
    // still outstanding, or one accepted but not reported, means no.
    const roundAssignments = await tx.reviewAssignment.findMany({
      where: {
        submissionId: assignment.submission.id,
        round: assignment.round,
        status: { notIn: ["declined", "withdrawn"] },
      },
      include: { report: { select: { id: true } } },
    });
    const allIn =
      roundAssignments.length > 0 &&
      roundAssignments.every((a) => a.report || a.id === assignment.id);

    if (allIn) {
      const sub = await tx.submission.findUnique({
        where: { id: assignment.submission.id },
        select: { status: true },
      });
      // Only nudge it forward from an active review state — never override a
      // decision an editor has already recorded.
      //
      // `submitted` belongs here too. The tidy path is submitted → desk review
      // → under review, but nothing forces an editor through it: inviting a
      // reviewer straight from the queue is one click and leaves the status
      // untouched. The manuscript then collected every report it was going to
      // get and stayed in `submitted`, so the editor's "decision owed" count
      // never counted it — the report was reachable, but only by opening the
      // manuscript and already knowing to look.
      if (
        sub &&
        (sub.status === "underReview" ||
          sub.status === "deskReview" ||
          sub.status === "submitted")
      ) {
        await tx.submission.update({
          where: { id: assignment.submission.id },
          data: { status: "awaitingDecision" },
        });
      }
    }
  });

  await recordAudit({
    action: "review.submitted",
    targetType: "submission",
    targetId: assignment.submission.id,
    detail: {
      reference: assignment.submission.reference,
      label: assignment.label,
      recommendation: d.recommendation,
    },
  });

  revalidatePath("/reviews");
  revalidatePath(`/reviews/${assignment.id}`);
  revalidatePath(`/editorial/${assignment.submission.id}`);
  revalidatePath(`/editorial/${assignment.submission.id}/decision`);
  revalidatePath("/dashboard");

  return {
    status: "success",
    message:
      "Your report is with the editorial office. The handling editor is not emailed automatically yet — the office passes it on — and you will be told the outcome when a decision is made.",
    values,
  };
}
