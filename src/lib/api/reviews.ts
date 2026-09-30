import "server-only";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isStoredFile } from "@/lib/storage";
import type {
  ReviewTask,
  ReviewTaskStatus,
  ReviewCriterion,
  ReviewScore,
  ReviewRecommendation,
} from "@/types";

/**
 * Server-side data access for review tasks.
 *
 * Phase 3: reads Postgres through Prisma. Mirrors `submissions.ts`
 * deliberately — same query shape, same clamping, same server-side
 * filtering — so the two list screens behave identically and a reader who
 * learns one has learned the other.
 *
 * Double-blind, enforced by the query: `ReviewAssignment.submission` is
 * fetched but never its `contributors` — the same separation `submissions.ts`
 * keeps in the other direction (author pages get `reviewAssignment.label`,
 * never `reviewer.name`). A `ReviewTask` has nowhere to put an author name,
 * so this file cannot leak one by a careless `include`.
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
 * Prisma Client's generated enums are camelCase (`@map()` only renames the
 * database column); `src/types` uses the kebab-case wire values the rest of
 * the app was built against.
 */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

const assignmentInclude = {
  submission: { include: { section: true, files: true } },
  report: true,
} satisfies Prisma.ReviewAssignmentInclude;

type AssignmentRow = Prisma.ReviewAssignmentGetPayload<{
  include: typeof assignmentInclude;
}>;

/**
 * Maps one assignment (this reviewer's invitation) plus its submission to the
 * `ReviewTask` the reviewer-facing pages render.
 *
 * `status` adds `"overdue"` and `"submitted"` on top of the four stored
 * `AssignmentStatus` values: overdue is derived the same way
 * `submissions.ts` derives it (accepted, past `dueAt`, nothing returned);
 * submitted is `"completed"` renamed for the reviewer's own vocabulary — the
 * report existing is what "submitted" means from this side.
 */
function toReviewTask(row: AssignmentRow): ReviewTask {
  const overdue =
    row.status === "accepted" && row.dueAt !== null && row.dueAt < new Date();
  const status: ReviewTaskStatus = row.report
    ? "submitted"
    : overdue
      ? "overdue"
      : (row.status as ReviewTaskStatus);

  return {
    id: row.id,
    reference: row.submission.reference,
    title: row.submission.title,
    abstract: row.submission.abstract,
    keywords: row.submission.keywords,
    type: camelToKebab(row.submission.type) as ReviewTask["type"],
    section: row.submission.section.name,
    round: row.round,
    status,
    invitedAt: row.invitedAt.toISOString(),
    respondedAt: row.respondedAt?.toISOString(),
    dueAt: row.dueAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    review: row.report
      ? {
          scores: row.report.scores as Record<ReviewCriterion, ReviewScore>,
          recommendation: camelToKebab(
            row.report.recommendation,
          ) as ReviewRecommendation,
          commentsToAuthor: row.report.commentsToAuthor,
          commentsToEditor: row.report.commentsToEditor,
          concernsRaised: row.report.concernsRaised ?? undefined,
          submittedAt: row.report.submittedAt.toISOString(),
        }
      : undefined,
    // No word count is stored — SubmissionFile carries no word-count field,
    // and computing one from a manuscript file needs the file's actual text,
    // which there is no storage backend to read yet.
    wordCount: undefined,
    // Both kinds name the authors, and the review is double-blind. The same
    // pair is refused by `lib/storage/entitlement.ts`, so a reviewer who
    // guessed a file id would still be turned away — but a file listed and
    // then refused reads as a broken portal, so it is not listed either.
    files: row.submission.files
      .filter((f) => f.kind !== "titlePage" && f.kind !== "coverLetter")
      .map((f) => ({
        id: f.id,
        filename: f.filename,
        sizeBytes: Number(f.sizeBytes),
        stored: isStoredFile(f.storagePath),
      })),
    invitationNote: row.invitationNote ?? undefined,
  };
}

/**
 * Every review task for the signed-in reviewer.
 *
 * Takes no user id — same signature as the mock version — because there is
 * still only one session. `getCurrentUser()` is what changes when auth
 * (Phase 2) lands; this file does not need to.
 */
export async function getReviewTasks(): Promise<ReviewTask[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await db.reviewAssignment.findMany({
    where: { reviewerId: user.id },
    include: assignmentInclude,
    orderBy: { invitedAt: "desc" },
  });
  return rows.map(toReviewTask);
}

export async function getReviewTaskById(
  id: string,
): Promise<ReviewTask | null> {
  // A pre-database id ("rv4", from mock-reviews.ts) or any other non-UUID
  // string is not a lookup failure the database should see — it is simply
  // not there, the same as a real UUID with no matching row.
  if (!isUuid(id)) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const row = await db.reviewAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
  // Scoped to the signed-in reviewer: another reviewer's task is "not found",
  // not merely unlisted. The manuscript is confidential and the assignment is
  // not this person's to see.
  if (!row || row.reviewerId !== user.id) return null;
  return toReviewTask(row);
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
