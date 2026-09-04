import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import type { Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  research: "Research Article",
  review: "Review Article",
  "case-study": "Case Study",
  editorial: "Editorial",
  conceptual: "Conceptual Paper",
  "book-review": "Book Review",
};

function authorLine(article: Article) {
  const names = article.contributors.map(
    (c) => `${c.givenName} ${c.familyName}`,
  );
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
}

/**
 * Full card — used in grids.
 *
 * The root must stay `relative`: the title is a stretched link whose
 * ::after overlay anchors to the nearest positioned ancestor. Drop it and
 * the clickable area escapes the card and covers a large part of the page.
 */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card interactive className="group relative flex flex-col">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <Badge size="sm">{TYPE_LABEL[article.type] ?? article.type}</Badge>
          {article.publishedAt && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-serif text-lg font-semibold leading-snug">
          <Link
            href={`/articles/${article.slug}`}
            className="after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm font-medium text-foreground/80">
          {authorLine(article)}
        </p>

        {article.abstract && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.abstract}
          </p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted-foreground">
          <span>
            Vol. {article.volume}, No. {article.issue}
          </span>
          {article.pages && <span>pp. {article.pages}</span>}
          {article.galleys.some((g) => g.label === "PDF") && (
            <span className="inline-flex items-center gap-1">
              <FileText className="size-3.5" aria-hidden />
              PDF
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Compact row — used in tables of contents and lists. */
export function ArticleListItem({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "group relative rounded-lg border border-brand bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {TYPE_LABEL[article.type] ?? article.type}
          </p>

          <h3 className="mt-1.5 font-serif text-lg font-medium leading-snug">
            <Link
              href={`/articles/${article.slug}`}
              className="after:absolute after:inset-0"
            >
              {article.title}
            </Link>
          </h3>

          <p className="mt-1.5 text-sm font-medium text-foreground/80">
            {authorLine(article)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {article.pages && <span>pp. {article.pages}</span>}
            {article.doi && (
              <span className="truncate">https://doi.org/{article.doi}</span>
            )}
          </div>
        </div>

        <ArrowUpRight
          aria-hidden
          className="mt-1 size-5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand group-hover:opacity-100"
        />
      </div>
    </li>
  );
}
