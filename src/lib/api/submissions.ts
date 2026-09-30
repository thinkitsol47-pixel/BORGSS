import "server-only";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import { isStoredFile } from "@/lib/storage";
import type {
  Submission,
  SubmissionStatus,
  ArticleType,
  SubmissionFileKind,
  DecisionType,
  ReviewAssignment,
} from "@/types";

/**
 * Prisma Client's generated TS enums are always camelCase — `@map()` in the
 * schema only renames the database column, not the generated type — while
 * `src/types` (and every page) uses the kebab-case wire values the rest of the
 * app was built against. One mechanical converter for the four enums that
 * differ, rather than a bespoke `Record` per enum.
 */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * Server-side data access for submissions.
 *
 * Phase 3: reads Postgres through Prisma. Filtering and sorting still happen
 * here rather than in the page, so the list pages stay server-rendered — which
 * is what makes their URLs shareable and keeps them working without
 * JavaScript.
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

/**
 * The full shape a `Submission` is assembled from. One constant so a query
 * that forgets a relation fails at compile time rather than rendering a blank
 * field.
 */
const submissionInclude = {
  section: true,
  contributors: {
    include: { affiliations: { include: { affiliation: true } } },
    orderBy: { position: "asc" },
  },
  files: { orderBy: { round: "asc" } },
  decisions: { include: { decidedBy: true }, orderBy: { decidedAt: "asc" } },
  messages: { include: { from: true }, orderBy: { sentAt: "asc" } },
  assignments: { include: { reviewer: true }, orderBy: { invitedAt: "asc" } },
} satisfies Prisma.SubmissionInclude;

type SubmissionRow = Prisma.SubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

/**
 * Maps a row to the `Submission` the app renders.
 *
 * Two things the database does not store directly:
 * - `section` is the section's name, not its id — the type predates the
 *   registry and every page reads a display string.
 * - `ReviewAssignment.status` adds `"overdue"`, which is not a stored enum
 *   value (`AssignmentStatus` has none) but a fact derived from an accepted
 *   assignment whose `dueAt` has passed.
 */
function toSubmission(row: SubmissionRow): Submission {
  const reviewAssignments: ReviewAssignment[] = row.assignments.map((a) => {
    const overdue =
      a.status === "accepted" && a.dueAt !== null && a.dueAt < new Date();
    return {
      id: a.id,
      reviewerName: a.reviewer.name,
      label: a.label,
      invitedAt: a.invitedAt.toISOString(),
      respondedAt: a.respondedAt?.toISOString(),
      dueAt: a.dueAt?.toISOString(),
      completedAt: a.completedAt?.toISOString(),
      status: overdue ? "overdue" : a.status,
      round: a.round,
    };
  });

  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    abstract: row.abstract,
    keywords: row.keywords,
    type: camelToKebab(row.type) as ArticleType,
    section: row.section.name,
    contributors: row.contributors.map((c) => ({
      id: c.id,
      givenName: c.givenName,
      familyName: c.familyName,
      orcid: c.orcid ?? undefined,
      isCorresponding: c.isCorresponding,
      email: c.email ?? undefined,
      affiliations: c.affiliations.map((ca) => ({
        id: ca.affiliation.id,
        name: ca.affiliation.name,
        city: ca.affiliation.city ?? undefined,
        country: ca.affiliation.country ?? undefined,
        ror: ca.affiliation.ror ?? undefined,
      })),
    })),
    submittedById: row.submittedById,
    status: camelToKebab(row.status) as SubmissionStatus,
    round: row.round,
    submittedAt: row.submittedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    revisionDueAt: row.revisionDueAt?.toISOString(),
    files: row.files.map((f) => ({
      id: f.id,
      kind: camelToKebab(f.kind) as SubmissionFileKind,
      filename: f.filename,
      sizeBytes: Number(f.sizeBytes),
      uploadedAt: f.uploadedAt.toISOString(),
      round: f.round,
      // The path never leaves this layer — only whether it points at a real
      // upload. See `SubmissionFile.stored` in src/types.
      stored: isStoredFile(f.storagePath),
    })),
    decisions: row.decisions.map((d) => ({
      id: d.id,
      type: camelToKebab(d.type) as DecisionType,
      decidedAt: d.decidedAt.toISOString(),
      decidedBy: d.decidedBy.name,
      letter: d.letter,
      round: d.round,
    })),
    messages: row.messages.map((m) => ({
      id: m.id,
      sentAt: m.sentAt.toISOString(),
      from: m.from.name,
      fromRole: m.fromRole as "author" | "editor",
      subject: m.subject,
      body: m.body,
    })),
    reviewAssignments,
    articleId: row.articleId ?? undefined,
  };
}

/** Every submission owned by one account, newest first. */
export async function getSubmissionsForAuthor(
  userId: string,
): Promise<Submission[]> {
  const rows = await db.submission.findMany({
    where: { submittedById: userId },
    include: submissionInclude,
    orderBy: { submittedAt: "desc" },
  });
  return rows.map(toSubmission);
}

