"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation/schemas";
import { siteConfig } from "@/config/site.config";
import { sendEmail } from "@/lib/email/send";
import {
  contactNotifyOfficeEmail,
  contactReceiptEmail,
} from "@/lib/email/templates";

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
 * The message is persisted to `ContactMessage`, which is what
 * `/admin/messages` works, and `handledAt` stays null until someone actions the
 * row. Since phase 6 it is also emailed — to the office, and back to the sender
 * as a receipt.
 *
 * **The row is the record and the mail is a courtesy**, in that order: a send
 * that fails does not fail the action, because a message sitting in the queue
 * has reached the office whether or not an email announced it. Note that with
 * no verified domain the receipt to the sender is refused by the provider, so
 * the success text promises the office has it and does not mention an inbox.
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
    const { name, email, affiliation, topic, manuscriptId, message } =
      parsed.data;

    await db.contactMessage.create({
      data: {
        name,
        email,
        affiliation: affiliation || null,
        topic,
        // Only meaningful for a submission enquiry; stored as typed regardless.
        manuscriptId: manuscriptId || null,
        message,
      },
    });

    // **The row is the record; the mail is a courtesy.** Both sends are
    // deliberately after the write and neither is allowed to fail the action —
    // a message that reached the queue has reached the office whether or not
    // an email about it was delivered. `/admin/messages` is worked regardless.
    const office = siteConfig.contact.editorialOffice;
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";

    await Promise.all([
      sendEmail(
        contactNotifyOfficeEmail({
          to: office,
          fromName: name,
          fromEmail: email,
          subject: topic,
          body: message,
          queueUrl: `${base}/admin/messages`,
        }),
      ),
      sendEmail(contactReceiptEmail({ to: email, name, subject: topic })),
    ]);

    return {
      status: "success",
      // No delivery claim: with no verified domain, mail to the sender is
      // refused by the provider, and telling them to watch their inbox would
      // be telling them something untrue.
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
