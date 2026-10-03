import "server-only";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import { isStoredFile } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import type {
  DecisionType,
  DoiRecord,
  EditorialIssue,
  ReviewCriterion,
  ReviewerAvailability,
  ReviewerProfile,
  ReviewerReport,
  ReviewScore,
  Submission,
  SubmissionStatus,
} from "@/types";
import { getSubmissionById, getSubmissionsForAuthor } from "./submissions";

/**
 * Server-side data access for the editorial screens.
 *
 * Phase 3: reads Postgres through Prisma. Separate from `submissions.ts`
 * because the questions are different. That module answers "what is mine?";
 * this one answers "what is waiting, and who is it waiting on?" — which is
 * the whole job of an editorial queue.
 */

export const QUEUE_PER_PAGE = 10;

/**
 * Prisma Client's generated enums are camelCase (`@map()` only renames the
 * database column); `src/types` uses the kebab-case wire values the rest of
 * the app was built against.
 */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
function kebabToCamel(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Drafts never appear. An author still filling in the wizard has not submitted
 * anything, and showing it would let an editor read work that was never handed
 * over.
 */
function editorVisible(s: Submission) {
  return s.status !== "draft";
}

/**
 * The full shape a `Submission` is assembled from, reused unmodified from
 * `submissions.ts` — every editorial page renders the same `Submission`
 * shape the author's own pages do, just for every author rather than one.
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
 * Maps a row to `Submission`, identically to `submissions.ts`'s own mapper.
 *
 * Not imported from there because that module does not export it — it is
 * private to keep `getSubmissionsForAuthor` the one sanctioned way in, and
 * duplicating ~60 lines here is cheaper than widening that module's surface
 * for one shared helper. If a third file needs it, that is the point to
 * factor it out into its own module.
 */
function toSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    abstract: row.abstract,
    keywords: row.keywords,
    type: camelToKebab(row.type) as Submission["type"],
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
      kind: camelToKebab(f.kind) as Submission["files"][number]["kind"],
      filename: f.filename,
      sizeBytes: Number(f.sizeBytes),
      uploadedAt: f.uploadedAt.toISOString(),
      round: f.round,
      // The storage path stays in this layer; only whether it is real crosses
      // into the UI. See `SubmissionFile.stored` in src/types.
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
    reviewAssignments: row.assignments.map((a) => {
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
    }),
    articleId: row.articleId ?? undefined,
  };
}

/** Everything in the workflow, from every author. */
export async function getAllSubmissions(): Promise<Submission[]> {
  const rows = await db.submission.findMany({
    where: { status: { not: "draft" } },
    include: submissionInclude,
    orderBy: { updatedAt: "asc" },
  });
  return rows.map(toSubmission).filter(editorVisible);
}

export async function getEditorialSubmissionById(
  id: string,
): Promise<Submission | null> {
  if (!isUuid(id)) return null;
  const row = await db.submission.findUnique({
    where: { id },
    include: submissionInclude,
  });
  if (!row) return null;
  const submission = toSubmission(row);
  return editorVisible(submission) ? submission : null;
}

/* ------------------------------------------------------------------ *
 * Triage — what the editor has to do next.
 * ------------------------------------------------------------------ */

/**
 * Who the manuscript is currently waiting on.
 *
 * This is the queue's most important column, and it is derived rather than
 * stored: a status says what stage a manuscript is at, not whose desk it is
 * sitting on. "Under review" with every report in means the editor is the
 * hold-up, and an editor scanning a status column alone would not see that.
 */
export type WaitingOn =
  | "editor"
  | "reviewers"
  | "author"
  | "production"
  | "none";

export function waitingOn(s: Submission): WaitingOn {
  switch (s.status) {
    case "submitted":
    case "desk-review":
    case "awaiting-decision":
    case "revision-submitted":
      return "editor";
    case "under-review": {
      const { completed, total } = roundProgress(s);
      // Reports are all in but no decision has been recorded — the editor is
      // the one holding this up, whatever the status says.
      return total > 0 && completed >= total ? "editor" : "reviewers";
    }
    case "revision-requested":
      return "author";
    case "accepted":
    case "in-production":
      return "production";
    default:
      return "none";
  }
}