export async function getSubmissionById(
  id: string,
): Promise<Submission | null> {
  // A pre-database id ("s1", from mock-submissions.ts) or any other non-UUID
  // string is not a lookup failure the database should see — it is simply
  // not there, the same as a real UUID with no matching row.
  if (!isUuid(id)) return null;

  const row = await db.submission.findUnique({
    where: { id },
    include: submissionInclude,
  });
  return row ? toSubmission(row) : null;
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

/* -------------------------------------------------------------------------- */
/*  The wizard's review step                                                   */
/* -------------------------------------------------------------------------- */

/**
 * What the contributors step needs to reopen on what is stored.
 *
 * Deliberately **not** `DraftSummary.contributors`, which flattens each author
 * to a display `name` for the review screen. A form has to put the given name
 * and family name in separate boxes, and needs the email and ORCID that the
 * summary has no use for — so the two shapes are different on purpose rather
 * than one being made to serve both.
 */
export type DraftContributor = {
  givenName: string;
  familyName: string;
  email: string;
  affiliation: string;
  orcid: string;
  isCorresponding: boolean;
};

/**
 * The stored author list for a draft, in order.
 *
 * Ownership is part of the query for the same reason as `getDraftSummary`:
 * someone else's draft, or one already submitted, returns an empty list and the
 * form simply opens blank. The action refuses the write independently.
 */
export async function getDraftContributors(
  draftId: string,
  userId: string,
): Promise<DraftContributor[]> {
  if (!isUuid(draftId)) return [];

  const draft = await db.submission.findFirst({
    where: { id: draftId, submittedById: userId, status: "draft" },
    select: {
      contributors: {
        orderBy: { position: "asc" },
        select: {
          givenName: true,
          familyName: true,
          email: true,
          orcid: true,
          isCorresponding: true,
          affiliations: {
            select: { affiliation: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!draft) return [];

  return draft.contributors.map((c) => ({
    givenName: c.givenName,
    familyName: c.familyName,
    email: c.email ?? "",
    orcid: c.orcid ?? "",
    // One institution per row on the form; a contributor with several keeps
    // the first, which is the one the form wrote.
    affiliation: c.affiliations[0]?.affiliation.name ?? "",
    isCorresponding: c.isCorresponding,
  }));
}

export type DraftSummary = {
  reference: string;
  type: ArticleType;
  sectionName: string | null;
  title: string;
  abstract: string;
  keywords: string[];
  funding: string | null;
  conflictOfInterest: string | null;
  aiDisclosure: string | null;
  dataAvailability: string | null;
  declaredAt: Date | null;
  files: { kind: SubmissionFileKind; filename: string }[];
  contributors: {
    name: string;
    affiliation: string | null;
    isCorresponding: boolean;
  }[];
};

/**
 * Everything step 6 shows back to the author before they submit.
 *
 * Ownership is part of the query, not a check after it: a draft belonging to
 * someone else, or one already submitted, returns null and the page treats it
 * the same as a draft that does not exist. This mirrors `ownedDraft` in the
 * wizard's actions — the action re-checks independently, because a Server
 * Action is its own entry point and never trusts what a page rendered.
 */
export async function getDraftSummary(
  draftId: string,
  userId: string,
): Promise<DraftSummary | null> {
  if (!isUuid(draftId)) return null;

  const draft = await db.submission.findFirst({
    where: { id: draftId, submittedById: userId, status: "draft" },
    select: {
      reference: true,
      type: true,
      title: true,
      abstract: true,
      keywords: true,
      funding: true,
      conflictOfInterest: true,
      aiDisclosure: true,
      dataAvailability: true,
      declaredAt: true,
      section: { select: { name: true } },
      files: { select: { kind: true, filename: true } },
      contributors: {
        orderBy: { position: "asc" },
        select: {
          givenName: true,
          familyName: true,
          isCorresponding: true,
          affiliations: {
            select: { affiliation: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!draft) return null;

  return {
    reference: draft.reference,
    type: camelToKebab(draft.type) as ArticleType,
    sectionName: draft.section?.name ?? null,
    title: draft.title,
    abstract: draft.abstract,
    keywords: draft.keywords,
    funding: draft.funding,
    conflictOfInterest: draft.conflictOfInterest,
    aiDisclosure: draft.aiDisclosure,
    dataAvailability: draft.dataAvailability,
    declaredAt: draft.declaredAt,
    files: draft.files.map((f) => ({
      kind: camelToKebab(f.kind) as SubmissionFileKind,
      filename: f.filename,
    })),
    contributors: draft.contributors.map((c) => ({
      name: `${c.givenName} ${c.familyName}`.trim(),
      // An author may sit at more than one institution; the summary joins them
      // rather than silently showing only the first.
      affiliation:
        c.affiliations.map((a) => a.affiliation.name).join("; ") || null,
      isCorresponding: c.isCorresponding,
    })),
  };
}
