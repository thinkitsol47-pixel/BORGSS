import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Email Templates" };

/**
 * Every message the platform has promised, and which of them exist.
 *
 * **Half specification, half register.** `src/lib/email/templates.ts` holds
 * seven written templates and `sendEmail` is called from four places, so the
 * blanket "nothing here exists in code" this file used to open with is wrong —
 * as was the "Not built" chip on all fifteen rows and the hand-counted "six of
 * the fifteen" near the bottom. Each row now carries its own `written` flag and
 * the counts derive from it, so the next template to land updates the page by
 * being marked rather than by someone remembering three sentences.
 *
 * What it can do usefully is enumerate every message the portal has promised
 * elsewhere. Each `TODO(backend)` in the codebase that says "email the author"
 * is a template that has to exist, and gathering them in one place is how that
 * list stops being discovered one screen at a time.
 */

type Trigger = {
  name: string;
  /** What causes it to be sent. */
  when: string;
  to: string;
  /** Where in the app this promise was made. */
  promisedBy: string;
  href?: string;
  /** True when nothing at all happens today, not even a manual workaround. */
  critical?: boolean;
  /**
   * True when a function for it exists in `src/lib/email/templates.ts` and
   * something calls it.
   *
   * Marked per message rather than counted in a sentence: "six of fifteen" was
   * written by hand here and was already wrong by one when the seventh landed.
   * A flag on the row is checked by whoever adds the template, in the file they
   * are already editing.
   */
  written?: boolean;
};

