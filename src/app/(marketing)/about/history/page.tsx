import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { Breadcrumb, Button, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "History",
  description:
    "How the Blue Ocean Research Journal for Social Sciences was founded and how it has developed.",
};

const MILESTONES = [
  {
    year: "2025",
    title: "The journal is conceived",
    body: "Blue Ocean Educational Services identifies a gap: social-science researchers in Pakistan face long waits at international journals and few credible domestic venues that combine rigorous review with open access.",
  },
  {
    year: "2025",
    title: "Editorial board formed",
    body: "An editorial board is assembled from universities across Pakistan, alongside an international advisory board, to establish the standards the journal would be held to.",
  },
  {
    year: "2026",
    title: "Policies adopted",
    body: "The journal adopts a full set of editorial policies covering peer review, publication ethics, authorship, plagiarism, AI-assisted writing and open access — modelled on COPE guidance.",
  },
  {
    year: "2026",
    title: "Inaugural issue published",
    body: "Volume 1, Issue 1 appears in June 2026, carrying four peer-reviewed articles spanning development finance, labour economics, education policy and urban studies.",
  },
  {
    year: "2026",
    title: "Second issue and DOI registration",
    body: "Volume 1, Issue 2 follows in December. All published articles are assigned DOIs registered with Crossref, making them permanently citable.",
  },
  {
    year: "Ahead",
    title: "Indexing and growth",
    body: "The journal is building the publication record required for evaluation by DOAJ and, in time, Scopus. Submissions continue to be accepted on a rolling basis.",
  },
];

export default function HistoryPage() {
  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[{ label: "About", href: "/about" }, { label: "History" }]}
      />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>About the Journal</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">History</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {siteConfig.shortName} was founded to give social-science researchers a
          rigorous, openly accessible publishing venue. This is how it came
          about.
        </p>
      </header>

      {/* founding statement */}
      <section className="mt-10 max-w-3xl">
        <h2 className="font-serif text-xl font-bold">Why the journal exists</h2>
        <div className="prose mt-4">
          <p>
            Researchers working on social questions in Pakistan and the wider
            region have long faced a difficult choice. International journals
            offer visibility but often impose year-long review cycles, and their
            article processing charges can exceed a month&rsquo;s academic
            salary. Domestic alternatives were frequently faster, but too few
            combined genuine peer review with permanent, open availability.
          </p>
          <p>
            {siteConfig.publisher} established {siteConfig.shortName} to close
            that gap: a journal run to international standards of review and
            ethics, published openly, and editorially independent of commercial
            pressure. The commitment from the outset was that no reader would
            ever pay to read an article, and no author would wait indefinitely
            for a decision.
          </p>
        </div>
      </section>

      {/* timeline */}
      <section aria-labelledby="timeline" className="mt-12">
        <h2 id="timeline" className="font-serif text-xl font-bold">
          Milestones
        </h2>

        <ol className="mt-6 max-w-3xl">
          {MILESTONES.map((m, i) => (
            <li key={`${m.year}-${m.title}`} className="relative flex gap-5 pb-8 last:pb-0">
              {/* connector */}
              {i < MILESTONES.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[0.6875rem] top-6 h-full w-px bg-brand-border"
                />
              )}

              <span
                aria-hidden
                className="relative mt-1.5 size-[0.875rem] shrink-0 rounded-full border-2 border-brand bg-background"
              />

              <div className="min-w-0 pb-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {m.year}
                </p>
                <p className="mt-1 font-serif text-lg font-semibold leading-snug">
                  {m.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {m.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* forward */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              Be part of what comes next
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The journal grows through the work it publishes and the scholars
              who review it. Submissions are open on a rolling basis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/for-authors/how-to-submit">Submit a manuscript</Button>
            <Button href="/about/editorial-board" variant="outline">
              Meet the board
            </Button>
          </div>
        </div>
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        For the formal publishing record, see{" "}
        <Link
          href="/about/journal-information"
          className="text-primary hover:underline"
        >
          journal information
        </Link>
        .
      </p>
    </div>
  );
}
