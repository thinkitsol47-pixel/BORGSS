import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  getIssueBySlug,
  getArticlesForIssue,
  getIssues,
} from "@/lib/api/articles";
import { IssueHeader, IssueContents } from "@/components/marketing/issue-toc";
import { Breadcrumb } from "@/components/ui";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const issues = await getIssues();
  return issues.map((i) => ({ issueId: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { issueId: string };
}): Promise<Metadata> {
  const issue = await getIssueBySlug(params.issueId);
  if (!issue) return {};

  const name = `Volume ${issue.volume}, Issue ${issue.number} (${issue.year})`;
  return {
    title: issue.title ? `${issue.title} — ${name}` : name,
    description: `Table of contents for ${name} of the Blue Ocean Research Journal for Social Sciences.`,
    alternates: { canonical: absoluteUrl(`/issues/${issue.slug}`) },
  };
}

export default async function IssuePage({
  params,
}: {
  params: { issueId: string };
}) {
  const issue = await getIssueBySlug(params.issueId);
  if (!issue) notFound();

  const articles = await getArticlesForIssue(issue);
  const all = await getIssues();

  const index = all.findIndex((i) => i.id === issue.id);
  const isCurrent = index === 0;
  const newer = index > 0 ? all[index - 1] : null;
  const older = index < all.length - 1 ? all[index + 1] : null;

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[
          { label: "Issues", href: "/issues" },
          { label: `Vol. ${issue.volume}, No. ${issue.number}` },
        ]}
      />

      <div className="mt-4">
        <IssueHeader
          issue={issue}
          articleCount={articles.length}
          isCurrent={isCurrent}
        />
      </div>

      <IssueContents articles={articles} />

      <nav
        aria-label="Issue navigation"
        className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
      >
        {older ? (
          <Link
            href={`/issues/${older.slug}`}
            className="text-sm font-medium text-primary hover:text-brand-dark"
          >
            ← Vol. {older.volume}, No. {older.number}
          </Link>
        ) : (
          <span />
        )}

        <Link
          href="/issues"
          className="text-sm font-medium text-primary hover:text-brand-dark"
        >
          All issues
        </Link>

        {newer ? (
          <Link
            href={`/issues/${newer.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
          >
            Vol. {newer.volume}, No. {newer.number}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
