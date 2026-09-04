import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  FileCheck2,
  Globe2,
  History,
  Info,
  ScrollText,
  Unlock,
  Users,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { getPublishedArticles, getIssues } from "@/lib/api/articles";
import { Breadcrumb, Button, Card, Eyebrow } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About the Journal",
  description:
    "Overview, editorial identity and publishing standards of the Blue Ocean Research Journal for Social Sciences.",
};

const PILLARS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileCheck2,
    title: "Double-blind peer review",
    body: "Every submission is assessed by at least two independent reviewers. Neither authors nor reviewers learn each other's identity.",
  },
  {
    icon: Unlock,
    title: "Open access, no paywall",
    body: "All articles are free to read, download and reuse under a Creative Commons licence from the day of publication.",
  },
  {
    icon: Clock,
    title: "Timely decisions",
    body: "We target a median of six weeks to first decision, and tell authors where their manuscript stands at each stage.",
  },
  {
    icon: Globe2,
    title: "Regional focus, global standards",
    body: "Research grounded in the Global South, held to the same methodological standards expected anywhere.",
  },
];

const SECTIONS: { icon: LucideIcon; title: string; body: string; href: string }[] =
  [
    {
      icon: Info,
      title: "Aims & Scope",
      body: "Subject areas covered, manuscript types accepted, and what falls outside the journal's remit.",
      href: "/about/aims-scope",
    },
    {
      icon: Users,
      title: "Editorial Board",
      body: "The Editor-in-Chief, associate and section editors, and the international advisory board.",
      href: "/about/editorial-board",
    },
    {
      icon: BookOpen,
      title: "Journal Information",
      body: "Title, ISSN, publisher, frequency, licensing and archiving — the formal record.",
      href: "/about/journal-information",
    },
    {
      icon: History,
      title: "History",
      body: "How the journal was founded and how it has developed since.",
      href: "/about/history",
    },
    {
      icon: ScrollText,
      title: "Editorial Policies",
      body: "Peer review, publication ethics, authorship, plagiarism, open access and licensing.",
      href: "/policies/peer-review",
    },
  ];

export default async function AboutPage() {
  const articles = await getPublishedArticles();
  const issues = await getIssues();

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "About" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold md:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {siteConfig.shortName} is a peer-reviewed, open-access journal
          published {siteConfig.frequency.toLowerCase()} by{" "}
          {siteConfig.publisher}. It publishes original research, review
          articles, conceptual papers and case studies across the social
          sciences.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/for-authors/how-to-submit">Submit a manuscript</Button>
          <Button href="/about/aims-scope" variant="outline">
            Read aims &amp; scope
          </Button>
        </div>
      </header>

      {/* what we stand for */}
      <section aria-labelledby="principles" className="mt-10">
        <h2 id="principles" className="font-serif text-xl font-bold">
          How this journal works
        </h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, body }) => (
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

      {/* facts */}
      <section aria-labelledby="facts" className="mt-12">
        <h2 id="facts" className="font-serif text-xl font-bold">
          The journal at a glance
        </h2>
        <dl className="mt-5 divide-y divide-border rounded-lg border border-brand-border">
          {[
            ["Full title", siteConfig.name],
            ["Abbreviation", siteConfig.shortName],
            ["Publisher", siteConfig.publisher],
            ["Frequency", siteConfig.frequency],
            ["Access model", `${siteConfig.accessModel} — no reader fees`],
            ["Peer review", "Double-blind, minimum two reviewers"],
            ["Language", "English"],
            ["Country of publication", siteConfig.countryOfPublication],
            ["Issues published", String(issues.length)],
            ["Articles published", String(articles.length)],
          ].map(([term, value]) => (
            <div
              key={term}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {term}
              </dt>
              <dd className="min-w-0 break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          ISSN and e-ISSN will be listed here once formally assigned. See{" "}
          <Link
            href="/about/journal-information"
            className="text-primary hover:underline"
          >
            journal information
          </Link>{" "}
          for the full record.
        </p>
      </section>

      {/* where to go next */}
      <section aria-labelledby="more" className="mt-12">
        <h2 id="more" className="font-serif text-xl font-bold">
          More about {siteConfig.shortName}
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ icon: Icon, title, body, href }) => (
            <li key={href} className="group relative">
              <Card interactive className="h-full p-5">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand-dark transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 font-serif text-base font-semibold">
                  <Link href={href} className="after:absolute after:inset-0">
                    {title}
                  </Link>
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
