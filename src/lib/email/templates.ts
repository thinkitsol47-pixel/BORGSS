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
 * Sent when someone registers, and again when they ask for a fresh link.
 *
 * The account cannot sign in until this link is followed — Supabase refuses
 * the password with `email_not_confirmed` — so the message leads with the link
 * and says plainly what happens if it is ignored. The link is single-use and
 * lands on `/auth/confirm`, which confirms the address and signs them in.
 */
export function verificationEmail(params: {
  to: string;
  name: string;
  link: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `Confirm your email address for ${journalName()}`,
    text:
      `Dear ${params.name},\n\n` +
      `An account has been created at ${journalName()} with this email address. ` +
      `To finish setting it up, confirm the address by opening this link:\n\n` +
      `${params.link}\n\n` +
      `The link works once. You will not be able to sign in until the address is confirmed; ` +
      `if the link has expired, request a new one from the sign-in page.\n\n` +
      `If you did not create this account, ignore this message — nothing further will happen.` +
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
      `To set your password, open ${params.signInUrl} and enter this email address — ` +
      `we will send you a link. Then sign in with the password you chose.\n\n` +
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

/**
 * The decision letter, sent to the corresponding author when an editor records
 * a decision.
 *
 * **The letter, and optionally the reviewers' comments to the author.** The
 * internal note, the reviewers' identities and their confidential comments to
 * the editor never enter this function — it is not given them, so it cannot
 * leak them. The letter is sent exactly as recorded, which is also what the
 * author's decision page in the portal shows.
 *
 * The opening names the decision in plain words, so an author scanning an
 * inbox knows before reading the letter; a revision carries its due date.
 */
export function decisionLetterEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  decisionLabel: string;
  /** The letter as stored: one string per paragraph. */
  letter: string[];
  /**
   * Reviewers' comments to the author, when the editor chose to include them.
   * Labelled ("Reviewer 2"), never named. Comments to the editor are not a
   * field here, so they cannot be passed in.
   */
  reports?: { label: string; comments: string[] }[];
  revisionDueAt?: Date | null;
  portalUrl: string;
}): EmailMessage {
  const reports =
    params.reports && params.reports.length > 0
      ? `\n\n—\n\nReviewers' comments\n\n` +
        params.reports
          .map((r) => `${r.label}:\n\n${r.comments.join("\n\n")}`)
          .join("\n\n")
      : "";

  const due = params.revisionDueAt
    ? `\n\nPlease return your revised manuscript by ${params.revisionDueAt.toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "long", year: "numeric" },
      )}, through the portal, with a point-by-point response to each comment.`
    : "";

  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `${params.reference} — decision on your manuscript`,
    text:
      `Dear ${params.name},\n\n` +
      `A decision has been reached on your manuscript "${params.title}" (${params.reference}).\n\n` +
      `Decision: ${params.decisionLabel}${due}\n\n` +
      `The editor's letter follows.\n\n` +
      `—\n\n` +
      params.letter.join("\n\n") +
      reports +
      `\n\n—\n\n` +
      `You can also read the editor's letter in the portal:\n${params.portalUrl}\n\n` +
      `Please quote ${params.reference} in any reply.` +
      signOff(),
  };
}

/**
 * The invitation to review, sent when an editor records one.
 *
 * **Double-blind by construction:** the function takes the title and abstract
 * and nothing else about the manuscript — no contributors, affiliations or
 * files — so it cannot name the authors even by mistake.
 */
