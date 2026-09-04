import "server-only";
import type { ReviewTask, ReviewTaskStatus } from "@/types";
import { mockReviews } from "./mock-reviews";

/**
 * Server-side data access for review tasks.
 * SCAFFOLD: reads mock data. Swap each body for a real tRPC/DB call.
 *
 * Mirrors `submissions.ts` deliberately — same query shape, same clamping,
 * same server-side filtering — so the two list screens behave identically and
 * a reader who learns one has learned the other.
 */

export const REVIEWS_PER_PAGE = 10;

export type ReviewSort = "due" | "invited" | "title";

export type ReviewQuery = {
  q?: string;
  status?: ReviewTaskStatus;
  sort?: ReviewSort;
  page?: number;
};

export type ReviewListResult = {
  items: ReviewTask[];
  total: number;
  page: number;
  totalPages: number;
};

/**
 * Every review task for the signed-in reviewer.
 *
 * Takes no user id yet because the mock set belongs to the one fixed account;
 * the parameter arrives with the backend.
 */
export async function getReviewTasks(): Promise<ReviewTask[]> {
  return [...mockReviews];
}

export async function getReviewTaskById(
  id: string,
): Promise<ReviewTask | null> {
  return mockReviews.find((r) => r.id === id) ?? null;
}

export async function listReviewTasks(
  query: ReviewQuery = {},
): Promise<ReviewListResult> {
  const { q, status, sort = "due", page = 1 } = query;

  let items = await getReviewTasks();

  if (status) items = items.filter((r) => r.status === status);

  if (q) {
    const needle = q.toLowerCase().trim();
    items = items.filter(
      (r) =>
        r.reference.toLowerCase().includes(needle) ||
        r.title.toLowerCase().includes(needle) ||
        r.keywords.some((k) => k.toLowerCase().includes(needle)),
    );
  }

  items = sortReviews(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * REVIEWS_PER_PAGE;

  return {
    items: items.slice(start, start + REVIEWS_PER_PAGE),
    total,
    page: current,
    totalPages,
  };
}

/**
 * Default order is by due date, soonest first — a reviewer's list is a work
 * queue, and the only question it has to answer is what to do next. Tasks with
 * no due date (a declined or unanswered invitation) sort last.
 */
function sortReviews(items: ReviewTask[], sort: ReviewSort) {
  const sorted = [...items];
  switch (sort) {
    case "invited":
      return sorted.sort(
        (a, b) => +new Date(b.invitedAt) - +new Date(a.invitedAt),
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "due":
    default:
      return sorted.sort((a, b) => {
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return +new Date(a.dueAt) - +new Date(b.dueAt);
      });
  }
}

/**
 * Whole days until a deadline; negative once it has passed.
 * Both dates are floored to midnight so "due today" is 0 rather than a
 * fraction that rounds unpredictably.
 */
export function daysUntil(iso: string, now = new Date()) {
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((+due - +today) / 86_400_000);
}

/** Counts for the reviewer's dashboard section. */
export async function getReviewerStats() {
  const all = await getReviewTasks();
  return {
    invited: all.filter((r) => r.status === "invited").length,
    inProgress: all.filter((r) => r.status === "accepted").length,
    overdue: all.filter((r) => r.status === "overdue").length,
    completed: all.filter((r) => r.status === "submitted").length,
    /** Invitations and active reviews, soonest deadline first. */
    actionable: sortReviews(
      all.filter((r) => ["invited", "accepted", "overdue"].includes(r.status)),
      "due",
    ),
  };
}
