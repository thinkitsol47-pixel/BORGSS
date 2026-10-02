import "server-only";
import { Resend } from "resend";

/**
 * The only caller of Resend.
 *
 * Everything the journal sends goes through `sendEmail`, for the same reason
 * `storage.ts` will be the only caller of Cloudinary: a provider that is
 * reached from thirty places cannot be swapped, rate-limited, or audited. Brevo
 * is the documented fallback, and switching to it should be a change to this
 * file alone.
 *
 * **Nothing here throws into a Server Action.** A decision letter that fails to
 * send must not roll back the decision — the editor's hour of writing is worth
 * more than the notification, and the office can resend by hand. So every
 * function returns a result, and callers decide what to say on screen.
 *
 * ## Delivery, as of 2026-10-01
 *
 * `borjss.online` is verified at Resend and `EMAIL_FROM` is
 * `BORJSS <editorial@borjss.online>`, so mail reaches any address. The domain
 * has **no inbox**: every message sets `replyTo` to the editorial office's
 * Gmail (`site.config.ts`), and nothing should invite a reply to the sending
 * address. If `EMAIL_FROM` is ever unset, the fallback below is Resend's
 * sandbox sender, which delivers only to the Resend account owner —
 * `canReachRecipients()` reports exactly that case.
 */

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured" | "refused" | "failed"; message: string };

export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain text. Every message the journal sends is readable without HTML. */
  text: string;
  /** Optional HTML alternative. When absent the text stands on its own. */
  html?: string;
  /** Where a reply should go — the editorial office, not this mailbox. */
  replyTo?: string;
};

/** The address mail is sent from, and the one thing a verified domain changes. */
function fromAddress(): string {
  return process.env.EMAIL_FROM || "BORJSS <onboarding@resend.dev>";
}

/**
 * Whether mail can reach anyone other than the Resend account owner.
 *
 * A screen that promises "we have emailed the author" when this is false is
 * telling the reader something untrue, which is the mistake the indexing page
 * already made once. Drives the wording, not the sending.
 */
export function canReachRecipients(): boolean {
  // Read the address actually sent from, so an unset EMAIL_FROM — which falls
  // back to resend.dev — is not mistaken for a verified domain.
  return Boolean(process.env.RESEND_API_KEY) && !fromAddress().includes("resend.dev");
}

/** Whether email is wired up at all. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;

  // Not an error, and deliberately not a throw: the app has to keep working
  // on a machine with no key, and every caller already handles this result.
  if (!key) {
    return {
      ok: false,
      reason: "not-configured",
      message: "No mail provider is configured, so nothing was sent.",
    };
  }

  try {
    const { data, error } = await new Resend(key).emails.send({
      from: fromAddress(),
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });

    if (error) {
      // Resend answers 403 with this when no domain is verified. Separated from
      // a genuine failure because the fix is different — verify a domain, not
      // retry — and because a caller may want to say so on screen.
      const refused = /verify a domain|only send testing emails/i.test(error.message ?? "");
      return {
        ok: false,
        reason: refused ? "refused" : "failed",
        message: error.message ?? "The message could not be sent.",
      };
    }

    return { ok: true, id: data?.id ?? "" };
  } catch (cause) {
    // A network failure, a timeout, an unparseable response. Never rethrown:
    // see the note at the top about not rolling back the work that triggered
    // the message.
    return {
      ok: false,
      reason: "failed",
      message: cause instanceof Error ? cause.message : "The message could not be sent.",
    };
  }
}
