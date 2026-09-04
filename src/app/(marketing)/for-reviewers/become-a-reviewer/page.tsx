import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Handshake,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { ReviewerForm } from "@/components/reviewer/reviewer-form";
import { Breadcrumb, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Become a Reviewer",
  description:
    "Join the BORJSS reviewer panel. Register your subject expertise and reviewing capacity.",
};

const BENEFITS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Award,
    title: "Formal recognition",
    body: "An acknowledgement letter for your institutional record, and optional credit on your ORCID profile.",
  },
  {
    icon: BookOpen,
    title: "Early sight of new work",
    body: "Read research in your field before it is published, and shape it through your assessment.",
  },
  {
    icon: Handshake,
    title: "A route to the board",
    body: "Most of our editorial board members began as reviewers for the journal.",
  },
  {
    icon: Clock,
    title: "You control the load",
    body: "Tell us your capacity, and decline any invitation without needing a reason.",
  },
];

const CRITERIA = [
  "A doctorate, or current doctoral candidacy, in a social science discipline",
  "A record of peer-reviewed publication in your field",
  "An institutional email address we can verify",
  "Capacity to return a review within three weeks",
];

export default function BecomeReviewerPage() {
  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[
          { label: "For Reviewers", href: "/for-reviewers/guidelines" },
          { label: "Become a Reviewer" },
        ]}
      />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>For Reviewers</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Become a Reviewer
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Peer review is what makes a journal worth publishing in.{" "}
          {siteConfig.shortName} is building a panel of reviewers across the
          social sciences — register your expertise and we will approach you
          when a manuscript matches it.
        </p>
      </header>

      {/* -------------------------------------------------------- benefits */}
      <section aria-labelledby="why" className="mt-10">
        <h2 id="why" className="font-serif text-xl font-bold">
          Why review for us
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <Card className="h-full p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand-dark">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 font-serif text-base font-semibold">
                  {title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------- form + rail */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <section aria-labelledby="apply" className="min-w-0">
          <h2 id="apply" className="font-serif text-xl font-bold">
            Register your interest
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            The editorial office reviews every application. Expect a reply
            within a week.
          </p>

          <div className="mt-6 rounded-lg border border-brand-border bg-card p-6 shadow-card sm:p-7">
            <ReviewerForm />
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
              <GraduationCap className="size-3.5" aria-hidden />
              What we look for
            </p>
            <ul className="mt-3 space-y-2.5">
              {CRITERIA.map((c) => (
                <li key={c} className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                  />
                  <span className="text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Early-career researchers are welcome. Say so on the form and we
              will pair your first reviews alongside an experienced reviewer.
            </p>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
              <Clock className="size-3.5" aria-hidden />
              What is expected
            </p>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["Reply to invitations", "Within 5 days"],
                ["Complete a review", "Within 3 weeks"],
                ["Typical load", "2–4 a year"],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{term}</dt>
                  <dd className="shrink-0 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="bg-brand-tint/30 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-brand" aria-hidden />
              Read first
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              The guidelines set out how we ask reviews to be written, and the
              ethics policy covers confidentiality and the ban on entering
              manuscripts into AI tools.
            </p>
            <div className="mt-3 space-y-1.5">
              <Link
                href="/for-reviewers/guidelines"
                className="block text-sm font-medium text-primary hover:text-brand-dark"
              >
                Reviewer guidelines →
              </Link>
              <Link
                href="/policies/reviewer-ethics"
                className="block text-sm font-medium text-primary hover:text-brand-dark"
              >
                Reviewer ethics →
              </Link>
              <Link
                href="/policies/peer-review"
                className="block text-sm font-medium text-primary hover:text-brand-dark"
              >
                Peer review policy →
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
