import type { Metadata } from "next";
import { Library, Search } from "lucide-react";
import { getIssues, getPublishedArticles } from "@/lib/api/articles";
import { IssueCard } from "@/components/marketing/issue-toc";
import { Breadcrumb, Button, EmptyState, Eyebrow } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Archives",
  description:
    "Browse every volume and issue published in the Blue Ocean Research Journal for Social Sciences.",
};

export default async function ArchivesPage() {
  const issues = await getIssues();
  const articles = await getPublishedArticles();

  const byId = new Map(articles.map((a) => [a.id, a]));
  const articlesIn = (issueId: string) =>
    (issues.find((i) => i.id === issueId)?.articleIds ?? [])
      .map((id) => byId.get(id))
      .filter((a): a is (typeof articles)[number] => Boolean(a));

  // Newest volume first; issues within a volume also newest first.
  const volumes = Array.from(new Set(issues.map((i) => i.volume)))
    .sort((a, b) => b - a)
    .map((volume) => ({
      volume,
      issues: issues
        .filter((i) => i.volume === volume)
        .sort((a, b) => b.number - a.number),
    }));

  const currentId = issues[0]?.id;

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Issues" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>Archives</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">All Issues</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Every issue published to date. All articles are open access and
          permanently available.
        </p>

        <dl className="mt-6 grid max-w-lg grid-cols-1 gap-px sm:grid-cols-3 overflow-hidden rounded-lg border border-brand-border bg-border">
          {[
            ["Volumes", volumes.length],
            ["Issues", issues.length],
            ["Articles", articles.length],
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

      {issues.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No issues published yet"
          description="The inaugural issue is in production and will appear here on publication."
          action={{ label: "Author guidelines", href: "/for-authors/guidelines" }}
          className="mt-8"
        />
      ) : (
        <div className="mt-10 space-y-12">
          {volumes.map((v) => (
            <section key={v.volume} aria-labelledby={`vol-${v.volume}`}>
              <div className="flex items-center gap-3">
                <h2
                  id={`vol-${v.volume}`}
                  className="font-serif text-xl font-bold"
                >
                  Volume {v.volume}
                </h2>
                <span className="h-px flex-1 bg-border" aria-hidden />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {v.issues.length} {v.issues.length === 1 ? "issue" : "issues"}
                </span>
              </div>

              <ul className="mt-5 grid gap-5 lg:grid-cols-2">
                {v.issues.map((issue) => {
                  const items = articlesIn(issue.id);
                  return (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      articleCount={items.length}
                      articles={items}
                      isCurrent={issue.id === currentId}
                    />
                  );
                })}
              </ul>
            </section>
          ))}

          {/* closes the page rather than ending on a half-empty grid row */}
          <section className="rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-lg">
                <h2 className="font-serif text-xl font-bold">
                  Looking for something specific?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Search every published article by title, author or keyword, or
                  filter the full archive by type and year.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/articles">
                  <Search className="size-4" aria-hidden />
                  Browse all articles
                </Button>
                <Button href="/for-authors/how-to-submit" variant="outline">
                  Submit your research
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
