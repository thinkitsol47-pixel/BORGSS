import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Fingerprint,
  Globe2,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Alert, Breadcrumb, Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Indexing & Abstracting",
  description:
    "Where BORJSS content is currently indexed, which databases we have applied to, and the standards we meet for evaluation.",
};

type Status = "live" | "applied" | "planned";

const SERVICES: {
  name: string;
  icon: LucideIcon;
  status: Status;
  body: string;
  href?: string;
}[] = [
  {
    name: "Crossref",
    icon: Fingerprint,
    status: "live",
    body: "Every article is assigned a DOI registered with Crossref, with full metadata and reference deposits. This makes articles permanently citable and their citations trackable.",
    href: "https://www.crossref.org",
  },
  {
    name: "Google Scholar",
    icon: Search,
    status: "live",
    body: "Article pages carry Highwire Press citation metadata, so published work is discoverable and citations are counted.",
    href: "https://scholar.google.com",
  },
  {
    name: "OAI-PMH",
    icon: Database,
    status: "applied",
    body: "A metadata-harvesting endpoint that lets repositories and aggregators collect the journal's records automatically. The endpoint is being implemented ahead of the DOAJ application.",
  },
  {
    name: "DOAJ",
    icon: ShieldCheck,
    status: "applied",
    body: "The Directory of Open Access Journals requires a publication record before evaluation. We meet the editorial and licensing criteria and will apply once the required volume of content is published.",
    href: "https://doaj.org",
  },
  {
    name: "Zenodo",
    icon: Archive,
    status: "applied",
    body: "Long-term preservation deposit, so published content survives independently of this website.",
    href: "https://zenodo.org",
  },
  {
    name: "Scopus",
    icon: Globe2,
    status: "planned",
    body: "Elsevier's Scopus requires at least two years of consistent, on-time publication before a title can be submitted for evaluation. This is a target for 2028.",
    href: "https://www.scopus.com",
  },
  {
    name: "Web of Science",
    icon: Globe2,
    status: "planned",
    body: "Clarivate's Emerging Sources Citation Index is a longer-term goal, following the same publication-record requirement.",
    href: "https://clarivate.com",
  },
  {
    name: "HEC Recognition",
    icon: ShieldCheck,
    status: "planned",
    body: "Recognition by Pakistan's Higher Education Commission, which determines whether publications count toward faculty assessment in Pakistani institutions.",
  },
];

const STATUS_META: Record<
  Status,
  { label: string; className: string; icon: LucideIcon }
> = {
  live: {
    label: "Active",
    className: "border-success/30 bg-success/10 text-success",
    icon: CheckCircle2,
  },
  applied: {
    label: "In progress",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: Clock,
  },
  planned: {
    label: "Planned",
    className: "border-brand-border bg-brand-tint/60 text-brand-darker",
    icon: Clock,
  },
};

const STANDARDS = [
  {
    title: "Registered DOIs",
    body: "Every article carries a Crossref DOI with complete metadata, so it resolves permanently and its citations can be tracked.",
  },
  {
    title: "Published editorial policies",
    body: "Peer review, publication ethics, authorship, plagiarism, corrections and complaints are all set out publicly, following COPE guidance.",
  },
  {
    title: "Named editorial board",
    body: "Every board member is listed with their institution and country, and serves in a personal academic capacity.",
  },
  {
    title: "Open licensing",
    body: "Articles are published under CC BY 4.0 with authors retaining copyright — the licensing clarity DOAJ requires.",
  },
  {
    title: "Machine-readable metadata",
    body: "Article pages carry Highwire Press citation tags and Schema.org structured data, so search engines and indexers can read them without manual work.",
  },
  {
    title: "Persistent identifiers",
    body: "DOIs resolve regardless of URL changes, and ORCID iDs link authors to their work unambiguously across systems.",
  },
];

