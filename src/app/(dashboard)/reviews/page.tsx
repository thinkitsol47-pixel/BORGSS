import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Inbox, Search } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { listReviewTasks, type ReviewSort } from "@/lib/api/reviews";
import { PortalPage } from "@/components/layout/portal-page";
import {
  DueDate,
  REVIEW_FILTER_STATUSES,
  ReviewStatusBadge,
  reviewStatusLabel,
} from "@/components/portal/review-status";
import {
  Button,
  EmptyState,
  Input,
  Pagination,
  Select,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ReviewTask, ReviewTaskStatus } from "@/types";

export const metadata: Metadata = { title: "My Reviews" };

const SORTS: ReviewSort[] = ["due", "invited", "title"];

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; sort?: string; page?: string };
}) {
  await requireUser();

  const q = searchParams?.q?.trim() || undefined;
  const status = asStatus(searchParams?.status);
  const sort = SORTS.includes(searchParams?.sort as ReviewSort)
    ? (searchParams?.sort as ReviewSort)
    : "due";
  const page = Number(searchParams?.page) || 1;

  const { items, total, page: current, totalPages } = await listReviewTasks({
    q,
    status,
    sort,
    page,
  });

  const filtered = Boolean(q || status);

  return (
    <PortalPage
      title="My reviews"
      lead="Invitations awaiting your response, reviews in progress, and reports you have returned."
    >
      {/* Same GET-form filter bar as the submissions list: shareable URL, and
          it works with JavaScript disabled. */}
      <form
        action="/reviews"
        method="get"
        className="rounded-xl border border-brand-border bg-brand-tint/20 p-3 sm:p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="q"
              className="block text-xs font-medium text-muted-foreground"
            >
              Search
            </label>
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Reference, title or keyword"
              icon={<Search />}
              className="mt-1.5"
            />
          </div>

          <div className="sm:w-48">
            <label
              htmlFor="status"
              className="block text-xs font-medium text-muted-foreground"
            >
              Status
            </label>
            <Select
              id="status"
              name="status"
              defaultValue={status ?? ""}
              className="mt-1.5"
            >
              <option value="">Any status</option>
              {REVIEW_FILTER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {reviewStatusLabel(s)}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:w-44">
            <label
              htmlFor="sort"
              className="block text-xs font-medium text-muted-foreground"
            >
              Sort by
            </label>
            <Select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="mt-1.5"
            >
              <option value="due">Due date</option>
              <option value="invited">Recently invited</option>
              <option value="title">Title A–Z</option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              Apply
            </Button>
            {filtered && (
              <Button
                href="/reviews"
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="mt-6">
          {filtered ? (
            <EmptyState
              icon={Inbox}
              title="No reviews match those filters"
              description="Try a different status, or clear the filters to see everything."
              action={{ label: "Clear filters", href: "/reviews" }}
            />
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No review invitations yet"
              description="Editors invite reviewers by subject expertise. Keeping your profile's subject areas current makes an invitation more likely."
              action={{ label: "Update your profile", href: "/profile" }}
              secondaryAction={{
                label: "Reviewer guidelines",
                href: "/for-reviewers/guidelines",
              }}
            />
          )}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {total} {total === 1 ? "review" : "reviews"}
            {filtered && " matching your filters"}
          </p>

          {/* Cards at every width rather than a table. A review row's most
              important field is a deadline phrase, not a value to scan down a
              column, and the title needs two lines to be recognisable. */}
          <ul className="mt-3 space-y-3">
            {items.map((task) => (
              <li key={task.id}>
                <ReviewCard task={task} />
              </li>
            ))}
          </ul>

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

function ReviewCard({ task }: { task: ReviewTask }) {
  const needsResponse = task.status === "invited";

  return (
    <Link
      href={`/reviews/${task.id}`}
      className={
        task.status === "overdue"
          ? "block rounded-xl border border-warning/40 bg-warning/5 p-5 transition-colors hover:border-warning"
          : "block rounded-xl border p-5 transition-colors hover:border-brand-border hover:bg-brand-tint/30"
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-sm font-medium text-primary">
          {task.reference}
        </span>
        <ReviewStatusBadge status={task.status} size="sm" />
        {task.round > 1 && (
          <span className="text-xs text-muted-foreground">
            Round {task.round}
          </span>
        )}
      </div>

      <p className="mt-2 font-serif text-[15px] font-semibold leading-snug">
        {task.title}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="text-xs text-muted-foreground">{task.section}</span>
        {task.wordCount && (
          <span className="text-xs text-muted-foreground">
            {task.wordCount.toLocaleString()} words
          </span>
        )}
        {task.status === "submitted" && task.completedAt ? (
          <span className="text-xs text-muted-foreground">
            Returned {formatDate(task.completedAt)}
          </span>
        ) : (
          task.dueAt && <DueDate dueAt={task.dueAt} />
        )}
      </div>

      {needsResponse && (
        <p className="mt-3 border-t pt-3 text-xs font-medium text-brand-darker">
          Awaiting your response — open to accept or decline
        </p>
      )}
      {(task.status === "accepted" || task.status === "overdue") && (
        <p className="mt-3 border-t pt-3 text-xs font-medium text-brand-darker">
          Open to write or continue your review
        </p>
      )}
    </Link>
  );
}

function asStatus(value?: string): ReviewTaskStatus | undefined {
  const all: ReviewTaskStatus[] = [
    "invited",
    "accepted",
    "declined",
    "overdue",
    "submitted",
  ];
  return all.includes(value as ReviewTaskStatus)
    ? (value as ReviewTaskStatus)
    : undefined;
}

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
  if (sort && sort !== "due") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/reviews?${qs}` : "/reviews";
}
