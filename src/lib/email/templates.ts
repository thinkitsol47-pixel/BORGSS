import "server-only";
import type { EmailMessage } from "./send";
import { siteConfig } from "@/config/site.config";

/**
 * The journal's messages, as plain functions returning a subject and a body.
 *
 * **Text first, HTML optional.** Every message here reads correctly with no
 * HTML at all, because a decision letter that only renders in a graphical
 * client is a decision letter some authors cannot read. Where HTML is added
 * later it is an alternative, never the only version.
 *
 * **No unsubscribe link on any of these.** They are transactional — the
 * consequence of something the recipient did, or of a decision about their own
 * manuscript. `/profile/notifications` is where optional mail is switched off,
 * and the messages it governs are not these.
 *
 * `/admin/settings/email-templates` enumerates all 15 the portal has promised.
 * The ones written here are the ones whose trigger exists in the code today;
 * the rest are added as their phases land, not before — a template with no
 * caller is a promise the app cannot keep.
 */

/**
 * Where replies go. Never the sending mailbox, which nobody reads.
 *
 * Read from `site.config.ts` rather than repeated here, so the address printed
 * on `/contact` and the one an author replies to cannot drift apart.
 */
const EDITORIAL_OFFICE = siteConfig.contact.editorialOffice;

function journalName(): string {
  return process.env.NEXT_PUBLIC_JOURNAL_NAME || "BORJSS";
}

function signOff(): string {
  return `\n\n—\n${journalName()}\nEditorial office: ${EDITORIAL_OFFICE}`;
}

/* ------------------------------------------------------------- the account */

/**
 * Sent when someone registers.
 *
 * Deliberately **not** a "confirm your address" message. Registration currently
 * confirms addresses on creation because a confirmation link cannot be
 * delivered reliably yet, so asking someone to click one would be asking for
 * something that does nothing. When Resend has a verified domain and
 * `email_confirm` goes back to `false`, this becomes the verification message
 * and gains a link.
 */
export function welcomeEmail(params: { to: string; name: string }): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `Your ${journalName()} account`,
    text:
      `Dear ${params.name},\n\n` +
      `An account has been created for you at ${journalName()} with this email address. ` +
      `You can sign in with the password you chose.\n\n` +
      `If you did not create this account, please reply to this message and we will remove it.` +
      signOff(),
  };
}

/**
 * Sent when the editorial office creates an account for someone who has not
 * registered themselves — an invited reviewer, a new board member.
 *
 * They did not ask for this, so it says who created it and why, and it does not
 * carry a password. Setting one is the recipient's own act, through the
 * password-reset flow.
 */
export function accountInviteEmail(params: {
  to: string;
  name: string;
  invitedBy: string;
  signInUrl: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `You have been invited to ${journalName()}`,
    text:
      `Dear ${params.name},\n\n` +
      `${params.invitedBy} has created an account for you at ${journalName()}.\n\n` +
      `To set a password and sign in, use the "Forgot password" link at ${params.signInUrl} ` +
      `and enter this email address.\n\n` +
      `If you were not expecting this, you can ignore this message — an account with no ` +
      `password set cannot be signed in to.` +
      signOff(),
  };
}

/* ------------------------------------------------------------ manuscripts */

/**
 * The receipt for a submitted manuscript.
 *
 * **The reference number is the point of this message.** It is what the author
 * quotes in every later email, and the one thing they cannot reconstruct
 * themselves. It comes from a Postgres sequence, so it is real and the office
 * can look it up — which is why no such message was sent before phase 5.
 *
 * Says what happens next in one line, and does not quote a timetable the
 * journal has never measured.
 */
export function submissionReceiptEmail(params: {
  to: string;
  name: string;
  reference: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `${params.reference} — your submission to ${journalName()}`,
    text:
      `Dear ${params.name},\n\n` +
      `Your manuscript has reached ${journalName()}.\n\n` +
      `Reference: ${params.reference}\n\n` +
      `Please quote that reference in any correspondence about this manuscript.\n\n` +
      `An editor will carry out an initial assessment before deciding whether to send ` +
      `it for peer review. You can follow its progress by signing in to the portal.` +
      signOff(),
  };
}

/* ------------------------------------------------------- the public queues */

/**
 * Acknowledges a message sent through the contact form.
 *
 * **The one promise it makes is the one the office can keep.** It does not
 * quote a response time the journal has never measured; it says the message
 * arrived and that a person will read it.
 */
export function contactReceiptEmail(params: {
  to: string;
  name: string;
  subject: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `We have your message — ${params.subject}`,
    text:
      `Dear ${params.name},\n\n` +
      `Thank you for writing to ${journalName()}. Your message has reached the editorial ` +
      `office and someone will read it.\n\n` +
      `Subject: ${params.subject}\n\n` +
      `If your message concerns a manuscript already under consideration, replying to this ` +
      `email will keep it with the rest of the correspondence.` +
      signOff(),
  };
}

/**
 * Tells the office that a contact message is waiting.
 *
 * Sent to the office, not the sender — `/admin/messages` is where the queue is
 * worked, and a queue nobody is told about is a queue nobody opens.
 */
export function contactNotifyOfficeEmail(params: {
  to: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  queueUrl: string;
}): EmailMessage {
  return {
    to: params.to,
    // So the office can answer the sender directly rather than copying an
    // address out of the portal.
    replyTo: params.fromEmail,
    subject: `[Contact] ${params.subject}`,
    text:
      `A message has arrived through the contact form.\n\n` +
      `From: ${params.fromName} <${params.fromEmail}>\n` +
      `Subject: ${params.subject}\n\n` +
      `${params.body}\n\n` +
      `Work the queue at ${params.queueUrl}`,
  };
}

/**
 * Acknowledges a reviewer application.
 *
 * Says plainly that an application is not an appointment. Someone who reads
 * "thank you for applying" and then hears nothing for two months concluded
 * something went wrong; this says what actually happens next.
 */
export function reviewerApplicationReceiptEmail(params: {
  to: string;
  name: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `Your application to review for ${journalName()}`,
    text:
      `Dear ${params.name},\n\n` +
      `Thank you for offering to review for ${journalName()}. Your application has reached ` +
      `the editorial office.\n\n` +
      `Applications are read as manuscripts arrive in the relevant subject areas, so there ` +
      `is no fixed timetable. You will hear from us when a manuscript matches your ` +
      `expertise — that first invitation is how most reviewers begin.` +
      signOff(),
  };
}

/** Tells the office a reviewer application is waiting. */
export function reviewerApplicationNotifyOfficeEmail(params: {
  to: string;
  applicantName: string;
  applicantEmail: string;
  affiliation: string;
  expertise: string;
  queueUrl: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: params.applicantEmail,
    subject: `[Reviewer application] ${params.applicantName}`,
    text:
      `A reviewer application has arrived.\n\n` +
      `Name: ${params.applicantName} <${params.applicantEmail}>\n` +
      `Affiliation: ${params.affiliation}\n` +
      `Expertise: ${params.expertise}\n\n` +
      `Review the application at ${params.queueUrl}`,
  };
}