export const WAITING_ON_LABEL: Record<WaitingOn, string> = {
  editor: "Editor",
  reviewers: "Reviewers",
  author: "Author",
  production: "Production",
  none: "—",
};

/** Review progress for the manuscript's current round. */
export function roundProgress(s: Submission) {
  const thisRound = s.reviewAssignments.filter((r) => r.round === s.round);
  // A declined or withdrawn assignment is not a report the round is waiting on.
  const active = thisRound.filter(
    (r) => r.status !== "declined" && r.status !== "withdrawn",
  );
  const completed = thisRound.filter((r) => r.status === "completed");
  const overdue = thisRound.filter((r) => r.status === "overdue");
  return {
    completed: completed.length,
    total: active.length,
    overdue: overdue.length,
    invited: thisRound.filter((r) => r.status === "invited").length,
  };
}

/** Whole days a manuscript has been waiting since it was last touched. */
export function daysWaiting(s: Submission, now = new Date()): number {
  return Math.max(0, Math.floor((+now - +new Date(s.updatedAt)) / 86_400_000));
}

/**
 * Whether the queue should mark this row as needing attention.
 *
 * Two triggers, both about time rather than status: an overdue reviewer, or a
 * manuscript that has sat with the editor for more than a fortnight. Kept here
 * rather than in the page so the queue and the dashboard cannot disagree.
 */
export const EDITOR_STALE_DAYS = 14;

export function needsAttention(s: Submission, now = new Date()): boolean {
  if (roundProgress(s).overdue > 0) return true;
  return waitingOn(s) === "editor" && daysWaiting(s, now) > EDITOR_STALE_DAYS;
}

/* ------------------------------------------------------------------ *
 * The queue list.
 * ------------------------------------------------------------------ */

export type QueueSort = "waiting" | "newest" | "oldest" | "title";

export type QueueQuery = {
  q?: string;
  status?: SubmissionStatus;
  section?: string;
  waitingOn?: WaitingOn;
  sort?: QueueSort;
  page?: number;
};

export type QueueResult = {
  items: Submission[];
  total: number;
  page: number;
  totalPages: number;
  /** Counts across everything visible, not just this page. */
  stats: {
    total: number;
    withEditor: number;
    withReviewers: number;
    overdue: number;
    attention: number;
  };
};

export async function listEditorialQueue(
  query: QueueQuery = {},
): Promise<QueueResult> {
  const {
    q,
    status,
    section,
    waitingOn: waiting,
    sort = "waiting",
    page = 1,
  } = query;

  const all = await getAllSubmissions();

  const stats = {
    total: all.length,
    withEditor: all.filter((s) => waitingOn(s) === "editor").length,
    withReviewers: all.filter((s) => waitingOn(s) === "reviewers").length,
    overdue: all.filter((s) => roundProgress(s).overdue > 0).length,
    attention: all.filter((s) => needsAttention(s)).length,
  };

  let items = all;

  if (status) items = items.filter((s) => s.status === status);
  if (section) items = items.filter((s) => s.section === section);
  if (waiting) items = items.filter((s) => waitingOn(s) === waiting);

  if (q) {
    const needle = q.toLowerCase().trim();
    items = items.filter(
      (s) =>
        s.reference.toLowerCase().includes(needle) ||
        s.title.toLowerCase().includes(needle) ||
        s.keywords.some((k) => k.toLowerCase().includes(needle)) ||
        // Editors search by author name — the one thing the author-facing
        // list deliberately cannot do.
        s.contributors.some((c) =>
          `${c.givenName} ${c.familyName}`.toLowerCase().includes(needle),
        ),
    );
  }

  items = sortQueue(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / QUEUE_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * QUEUE_PER_PAGE;

  return {
    items: items.slice(start, start + QUEUE_PER_PAGE),
    total,
    page: current,
    totalPages,
    stats,
  };
}

/**
 * Default sort is "waiting longest", not "newest".
 *
 * A queue exists to surface what has been ignored. Sorting newest-first buries
 * exactly the manuscript that most needs finding.
 */
function sortQueue(items: Submission[], sort: QueueSort) {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
      );
    case "oldest":
      return sorted.sort(
        (a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt),
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "waiting":
    default:
      return sorted.sort(
        (a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt),
      );
  }
}