export default function IndexingPage() {
  const live = SERVICES.filter((s) => s.status === "live");
  const applied = SERVICES.filter((s) => s.status === "applied");
  const planned = SERVICES.filter((s) => s.status === "planned");

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Indexing" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>Discoverability</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Indexing &amp; Abstracting
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Where {siteConfig.shortName} content can currently be found, which
          databases we have approached, and what we are doing to meet the
          requirements of the rest.
        </p>

        <dl className="mt-6 grid max-w-lg grid-cols-1 gap-px sm:grid-cols-3 overflow-hidden rounded-lg border border-brand-border bg-border">
          {[
            ["Active", live.length],
            ["In progress", applied.length],
            ["Planned", planned.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-card px-4 py-3 text-center">
              <dd className="font-serif text-2xl font-bold text-brand-dark tabular-nums">
                {value}
              </dd>
              <dt className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      </header>

      {/* ------------------------------------------------------- honesty */}
      <div className="mt-8">
        <Alert tone="info" title="An honest position">
          {siteConfig.shortName} is newly launched and its first issue is in
          preparation. Established indexes such as Scopus and Web of Science
          require two or more years of
          consistent publication before a journal can even be evaluated, so we
          list those as targets rather than claiming coverage we do not have.
          The status of each service below is stated plainly.
        </Alert>
      </div>

      {/* ------------------------------------------------------- services */}
      <section aria-labelledby="services" className="mt-10">
        <h2 id="services" className="font-serif text-xl font-bold">
          Indexing status
        </h2>

        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {SERVICES.map((s) => {
            const meta = STATUS_META[s.status];
            const StatusIcon = meta.icon;
            const ServiceIcon = s.icon;

            return (
              <li key={s.name}>
                <Card className="h-full p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand-dark">
                      <ServiceIcon className="size-5" aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-serif text-base font-semibold">
                          {s.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
                        >
                          <StatusIcon className="size-3" aria-hidden />
                          {meta.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>

                      {s.href && (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-dark"
                        >
                          Visit {s.name}
                          <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------ standards */}
      <section aria-labelledby="standards" className="mt-12">
        <h2 id="standards" className="font-serif text-xl font-bold">
          What we already meet
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Indexes assess journals against criteria for editorial quality,
          transparency and technical infrastructure. These are in place now, so
          that when the publication record is sufficient, nothing else stands in
          the way.
        </p>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STANDARDS.map((s) => (
            <li key={s.title}>
              <Card className="h-full p-5">
                <p className="flex items-start gap-2 font-serif text-[15px] font-semibold">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden
                  />
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------- what this means */}
      <section aria-labelledby="authors" className="mt-12">
        <h2 id="authors" className="font-serif text-xl font-bold">
          What this means for authors
        </h2>

        <div className="prose mt-4 max-w-3xl">
          <p>
            Where a journal is indexed affects how easily your work is found and
            whether it counts toward institutional assessment. It is a fair
            question to ask before submitting, so here is the position without
            spin.
          </p>

          <p>
            <strong>Your article will be discoverable.</strong> A registered DOI
            and Google Scholar coverage mean the article is citable, findable and
            its citations are counted from the day it is published. That is true
            now, not at some future date.
          </p>

          <p>
            <strong>Your article will stay citable.</strong> A DOI resolves to
            the article regardless of how this site&rsquo;s URLs change, so
            citations do not break. Independent preservation deposit is being
            arranged in addition to this.
          </p>

          <p>
            <strong>Scopus indexing is not yet available</strong>, and will not
            be for some years — no new journal can offer it. If your institution
            requires a Scopus-indexed venue for this particular paper, that is a
            legitimate reason to publish elsewhere, and we would rather you knew
            now than after review.
          </p>

          <p>
            If a database indexes {siteConfig.shortName} in future, that coverage
            applies to <em>all</em> previously published articles, not only those
            published after acceptance into the index. Early authors are not
            disadvantaged.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ cta */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              Questions about indexing?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If indexing affects your decision to submit, ask us before you do.
              We will give you a straight answer about where an application
              stands.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact">Contact the editorial office</Button>
            <Button href="/about/journal-information" variant="outline">
              Journal information
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          See also the{" "}
          <Link
            href="/policies/open-access"
            className="text-primary hover:underline"
          >
            open access policy
          </Link>{" "}
          and{" "}
          <Link
            href="/policies/licensing"
            className="text-primary hover:underline"
          >
            licensing terms
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