const TRIGGERS: { group: string; items: Trigger[] }[] = [
  {
    group: "Account",
    items: [
      {
        name: "Verify your email address",
        when: "An account is registered.",
        to: "The new account holder",
        // `verificationEmail`, sent by `register` and by "Send the link again".
        // The account cannot sign in until the link is followed.
        promisedBy: "Registration — sent with a confirmation link",
        href: "/register",
        written: true,
      },
      {
        name: "Reset your password",
        when: "A password reset is requested.",
        to: "The account holder",
        // The one message not in templates.ts: Supabase sends it, through
        // custom SMTP pointed at Resend (set in the Supabase dashboard). Its
        // wording is edited there, under Authentication → Emails.
        promisedBy: "Forgot-password screen — sent by Supabase through Resend",
        href: "/forgot-password",
        written: true,
      },
      {
        name: "You have been invited",
        when: "An administrator creates an account for someone.",
        to: "The invited person",
        // `accountInviteEmail`, sent by `createInvitedUser` from
        // /admin/users/new. It points them to "Forgot password" to set their
        // own password; nobody else ever knows it.
        promisedBy: "New account screen — sent when the account is created",
        href: "/admin/users/new",
        written: true,
      },
    ],
  },
  {
    group: "Submission",
    items: [
      {
        name: "Submission received",
        when: "A manuscript is submitted through the wizard.",
        to: "The corresponding author",
        promisedBy: "Wizard step 6 — sent on submission",
        href: "/submissions/new",
        written: true,
      },
      {
        name: "Revision requested",
        when: "An editor records a minor or major revision.",
        to: "The corresponding author, with the decision letter",
        // `decisionLetterEmail` — one template for every decision type; a
        // revision adds its due date.
        promisedBy: "Decision screen — sent when the decision is recorded",
        written: true,
      },
      {
        name: "Decision — accepted or declined",
        when: "An editor records a decision.",
        to: "The corresponding author, with the letter",
        promisedBy: "Decision screen — sent when the decision is recorded",
        written: true,
      },
      {
        name: "Revision received",
        when: "An author uploads a revised manuscript.",
        to: "The editorial office",
        // `revisionReceivedOfficeEmail`, from `uploadRevision`.
        promisedBy: "Revision upload screen",
        written: true,
      },
      {
        name: "Revision due soon",
        when: "An editor presses Remind the author on a manuscript awaiting its revision.",
        to: "The corresponding author",
        // `revisionReminderEmail`. By hand, at most once a day — nothing sends
        // it on a schedule.
        promisedBy: "Editor’s manuscript page — Remind the author",
        written: true,
      },
    ],
  },
  {
    group: "Review",
    items: [
      {
        name: "Invitation to review",
        when: "An editor invites a reviewer.",
        to: "The invited reviewer",
        // `reviewInvitationEmail` — title and abstract only, never the authors.
        promisedBy: "Reviewer assignment screen — sent when the invitation is recorded",
        written: true,
      },
      {
        name: "A reviewer responded",
        when: "A reviewer accepts or declines an invitation, or returns a report.",
        to: "The editorial office",
        // `reviewUpdateOfficeEmail`. To the office rather than a named editor:
        // there is no handling-editor column to address it to.
        promisedBy: "Reviewer’s invitation and report screens",
        href: "/reviews",
        written: true,
      },
      {
        name: "Review reminder",
        when: "An editor presses Send reminder on an unanswered invitation or an outstanding review.",
        to: "The reviewer",
        // `reviewReminderEmail`, from the reviewers page. Sent by hand, at most
        // once a day per assignment — nothing sends it on a schedule yet.
        promisedBy: "Reviewers page — Send reminder",
        written: true,
      },
      {
        name: "Thank you, and the outcome",
        when: "A decision is reached on a manuscript someone reviewed.",
        to: "Every reviewer who reported in that round",
        // `reviewOutcomeEmail` — the decision only, not the letter or the
        // other reviewers' reports.
        promisedBy: "Decision screen — sent when the decision is recorded",
        written: true,
      },
    ],
  },
  {
    group: "Production and publication",
    items: [
      {
        name: "Copyedits for your approval",
        when: "Copyediting is sent to the author.",
        to: "The corresponding author",
        // `productionStageAuthorEmail` — tells them it waits on them; the
        // file itself is still sent by hand. No file or link is ever emailed.
        promisedBy: "Copyediting stage — Send to author",
        written: true,
      },
      {
        name: "Proofs for your approval",
        when: "A galley is sent for proofreading.",
        to: "The corresponding author",
        promisedBy: "Proofreading stage — Send to author",
        written: true,
      },
      {
        name: "Your article is published",
        when: "An issue containing the article is published.",
        to: "The corresponding author",
        // `articlePublishedEmail`, sent by `publishIssue` with the public link.
        promisedBy: "Issue screen — Publish this issue",
        href: "/editorial/issues",
        written: true,
      },
    ],
  },
  {
    group: "Public forms",
    items: [
      {
        name: "Contact form received",
        when: "Someone submits the public contact form.",
        to: "The editorial office, and an acknowledgement to the sender",
        // Both halves are written and both are sent. Not `critical`: the queue
        // at /admin/messages is the record, and the office works it whether or
        // not the notification was delivered.
        promisedBy: "Contact form — sends both messages",
        href: "/contact",
        written: true,
      },
      {
        name: "Reviewer application received",
        when: "Someone applies to join the reviewer pool.",
        to: "The editorial office, and an acknowledgement to the applicant",
        promisedBy: "Become a reviewer — sends both messages",
        href: "/for-reviewers/become-a-reviewer",
        written: true,
      },
    ],
  },
];

