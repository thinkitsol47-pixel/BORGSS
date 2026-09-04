import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getPosts } from "@/lib/api/articles";
import { PostCard } from "@/components/marketing/post-list";
import { Breadcrumb, EmptyState, Eyebrow } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "News",
  description:
    "Developments from the Blue Ocean Research Journal for Social Sciences — indexing, editorial board, and publishing milestones.",
};

export default async function NewsPage() {
  const posts = await getPosts("news");

  // Grouped by year so a growing archive stays navigable.
  const years = Array.from(
    new Set(posts.map((p) => new Date(p.publishedAt).getFullYear())),
  ).sort((a, b) => b - a);

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "News" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>From the Journal</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">News</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Developments at the journal: indexing progress, editorial appointments,
          and publishing milestones.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No news yet"
          description="Updates about the journal will be posted here as they happen."
          action={{ label: "About the journal", href: "/about" }}
          className="mt-8"
        />
      ) : (
        <div className="mt-8 space-y-10">
          {years.map((year) => (
            <section key={year} aria-labelledby={`y-${year}`}>
              <div className="flex items-center gap-3">
                <h2 id={`y-${year}`} className="font-serif text-lg font-bold">
                  {year}
                </h2>
                <span className="h-px flex-1 bg-border" aria-hidden />
              </div>
              <ul className="mt-4 grid gap-4">
                {posts
                  .filter(
                    (p) => new Date(p.publishedAt).getFullYear() === year,
                  )
                  .map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
