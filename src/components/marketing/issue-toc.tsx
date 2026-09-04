import Link from "next/link";
import { CalendarDays, Download, FileText, Layers } from "lucide-react";
import type { Article, ArticleType, Issue } from "@/types";
import { ArticleListItem } from "@/components/marketing/article-card";
import { Badge, Button, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

/**
 * An issue's masthead and table of contents. Shared by /issues/current and
 * /issues/[issueId] so the current issue is never a second implementation.
 *
 * Articles are grouped by type, in the order a printed issue would run them.
 */

const SECTION_ORDER: ArticleType[] = [
  "editorial",
  "research",
  "review",
  "conceptual",
  "case-study",
  "book-review",
];

const SECTION_LABEL: Record<ArticleType, string> = {
  editorial: "Editorials",
  research: "Research Articles",
  review: "Review Articles",
  conceptual: "Conceptual Papers",
  "case-study": "Case Studies",
  "book-review": "Book Reviews",
};

const SECTION_SINGULAR: Record<ArticleType, string> = {
  editorial: "Editorial",
  research: "Research Article",
  review: "Review Article",
  conceptual: "Conceptual Paper",
  "case-study": "Case Study",
  "book-review": "Book Review",
};

export function IssueHeader({
  issue,
  articleCount,
  isCurrent,
}: {
  issue: Issue;
  articleCount: number;
  isCurrent?: boolean;
}) {
  return (
    <header className="border-b pb-8">
      <div className="flex flex-wrap items-center gap-2">
        {isCurrent && <Badge variant="solid">Current Issue</Badge>}
        <Badge variant="outline">Open Access</Badge>
      </div>

      <h1 className="mt-4 text-3xl font-bold md:text-4xl">
        Volume {issue.volume}, Issue {issue.number}
      </h1>

      {issue.title && (
        <p className="mt-2 font-serif text-xl text-muted-foreground">
          {issue.title}
        </p>
      )}

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-brand" aria-hidden />
          <dt className="text-muted-foreground">Published</dt>
          <dd className="font-medium">{formatDate(issue.publishedAt)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-brand" aria-hidden />
          <dt className="text-muted-foreground">Articles</dt>
          <dd className="font-medium">{articleCount}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-brand" aria-hidden />
          <dt className="text-muted-foreground">Year</dt>
          <dd className="font-medium">{issue.year}</dd>
        </div>
      </dl>
    </header>
  );
}

export function IssueContents({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="This issue is in production"
        description="Accepted articles are being prepared for publication and will appear here once the issue is released."
        action={{ label: "Browse published articles", href: "/articles" }}
        className="mt-8"
      />
    );
  }

  const groups = SECTION_ORDER.map((type) => {
    const items = articles.filter((a) => a.type === type);
    return {
      type,
      label: items.length === 1 ? SECTION_SINGULAR[type] : SECTION_LABEL[type],
      items,
    };
  }).filter((g) => g.items.length > 0);

  return (
    <div className="mt-8 space-y-10">
      {groups.map((group) => (
        <section key={group.type} aria-labelledby={`sec-${group.type}`}>
          <div className="flex items-center gap-3">
            <h2
              id={`sec-${group.type}`}
              className="font-serif text-lg font-bold"
            >
              {group.label}
            </h2>
            <span className="h-px flex-1 bg-border" aria-hidden />
            <span className="shrink-0 text-xs text-muted-foreground">
              {group.items.length}
            </span>
          </div>

          <ul className="mt-4 grid gap-4">
            {group.items.map((a) => (
              <ArticleListItem key={a.id} article={a} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Card used in the archive grid. */
export function IssueCard({
  issue,
  articleCount,
  articles = [],
  isCurrent,
}: {
  issue: Issue;
  articleCount: number;
  /** Used to list a few titles and the section mix; optional. */
  articles?: Article[];
  isCurrent?: boolean;
}) {
  const sections = SECTION_ORDER.map((type) => ({
    label: SECTION_LABEL[type],
    singular: SECTION_SINGULAR[type],
    count: articles.filter((a) => a.type === type).length,
  })).filter((s) => s.count > 0);

  return (
    <li className="group relative flex overflow-hidden rounded-lg border border-brand bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* spine — stands in until real cover art exists */}
      <div className="relative flex w-28 shrink-0 flex-col items-center justify-center bg-brand-gradient p-4 text-center text-brand-foreground sm:w-36">
        <div
          aria-hidden
          className="absolute -right-6 -top-6 size-20 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-8 -left-6 size-24 rounded-full bg-white/10"
        />
        <p className="relative font-serif text-2xl font-bold sm:text-3xl">
          Vol. {issue.volume}
        </p>
        <p className="relative mt-0.5 font-serif text-base opacity-95 sm:text-lg">
          No. {issue.number}
        </p>
        <span
          aria-hidden
          className="relative my-3 h-px w-8 bg-white/40"
        />
        <p className="relative text-[11px] uppercase tracking-[0.16em] opacity-85">
          {issue.year}
        </p>
      </div>

      {/* details */}
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isCurrent && (
            <Badge size="sm" variant="solid">
              Current
            </Badge>
          )}
          <Badge size="sm" variant="outline">
            {articleCount} {articleCount === 1 ? "article" : "articles"}
          </Badge>
        </div>

        {issue.title && (
          <h3 className="mt-2.5 font-serif text-lg font-semibold leading-snug">
            <Link
              href={`/issues/${issue.slug}`}
              className="after:absolute after:inset-0"
            >
              {issue.title}
            </Link>
          </h3>
        )}

        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {formatDate(issue.publishedAt)}
        </p>

        {sections.length > 0 && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {sections
              .map((s) => `${s.count} ${s.count === 1 ? s.singular : s.label}`)
              .join(" · ")}
          </p>
        )}

        {articles.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
            {articles.slice(0, 3).map((a) => (
              <li
                key={a.id}
                className="truncate text-xs text-muted-foreground"
                title={a.title}
              >
                <span className="mr-1.5 text-brand" aria-hidden>
                  ›
                </span>
                {a.title}
              </li>
            ))}
            {articles.length > 3 && (
              <li className="text-xs text-muted-foreground/80">
                + {articles.length - 3} more
              </li>
            )}
          </ul>
        )}

        <span className="mt-auto pt-4 text-sm font-medium text-primary">
          View table of contents →
        </span>
      </div>
    </li>
  );
}

/** Download-the-whole-issue action; wired once galley files exist. */
export function IssueActions({ issue }: { issue: Issue }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button href={`/issues/${issue.slug}`} variant="outline" size="sm">
        <Download className="size-4" />
        Full issue (PDF)
      </Button>
      <Button href="/articles" variant="ghost" size="sm">
        Browse all articles
      </Button>
    </div>
  );
}