export default async function Page() {
  await requireGroup("adminOnly");

  const all = TRIGGERS.flatMap((g) => g.items);
  const critical = all.filter((t) => t.critical);
  /* Counted from the rows, not written into the sentence — the hand-written
     "six of the fifteen" further down this page was already out of date.

     Note this counts *messages*, not template functions. `templates.ts` exports
     seven functions, but the contact form and the reviewer application each
     send a pair (a receipt to the person, a notification to the office), which
     is one row here. Counting functions would report a larger number than the
     list on screen can account for. */
  const written = all.filter((t) => t.written).length;

  return (
    <SettingsPage
      active="email-templates"
      title="Email templates"
      lead="Every message this platform has promised to send, and which of them exist. Mail is sent from borjss.online and reaches any address; the ones marked Not built are still sent by hand from the editorial office."
    >
      {/* No standing box. Each row carries its own Written / Not built chip,
          which says the same thing per message and in the place the reader
          is already looking. */}

      {/* The ones with no workaround at all come next — the rest can at least
          be done by hand from the editorial office. */}
      {critical.length > 0 && (
        <section aria-labelledby="critical-heading" className="mt-8">
          <h2
            id="critical-heading"
            className="font-serif text-lg font-semibold"
          >
            {critical.length} have no manual alternative
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A decision letter can be sent by hand from the editorial office.
            These cannot be fully replaced that way: each starts a step inside
            the portal that the person is never told about.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {critical.map((t) => (
              <li
                key={t.name}
                className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
              >
                {t.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------- the list */}
      {TRIGGERS.map((group) => (
        <section
          key={group.group}
          aria-labelledby={`g-${group.group}`}
          className="mt-10"
        >
          <h2
            id={`g-${group.group}`}
            className="font-serif text-lg font-semibold"
          >
            {group.group}
          </h2>
          <ul className="mt-3 divide-y rounded-xl border">
            {group.items.map((t) => (
              <li
                key={t.name}
                className={cn("p-4", t.critical && "bg-warning/5")}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t.when}
                    </p>
                  </div>
                  {/* Per row, not one label for all fifteen: some of these
                      are written, and a blanket "Not built" made the screen
                      deny work that had already been done. */}
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                      t.written
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border-strong bg-background text-muted-foreground",
                    )}
                  >
                    {t.written ? "Written" : "Not built"}
                  </span>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                  <div className="flex gap-1.5">
                    <dt>To</dt>
                    <dd className="font-medium text-foreground">{t.to}</dd>
                  </div>
                  <div className="flex min-w-0 gap-1.5">
                    <dt>Promised by</dt>
                    <dd className="min-w-0 font-medium text-foreground">
                      {t.href ? (
                        <Link href={t.href} className="text-primary hover:underline">
                          {t.promisedBy}
                        </Link>
                      ) : (
                        t.promisedBy
                      )}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* ------------------------------------------------ what they need */}
      <section aria-labelledby="requirements-heading" className="mt-10">
        <h2
          id="requirements-heading"
          className="font-serif text-lg font-semibold"
        >
          What the real templates have to get right
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Recorded now because these are the decisions that are expensive to
          change once mail is going out.
        </p>
        <dl className="mt-4 divide-y rounded-xl border">
          {REQUIREMENTS.map((r) => (
            <div key={r.title} className="p-4">
              <dt className="text-sm font-medium">{r.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {r.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <SourceNote file="src/lib/email/templates.ts">
        <p>
          {written} of the {all.length} are written — the ones whose trigger
          exists in the code. A template with no caller is a promise the app
          cannot keep, so the rest arrive with the features that send them.
        </p>
        <p className="mt-2">
          <span className="font-medium">
            They are code, not content, and stay that way.
          </span>{" "}
          Each is a function taking typed arguments — a reference number, a due
          date — and a database-backed editor would turn a mistyped placeholder
          into an email that goes out with a blank where the manuscript number
          should be. Changing wording is a one-line edit reviewed like any other.
        </p>
        <p className="mt-2">
          Mail is sent from borjss.online and replies come back to{" "}
          <span className="font-medium">
            {siteConfig.contact.editorialOffice}
          </span>
          . Anything marked Not built still goes out by hand from that address.{" "}
          <Link
            href="/admin/integrations"
            className="font-medium text-primary hover:underline"
          >
            See integrations
          </Link>
          .
        </p>
      </SourceNote>
    </SettingsPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const REQUIREMENTS = [
  {
    title: "Every message quotes the manuscript reference",
    detail:
      "BORJSS-2026-0042 in the subject line. It is what the author quotes back, what the editorial office searches on, and what makes a reply threadable when the portal cannot thread it.",
  },
  {
    title: "Nothing sent to an author may contain a reviewer's identity",
    detail:
      "The journal is double-blind. Comments to the author go out; comments to the editor never do, under any setting. This is enforced in the type on screen and must be enforced again at the point of send.",
  },
  {
    title: "Plain text alongside HTML",
    detail:
      "Institutional mail systems strip or mangle HTML, and a decision letter that arrives unreadable is a complaint. The plain-text part is the letter, not a “view in browser” link.",
  },
  {
    title: "Reminders stop when the thing is done",
    detail:
      "A reviewer who has returned their report must never receive another reminder for it. The obvious bug in every reminder system, and the one that loses reviewers.",
  },
  {
    title: "The unsubscribable and the unsubscribable-not are separated",
    detail:
      "Decision letters, revision requests and account security mail are sent regardless of notification preferences — the profile screen already says so. Reminders and announcements are not. The template has to know which it is.",
  },
  {
    title: "A send is recorded",
    detail:
      "Who it went to, when, and which template. An author saying “I never received the decision” is answerable only if the send was logged.",
  },
];
