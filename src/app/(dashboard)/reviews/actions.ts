"use server";

import { reviewFormSchema } from "@/lib/validation/schemas";

/**
 * Review Server Actions.
 *
 * SCAFFOLD: each validates and returns. Nothing is stored, no editor is
 * notified, and no assignment status changes — there is no database.
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

/** Accept or decline an invitation. */
export async function respondToInvitation(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const response = String(formData.get("response") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (response !== "accept" && response !== "decline") {
    return { status: "error", message: "Choose whether to accept or decline." };
  }

  // A decline that suggests someone else is worth far more to an editor than a
  // bare no, so the reason is asked for — but never required, because forcing
  // an explanation just produces empty ones.
  // TODO(backend): update the assignment, notify the handling editor.
  return {
    status: "success",
    message:
      response === "accept"
        ? "You would now be able to open the manuscript and start your report. Nothing has been recorded — the portal is not connected to a backend yet."
        : "The editor would be told you are unavailable. Nothing has been recorded — the portal is not connected to a backend yet.",
    values: { response, reason },
  };
}

/** Submit the completed report. */
export async function submitReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = reviewFormSchema.safeParse(raw);

  // Echo the long text fields back; losing a written review to a validation
  // error would be unforgivable.
  const values: Record<string, string> = {
    ...raw,
    commentsToAuthor: raw.commentsToAuthor ?? "",
    commentsToEditor: raw.commentsToEditor ?? "",
    concernsRaised: raw.concernsRaised ?? "",
  };

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields — nothing has been lost.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  // TODO(backend): store the review, mark the assignment complete, notify the
  // handling editor, and check whether every report for the round is now in.
  return {
    status: "success",
    message:
      "Your review is complete and valid. Nothing has been sent — the portal is not connected to a backend yet.",
    values,
  };
}
