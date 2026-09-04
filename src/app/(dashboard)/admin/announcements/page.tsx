import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Pencil, Plus } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { getPosts } from "@/lib/api/articles";
import { PortalPage } from "@/components/layout/portal-page";
import { Alert, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AnnouncementCategory, Post, PostKind } from "@/types";

export const metadata: Metadata = { title: "Announcements" };

const KIND_LABEL: Record<PostKind, string> = {
  announcement: "Announcement",
  news: "News",
  event: "Event",
};

/** Where each kind is read on the public site. */
const PUBLIC_PATH: Record<PostKind, string> = {
  announcement: "/announcements",
  news: "/news",
  event: "/events",
};

const CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  "call-for-papers": "Call for papers",
  "policy-update": "Policy update",
  "issue-release": "Issue release",
  general: "General",
};

/**
 * The editorial side of the three public post lists.
 *
 * `Post` already carries announcements, news and events under one shape, and
 * the public pages render all three. So this screen manages all three rather
 * than announcements alone: they are one content type with one lifecycle, and
 * splitting the admin view would mean three near-identical screens.
 *
 * The one fact this screen adds that the public pages cannot show is
 * **expiry** — a call for papers past its deadline vanishes from the public
 * list, and whoever wrote it needs to see that it has.
 */
export default async function Page({
  searchParams,
}: {
  searchParams?: { kind?: string };
}) {
  await requireGroup("adminOnly");

  const kinds: PostKind[] = ["announcement", "news", "event"];
  const kind = kinds.includes(searchParams?.kind as PostKind)
    ? (searchParams?.kind as PostKind)
    : undefined;

  const [announcements, news, events] = await Promise.all([
    getPosts("announcement"),
    getPosts("news"),
    getPosts("event"),
  ]);

  const all = [...announcements, ...news, ...events];
  const items = kind ? all.filter((p) => p.kind === kind) : all;

  const now = Date.now();
  const expired = all.filter(
    (p) => p.expiresAt && +new Date(p.expiresAt) < now,
  ).length;
  const scheduled = all.filter((p) => +new Date(p.publishedAt) > now).length;

  return (
    <PortalPage
      title="Announcements, news and events"
      lead="Everything published to the three public post lists, and what has expired off them."
      actions={
        <Link
          href="/admin/announcements/new"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-dark bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark"
        >
          <Plus className="size-4" aria-hidden />
          New post
        </Link>
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Announcements" value={announcements.length} href="/admin/announcements?kind=announcement" />
        <Stat label="News" value={news.length} href="/admin/announcements?kind=news" />
        <Stat label="Events" value={events.length} href="/admin/announcements?kind=event" />
        <Stat
          label="Expired"
          value={expired}
          href="/admin/announcements"
          tone={expired > 0 ? "warning" : "plain"}
        />
      </dl>

      {/* Scheduled posts are the surprise on this screen: a post dated in the
          future is already in the data and will appear on its own. */}
      {scheduled > 0 && (
        <div className="mt-6">
          <Alert tone="info" title={`${scheduled} dated in the future`}>
            These carry a publication date that has not arrived. The public
            lists sort by date and will show them as soon as it does — nothing
            further is needed, but nothing holds them back either.
          </Alert>
        </div>
      )}

      {/* Four links rather than a form: shareable URLs, no JavaScript. */}
      <nav aria-label="Filter by kind" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <FilterLink href="/admin/announcements" active={!kind}>
              All
            </FilterLink>
          </li>
          {kinds.map((k) => (
            <li key={k}>
              <FilterLink
                href={`/admin/announcements?kind=${k}`}
                active={kind === k}
              >
                {KIND_LABEL[k]}
              </FilterLink>
            </li>
          ))}
        </ul>
      </nav>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Megaphone}
            title="Nothing of that kind"
            description="No post of this kind has been published."
            action={{ label: "Show all", href: "/admin/announcements" }}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((post) => (
            <li key={post.id}>
              <PostRow post={post} />
            </li>
          ))}
        </ul>
      )}

      <Alert tone="warning" title="Publishing is not built yet" className="mt-8">
        The forms behind these buttons are built, but nothing they do is saved:
        the posts are fixtures in{" "}
        <span className="font-mono text-[0.9em]">mock-data.ts</span> and there
        is no database behind them. Adding an announcement today still means
        editing that file and deploying.
      </Alert>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function PostRow({ post }: { post: Post }) {
  const now = Date.now();
  const isExpired = Boolean(post.expiresAt && +new Date(post.expiresAt) < now);
  const isScheduled = +new Date(post.publishedAt) > now;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isExpired && "border-dashed bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <Link
            href={`${PUBLIC_PATH[post.kind]}/${post.slug}`}
            className="text-sm font-medium hover:text-primary hover:underline"
          >
            {post.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={`/admin/announcements/${post.kind}/${post.slug}/edit`}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
          >
            <Pencil className="size-3" aria-hidden />
            Edit
          </Link>
          <Badge variant="outline" size="sm">
            {KIND_LABEL[post.kind]}
          </Badge>
          {/* Three states, each named. Nothing is carried by colour alone. */}
          {isExpired ? (
            <Badge variant="warning" size="sm">
              Expired
            </Badge>
          ) : isScheduled ? (
            <Badge variant="brand" size="sm">
              Scheduled
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Live
            </Badge>
          )}
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>{isScheduled ? "Publishes" : "Published"}</dt>
          <dd className="font-medium text-foreground">
            {formatDate(post.publishedAt)}
          </dd>
        </div>
        {post.expiresAt && (
          <div className="flex gap-1.5">
            <dt>{isExpired ? "Expired" : "Expires"}</dt>
            <dd
              className={cn(
                "font-medium",
                isExpired ? "text-warning" : "text-foreground",
              )}
            >
              {formatDate(post.expiresAt)}
            </dd>
          </div>
        )}
        {post.category && (
          <div className="flex gap-1.5">
            <dt>Category</dt>
            <dd className="font-medium text-foreground">
              {CATEGORY_LABEL[post.category]}
            </dd>
          </div>
        )}
        {post.event && (
          <div className="flex gap-1.5">
            <dt>Event</dt>
            <dd className="font-medium text-foreground">
              {formatDate(post.event.startsAt)} · {post.event.location}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand-tint text-brand-darker"
          : "border-border text-muted-foreground hover:border-brand-border hover:text-brand-darker",
      )}
    >
      {children}
    </Link>
  );
}

function Stat({
  label,
  value,
  href,
  tone = "plain",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "plain" | "warning";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/40"
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-serif text-2xl font-semibold tabular-nums",
          tone === "warning" && value > 0 && "text-warning",
        )}
      >
        {value}
      </dd>
    </Link>
  );
}
