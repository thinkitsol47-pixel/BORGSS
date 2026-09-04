import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { getPosts } from "@/lib/api/articles";
import { PostCard, isPastEvent } from "@/components/marketing/post-list";
import { Breadcrumb, EmptyState, Eyebrow } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, training sessions and colloquia hosted by the Blue Ocean Research Journal for Social Sciences.",
};

export default async function EventsPage() {
  const posts = await getPosts("event");

  const upcoming = posts
    .filter((p) => !isPastEvent(p))
    // soonest first, so the next thing to attend is at the top
    .sort(
      (a, b) =>
        +new Date(a.event?.startsAt ?? a.publishedAt) -
        +new Date(b.event?.startsAt ?? b.publishedAt),
    );
  const past = posts.filter(isPastEvent);

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Events" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>Get Involved</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Events</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Workshops, reviewer training and colloquia run by the journal. Most
          are free and open to researchers at any institution.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events scheduled"
          description="Workshops and training sessions will be listed here when dates are confirmed."
          action={{ label: "Contact the office", href: "/contact" }}
          className="mt-8"
        />
      ) : (
        <div className="mt-8 space-y-10">
          <section aria-labelledby="upcoming">
            <div className="flex items-center gap-3">
              <h2 id="upcoming" className="font-serif text-lg font-bold">
                Upcoming
              </h2>
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="shrink-0 text-xs text-muted-foreground">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled at the moment"
                description="New workshops and training sessions are announced a few weeks in advance. Past events are listed below."
                className="mt-4"
              />
            ) : (
              <ul className="mt-4 grid gap-4">
                {upcoming.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section aria-labelledby="past">
              <div className="flex items-center gap-3">
                <h2 id="past" className="font-serif text-lg font-bold">
                  Past events
                </h2>
                <span className="h-px flex-1 bg-border" aria-hidden />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {past.length}
                </span>
              </div>
              <ul className="mt-4 grid gap-4">
                {past.map((p) => (
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
