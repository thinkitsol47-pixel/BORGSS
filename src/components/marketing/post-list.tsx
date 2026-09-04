import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Globe,
  MapPin,
} from "lucide-react";
import type { AnnouncementCategory, Post, PostKind } from "@/types";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

/**
 * Listing card shared by announcements, news and events. The three kinds
 * differ only in which metadata line they show, so one component covers all.
 */

export const KIND_PATH: Record<PostKind, string> = {
  announcement: "/announcements",
  news: "/news",
  event: "/events",
};

const CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  "call-for-papers": "Call for Papers",
  "policy-update": "Policy Update",
  "issue-release": "Issue Release",
  general: "Announcement",
};

/** Formats an event's date and time range in the reader's locale-neutral form. */
export function formatEventWhen(event: NonNullable<Post["event"]>): string {
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;

  const date = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const time = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (!end) return `${date}, ${time(start)}`;

  const sameDay = start.toDateString() === end.toDateString();
  return sameDay
    ? `${date}, ${time(start)}–${time(end)}`
    : `${date} – ${end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
}

export function isPastEvent(post: Post): boolean {
  const when = post.event?.endsAt ?? post.event?.startsAt;
  return when ? +new Date(when) < Date.now() : false;
}

export function PostCard({ post }: { post: Post }) {
  const past = isPastEvent(post);

  return (
    <li className="group relative rounded-lg border border-brand bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* ------------------------------------------------ meta line */}
          <div className="flex flex-wrap items-center gap-2">
            {post.kind === "announcement" && post.category && (
              <Badge size="sm">{CATEGORY_LABEL[post.category]}</Badge>
            )}
            {post.kind === "event" && (
              <Badge size="sm" variant={past ? "outline" : "solid"}>
                {past ? "Past event" : "Upcoming"}
              </Badge>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              {post.kind === "event" && post.event
                ? formatEventWhen(post.event)
                : formatDate(post.publishedAt)}
            </span>
          </div>

          <h2 className="mt-2 font-serif text-lg font-semibold leading-snug">
            <Link
              href={`${KIND_PATH[post.kind]}/${post.slug}`}
              className="after:absolute after:inset-0"
            >
              {post.title}
            </Link>
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {post.summary}
          </p>

          {/* --------------------------------------------- event details */}
          {post.event && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                {post.event.online ? (
                  <Globe className="size-3.5 shrink-0 text-brand" aria-hidden />
                ) : (
                  <MapPin className="size-3.5 shrink-0 text-brand" aria-hidden />
                )}
                {post.event.location}
              </span>
              {post.event.deadline && !past && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0 text-brand" aria-hidden />
                  Register by {formatDate(post.event.deadline)}
                </span>
              )}
            </div>
          )}
        </div>

        <ArrowUpRight
          aria-hidden
          className="mt-1 size-5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand group-hover:opacity-100"
        />
      </div>
    </li>
  );
}

/** Compact row for the home page's announcements strip. */
export function PostRow({ post }: { post: Post }) {
  return (
    <li className="group relative border-b py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        {post.category && (
          <Badge size="sm">{CATEGORY_LABEL[post.category]}</Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDate(post.publishedAt)}
        </span>
      </div>
      <p className="mt-1.5 font-serif text-base font-medium leading-snug">
        <Link
          href={`${KIND_PATH[post.kind]}/${post.slug}`}
          className="after:absolute after:inset-0 hover:text-brand-dark"
        >
          {post.title}
        </Link>
      </p>
    </li>
  );
}
