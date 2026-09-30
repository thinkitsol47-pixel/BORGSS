import type { Metadata } from "next";
import Link from "next/link";
import { FileText, LogIn, Mail, ScrollText, Send, UserPlus } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Submit a Manuscript",
  description:
    "How to submit a manuscript to BORJSS through the online submission portal.",
};

/**
 * The public "how do I submit?" page, for visitors who are not signed in.
 *
 * It lives at `/for-authors/how-to-submit`, not `/submissions/new`. Both
 * versions of this page existed at that URL briefly and Next cannot resolve
 * two route groups to one path: `(dashboard)/submissions/new` is the portal's
 * own version, behind the sidebar, and this is the public one behind the site
 * header. The site header's "Submit Manuscript" button points here.
 *
 * The wizard is live: it creates a draft row, uploads files to storage and
 * issues a real reference from a database sequence. So this page's job is now
 * to route a visitor into it — `/login?next=/submissions/new`, which the login
 * page supports — rather than to apologise for its absence.
 *
 * Email is kept as the secondary route, not the primary one. It genuinely
 * still works and the editorial office still reads it, but a portal
 * submission is tracked and an emailed one is typed in by hand.
 */

const PREPARE = [
  {
    icon: ScrollText,
    title: "Read the author guidelines",
    body: "Formatting, word limits, reference style and what each file should contain.",
    href: "/for-authors/guidelines",
    cta: "Author guidelines",
  },
  {
    icon: FileText,
    title: "Check the journal's scope",
    body: "Manuscripts outside the aims and scope are declined at desk check regardless of quality.",
    href: "/about/aims-scope",
    cta: "Aims & scope",
  },
  {
    icon: Send,
    title: "Know what happens next",
    body: "Desk assessment, double-blind review by at least two reviewers, then a decision — with the timelines for each stage.",
    href: "/for-authors/submission-process",
    cta: "Submission process",
  },
];

export default function Page() {
  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <header className="border-b pb-6">
        <Eyebrow>For Authors</Eyebrow>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          Submit a Manuscript
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          The journal is accepting submissions for its inaugural volume. Submit
          online through the author portal — you will need an account, which
          takes a minute to create.
        </p>
      </header>

      {/* ------------------------------------------------------- the portal */}
      <section aria-labelledby="portal" className="mt-10">
        <h2 id="portal" className="font-serif text-xl font-bold">
          Submit online
        </h2>

        <Card className="mt-5 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand-dark">
              <Send className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base font-semibold">
                The submission portal
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                A six-step form: article type and title, your files, the
                metadata, your co-authors in order, the declarations, then a
                summary to check before you send it. Each step is saved as you
                go, so you can leave and come back.
              </p>

              <p className="mt-4 text-sm font-medium">You will need:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    •
                  </span>
                  <span>
                    The <strong>anonymised main manuscript</strong> — no author
                    names, affiliations or acknowledgements anywhere in the
                    file, including its document properties.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    •
                  </span>
                  <span>
                    A <strong>title page</strong> as a separate file, with all
                    author names, affiliations, ORCID iDs and the corresponding
                    author&rsquo;s contact details.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    •
                  </span>
                  <span>
                    Your <strong>declarations</strong> — funding, competing
                    interests, ethics approval, data availability, and any use
                    of AI tools.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    •
                  </span>
                  <span>Any figures, tables or supplementary files.</span>
                </li>
              </ul>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Your manuscript is given a reference as soon as it is submitted,
                and you can follow it through review in the portal. Quote that
                reference in any correspondence about the submission.
              </p>

              <Button href="/login?next=/submissions/new" className="mt-5">
                <Send className="size-4" aria-hidden />
                Start a submission
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------ how to send */}
      <section aria-labelledby="how" className="mt-12">
        <h2 id="how" className="font-serif text-xl font-bold">
          Or submit by email
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          If you would rather not use the portal, the editorial office still
          accepts submissions by email. A portal submission is tracked
          automatically; an emailed one is entered by hand, so it takes longer
          to acknowledge.
        </p>

        <Card className="mt-5 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand-dark">
              <Mail className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base font-semibold">
                Email the submissions desk
              </p>
              <a
                href={`mailto:${siteConfig.contact.submissions}`}
                className="mt-1 block break-all font-medium text-primary hover:text-brand-dark hover:underline"
              >
                {siteConfig.contact.submissions}
              </a>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Attach the same four items the portal asks for — the anonymised
                manuscript, a separate title page, your declarations, and any
                figures or supplementary files. You will receive an
                acknowledgement with a manuscript reference within two working
                days.
              </p>

              <Button
                href={`mailto:${siteConfig.contact.submissions}`}
                className="mt-5"
              >
                <Mail className="size-4" aria-hidden />
                Email your manuscript
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* ---------------------------------------------------------- account */}
      <section aria-labelledby="account" className="mt-12">
        <h2 id="account" className="font-serif text-xl font-bold">
          About accounts
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Submitting through the portal needs an account — it is what links a
          manuscript to you, lets you track it through review, and carries the
          decision back. You do not need one to email a submission.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button href="/register" variant="outline">
            <UserPlus className="size-4" aria-hidden />
            Create an account
          </Button>
          <Button href="/login" variant="outline">
            <LogIn className="size-4" aria-hidden />
            Sign in
          </Button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Email addresses are not verified yet, so if you forget your password
          the reset link may not reach you. Contact the editorial office if you
          are locked out.
        </p>
      </section>

      {/* --------------------------------------------------- before you send */}
      <section aria-labelledby="prepare" className="mt-12">
        <h2 id="prepare" className="font-serif text-xl font-bold">
          Before you send it
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Most desk rejections are avoidable. These three pages cover what the
          editorial office checks first.
        </p>

        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {PREPARE.map(({ icon: Icon, title, body, href, cta }) => (
            <li key={title}>
              <Card className="flex h-full flex-col p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand-dark">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3.5 font-serif text-base font-semibold">
                  {title}
                </p>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
                <Link
                  href={href}
                  className="mt-4 text-sm font-medium text-primary hover:text-brand-dark"
                >
                  {cta} →
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------- charges */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              There is nothing to pay at submission
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No submission fee, and nothing is charged on a manuscript that is
              declined. A single charge applies on acceptance, and it is waived
              for students, unfunded research and authors in low- and
              lower-middle-income countries.
            </p>
          </div>
          <Button href="/apc" variant="outline">
            Publication charges
          </Button>
        </div>
      </section>
    </div>
  );
}
