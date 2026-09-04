import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus, FileText, Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import {
  listSubmissionsForAuthor,
  reviewProgress,
  type SubmissionSort,
} from "@/lib/api/submissions";
import { PortalPage } from "@/components/layout/portal-page";
import { StatusBadge } from "@/components/portal/status-badge";
import { SubmissionFilters } from "@/components/portal/submission-filters";
import {
  Button,
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

export const metadata: Metadata = { title: "My Submissions" };

const SORTS: SubmissionSort[] = ["newest", "oldest", "updated", "title"];

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; sort?: string; page?: string };
}) {
  const user = await requireUser();

  // Validate off the query string rather than trusting it: an unknown status
  // should show everything, not an empty list the reader cannot explain.
  const q = searchParams?.q?.trim() || undefined;
  const status = asStatus(searchParams?.status);
  const sort = SORTS.includes(searchParams?.sort as SubmissionSort)
    ? (searchParams?.sort as SubmissionSort)
    : "newest";
  const page = Number(searchParams?.page) || 1;

  const { items, total, page: current, totalPages } =
    await listSubmissionsForAuthor(user.id, { q, status, sort, page });

  const filtered = Boolean(q || status);

  return (
    <PortalPage
      title="My submissions"
      lead="Every manuscript you have submitted, and where each one has reached."
      actions={
        <Button href="/submissions/new">
          <FilePlus className="size-4" aria-hidden />
          New submission
        </Button>
      }
    >
      <SubmissionFilters
        q={q}
        status={status}
        sort={sort}
        action="/submissions"
      />

      {items.length === 0 ? (
        <div className="mt-6">
          {filtered ? (
            <EmptyState
              icon={Inbox}
              title="No submissions match those filters"
              description="Try a different status, or clear the filters to see everything."
              action={{ label: "Clear filters", href: "/submissions" }}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="You have not submitted anything yet"
              description="When you submit a manuscript it will appear here, with its status and every letter from the editorial office."
              action={{ label: "Submit a manuscript", href: "/submissions/new" }}
              secondaryAction={{
                label: "Author guidelines",
                href: "/for-authors/guidelines",
              }}
            />
          )}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {total} {total === 1 ? "submission" : "submissions"}
            {filtered && " matching your filters"}
          </p>

          {/* Cards below md, table from md up. A seven-column table on a
              phone is unreadable however it scrolls. */}
          <ul className="mt-3 space-y-3 md:hidden">
            {items.map((s) => (
              <li key={s.id}>
                <SubmissionCard submission={s} />
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden md:block">
            <Table caption="My submissions: title, reference, status and last updated">
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Title</TH>
                  <TH>Status</TH>
                  <TH>Review</TH>
                  <TH>Submitted</TH>
                  <TH>Updated</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((s) => (
                  <TR key={s.id} interactive>
                    <TD className="whitespace-nowrap font-medium">
                      <Link
                        href={`/submissions/${s.id}`}
                        className="text-primary hover:text-brand-dark hover:underline"
                      >
                        {s.reference}
                      </Link>
                    </TD>
                    <TD className="max-w-sm">
                      <Link
                        href={`/submissions/${s.id}`}
                        className="line-clamp-2 hover:text-primary"
                      >
                        {s.title}
                      </Link>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {s.section}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={s.status} size="sm" />
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      <ReviewProgress submission={s} />
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(s.submittedAt)}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(s.updatedAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <Pagination
            page={current}
            totalPages={totalPages}
            buildHref={(p) => buildHref({ q, status, sort, page: p })}
            className="mt-8"
          />
        </>
      )}
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Phone card — the same six facts, stacked.
 * ------------------------------------------------------------------ */

function SubmissionCard({ submission: s }: { submission: Submission }) {
  return (
    <Link
      href={`/submissions/${s.id}`}
      className="block rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/30"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-medium text-primary">{s.reference}</span>
        <StatusBadge status={s.status} size="sm" />
      </div>
      <p className="mt-2 font-serif text-[15px] font-semibold leading-snug">
        {s.title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{s.section}</p>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>Submitted</dt>
          <dd className="font-medium text-foreground">
            {formatDate(s.submittedAt)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Updated</dt>
          <dd className="font-medium text-foreground">
            {formatDate(s.updatedAt)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

/**
 * "2 of 3 reviews" — but only while that number means something. A submitted
 * manuscript has no reviewers yet, and a rejected one's count is history.
 */
function ReviewProgress({ submission }: { submission: Submission }) {
  const showFor: SubmissionStatus[] = [
    "under-review",
    "awaiting-decision",
    "revision-submitted",
  ];
  if (!showFor.includes(submission.status)) return <span>—</span>;

  const { completed, total } = reviewProgress(submission);
  if (total === 0) return <span>—</span>;
  return (
    <span>
      {completed} of {total}
    </span>
  );
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

/** Keeps the active filters when paging. */
function buildHref({
  q,
  status,
  sort,
  page,
}: {
  q?: string;
  status?: string;
  sort?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/submissions?${qs}` : "/submissions";
}
