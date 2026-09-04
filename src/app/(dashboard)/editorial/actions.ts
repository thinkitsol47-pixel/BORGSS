"use server";

import { requireGroup } from "@/lib/auth/require-role";
import { decisionSchema } from "@/lib/validation/schemas";

/**
 * Editorial Server Actions.
 *
 * SCAFFOLD: validates and returns. Nothing is written, nothing is sent.
 *
 * The guard is not decorative even so. `/editorial/*` pages call
 * `requireGroup("editorial")`, but a Server Action is its own entry point —
 * it can be invoked directly, without the page that renders its form ever
 * being loaded — so the check is repeated here rather than assumed.
 */

export type DecisionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  /** Echoed back so the success screen can name what was decided. */
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

export async function recordDecision(
  _prev: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  await requireGroup("editorial");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = decisionSchema.safeParse(raw);

  // A decision letter can be an hour's writing. Losing it to a failed submit
  // would be as unforgivable here as it is on the review form.
  const values: Record<string, string> = {
    decision: raw.decision ?? "",
    letter: raw.letter ?? "",
    internalNote: raw.internalNote ?? "",
  };

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  /*
   * TODO(backend): recording a decision must, in one transaction:
   *
   *  1. Append a `SubmissionDecision` to the submission's `decisions` array.
   *     Append — never overwrite the last one. The history is what an appeal
   *     is heard against, and a decision that replaced its predecessor would
   *     make the record unusable.
   *  2. Move the submission's status: accept → `accepted`, minor/major →
   *     `revision-requested` with `revisionDueAt` set, reject → `rejected`,
   *     desk-reject → `desk-rejected`.
   *  3. Increment `round` on a revision request, so the next set of reports
   *     is counted separately from this one.
   *  4. Email the corresponding author the letter, attaching the reviewers'
   *     comments-to-author only if `includeReports` was ticked — and never
   *     the comments-to-editor, under any setting.
   *  5. Notify the reviewers who reported that a decision has been reached.
   *     They gave hours to this and are routinely left to guess the outcome.
   *  6. Write an audit entry: who decided, when, and against which reports.
   */

  return {
    status: "success",
    decision: parsed.data.decision,
    message:
      "The decision was checked and is valid. Nothing was recorded and no letter was sent — there is no database and no mail provider yet.",
    values,
  };
}
