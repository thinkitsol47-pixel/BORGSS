import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileSearch, Search as SearchIcon, X } from "lucide-react";
import type { ArticleType } from "@/types";
import { getPublishedArticles } from "@/lib/api/articles";
import {
  searchArticles,
  parseQuery,
  type SearchField,
  type SearchHit,
} from "@/lib/search";
import { Highlight } from "@/components/search/highlight";
import {
  Badge,
  Breadcrumb,
  Button,
  EmptyState,
  Eyebrow,
  Input,
  Pagination,
  Select,
} from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search published articles by title, author, keyword, abstract or DOI.",
};

const PER_PAGE = 8;

const FIELDS: { value: SearchField; label: string }[] = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "keyword", label: "Keywords" },
  { value: "abstract", label: "Abstract" },
];

const TYPE_LABEL: Record<ArticleType, string> = {
  research: "Research Article",
  review: "Review Article",
  "case-study": "Case Study",
  editorial: "Editorial",
  conceptual: "Conceptual Paper",
  "book-review": "Book Review",
};

const FIELD_LABEL: Record<string, string> = {
  title: "title",
  keyword: "keywords",
  author: "authors",
  abstract: "abstract",
  doi: "DOI",
};

type SearchParams = {
  q?: string;
  field?: string;
  type?: string;
  year?: string;
  page?: string;
};