/** Sections present in the data, for the filter bar. */
export async function getQueueSections(): Promise<string[]> {
  const all = await getAllSubmissions();
  return [...new Set(all.map((s) => s.section))].sort();
}

/* ------------------------------------------------------------------ *
 * Reviewer directory.
 * ------------------------------------------------------------------ */

export const REVIEWERS_PER_PAGE = 10;

export type ReviewerSort = "name" | "turnaround" | "completed" | "recent";

export type ReviewerQuery = {
  q?: string;
  section?: string;
  availability?: ReviewerAvailability;
  sort?: ReviewerSort;
  page?: number;
};

const reviewerProfileInclude = {
  user: true,
} satisfies Prisma.ReviewerProfileInclude;

type ReviewerProfileRow = Prisma.ReviewerProfileGetPayload<{
  include: typeof reviewerProfileInclude;
}>;

/**
 * `ReviewerProfile` (the type) carries lifetime stats — completed, declined,
 * unanswered, average turnaround, last reviewed — that are not columns on
 * `ReviewerProfile` (the table); they are computed from every
 * `ReviewAssignment` naming that user as reviewer. One query per reviewer
 * would be N+1 on a directory page, so `listReviewers` fetches every
 * assignment for the whole pool once and this function reduces over it.
 */
function toReviewerProfile(
  row: ReviewerProfileRow,
  assignments: { status: string; invitedAt: Date; completedAt: Date | null }[],
): ReviewerProfile {
  const completed = assignments.filter((a) => a.status === "completed");
  const declined = assignments.filter((a) => a.status === "declined");
  // AssignmentStatus has no "unanswered" state of its own — an invitation
  // nobody has responded to is still "invited". The directory's definition of
  // "unanswered" (worth seeing before inviting someone again) is exactly that.
  const unanswered = assignments.filter((a) => a.status === "invited");
  const active = assignments.filter(
    (a) => a.status === "invited" || a.status === "accepted",
  );

  const turnarounds = completed
    .filter((a) => a.completedAt !== null)
    .map((a) => Math.round((+a.completedAt! - +a.invitedAt) / 86_400_000));
  const averageTurnaroundDays = turnarounds.length
    ? Math.round(turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length)
    : null;

  const lastReviewedAt = completed.length
    ? completed
        .map((a) => a.completedAt!.toISOString())
        .sort()
        .slice(-1)[0]
    : undefined;

  return {
    id: row.id,
    /** The `User` id — what a `ReviewAssignment` points at. */
    userId: row.userId,
    name: row.user.name,
    email: row.user.email,
    affiliation: row.user.affiliation ?? "",
    country: row.user.country ?? "",
    orcid: row.user.orcid ?? undefined,
    expertise: row.expertise,
    sections: row.sections,
    availability: camelToKebab(row.availability) as ReviewerAvailability,
    unavailableUntil: row.unavailableUntil?.toISOString(),
    activeReviews: active.length,
    completed: completed.length,
    declined: declined.length,
    unanswered: unanswered.length,
    averageTurnaroundDays,
    lastReviewedAt,
  };
}

