import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { getJournalStats, getTurnaroundStats } from "@/lib/api/admin";
import { PortalPage } from "@/components/layout/portal-page";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Statistics" };

/**
 * Journal statistics.
 *
 * Written under one constraint: **report only what the data holds.** The
 * journal has seven published articles, fourteen manuscripts and no analytics
 * of any kind. A dashboard of plausible figures here would be the indexing
 * page's mistake at its worst — these are the numbers a journal quotes in an
 * indexing application, and an invented one is a false statement to DOAJ.
 *
 * On the form: this is deliberately **not a chart page**. Fourteen
 * manuscripts across five sections is a set of counts, and a pie or a colourful
 * bar chart over it would be decoration standing in for data. Counts are
 * printed as numbers; the one place a shape helps — the relative size of five
 * sections — gets a single-hue bar whose length carries the magnitude and
 * whose count is printed beside it, so nothing is conveyed by colour at all.
 */
export default async function Page() {
  await requireGroup("adminOnly");

  const [stats, turnaround] = await Promise.all([
    getJournalStats(),
    getTurnaroundStats(),
  ]);

  const s = stats.submissions;

  return (
    <PortalPage
      title="Statistics"
      lead="Counted from the manuscripts and articles this platform holds. Nothing here is estimated."
    >
      {/* The scale caveat comes first. Every figure below is true and almost
          every one is drawn from a sample too small to generalise from, and
          the reader needs both facts at once. */}
      <Alert tone="info" title="A young journal, and small numbers">
        These are real counts from real records, but there are{" "}
        <span className="font-medium">{s.total}</span> manuscripts and{" "}
        <span className="font-medium">{stats.published.articles}</span>{" "}
        published articles in total. Rates computed over numbers this small move
        several points when one manuscript changes, so treat them as a
        description of what has happened rather than as a property of the
        journal. Each figure below states what it is calculated over.
      </Alert>

      {/* ---------------------------------------------------- submissions */}
      <section aria-labelledby="submissions-heading" className="mt-10">
        <h2 id="submissions-heading" className="font-serif text-lg font-semibold">
          Submissions
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Drafts are excluded throughout. An author still filling in the wizard
          has not submitted anything, and counting them would inflate both the
          total and the denominator of the acceptance rate.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Figure label="Received" value={s.total} />
          <Figure label="In progress" value={s.inProgress} />
          <Figure label="Accepted" value={s.accepted} />
          <Figure label="Declined" value={s.rejected} />
        </dl>

        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Figure
            label="Desk rejected"
            value={s.deskRejected}
            note="Declined without review"
          />
          <Figure label="Withdrawn" value={s.withdrawn} note="By the author" />
          <Figure
            label="Decided"
            value={s.decided}
            note="Accepted or declined"
          />
          <AcceptanceFigure rate={s.acceptanceRate} decided={s.decided} />
        </dl>
      </section>

      {/* ----------------------------------------------------- turnaround */}
      <section aria-labelledby="turnaround-heading" className="mt-10">
        <h2 id="turnaround-heading" className="font-serif text-lg font-semibold">
          Time to first decision
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Median rather than mean: on a handful of manuscripts a single slow
          outlier drags a mean to a number no manuscript was ever near. The
          range is given alongside so the spread is visible rather than hidden
          behind one figure.
        </p>

        {turnaround.median === null ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No manuscript has received a decision yet, so there is nothing to
              measure. This will stay empty rather than showing a zero.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border p-5">
            <p className="font-serif text-4xl font-semibold tabular-nums">
              {turnaround.median}
              <span className="ml-2 font-sans text-base font-normal text-muted-foreground">
                days, median
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Range {turnaround.min}–{turnaround.max} days, over{" "}
              <span className="font-medium text-foreground">{turnaround.n}</span>{" "}
              {turnaround.n === 1 ? "manuscript" : "manuscripts"} that have had
              a first decision. Submission to first decision, whether that
              decision was a desk rejection or a full review.
            </p>
          </div>
        )}
      </section>

      {/* -------------------------------------------------- by section */}
      <section aria-labelledby="section-heading" className="mt-10">
        <h2 id="section-heading" className="font-serif text-lg font-semibold">
          Where manuscripts come from
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          By section, then by article type. A single hue throughout: bar length
          already carries the magnitude, so colour would be decoration, and
          every row prints its own count.
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <BarList
            title="By section"
            items={stats.bySection}
            total={s.total}
          />
          <BarList
            title="By article type"
            items={stats.byType.map((t) => ({
              label: TYPE_LABEL[t.label] ?? t.label,
              count: t.count,
            }))}
            total={s.total}
          />
        </div>
      </section>

      {/* ------------------------------------------------------ published */}
      <section aria-labelledby="published-heading" className="mt-10">
        <h2 id="published-heading" className="font-serif text-lg font-semibold">
          Published and people
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Figure label="Articles" value={stats.published.articles} />
          <Figure label="Issues" value={stats.published.issues} />
          <Figure label="Accounts" value={stats.people.accounts} />
          <Figure
            label="Reviewers"
            value={stats.people.reviewers}
            note={`${stats.people.reviewersWithHistory} have completed a review`}
          />
        </dl>
      </section>

      {/* ------------------------------------------------- what is missing */}
      <section aria-labelledby="missing-heading" className="mt-10">
        <h2 id="missing-heading" className="font-serif text-lg font-semibold">
          What is not measured
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Listed rather than left as empty cards. A statistics screen that
          simply omits downloads invites the reader to assume the number is
          zero; these were never collected at all.
        </p>
        <dl className="mt-4 divide-y rounded-xl border">
          {NOT_MEASURED.map((item) => (
            <div key={item.title} className="p-4">
              <dt className="text-sm font-medium">{item.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          Every one of these needs an integration that is not connected — see{" "}
          <Link
            href="/admin/integrations"
            className="font-medium text-primary hover:underline"
          >
            integrations
          </Link>
          .
        </p>
      </section>

      <Alert tone="warning" title="These figures come from fixtures" className="mt-10">
        There is no database. The counts above are computed from the mock
        manuscripts and articles in{" "}
        <code className="font-mono text-[0.9em]">src/lib/api/</code>, so they
        describe the development data rather than a live journal. The
        calculations themselves are real and will not change when the backend
        lands — only the numbers they run over.
      </Alert>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const TYPE_LABEL: Record<string, string> = {
  research: "Research article",
  review: "Review article",
  "case-study": "Case study",
  editorial: "Editorial",
  conceptual: "Conceptual paper",
  "book-review": "Book review",
};

const NOT_MEASURED = [
  {
    title: "Article views and downloads",
    detail:
      "There is no analytics script anywhere on the site and no cookie is set, by design — the privacy policy is written against that. Nothing has been counted, so no view or download figure exists to report.",
  },
  {
    title: "Where readers are",
    detail:
      "Geography comes from analytics, and there is none. The countries in the account directory are what people typed about themselves, not where anyone read an article.",
  },
  {
    title: "Citations",
    detail:
      "Citation counts come from Crossref and the indexing services. The journal has no Crossref membership, so no article has ever been deposited and nothing can cite a DOI that does not resolve.",
  },
  {
    title: "Reviewer turnaround, journal-wide",
    detail:
      "The reviewer database holds a turnaround figure per reviewer, but those are fixture values rather than measurements taken by this system. Aggregating them would produce a journal-wide figure that was never observed.",
  },
];

function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums">
        {value}
      </dd>
      {note && (
        <dd className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {note}
        </dd>
      )}
    </div>
  );
}

/**
 * The acceptance rate, or an honest absence of one.
 *
 * Null when nothing has been decided — a rate over an empty denominator is not
 * 0%, and printing 0% would say the journal rejects everything.
 */
function AcceptanceFigure({
  rate,
  decided,
}: {
  rate: number | null;
  decided: number;
}) {
  return (
    <div className="rounded-xl border p-4">
      <dt className="text-xs text-muted-foreground">Acceptance rate</dt>
      <dd className="mt-1 font-serif text-2xl font-semibold tabular-nums">
        {rate === null ? "—" : `${Math.round(rate * 100)}%`}
      </dd>
      <dd className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {rate === null
          ? "Nothing decided yet"
          : `Of ${decided} decided manuscripts, not of all received`}
      </dd>
    </div>
  );
}

/**
 * A horizontal bar per row, single hue.
 *
 * Length carries the magnitude and the count is printed, so the chart is
 * readable with no colour perception at all. Rows with a count of zero would
 * still be listed if they existed — a category disappearing between two
 * readings makes the two impossible to compare.
 */
function BarList({
  title,
  items,
  total,
}: {
  title: string;
  items: { label: string; count: number }[];
  total: number;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing to show.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-xs">{item.label}</span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {item.count}
                  {total > 0 && (
                    <span className="ml-1 text-[11px]">
                      ({Math.round((item.count / total) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div
                className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className={cn("h-full rounded-full bg-brand")}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