function hrefWith(sp: SearchParams, patch: Partial<SearchParams>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (!value || value === "all") continue;
    if (key === "page" && value === "1") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = (searchParams.q ?? "").trim();
  const field = (searchParams.field as SearchField) || "all";
  const terms = parseQuery(query);

  const articles = await getPublishedArticles();
  const allHits = query ? searchArticles(articles, query, field) : [];

  // Facet counts come from the unfiltered hit set, so a user can see what
  // narrowing would do before they click.
  const typeCounts = new Map<string, number>();
  const yearCounts = new Map<string, number>();
  for (const h of allHits) {
    typeCounts.set(h.article.type, (typeCounts.get(h.article.type) ?? 0) + 1);
    const y = String(new Date(h.article.publishedAt).getFullYear());
    yearCounts.set(y, (yearCounts.get(y) ?? 0) + 1);
  }

  const activeType = searchParams.type ?? "all";
  const activeYear = searchParams.year ?? "all";

  const hits = allHits.filter((h) => {
    if (activeType !== "all" && h.article.type !== activeType) return false;
    if (
      activeYear !== "all" &&
      String(new Date(h.article.publishedAt).getFullYear()) !== activeYear
    )
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(hits.length / PER_PAGE));
  const page = Math.min(Math.max(1, Number(searchParams.page) || 1), totalPages);
  const results = hits.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const hasFacets = activeType !== "all" || activeYear !== "all";

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Search" }]} />

      <header className="mt-4">
        <Eyebrow>Search</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Search the archive
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Search across every published article by title, author, keyword,
          abstract or DOI. Use &ldquo;quotation marks&rdquo; to match an exact
          phrase.
        </p>

        {/* ------------------------------------------------------- the box */}
        <form action="/search" className="mt-6 max-w-3xl">
          {/* preserve facets when a new term is submitted */}
          {activeType !== "all" && (
            <input type="hidden" name="type" value={activeType} />
          )}
          {activeYear !== "all" && (
            <input type="hidden" name="year" value={activeYear} />
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="min-w-0 flex-1">
              <label htmlFor="q" className="sr-only">
                Search terms
              </label>
              <Input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                autoFocus={!query}
                placeholder="e.g. financial inclusion, Khan, &quot;climate adaptation&quot;"
                icon={<SearchIcon />}
                className="h-11"
              />
            </div>

            <div className="flex gap-2">
              <div className="w-40 shrink-0">
                <label htmlFor="field" className="sr-only">
                  Search in
                </label>
                <Select
                  id="field"
                  name="field"
                  defaultValue={field}
                  className="h-11"
                >
                  {FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                Search
              </Button>
            </div>
          </div>
        </form>
      </header>

      {/* ------------------------------------------------------- no query */}
      {!query ? (
        <div className="mt-10 border-t pt-8">
          <SearchTips articles={articles} />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 border-t pt-8 lg:grid-cols-[18rem_1fr]">
          {/* ----------------------------------------------------- facets */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Facet
              heading="Type"
              options={[
                {
                  label: "All types",
                  value: "all",
                  count: allHits.length,
                  href: hrefWith(searchParams, { type: "all", page: "1" }),
                },
                ...[...typeCounts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => ({
                    label: TYPE_LABEL[type as ArticleType] ?? type,
                    value: type,
                    count,
                    href: hrefWith(searchParams, { type, page: "1" }),
                  })),
              ]}
              active={activeType}
            />

            {yearCounts.size > 0 && (
              <Facet
                heading="Year"
                className="mt-6"
                options={[
                  {
                    label: "All years",
                    value: "all",
                    count: allHits.length,
                    href: hrefWith(searchParams, { year: "all", page: "1" }),
                  },
                  ...[...yearCounts.entries()]
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([year, count]) => ({
                      label: year,
                      value: year,
                      count,
                      href: hrefWith(searchParams, { year, page: "1" }),
                    })),
                ]}
                active={activeYear}
              />
            )}

            {hasFacets && (
              <Button
                href={hrefWith(
                  { q: query, field },
                  { type: "all", year: "all", page: "1" },
                )}
                variant="ghost"
                size="sm"
                className="mt-6 w-full"
              >
                <X className="size-4" aria-hidden />
                Clear filters
              </Button>
            )}
          </aside>

          {/* ---------------------------------------------------- results */}
          <div className="min-w-0">
            <div
              aria-live="polite"
              className="flex flex-wrap items-baseline justify-between gap-3 pb-5"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {hits.length}
                </span>{" "}
                {hits.length === 1 ? "result" : "results"} for{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query}&rdquo;
                </span>
                {field !== "all" && ` in ${FIELDS.find((f) => f.value === field)?.label.toLowerCase()}`}
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
              )}
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon={FileSearch}
                title={`No results for "${query}"`}
                description="Check the spelling, try fewer or broader terms, or search all fields instead of a single one."
                action={{ label: "Browse all articles", href: "/articles" }}
                secondaryAction={{ label: "View issues", href: "/issues" }}
              />
            ) : (
              <>
                <ol className="space-y-4">
                  {results.map((hit) => (
                    <ResultRow key={hit.article.id} hit={hit} terms={terms} />
                  ))}
                </ol>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  buildHref={(p) => hrefWith(searchParams, { page: String(p) })}
                  className="mt-10"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Result row
 * ------------------------------------------------------------------ */

function ResultRow({ hit, terms }: { hit: SearchHit; terms: string[] }) {
  const { article } = hit;
  const authors = article.contributors
    .map((c) => `${c.givenName} ${c.familyName}`)
    .join(", ");

  return (
    <li className="group relative rounded-lg border border-brand bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm">{TYPE_LABEL[article.type] ?? article.type}</Badge>
            <span className="text-xs text-muted-foreground">
              Vol. {article.volume}, No. {article.issue} ·{" "}
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <h2 className="mt-2 font-serif text-lg font-semibold leading-snug">
            <Link
              href={`/articles/${article.slug}`}
              className="after:absolute after:inset-0"
            >
              <Highlight text={article.title} terms={terms} />
            </Link>
          </h2>

          <p className="mt-1.5 text-sm font-medium text-foreground/80">
            <Highlight text={authors} terms={terms} />
          </p>

          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            <Highlight text={hit.snippet} terms={terms} />
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {hit.matchedIn.length > 0 && (
              <span>
                Matched in{" "}
                <span className="font-medium text-brand-dark">
                  {hit.matchedIn.map((m) => FIELD_LABEL[m] ?? m).join(", ")}
                </span>
              </span>
            )}
            {article.doi && (
              <span className="truncate">doi.org/{article.doi}</span>
            )}
          </div>
        </div>

        <ArrowUpRight
          aria-hidden
          className="mt-1 size-5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand group-hover:opacity-100"
        />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Facet list
 * ------------------------------------------------------------------ */

function Facet({
  heading,
  options,
  active,
  className,
}: {
  heading: string;
  options: { label: string; value: string; count: number; href: string }[];
  active: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-darker">
        {heading}
      </p>
      <ul className="mt-2 space-y-0.5">
        {options.map((o) => {
          const isActive = o.value === active;
          return (
            <li key={o.value}>
              <Link
                href={o.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-brand-tint font-medium text-brand-darker"
                    : "text-muted-foreground hover:bg-brand-tint/50 hover:text-foreground",
                )}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs tabular-nums",
                    isActive ? "text-brand-dark" : "text-muted-foreground/70",
                  )}
                >
                  {o.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Empty-query landing state
 * ------------------------------------------------------------------ */

function SearchTips({
  articles,
}: {
  articles: Awaited<ReturnType<typeof getPublishedArticles>>;
}) {
  // Most frequent keywords across the corpus, as suggested starting points.
  const counts = new Map<string, number>();
  for (const a of articles) {
    for (const k of a.keywords) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const popular = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([k]) => k);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="font-serif text-lg font-bold">Popular topics</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Keywords used across the {articles.length} articles published so far.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {popular.map((k) => (
            <li key={k}>
              <Link
                href={`/search?q=${encodeURIComponent(k)}`}
                className="inline-flex rounded-full border border-brand-border bg-brand-tint/50 px-3 py-1.5 text-xs font-medium text-brand-darker transition-colors hover:border-brand hover:bg-brand-tint"
              >
                {k}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-lg font-bold">Search tips</h2>
        <dl className="mt-4 space-y-3.5 text-sm">
          {[
            [
              "Exact phrases",
              'Wrap words in quotation marks to match them together — "financial inclusion".',
            ],
            [
              "Multiple terms",
              "All terms must appear somewhere in the article, so adding words narrows results.",
            ],
            [
              "Field search",
              "Use the dropdown to search only titles, authors, keywords or abstracts.",
            ],
            [
              "Browsing instead",
              "To filter by type or year without a search term, use the articles archive.",
            ],
          ].map(([term, body]) => (
            <div key={term} className="border-l-2 border-brand-border pl-3.5">
              <dt className="font-medium">{term}</dt>
              <dd className="mt-0.5 leading-relaxed text-muted-foreground">
                {body}
              </dd>
            </div>
          ))}
        </dl>

        <Button href="/articles" variant="outline" size="sm" className="mt-5">
          Browse the full archive
        </Button>
      </div>
    </div>
  );
}