export async function listReviewers(query: ReviewerQuery = {}) {
  const { q, section, availability, sort = "name", page = 1 } = query;

  const rows = await db.reviewerProfile.findMany({
    include: reviewerProfileInclude,
  });

  // One query for every assignment naming any reviewer in the pool, grouped
  // by reviewer afterwards — the N+1 this file exists to avoid.
  const allAssignments = await db.reviewAssignment.findMany({
    where: { reviewerId: { in: rows.map((r) => r.userId) } },
    select: {
      reviewerId: true,
      status: true,
      invitedAt: true,
      completedAt: true,
    },
  });
  const byReviewer = new Map<string, typeof allAssignments>();
  for (const a of allAssignments) {
    const list = byReviewer.get(a.reviewerId) ?? [];
    list.push(a);
    byReviewer.set(a.reviewerId, list);
  }

  let items = rows.map((r) =>
    toReviewerProfile(r, byReviewer.get(r.userId) ?? []),
  );

  if (availability) {
    items = items.filter((r) => r.availability === availability);
  }
  if (section) {
    items = items.filter((r) => r.sections.includes(section));
  }
  if (q) {
    const needle = q.toLowerCase().trim();
    items = items.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.affiliation.toLowerCase().includes(needle) ||
        r.country.toLowerCase().includes(needle) ||
        r.expertise.some((e) => e.toLowerCase().includes(needle)),
    );
  }

  items = sortReviewers(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / REVIEWERS_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * REVIEWERS_PER_PAGE;

  return {
    items: items.slice(start, start + REVIEWERS_PER_PAGE),
    total,
    page: current,
    totalPages,
  };
}