export function reviewInvitationEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  abstract: string;
  dueAt?: Date | null;
  note?: string | null;
  portalUrl: string;
}): EmailMessage {
  const due = params.dueAt
    ? `\nThe review would be due by ${params.dueAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}.\n`
    : "";
  const note = params.note ? `\nA note from the editor:\n${params.note}\n` : "";

  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `${params.reference} — invitation to review for ${journalName()}`,
    text:
      `Dear ${params.name},\n\n` +
      `You are invited to review a manuscript for ${journalName()}. ` +
      `Review is double-blind: you will not see the authors' names, and they will not see yours.\n\n` +
      `Title: ${params.title}\n\n` +
      `Abstract:\n${params.abstract}\n` +
      due +
      note +
      `\nPlease accept or decline in the portal:\n${params.portalUrl}\n\n` +
      `Please quote ${params.reference} in any reply.` +
      signOff(),
  };
}

/**
 * Thanks a reviewer and tells them the outcome, sent to everyone who returned
 * a report for the round when the editor records the decision.
 *
 * The outcome only — not the editor's letter, which is written to the author,
 * and not the other reviewers' reports. Title and reference, never the
 * authors, as with every message to a reviewer.
 */
export function reviewOutcomeEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  decisionLabel: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `${params.reference} — thank you for your review`,
    text:
      `Dear ${params.name},\n\n` +
      `Thank you for reviewing "${params.title}" (${params.reference}) for ${journalName()}. ` +
      `Your report has been read and taken into account.\n\n` +
      `The editor's decision: ${params.decisionLabel}.\n\n` +
      `Peer review depends on colleagues giving their time as you have, and we are grateful for it.` +
      signOff(),
  };
}

/**
 * A reminder, sent when an editor presses "Send reminder" on an assignment.
 *
 * Two cases, because they ask for different things: an invitation still
 * unanswered asks for a yes or no; an accepted review asks for the report, and
 * says plainly when it is already late. Same double-blind rule as the
 * invitation — title only, never the authors.
 */
export function reviewReminderEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  stage: "invitation" | "report";
  dueAt?: Date | null;
  portalUrl: string;
}): EmailMessage {
  const due = params.dueAt
    ? params.dueAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const late = params.dueAt ? params.dueAt.getTime() < Date.now() : false;

  const ask =
    params.stage === "invitation"
      ? `You were invited to review this manuscript and we have not yet had your answer. ` +
        `Could you accept or decline? A quick no is far more helpful than no reply — ` +
        `if you can, name a colleague better placed to review it.`
      : late
        ? `Your review was due on ${due} and has not yet reached us. ` +
          `Please return it as soon as you can, or reply to tell us when to expect it.`
        : `This is a reminder that your review is due${due ? ` on ${due}` : ""}.`;

  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject:
      params.stage === "invitation"
        ? `${params.reference} — reminder: invitation to review`
        : `${params.reference} — reminder: your review${late ? " is overdue" : ""}`,
    text:
      `Dear ${params.name},\n\n` +
      `Title: ${params.title}\n\n` +
      `${ask}\n\n` +
      `${params.portalUrl}\n\n` +
      `Please quote ${params.reference} in any reply.` +
      signOff(),
  };
}

/**
 * Reminds the corresponding author that a revision is due, sent when an
 * editor presses "Remind the author". Says plainly when it is already late.
 */
export function revisionReminderEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  dueAt?: Date | null;
  portalUrl: string;
}): EmailMessage {
  const due = params.dueAt
    ? params.dueAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const late = params.dueAt ? params.dueAt.getTime() < Date.now() : false;

  const line = late
    ? `Your revision was due on ${due} and has not yet reached us. Please upload it as soon as you can, or reply to tell us when to expect it — if you need more time, ask.`
    : `This is a reminder that your revision is due${due ? ` on ${due}` : ""}. If you need more time, reply to let us know.`;

  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `${params.reference} — reminder: your revision${late ? " is overdue" : ""}`,
    text:
      `Dear ${params.name},\n\n` +
      `"${params.title}" (${params.reference})\n\n` +
      `${line}\n\n` +
      `Upload the revised manuscript and your response to the reviewers here:\n${params.portalUrl}\n\n` +
      `Please quote ${params.reference} in any reply.` +
      signOff(),
  };
}

