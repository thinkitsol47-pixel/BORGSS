import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Inbox } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  daysWaiting,
  getQueueSections,
  listEditorialQueue,
  needsAttention,
  roundProgress,
  waitingOn,
  type QueueSort,
  type WaitingOn,
} from "@/lib/api/editorial";
import { PortalPage } from "@/components/layout/portal-page";
import { StatusBadge } from "@/components/portal/status-badge";
import { WaitingBadge } from "@/components/portal/waiting-badge";
import { QueueFilters } from "@/components/portal/queue-filters";
import {
  EmptyState,
  Pagination,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Submission, SubmissionStatus } from "@/types";

export const metadata: Metadata = { title: "Submission Queue" };

const SORTS: QueueSort[] = ["waiting", "newest", "oldest", "title"];

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    status?: string;
    section?: string;
    waitingOn?: string;
    sort?: string;
    page?: string;
  };
}) {
  await requireGroup("editorial");

  const q = searchParams?.q?.trim() || undefined;
  const status = asStatus(searchParams?.status);
  const section = searchParams?.section?.trim() || undefined;
  const waiting = asWaiting(searchParams?.waitingOn);
  const sort = SORTS.includes(searchParams?.sort as QueueSort)
    ? (searchParams?.sort as QueueSort)
    : "waiting";
  const page = Number(searchParams?.page) || 1;

  const [{ items, total, page: current, totalPages, stats }, sections] =
    await Promise.all([
      listEditorialQueue({ q, status, section, waitingOn: waiting, sort, page }),
      getQueueSections(),
    ]);

  const filtered = Boolean(q || status || section || waiting);

  return (
    <PortalPage
      title="Submission queue"
      lead="Every manuscript in the workflow, and who each one is waiting on."
    >
      {/* Counts first: an editor opens this page to find what has stalled, so
          the numbers that answer that come before the table. */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QueueStat label="In the workflow" value={stats.total} href="/editorial/queue" />
        <QueueStat
          label="With you"
          value={stats.withEditor}
          href="/editorial/queue?waitingOn=editor"
        />
        <QueueStat
          label="With reviewers"
          value={stats.withReviewers}
          href="/editorial/queue?waitingOn=reviewers"
        />
        <QueueStat
          label="Reviews overdue"
          value={stats.overdue}
          href="/editorial/queue"
          tone={stats.overdue > 0 ? "warning" : "plain"}
        />
      </dl>

      <div className="mt-6">
        <QueueFilters
          q={q}
          status={status}
          section={section}
          waiting={waiting}
          sort={sort}
          sections={sections}
        />
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Inbox}
            title={
              filtered
                ? "No manuscripts match those filters"
                : "The queue is empty"
            }
            description={
              filtered
                ? "Try a different status or section, or clear the filters to see everything."
                : "Nothing is currently in the workflow."
            }
            action={
              filtered
                ? { label: "Clear filters", href: "/editorial/queue" }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {total} {total === 1 ? "manuscript" : "manuscripts"}
            {filtered && " matching your filters"}
          </p>

          {/* Cards below md, table from md up — a seven-column table on a
              phone is unreadable however it scrolls. */}
          <ul className="mt-3 space-y-3 md:hidden">
            {items.map((s) => (
              <li key={s.id}>
                <QueueCard submission={s} />
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden md:block">
            <Table caption="Submission queue: manuscript, status, who it is waiting on, and how long">
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Title and author</TH>
                  <TH>Status</TH>
                  <TH>Waiting on</TH>
                  <TH>Reviews</TH>
                  <TH>Waiting</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((s) => {
                  const attention = needsAttention(s);
                  return (
                    <TR key={s.id} interactive>
                      <TD className="whitespace-nowrap font-medium">
                        <Link
                          href={`/editorial/${s.id}`}
                          className="text-primary hover:text-brand-dark hover:underline"
                        >
                          {s.reference}
                        </Link>
                      </TD>
                      <TD className="max-w-sm">
                        <Link
                          href={`/editorial/${s.id}`}
                          className="line-clamp-2 hover:text-primary"
                        >
                          {s.title}
                        </Link>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {authorLine(s)} · {s.section}
                        </span>
                      </TD>
                      <TD>
                        <StatusBadge status={s.status} size="sm" />
                      </TD>
                      <TD>
                        <WaitingBadge waiting={waitingOn(s)} />
                      </TD>
                      <TD className="whitespace-nowrap text-xs text-muted-foreground">
                        <ReviewCell submission={s} />
                      </TD>
                      <TD className="whitespace-nowrap text-xs">
                        <WaitingCell submission={s} attention={attention} />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>

          <Pagination
            page={current}
            totalPages={totalPages}
            buildHref={(p) =>
              buildHref({ q, status, section, waiting, sort, page: p })
            }
            className="mt-8"
          />
        </>
      )}
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function QueueStat({
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
    <div
      className={
        tone === "warning"
          ? "rounded-xl border border-warning/30 bg-warning/5 p-4"
          : "rounded-xl border p-4"
      }
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <Link
          href={href}
          className="font-serif text-2xl font-semibold tracking-tight hover:text-primary"
        >
          {value}
        </Link>
      </dd>
    </div>
  );
}

/**
 * "2 of 3" — with the overdue count called out, because a late reviewer is the
 * single most common reason a manuscript stalls and the editor is the only
 * person who can chase one.
 */
function ReviewCell({ submission }: { submission: Submission }) {
  const { completed, total, overdue } = roundProgress(submission);
  if (total === 0) return <span>—</span>;
  return (
    <span className="flex items-center gap-1.5">
      <span>
        {completed} of {total}
      </span>
      {overdue > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-warning">
          <AlertTriangle className="size-3.5" aria-hidden />
          {overdue} late
        </span>
      )}
    </span>
  );
}

/** Days since the manuscript last moved, flagged once it has sat too long. */
function WaitingCell({
  submission,
  attention,
}: {
  submission: Submission;
  attention: boolean;
}) {
  const days = daysWaiting(submission);
  return (
    <span className={attention ? "font-medium text-warning" : "text-muted-foreground"}>
      {days === 0 ? "Today" : `${days} ${days === 1 ? "day" : "days"}`}
    </span>
  );
}

function QueueCard({ submission: s }: { submission: Submission }) {
  const { completed, total, overdue } = roundProgress(s);
  const days = daysWaiting(s);
  const attention = needsAttention(s);

  return (
    <Link
      href={`/editorial/${s.id}`}
      className="block rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/30"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-medium text-primary">{s.reference}</span>
        <StatusBadge status={s.status} size="sm" />
        <WaitingBadge waiting={waitingOn(s)} />
      </div>
      <p className="mt-2 font-serif text-[15px] font-semibold leading-snug">
        {s.title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {authorLine(s)} · {s.section}
      </p>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {total > 0 && (
          <div className="flex gap-1.5">
            <dt>Reviews</dt>
            <dd className="font-medium text-foreground">
              {completed} of {total}
              {overdue > 0 && (
                <span className="ml-1 font-medium text-warning">
                  · {overdue} late
                </span>
              )}
            </dd>
          </div>
        )}
        <div className="flex gap-1.5">
          <dt>Waiting</dt>
          <dd className={attention ? "font-medium text-warning" : "font-medium text-foreground"}>
            {days === 0 ? "Today" : `${days} ${days === 1 ? "day" : "days"}`}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Submitted</dt>
          <dd className="font-medium text-foreground">
            {formatDate(s.submittedAt)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

/** "Khan et al." — enough to recognise the manuscript, short enough for a cell. */
function authorLine(s: Submission) {
  const first = s.contributors[0];
  if (!first) return "No authors listed";
  const name = first.familyName || first.givenName;
  return s.contributors.length > 1 ? `${name} et al.` : name;
}

function asStatus(value?: string): SubmissionStatus | undefined {
  const all: SubmissionStatus[] = [
    "draft",
    "submitted",
    "desk-review",
    "under-review",
    "awaiting-decision",
    "revision-requested",
    "revision-submitted",
    "accepted",
    "in-production",
    "published",
    "desk-rejected",
    "rejected",
    "withdrawn",
  ];
  return all.includes(value as SubmissionStatus)
    ? (value as SubmissionStatus)
    : undefined;
}

function asWaiting(value?: string): WaitingOn | undefined {
  const all: WaitingOn[] = ["editor", "reviewers", "author", "production"];
  return all.includes(value as WaitingOn) ? (value as WaitingOn) : undefined;
}

function buildHref({
  q,
  status,
  section,
  waiting,
  sort,
  page,
}: {
  q?: string;
  status?: string;
  section?: string;
  waiting?: string;
  sort?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (section) params.set("section", section);
  if (waiting) params.set("waitingOn", waiting);
  if (sort && sort !== "waiting") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/editorial/queue?${qs}` : "/editorial/queue";
}