function sortReviewers(items: ReviewerProfile[], sort: ReviewerSort) {
  const sorted = [...items];
  switch (sort) {
    case "turnaround":
      // Reviewers with no completed review have no turnaround to rank. They go
      // last rather than first, which is what a null would otherwise do.
      return sorted.sort((a, b) => {
        if (a.averageTurnaroundDays === null) return 1;
        if (b.averageTurnaroundDays === null) return -1;
        return a.averageTurnaroundDays - b.averageTurnaroundDays;
      });
    case "completed":
      return sorted.sort((a, b) => b.completed - a.completed);
    case "recent":
      return sorted.sort(
        (a, b) =>
          +new Date(b.lastReviewedAt ?? 0) - +new Date(a.lastReviewedAt ?? 0),
      );
    case "name":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Every `ReviewerProfile` row, unpaginated and unfiltered — for
 * `getReviewerMatches`, which has to rank the whole pool against one
 * manuscript rather than one page of it.
 */
async function getAllReviewerProfiles(): Promise<ReviewerProfile[]> {
  const rows = await db.reviewerProfile.findMany({
    include: reviewerProfileInclude,
  });
  const allAssignments = await db.reviewAssignment.findMany({
    where: { reviewerId: { in: rows.map((r) => r.userId) } },
    select: {
      reviewerId: true,
      status: true,
      invitedAt: true,
      completedAt: true,
    },
  });
  const byReviewer = new Map<string, typeof allAssignments>();
  for (const a of allAssignments) {
    const list = byReviewer.get(a.reviewerId) ?? [];
    list.push(a);
    byReviewer.set(a.reviewerId, list);
  }
  return rows.map((r) => toReviewerProfile(r, byReviewer.get(r.userId) ?? []));
}

/* ------------------------------------------------------------------ *
 * Decisions — the reports behind one, and what it may be.
 * ------------------------------------------------------------------ */

/**
 * The reviewers' reports for one manuscript.
 *
 * Loaded here and never from a submission-shaped function, because
 * `Submission` is what author-facing screens render: keeping the report bodies
 * out of that object is what stops one from reaching an author by oversight.
 * The query below never selects `Submission.contributors` or anything
 * author-identifying — only report bodies and the reviewer/assignment fields
 * an editor is allowed to see.
 */
export async function getReportsForSubmission(
  submissionId: string,
): Promise<ReviewerReport[]> {
  if (!isUuid(submissionId)) return [];

  const rows = await db.reviewerReport.findMany({
    where: { submissionId },
    include: { assignment: { include: { reviewer: true } } },
  });

  return rows
    .map(
      (r): ReviewerReport => ({
        id: r.id,
        assignmentId: r.assignmentId,
        submissionId: r.submissionId,
        reviewerName: r.assignment.reviewer.name,
        label: r.assignment.label,
        round: r.round,
        body: {
          scores: r.scores as Record<ReviewCriterion, ReviewScore>,
          recommendation: camelToKebab(
            r.recommendation,
          ) as ReviewSubmissionBodyRecommendation,
          commentsToAuthor: r.commentsToAuthor,
          commentsToEditor: r.commentsToEditor,
          concernsRaised: r.concernsRaised ?? undefined,
          submittedAt: r.submittedAt.toISOString(),
        },
      }),
    )
    .sort((a, b) => a.round - b.round || a.label.localeCompare(b.label));
}

// Narrow alias purely so the mapper above reads without a long inline type.
type ReviewSubmissionBodyRecommendation =
  ReviewerReport["body"]["recommendation"];

/**
 * What the editor knows before writing a letter.
 *
 * `missing` is the point of this: an assignment with no report is a reviewer
 * who has not reported, and deciding without noticing that is the mistake this
 * screen exists to prevent.
 */
export type DecisionContext = {
  reports: ReviewerReport[];
  /** Reports from the round now in progress. */
  currentRound: ReviewerReport[];
  /** Rounds already decided, for reading alongside. */
  earlierRounds: ReviewerReport[];
  /** Assignments in the current round still without a report. */
  missing: { label: string; reviewerName: string; status: string }[];
  /** True when the current round's reviewers do not agree. */
  disagreement: boolean;
};

export async function getDecisionContext(
  submission: Submission,
): Promise<DecisionContext> {
  const reports = await getReportsForSubmission(submission.id);
  const currentRound = reports.filter((r) => r.round === submission.round);
  const earlierRounds = reports.filter((r) => r.round !== submission.round);

  const reported = new Set(currentRound.map((r) => r.assignmentId));
  const missing = submission.reviewAssignments
    .filter(
      (a) =>
        a.round === submission.round &&
        a.status !== "declined" &&
        a.status !== "withdrawn" &&
        !reported.has(a.id),
    )
    .map((a) => ({
      label: a.label,
      reviewerName: a.reviewerName,
      status: a.status,
    }));

  const verdicts = new Set(currentRound.map((r) => r.body.recommendation));

  return {
    reports,
    currentRound,
    earlierRounds,
    missing,
    disagreement: verdicts.size > 1,
  };
}

/**
 * Decisions this manuscript can actually receive, given where it is.
 *
 * A desk rejection is only available before review has begun — once a reviewer
 * has read the manuscript the rejection is no longer "desk", and recording it
 * as one would misdescribe the process on the author's own history.
 */
export function availableDecisions(s: Submission): DecisionType[] {
  const beforeReview = s.status === "submitted" || s.status === "desk-review";
  return beforeReview
    ? ["desk-reject", "major-revision", "minor-revision", "accept"]
    : ["accept", "minor-revision", "major-revision", "reject"];
}

/**
 * Whether a decision can be recorded at all right now.
 *
 * Stated rather than left to the button being absent: an editor who cannot
 * find the control needs to know why, not to wonder whether it is broken.
 */
export function decisionBlockedReason(s: Submission): string | null {
  switch (s.status) {
    case "accepted":
    case "in-production":
    case "published":
      return "This manuscript has already been accepted.";
    case "rejected":
    case "desk-rejected":
      return "This manuscript has already been declined.";
    case "withdrawn":
      return "The author withdrew this manuscript.";
    case "revision-requested":
      return "A revision has been requested and the manuscript is with the author.";
    default:
      return null;
  }
}

/**
 * Why no reviewer can be invited to this manuscript, or null if one can.
 *
 * Shared by the invite action (which enforces it) and the reviewers page
 * (which hides the buttons and says why), so the two cannot disagree. A
 * revision in progress is not closed: the next round may need reviewers.
 */
export function inviteClosedReason(
  status: Submission["status"],
): string | null {
  switch (status) {
    case "accepted":
    case "in-production":
    case "published":
      return "This manuscript has already been accepted, so no reviewers can be invited.";
    case "rejected":
    case "desk-rejected":
      return "This manuscript has already been declined, so no reviewers can be invited.";
    case "withdrawn":
      return "The author withdrew this manuscript, so no reviewers can be invited.";
    default:
      return null;
  }
}

/**
 * Whether an account is an author of the manuscript: the account that
 * submitted it, or anyone whose address is on its contributor list. Such an
 * account must never review it.
 */
export function isAuthorOf(
  s: Pick<Submission, "submittedById" | "contributors">,
  person: { id: string; email: string },
): boolean {
  const email = person.email.toLowerCase();
  return (
    person.id === s.submittedById ||
    s.contributors.some((c) => c.email?.toLowerCase() === email)
  );
}

/* ------------------------------------------------------------------ *
 * Issues in preparation.
 * ------------------------------------------------------------------ */

const editorialIssueInclude = {
  items: { include: { submission: true }, orderBy: { position: "asc" } },
} satisfies Prisma.EditorialIssueInclude;

type EditorialIssueRow = Prisma.EditorialIssueGetPayload<{
  include: typeof editorialIssueInclude;
}>;

function toEditorialIssue(row: EditorialIssueRow): EditorialIssue {
  return {
    id: row.id,
    volume: row.volume,
    number: row.number,
    year: row.year,
    title: row.title ?? undefined,
    state: camelToKebab(row.state) as EditorialIssue["state"],
    targetDate: row.targetDate.toISOString(),
    publishedAt: row.publishedAt?.toISOString(),
    plannedArticles: row.plannedArticles ?? undefined,
    items: row.items.map((it) => ({
      submissionId: it.submissionId,
      position: it.position,
      // No page-numbering field exists yet on IssuePlanItem — production has
      // no "assign pages" step in the schema. Left undefined rather than
      // guessed; the type already treats this as optional for exactly this
      // reason (pages are set only once production has assigned them).
      pages: undefined,
    })),
    slug: row.slug ?? undefined,
  };
}

/** Newest first, and the issue being assembled comes before the published. */
export async function listEditorialIssues(): Promise<EditorialIssue[]> {
  const rows = await db.editorialIssue.findMany({
    include: editorialIssueInclude,
  });
  const order: Record<EditorialIssue["state"], number> = {
    planned: 0,
    "in-production": 1,
    published: 2,
  };
  return rows
    .map(toEditorialIssue)
    .sort(
      (a, b) =>
        order[a.state] - order[b.state] ||
        b.year - a.year ||
        b.volume - a.volume ||
        b.number - a.number,
    );
}

export async function getEditorialIssueById(
  id: string,
): Promise<EditorialIssue | null> {
  if (!isUuid(id)) return null;
  const row = await db.editorialIssue.findUnique({
    where: { id },
    include: editorialIssueInclude,
  });
  return row ? toEditorialIssue(row) : null;
}

export function issueLabel(i: EditorialIssue): string {
  return `Vol. ${i.volume}, No. ${i.number} (${i.year})`;
}

/**
 * The manuscripts placed in an issue, in running order.
 *
 * A placed submission that cannot be found is returned as null rather than
 * dropped, so a broken placement shows as a gap in the table of contents
 * instead of silently shortening it. In practice the foreign key makes that
 * impossible now (a `IssuePlanItem` cannot outlive its `Submission`), but the
 * shape is kept — a submission an editor is not allowed to see would look
 * identical from here, and the page's handling of that case still matters.
 */
export async function getIssueContents(issue: EditorialIssue) {
  return Promise.all(
    [...issue.items]
      .sort((a, b) => a.position - b.position)
      .map(async (item) => ({
        item,
        submission: await getEditorialSubmissionById(item.submissionId),
      })),
  );
}

/**
 * Accepted manuscripts not yet placed in any issue.
 *
 * This is the other half of the issue screen: what is waiting to be scheduled
 * is as much a part of planning an issue as what is already in it.
 */
export async function getUnscheduledAccepted(): Promise<Submission[]> {
  const placedRows = await db.issuePlanItem.findMany({
    select: { submissionId: true },
  });
  const placed = new Set(placedRows.map((r) => r.submissionId));
  const all = await getAllSubmissions();
  return all.filter(
    (s) =>
      (s.status === "accepted" || s.status === "in-production") &&
      !placed.has(s.id),
  );
}

/* ------------------------------------------------------------------ *
 * DOI register.
 * ------------------------------------------------------------------ */

const doiRecordInclude = {
  article: { include: { issue: true } },
} satisfies Prisma.DoiRecordInclude;

type DoiRecordRow = Prisma.DoiRecordGetPayload<{
  include: typeof doiRecordInclude;
}>;

function toDoiRecord(row: DoiRecordRow): DoiRecord {
  return {
    id: row.id,
    doi: row.doi,
    articleId: row.articleId,
    articleSlug: row.article.slug,
    articleTitle: row.article.title,
    issueLabel: row.article.issue
      ? `Vol. ${row.article.issue.volume}, No. ${row.article.issue.number} (${row.article.issue.year})`
      : `Vol. ${row.article.volume}, No. ${row.article.issueNumber}`,
    state: camelToKebab(row.state) as DoiRecord["state"],
    lastAttemptAt: row.lastAttemptAt?.toISOString(),
    registeredAt: row.registeredAt?.toISOString(),
    failureReason: row.failureReason ?? undefined,
    attempts: row.attempts,
  };
}

export async function listDoiRecords(state?: DoiRecord["state"]) {
  const rows = await db.doiRecord.findMany({ include: doiRecordInclude });
  const items = rows.map(toDoiRecord);
  const filtered = state ? items.filter((r) => r.state === state) : items;

  const counts = {
    total: items.length,
    registered: items.filter((r) => r.state === "registered").length,
    pending: items.filter((r) => r.state === "pending").length,
    failed: items.filter((r) => r.state === "failed").length,
    notDeposited: items.filter((r) => r.state === "not-deposited").length,
  };

  return { items: filtered, counts };
}

/**
 * Whether every DOI on record is a real one.
 *
 * **Not the same question as `hasRealDoiPrefix()`** in `journal-settings.ts`,
 * which asks whether a prefix has been *entered*. This asks whether the DOIs
 * already minted use it. The two differ for exactly as long as it takes to
 * re-mint the placeholders after a prefix arrives, and that gap is worth being
 * able to see: a journal with a prefix but unmigrated DOIs still has articles
 * whose DOIs resolve nowhere.
 *
 * Derived from the data rather than hard-coded to false, so this stops
 * reporting "no prefix" the moment real DOIs are entered. The placeholder
 * DOIs are literally `10.xxxxx`, which no registry would ever issue.
 */
export async function hasCrossrefPrefix(): Promise<boolean> {
  const placeholder = await db.doiRecord.findFirst({
    where: { doi: { startsWith: "10.xxxxx" } },
    select: { id: true },
  });
  return placeholder === null;
}

/** Sections present in the reviewer pool, for the filter bar. */
export async function getReviewerSections(): Promise<string[]> {
  const rows = await db.reviewerProfile.findMany({
    select: { sections: true },
  });
  return [...new Set(rows.flatMap((r) => r.sections))].sort();
}

/* ------------------------------------------------------------------ *
 * Matching reviewers to one manuscript.
 * ------------------------------------------------------------------ */

export type ReviewerMatch = {
  reviewer: ReviewerProfile;
  /** Manuscript keywords this reviewer's expertise covers. */
  matchedKeywords: string[];
  sectionMatch: boolean;
  /** Already invited or reviewing this manuscript, in any round. */
  alreadyAssigned: boolean;
  /**
   * Why this reviewer cannot be invited, or null if they can. A conflict is
   * stated rather than the row being hidden: an editor who cannot see that
   * the obvious reviewer is the author's colleague will keep looking for them.
   */
  conflict: string | null;
};

/**
 * Candidate reviewers for a manuscript, best match first.
 *
 * Matching is on keywords and section, and it is deliberately shown rather
 * than applied silently — the editor sees which keywords matched and decides.
 * A scored ranking that hid its reasoning would be trusted more than it
 * deserves on eight reviewers and a keyword list.
 */
export async function getReviewerMatches(
  submission: Submission,
): Promise<ReviewerMatch[]> {
  const reviewers = await getAllReviewerProfiles();

  const authorAffiliations = new Set(
    submission.contributors.flatMap((c) =>
      c.affiliations.map((a) => a.name.toLowerCase()),
    ),
  );
  // A withdrawn invitation does not count — the editor can approach that
  // reviewer again.
  const assigned = new Set(
    submission.reviewAssignments
      .filter((r) => r.status !== "withdrawn")
      .map((r) => r.reviewerName),
  );

  const matches: ReviewerMatch[] = reviewers.map((reviewer) => {
    const matchedKeywords = submission.keywords.filter((k) =>
      reviewer.expertise.some(
        (e) =>
          e.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(e.toLowerCase()),
      ),
    );

    // Shared affiliation is the one conflict this scaffold can actually
    // detect. The real version must also check co-authorship in recent years,
    // supervision, and reviewer-declared conflicts.
    const sharedAffiliation = authorAffiliations.has(
      reviewer.affiliation.toLowerCase(),
    );

    let conflict: string | null = null;
    if (
      isAuthorOf(submission, { id: reviewer.userId, email: reviewer.email })
    ) {
      // First, because it is absolute: no availability or note changes it.
      conflict = "Is an author of this manuscript";
    } else if (sharedAffiliation) {
      conflict = "Shares an affiliation with an author";
    } else if (reviewer.availability === "unavailable") {
      // Through `formatDate`, not interpolated raw: `unavailableUntil` is an
      // ISO timestamp, so the screen was printing
      // "Unavailable until 2026-11-30T00:00:00.000Z" at an editor deciding who
      // to invite. Every other date in the portal reads "30 November 2026".
      conflict = reviewer.unavailableUntil
        ? `Unavailable until ${formatDate(reviewer.unavailableUntil)}`
        : "Currently unavailable";
    }

    return {
      reviewer,
      matchedKeywords,
      sectionMatch: reviewer.sections.includes(submission.section),
      alreadyAssigned: assigned.has(reviewer.name),
      conflict,
    };
  });

  return matches.sort((a, b) => {
    // Anyone who cannot be invited sinks, however well they match.
    const aBlocked = Number(Boolean(a.conflict) || a.alreadyAssigned);
    const bBlocked = Number(Boolean(b.conflict) || b.alreadyAssigned);
    if (aBlocked !== bBlocked) return aBlocked - bBlocked;

    if (b.matchedKeywords.length !== a.matchedKeywords.length) {
      return b.matchedKeywords.length - a.matchedKeywords.length;
    }
    if (a.sectionMatch !== b.sectionMatch) return a.sectionMatch ? -1 : 1;

    // Then workload, so the pool spreads rather than landing on one person.
    if (a.reviewer.activeReviews !== b.reviewer.activeReviews) {
      return a.reviewer.activeReviews - b.reviewer.activeReviews;
    }
    return a.reviewer.name.localeCompare(b.reviewer.name);
  });
}

// Re-exported so callers that only need "does this author have other
// submissions" (e.g. a conflict check) are not forced to import
// submissions.ts directly for one function. Not currently used within this
// file; kept for parity with what editorial pages have reached for before.
export { getSubmissionsForAuthor, getSubmissionById };
