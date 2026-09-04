import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
} from "lucide-react";
import type { AnnouncementCategory, Post } from "@/types";
import {
  KIND_PATH,
  formatEventWhen,
  isPastEvent,
} from "@/components/marketing/post-list";
import { Alert, Badge, Breadcrumb, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  "call-for-papers": "Call for Papers",
  "policy-update": "Policy Update",
  "issue-release": "Issue Release",
  general: "Announcement",
};

const KIND_LABEL = {
  announcement: "Announcements",
  news: "News",
  event: "Events",
} as const;

/** Detail view shared by all three post kinds. */
export function PostDetail({
  post,
  related,
}: {
  post: Post;
  related: Post[];
}) {
  const past = isPastEvent(post);
  const backHref = KIND_PATH[post.kind];

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[
          { label: KIND_LABEL[post.kind], href: backHref },
          { label: post.title },
        ]}
      />

      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_18rem]">
        {/* ---------------------------------------------------------- body */}
        <article className="min-w-0">
          <header className="border-b pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {post.kind === "announcement" && post.category && (
                <Badge variant="solid">{CATEGORY_LABEL[post.category]}</Badge>
              )}
              {post.kind === "event" && (
                <Badge variant={past ? "outline" : "solid"}>
                  {past ? "Past event" : "Upcoming event"}
                </Badge>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden />
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </span>
            </div>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
              {post.title}
            </h1>

            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {post.summary}
            </p>
          </header>

          {/* expiry notice for a lapsed call for papers */}
          {post.expiresAt && +new Date(post.expiresAt) < Date.now() && (
            <div className="mt-6">
              <Alert tone="warning" title="This announcement has expired">
                The deadline given below has passed. Submissions are still
                welcome on a rolling basis for future issues.
              </Alert>
            </div>
          )}

          <div className="prose mt-6">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {post.action && (
            <div className="mt-8">
              <Button href={post.action.href} size="lg">
                {post.action.label}
              </Button>
            </div>
          )}

          <div className="mt-10 border-t pt-6">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All {KIND_LABEL[post.kind].toLowerCase()}
            </Link>
          </div>
        </article>

        {/* ---------------------------------------------------------- rail */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {post.event && (
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-darker">
                Event details
              </p>

              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5 text-brand" aria-hidden />
                    When
                  </dt>
                  <dd className="mt-0.5 font-medium leading-relaxed">
                    {formatEventWhen(post.event)}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {post.event.online ? (
                      <Globe className="size-3.5 text-brand" aria-hidden />
                    ) : (
                      <MapPin className="size-3.5 text-brand" aria-hidden />
                    )}
                    Where
                  </dt>
                  <dd className="mt-0.5 font-medium">{post.event.location}</dd>
                </div>

                {post.event.deadline && (
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5 text-brand" aria-hidden />
                      Registration closes
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {formatDate(post.event.deadline)}
                    </dd>
                  </div>
                )}
              </dl>

              {post.event.registerUrl && !past && (
                <Button
                  href={post.event.registerUrl}
                  size="sm"
                  className="mt-4 w-full"
                >
                  Register
                  <ExternalLink className="size-3.5" aria-hidden />
                </Button>
              )}

              {past && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  This event has taken place. Details are kept here for the
                  record.
                </p>
              )}
            </Card>
          )}

          {related.length > 0 && (
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-darker">
                More {KIND_LABEL[post.kind].toLowerCase()}
              </p>
              <ul className="mt-3 space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`${KIND_PATH[r.kind]}/${r.slug}`}
                      className="text-sm font-medium leading-snug hover:text-brand-dark"
                    >
                      {r.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(r.publishedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="bg-brand-tint/30 p-5">
            <p className="text-sm font-semibold">Submit your research</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Open access, double-blind peer review, and a clear editorial
              process from submission to publication.
            </p>
            <Button
              href="/for-authors/how-to-submit"
              size="sm"
              variant="outline"
              className="mt-3 w-full"
            >
              Start a submission
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
