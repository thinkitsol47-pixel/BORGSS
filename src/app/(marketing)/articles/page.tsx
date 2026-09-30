import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch, Search } from "lucide-react";
import type { Article, ArticleType } from "@/types";
import { getPublishedArticles } from "@/lib/api/articles";
import { ArticleListItem } from "@/components/marketing/article-card";
import {
  Breadcrumb,
  Button,
  EmptyState,
  Eyebrow,
  Input,
  Pagination,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Articles",
  description:
    "All research articles, reviews, case studies and conceptual papers published in BORJSS.",
};

const PER_PAGE = 6;

const TYPES: { value: ArticleType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "research", label: "Research Article" },
  { value: "review", label: "Review Article" },
  { value: "case-study", label: "Case Study" },
  { value: "conceptual", label: "Conceptual Paper" },
  { value: "editorial", label: "Editorial" },
  { value: "book-review", label: "Book Review" },
];

type SearchParams = {
  q?: string;
  type?: string;
  year?: string;
  page?: string;
};

/** Filters are applied server-side so every result view has a shareable URL. */
function applyFilters(articles: Article[], sp: SearchParams) {
  const q = sp.q?.trim().toLowerCase();

  return articles.filter((a) => {
    if (sp.type && sp.type !== "all" && a.type !== sp.type) return false;

    if (sp.year && sp.year !== "all") {
      if (new Date(a.publishedAt).getFullYear() !== Number(sp.year)) return false;
    }

    if (q) {
      const haystack = [
        a.title,
        a.abstract,
        ...a.keywords,
        ...a.contributors.map((c) => `${c.givenName} ${c.familyName}`),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/** Rebuilds the query string, dropping empty values and resetting the page. */
function hrefWith(sp: SearchParams, patch: Partial<SearchParams>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(merged)) {
    if (!value || value === "all") continue;
    if (key === "page" && value === "1") continue;
    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const all = await getPublishedArticles();
  const sorted = [...all].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

  const filtered = applyFilters(sorted, searchParams);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(
    Math.max(1, Number(searchParams.page) || 1),
    totalPages,
  );
  const results = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const years = Array.from(
    new Set(all.map((a) => new Date(a.publishedAt).getFullYear())),
  ).sort((a, b) => b - a);

  const activeType = searchParams.type ?? "all";
  const activeYear = searchParams.year ?? "all";
  const isFiltered =
    Boolean(searchParams.q) || activeType !== "all" || activeYear !== "all";

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Articles" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>Published Research</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Articles</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Every research article, review, case study and conceptual paper
          published in {" "}
          <abbr title="Blue Ocean Research Journal for Social Sciences">
            BORJSS
          </abbr>
          . All content is open access and free to read.
        </p>
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[18rem_1fr]">
        {/* ------------------------------------------------------ filters */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <form action="/articles" className="space-y-6">
            {/* keep the other filters when submitting a new search term */}
            {activeType !== "all" && (
              <input type="hidden" name="type" value={activeType} />
            )}
            {activeYear !== "all" && (
              <input type="hidden" name="year" value={activeYear} />
            )}

            <div>
              <label
                htmlFor="q"
                className="text-xs font-semibold uppercase tracking-wide text-brand-darker"
              >
                Search
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="q"
                  name="q"
                  type="search"
                  defaultValue={searchParams.q ?? ""}
                  placeholder="Title, author, keyword"
                  icon={<Search />}
                />
                <Button type="submit" size="icon" aria-label="Search articles">
                  <Search className="size-4" />
                </Button>
              </div>
            </div>
          </form>

          <FilterGroup
            heading="Type"
            options={TYPES.map((t) => ({
              label: t.label,
              value: t.value,
              href: hrefWith(searchParams, { type: t.value, page: "1" }),
              count:
                t.value === "all"
                  ? sorted.length
                  : sorted.filter((a) => a.type === t.value).length,
            }))}
            active={activeType}
            className="mt-6"
          />

          <FilterGroup
            heading="Year"
            options={[
              {
                label: "All years",
                value: "all",
                href: hrefWith(searchParams, { year: "all", page: "1" }),
                count: sorted.length,
              },
              ...years.map((y) => ({
                label: String(y),
                value: String(y),
                href: hrefWith(searchParams, { year: String(y), page: "1" }),
                count: sorted.filter(
                  (a) => new Date(a.publishedAt).getFullYear() === y,
                ).length,
              })),
            ]}
            active={activeYear}
            className="mt-6"
          />

          {isFiltered && (
            <Button
              href="/articles"
              variant="ghost"
              size="sm"
              className="mt-6 w-full"
            >
              Clear all filters
            </Button>
          )}
        </aside>

        {/* ------------------------------------------------------ results */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5">
            {/* The result count is the region's heading, so the cards' h3s
                follow an h2 rather than jumping straight from the page h1.
                Styled as body text because that is what it should look like —
                the level is structure, not size. */}
            <h2 className="text-sm font-normal text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "article" : "articles"}
              {isFiltered && " matching your filters"}
            </h2>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
            )}
          </div>

          {/* An empty archive and an over-narrow filter are different facts,
              and the filter wording is the wrong one for a journal that has
              published nothing: it offers to clear filters that would reveal
              no more than is already shown. */}
          {results.length === 0 ? (
            all.length === 0 ? (
              <EmptyState
                icon={FileSearch}
                title="No articles published yet"
                description="The inaugural issue is in production. Published articles will be listed here, each with its own page, abstract and PDF."
                action={{ label: "Author guidelines", href: "/for-authors/guidelines" }}
              />
            ) : (
              <EmptyState
                icon={FileSearch}
                title="No articles match those filters"
                description="Try a broader search term, or clear the filters to see everything published so far."
                action={{ label: "Clear filters", href: "/articles" }}
                secondaryAction={{ label: "Browse issues", href: "/issues" }}
              />
            )
          ) : (
            <>
              <ul className="grid gap-4">
                {results.map((a) => (
                  <ArticleListItem key={a.id} article={a} />
                ))}
              </ul>

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
    </div>
  );
}

function FilterGroup({
  heading,
  options,
  active,
  className,
}: {
  heading: string;
  options: { label: string; value: string; href: string; count: number }[];
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
