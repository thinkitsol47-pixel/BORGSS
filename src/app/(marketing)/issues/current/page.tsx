import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getCurrentIssue,
  getArticlesForIssue,
  getIssues,
} from "@/lib/api/articles";
import {
  IssueHeader,
  IssueContents,
} from "@/components/marketing/issue-toc";
import { Breadcrumb, EmptyState } from "@/components/ui";
import { FileText } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Current Issue",
  description:
    "The latest published issue of the Blue Ocean Research Journal for Social Sciences.",
};

export default async function CurrentIssuePage() {
  const issue = await getCurrentIssue();

  if (!issue) {
    return (
      <div className="container py-8 md:py-10">
        <Breadcrumb items={[{ label: "Issues", href: "/issues" }, { label: "Current" }]} />
        {/* The page still needs its one heading when there is no issue to
            name it after: `EmptyState`'s title renders an h2, so without this
            the empty branch shipped a page with no h1 at all. */}
        <h1 className="mt-4 font-serif text-3xl font-bold md:text-4xl">
          Current Issue
        </h1>
        <EmptyState
          icon={FileText}
          title="No issue published yet"
          description="The inaugural issue is in production. Accepted articles will appear here on publication."
          action={{ label: "Author guidelines", href: "/for-authors/guidelines" }}
          className="mt-8"
        />
      </div>
    );
  }

  const articles = await getArticlesForIssue(issue);
  const all = await getIssues();
  const previous = all[1];

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[{ label: "Issues", href: "/issues" }, { label: "Current" }]}
      />

      <div className="mt-4">
        <IssueHeader issue={issue} articleCount={articles.length} isCurrent />
      </div>

      <IssueContents articles={articles} />

      <nav
        aria-label="Issue navigation"
        className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
      >
        {previous ? (
          <Link
            href={`/issues/${previous.slug}`}
            className="text-sm font-medium text-primary hover:text-brand-dark"
          >
            ← Previous issue: Vol. {previous.volume}, No. {previous.number}
          </Link>
        ) : (
          <span />
        )}

        <Link
          href="/issues"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
        >
          All issues
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </nav>
    </div>
  );
}
