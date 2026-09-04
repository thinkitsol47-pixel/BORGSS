"use server";

import { reviewerApplicationSchema } from "@/lib/validation/schemas";

export type ReviewerState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};

/**
 * Handles a reviewer application.
 *
 * SCAFFOLD: validates and returns. Wire the marked section to persist the
 * application to the reviewer database and notify the editorial office.
 */
export async function submitReviewerApplication(
  _prev: ReviewerState,
  formData: FormData,
): Promise<ReviewerState> {
  // Checkbox groups repeat their key, so they must be read with getAll().
  const raw = {
    ...(Object.fromEntries(formData) as Record<string, string>),
    subjects: formData.getAll("subjects").map(String),
    methods: formData.getAll("methods").map(String),
  };

  const parsed = reviewerApplicationSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors,
      values: { ...raw, website: "" },
    };
  }

  // A filled honeypot is a bot: report success, discard the application.
  if (parsed.data.website) {
    return { status: "success" };
  }

  try {
    // TODO(backend): store in the reviewer database and email the editorial
    // office. Until then the application is validated only.
    await new Promise((r) => setTimeout(r, 400));

    return {
      status: "success",
      message:
        "Thank you — your details are with the editorial office. We will be in touch when a manuscript matches your expertise, and you are free to decline any invitation.",
    };
  } catch {
    return {
      status: "error",
      message:
        "We could not submit your application. Please try again, or email the editorial office directly.",
      values: { ...raw, website: "" },
    };
  }
}
