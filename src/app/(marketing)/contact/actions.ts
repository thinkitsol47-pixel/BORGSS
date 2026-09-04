"use server";

import { contactSchema } from "@/lib/validation/schemas";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level messages, keyed by input name. */
  errors?: Record<string, string>;
  /** Echoed back so the form can be repopulated after a failed submit. */
  values?: Record<string, string>;
};

/**
 * Handles the contact form.
 *
 * SCAFFOLD: validates and returns, but does not yet deliver the message.
 * Wire the marked section to the transactional mail provider (Resend/Postmark)
 * and persist a copy for the editorial office.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;

  const parsed = contactSchema.safeParse(raw);

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
      // Never echo the honeypot back into the rendered form.
      values: { ...raw, website: "" },
    };
  }

  // A filled honeypot is a bot. Report success so it learns nothing, and drop
  // the message.
  if (parsed.data.website) {
    return { status: "success" };
  }

  try {
    // TODO(backend): send to siteConfig.contact.* via the mail provider and
    // record the enquiry. Until then the submission is validated only.
    await new Promise((r) => setTimeout(r, 400));

    return {
      status: "success",
      message:
        "Thank you — your message has reached the editorial office. We reply to most enquiries within two working days.",
    };
  } catch {
    return {
      status: "error",
      message:
        "We could not send your message. Please try again, or email the editorial office directly.",
      values: { ...raw, website: "" },
    };
  }
}