/**
 * Tells the corresponding author that a production stage is waiting on them —
 * copyedits to approve, or proofs to check.
 *
 * **It carries no file and no link to one.** A galley has no author access in
 * `lib/storage/entitlement.ts`, and a signed URL must never be emailed; so the
 * message says the office sends the file separately, which is what happens.
 * What it adds is that the author learns the stage exists and is theirs to
 * answer, with the reference to quote.
 */
export function productionStageAuthorEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  stage: "copyedit" | "proofread";
}): EmailMessage {
  const what =
    params.stage === "copyedit"
      ? "has been copyedited and is ready for your approval"
      : "has been typeset and the proofs are ready for you to check";
  const ask =
    params.stage === "copyedit"
      ? "Please review the edits and reply with your approval, or with any changes you need."
      : "Please check the proofs carefully — at this stage only corrections of errors can be made — and reply with your corrections or your approval.";

  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `${params.reference} — ${params.stage === "copyedit" ? "copyedits for your approval" : "proofs for your approval"}`,
    text:
      `Dear ${params.name},\n\n` +
      `Your accepted manuscript "${params.title}" (${params.reference}) ${what}.\n\n` +
      `The editorial office will send you the file in a separate email. ${ask}\n\n` +
      `Please quote ${params.reference} in your reply.` +
      signOff(),
  };
}

/**
 * Tells the corresponding author their article is published, with its public
 * link. The link is to the article page, which anyone may open — unlike every
 * other message here, there is nothing confidential left to protect.
 *
 * Says nothing about a DOI: articles are published without one until the
 * journal has a Crossref prefix, and promising one by date would be a promise
 * nobody here can keep.
 */
export function articlePublishedEmail(params: {
  to: string;
  name: string;
  reference: string;
  title: string;
  issue: string;
  articleUrl: string;
}): EmailMessage {
  return {
    to: params.to,
    replyTo: EDITORIAL_OFFICE,
    subject: `Published: ${params.title}`,
    text:
      `Dear ${params.name},\n\n` +
      `Your article "${params.title}" (${params.reference}) has been published in ` +
      `${journalName()}, ${params.issue}.\n\n` +
      `It is open access and can be read and shared here:\n${params.articleUrl}\n\n` +
      `Thank you for publishing with us.` +
      signOff(),
  };
}

/**
 * Tells the editorial office that an author has uploaded a revision, so it is
 * not left waiting until someone happens to open the queue. Reference and
 * round only — the response to reviewers is read in the portal.
 */
export function revisionReceivedOfficeEmail(params: {
  to: string;
  reference: string;
  round: number;
  portalUrl: string;
}): EmailMessage {
  return {
    to: params.to,
    subject: `${params.reference} — revision ${params.round} received`,
    text:
      `The author has uploaded revision ${params.round} of ${params.reference}, ` +
      `with a response to the reviewers.\n\n` +
      `The manuscript stays with the author in the queue until an editor moves it on.\n\n` +
      `Open the manuscript:\n${params.portalUrl}` +
      signOff(),
  };
}

/**
 * Tells the editorial office that a reviewer accepted, declined or returned a
 * report. Names the reviewer by label ("Reviewer 2"), as the portal does.
 */
export function reviewUpdateOfficeEmail(params: {
  to: string;
  reference: string;
  label: string;
  event: "accepted" | "declined" | "report";
  reason?: string | null;
  portalUrl: string;
}): EmailMessage {
  const what =
    params.event === "accepted"
      ? "accepted the invitation"
      : params.event === "declined"
        ? "declined the invitation"
        : "returned their report";
  const reason = params.reason ? `\n\nReason given:\n${params.reason}` : "";

  return {
    to: params.to,
    subject: `${params.reference} — ${params.label} ${what}`,
    text:
      `${params.label} has ${what} for ${params.reference}.${reason}\n\n` +
      `Open the manuscript:\n${params.portalUrl}` +
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
