import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileUp,
  Gavel,
  RefreshCw,
  Send,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Breadcrumb, Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Submission Process",
  description:
    "What happens to a manuscript submitted to BORJSS, from desk check through peer review to publication, and how long each stage takes.",
};

const STAGES: {
  icon: LucideIcon;
  step: string;
  title: string;
  duration: string;
  body: string;
  detail: string[];
}[] = [
  {
    icon: FileUp,
    step: "1",
    title: "Submission",
    duration: "You control the pace",
    body: "You complete the six-step submission form and upload your files. The form saves as you go, so a draft can be finished later.",
    detail: [
      "Details — title, abstract, keywords, manuscript type",
      "Contributors — all authors, affiliations and ORCID iDs",
      "Upload — anonymised manuscript, title page, figures",
      "Metadata — funding, section, language",
      "Declarations — originality, ethics, competing interests, AI use",
      "Review — check everything, then submit",
    ],
  },
  {
    icon: FileSearch,
    step: "2",
    title: "Desk check",
    duration: "3–5 working days",
    body: "The editorial office checks that the manuscript is in scope, correctly anonymised, complete, and passes a similarity screen.",
    detail: [
      "Scope against the journal's aims",
      "Anonymity of the main file",
      "Completeness of files and declarations",
      "Plagiarism and similarity screening",
    ],
  },
  {
    icon: ClipboardCheck,
    step: "3",
    title: "Peer review",
    duration: "4–6 weeks",
    body: "A handling editor assigns at least two independent reviewers with expertise in the area. Neither side learns the other's identity.",
    detail: [
      "Minimum two independent reviewers",
      "Double-blind throughout",
      "Reviewers assess originality, method, evidence and clarity",
      "A third reviewer is added where the first two disagree",
    ],
  },
  {
    icon: Gavel,
    step: "4",
    title: "Decision",
    duration: "Within 1 week of reports",
    body: "The handling editor weighs the reports and recommends a decision; the Editor-in-Chief confirms it. You receive the full reviewer comments either way.",
    detail: [
      "Accept — rare at first decision",
      "Minor revision — small corrections needed",
      "Major revision — substantive work needed, usually re-reviewed",
      "Reject — with reasons, and where useful, guidance",
    ],
  },
  {
    icon: RefreshCw,
    step: "5",
    title: "Revision",
    duration: "30 days (minor) · 60 days (major)",
    body: "You revise and resubmit with a point-by-point response to each reviewer comment. Ask for an extension if you need one — we would rather wait than lose good work.",
    detail: [
      "Point-by-point response required",
      "Changes marked in the manuscript",
      "Major revisions normally return to the original reviewers",
    ],
  },
  {
    icon: Wrench,
    step: "6",
    title: "Production",
    duration: "2–3 weeks",
    body: "Accepted manuscripts are copy-edited, typeset and returned to you as proofs. You check them; only genuine errors can be corrected at this stage.",
    detail: [
      "Copy-editing for language and house style",
      "Typesetting into the journal template",
      "Author proof — 72 hours to respond",
      "DOI registration with Crossref",
    ],
  },
  {
    icon: CheckCircle2,
    step: "7",
    title: "Publication",
    duration: "On issue release",
    body: "Your article is published open access, assigned a DOI, and deposited for long-term preservation. You are free to share it immediately.",
    detail: [
      "Open access from day one, no embargo",
      "Published under CC BY 4.0",
      "Indexed and permanently citable",
      "Self-archiving permitted immediately",
    ],
  },
];

export default function SubmissionProcessPage() {
  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[
          { label: "For Authors", href: "/for-authors/guidelines" },
          { label: "Submission Process" },
        ]}
      />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>For Authors</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Submission Process
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          What happens to your manuscript after you submit it, who handles each
          stage, and roughly how long it takes. You can check where your
          manuscript stands at any time from your dashboard.
        </p>

        <dl className="mt-6 grid max-w-xl grid-cols-1 gap-px sm:grid-cols-3 overflow-hidden rounded-lg border border-brand-border bg-border">
          {[
            ["~6 weeks", "To first decision"],
            ["2", "Reviewers minimum"],
            ["Double-blind", "Review model"],
          ].map(([value, label]) => (
            <div key={label} className="bg-card px-3 py-3 text-center">
              <dd className="font-serif text-lg font-bold text-brand-dark">
                {value}
              </dd>
              <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      </header>

      {/* ---------------------------------------------------- the stages */}
      <section aria-labelledby="stages" className="mt-10">
        <h2 id="stages" className="font-serif text-xl font-bold">
          The seven stages
        </h2>

        <ol className="mt-6 space-y-4">
          {STAGES.map(({ icon: Icon, step, title, duration, body, detail }, i) => (
            <li key={step} className="relative flex gap-4 sm:gap-6">
              {/* rail */}
              <div className="flex flex-col items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                {i < STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className="mt-1 w-px flex-1 bg-brand-border"
                  />
                )}
              </div>

              <Card className="mb-2 min-w-0 flex-1 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-serif text-lg font-semibold">
                    <span className="mr-2 text-brand-dark">{step}.</span>
                    {title}
                  </p>
                  <p className="shrink-0 text-xs font-medium text-primary">
                    {duration}
                  </p>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>

                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {detail.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 size-1 shrink-0 rounded-full bg-brand"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------- tracking */}
      <section aria-labelledby="tracking" className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 id="tracking" className="font-serif text-lg font-bold">
            Tracking your manuscript
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Every submission has a status you can see from your dashboard, and
            you receive an email whenever it changes. If a stage runs
            noticeably longer than the times above, write to the editorial
            office quoting your manuscript ID.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              "Submitted",
              "Under desk check",
              "Under review",
              "Decision pending",
              "Revision requested",
              "Accepted",
              "In production",
              "Published",
            ].map((s) => (
              <li
                key={s}
                className="rounded-full border border-brand-border bg-brand-tint/40 px-2.5 py-1 text-xs font-medium text-brand-darker"
              >
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-lg font-bold">
            If your manuscript is declined
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A rejection is not a judgement on you as a researcher, and you will
            always be told why. Reviewer comments are shared in full so the work
            can be improved for another venue.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            If you believe a decision rested on a factual error or a
            misunderstanding of the method, you may appeal. Appeals follow a
            formal procedure and are considered by an editor not involved in the
            original decision.
          </p>
          <Link
            href="/policies/complaints-appeals"
            className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-dark"
          >
            Complaints &amp; appeals policy →
          </Link>
        </Card>
      </section>

      {/* ------------------------------------------------------------ cta */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              Prepared your manuscript?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Check it against the author guidelines first — most returns at
              desk check are avoidable formatting and anonymity issues.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/for-authors/how-to-submit">
              <Send className="size-4" aria-hidden />
              Start a submission
            </Button>
            <Button href="/for-authors/guidelines" variant="outline">
              Author guidelines
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Questions about the process? Write to{" "}
          <a
            href={`mailto:${siteConfig.contact.submissions}`}
            className="text-primary hover:underline"
          >
            {siteConfig.contact.submissions}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
