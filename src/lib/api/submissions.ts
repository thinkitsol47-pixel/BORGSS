import "server-only";
import type { Submission, SubmissionStatus } from "@/types";
import { mockSubmissions } from "./mock-submissions";

/**
 * Server-side data access for submissions.
 * SCAFFOLD: reads mock data. Swap each body for a real tRPC/DB call.
 *
 * Filtering and sorting happen here rather than in the page so the same rules
 * apply when this becomes a database query — and so the list pages stay
 * server-rendered, which is what makes their URLs shareable and keeps them
 * working without JavaScript.
 */

export const SUBMISSIONS_PER_PAGE = 10;

export type SubmissionSort = "newest" | "oldest" | "updated" | "title";

export type SubmissionQuery = {
  /** Free text over reference, title and keywords. */
  q?: string;
  status?: SubmissionStatus;
  sort?: SubmissionSort;
  page?: number;
};

export type SubmissionListResult = {
  items: Submission[];
  /** Matches before pagination — what "12 submissions" in the heading counts. */
  total: number;
  page: number;
  totalPages: number;
};

/** Every submission owned by one account, newest first. */
export async function getSubmissionsForAuthor(
  userId: string,
): Promise<Submission[]> {
  return mockSubmissions
    .filter((s) => s.submittedById === userId)
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
}

export async function getSubmissionById(
  id: string,
): Promise<Submission | null> {
  return mockSubmissions.find((s) => s.id === id) ?? null;
}

/**
 * The author's list view: filter, sort, paginate.
 *
 * Returns the total before pagination so the caller can say how many matched
 * without loading every page.
 */
export async function listSubmissionsForAuthor(
  userId: string,
  query: SubmissionQuery = {},
): Promise<SubmissionListResult> {
  const { q, status, sort = "newest", page = 1 } = query;

  let items = await getSubmissionsForAuthor(userId);

  if (status) {
    items = items.filter((s) => s.status === status);
  }

  if (q) {
    const needle = q.toLowerCase().trim();
    items = items.filter(
      (s) =>
        s.reference.toLowerCase().includes(needle) ||
        s.title.toLowerCase().includes(needle) ||
        s.keywords.some((k) => k.toLowerCase().includes(needle)),
    );
  }

  items = sortSubmissions(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / SUBMISSIONS_PER_PAGE));
  // Clamp rather than 404: a stale bookmark to page 5 of a list that has since
  // shrunk should show the last page, not an error.
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * SUBMISSIONS_PER_PAGE;

  return {
    items: items.slice(start, start + SUBMISSIONS_PER_PAGE),
    total,
    page: current,
    totalPages,
  };
}

function sortSubmissions(items: Submission[], sort: SubmissionSort) {
  const sorted = [...items];
  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt),
      );
    case "updated":
      return sorted.sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return sorted.sort(
        (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
      );
  }
}

/**
 * How far through review a manuscript is, for the author's progress line.
 * Counts only the current round — a reviewer who returned a report in round 1
 * has not returned one for round 2.
 */
export function reviewProgress(submission: Submission) {
  const thisRound = submission.reviewAssignments.filter(
    (r) => r.round === submission.round,
  );
  const accepted = thisRound.filter((r) => r.status !== "declined");
  const completed = thisRound.filter((r) => r.status === "completed");
  return { completed: completed.length, total: accepted.length };
}

/** The decision the author is currently acting on, if any. */
export function latestDecision(submission: Submission) {
  return submission.decisions.length
    ? submission.decisions[submission.decisions.length - 1]
    : null;
}

/**
 * Counts for the author's dashboard.
 *
 * `needsAttention` is the number the dashboard leads on, because it is the
 * only one that implies the author has something to do — everything else is
 * waiting on the journal.
 */
export async function getAuthorStats(userId: string) {
  const all = await getSubmissionsForAuthor(userId);

  const inProgress = all.filter((s) =>
    (
      [
        "submitted",
        "desk-review",
        "under-review",
        "awaiting-decision",
        "revision-submitted",
      ] as SubmissionStatus[]
    ).includes(s.status),
  );

  const needsAttention = all.filter((s) => s.status === "revision-requested");

  const published = all.filter((s) =>
    (["accepted", "in-production", "published"] as SubmissionStatus[]).includes(
      s.status,
    ),
  );

  return {
    total: all.length,
    inProgress: inProgress.length,
    needsAttention: needsAttention.length,
    published: published.length,
    /** The rows the dashboard lists under "Needs your attention". */
    attentionItems: needsAttention,
    /** Most recently updated, for the activity list. */
    recent: [...all]
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 5),
  };
}

/**
 * How long the journal has actually taken on this author's manuscripts.
 *
 * Computed from their own history rather than quoted as a journal-wide
 * average, because an average across everyone tells an author nothing about
 * their own paper — and because publishing a headline "time to first
 * decision" the journal has not measured would be a claim it cannot support.
 *
 * Returns null where there is nothing to measure, so the caller can omit the
 * card rather than render a zero.
 */
export async function getAuthorTimings(userId: string) {
  const all = await getSubmissionsForAuthor(userId);

  const days = (from: string, to: string) =>
    Math.round((+new Date(to) - +new Date(from)) / 86_400_000);

  // First decision: submission → the round-1 decision letter.
  const toFirstDecision = all
    .map((s) => {
      const first = s.decisions.find((d) => d.round === 1);
      return first ? days(s.submittedAt, first.decidedAt) : null;
    })
    .filter((n): n is number => n !== null);

  // Review turnaround: each completed report, invitation → return.
  const reviewDays = all
    .flatMap((s) => s.reviewAssignments)
    .filter((r) => r.completedAt)
    .map((r) => days(r.invitedAt, r.completedAt!));

  const mean = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;

  return {
    firstDecisionDays: mean(toFirstDecision),
    firstDecisionCount: toFirstDecision.length,
    reviewDays: mean(reviewDays),
    reviewCount: reviewDays.length,
  };
}
