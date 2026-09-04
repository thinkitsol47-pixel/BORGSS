import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { getPosts } from "@/lib/api/articles";
import { PostCard } from "@/components/marketing/post-list";
import { Breadcrumb, EmptyState, Eyebrow } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Announcements",
  description:
    "Calls for papers, policy updates and issue releases from the Blue Ocean Research Journal for Social Sciences.",
};

export default async function AnnouncementsPage() {
  const posts = await getPosts("announcement");
  const now = Date.now();

  const current = posts.filter(
    (p) => !p.expiresAt || +new Date(p.expiresAt) >= now,
  );
  const expired = posts.filter(
    (p) => p.expiresAt && +new Date(p.expiresAt) < now,
  );

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Announcements" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>Journal Updates</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Announcements</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Calls for papers, changes to editorial policy, and issue releases.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Calls for papers and journal updates will be posted here."
          action={{ label: "Author guidelines", href: "/for-authors/guidelines" }}
          className="mt-8"
        />
      ) : (
        <div className="mt-8 space-y-10">
          <ul className="grid gap-4">
            {current.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </ul>

          {expired.length > 0 && (
            <section aria-labelledby="past">
              <div className="flex items-center gap-3">
                <h2 id="past" className="font-serif text-lg font-bold">
                  Past announcements
                </h2>
                <span className="h-px flex-1 bg-border" aria-hidden />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {expired.length}
                </span>
              </div>
              <ul className="mt-4 grid gap-4">
                {expired.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
