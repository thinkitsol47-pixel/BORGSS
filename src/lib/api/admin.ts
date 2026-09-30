import "server-only";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import type { AccountStatus, AuditEntry, UserAccount } from "@/types";
import type { Role } from "@/config/roles";

/**
 * Server-side data access for the administration screens.
 *
 * Phase 3: reads Postgres through Prisma, the same pattern `editorial.ts` and
 * `production.ts` used — function signatures unchanged, `isUuid()` guarding
 * every lookup-by-id, and `camelToKebab` bridging Prisma's camelCase enums to
 * the kebab-case wire values `src/types` is built on. `Role` and
 * `AccountStatus` carry no `@map()`, so they need no conversion; the helper is
 * kept for parity and for any enum that grows one later.
 */

/**
 * Prisma Client's generated enums are camelCase (`@map()` only renames the
 * database column); `src/types` uses the kebab-case wire values elsewhere.
 * Needed here for `ArticleType` (`caseStudy` → `case-study`); `Role` and
 * `AccountStatus` happen to need no conversion.
 */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/* ------------------------------------------------------------------ *
 * Accounts.
 * ------------------------------------------------------------------ */

export const USERS_PER_PAGE = 12;

export type UserSort = "name" | "recent" | "created" | "roles";

export type UserQuery = {
  q?: string;
  role?: Role;
  status?: AccountStatus;
  sort?: UserSort;
  page?: number;
};

const userInclude = {
  roles: { orderBy: { role: "asc" } },
} satisfies Prisma.UserInclude;

type UserRow = Prisma.UserGetPayload<{ include: typeof userInclude }>;

function toUserAccount(row: UserRow): UserAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roles: row.roles.map((r) => r.role as Role),
    status: row.status as AccountStatus,
    affiliation: row.affiliation ?? undefined,
    country: row.country ?? undefined,
    orcid: row.orcid ?? undefined,
    createdAt: row.createdAt.toISOString(),
    lastActiveAt: row.lastActiveAt?.toISOString(),
    suspendedReason: row.suspendedReason ?? undefined,
  };
}

export async function listUsers(query: UserQuery = {}) {
  const { q, role, status, sort = "name", page = 1 } = query;

  const rows = await db.user.findMany({ include: userInclude });
  const all = rows.map(toUserAccount);

  const stats = {
    total: all.length,
    active: all.filter((u) => u.status === "active").length,
    invited: all.filter((u) => u.status === "invited").length,
    suspended: all.filter((u) => u.status === "suspended").length,
  };

  let items = all;

  if (status) items = items.filter((u) => u.status === status);
  if (role) items = items.filter((u) => u.roles.includes(role));

  if (q) {
    const needle = q.toLowerCase().trim();
    items = items.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        (u.affiliation?.toLowerCase().includes(needle) ?? false),
    );
  }

  items = sortUsers(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / USERS_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * USERS_PER_PAGE;

  return {
    items: items.slice(start, start + USERS_PER_PAGE),
    total,
    page: current,
    totalPages,
    stats,
  };
}

function sortUsers(items: UserAccount[], sort: UserSort) {
  const sorted = [...items];
  switch (sort) {
    case "recent":
      // An account that has never signed in sinks rather than sorting to the
      // top of "most recently active", which is what a missing date would do.
      return sorted.sort((a, b) => {
        if (!a.lastActiveAt) return 1;
        if (!b.lastActiveAt) return -1;
        return +new Date(b.lastActiveAt) - +new Date(a.lastActiveAt);
      });
    case "created":
      return sorted.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
    case "roles":
      return sorted.sort(
        (a, b) => b.roles.length - a.roles.length || a.name.localeCompare(b.name),
      );
    case "name":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  if (!isUuid(id)) return null;
  const row = await db.user.findUnique({ where: { id }, include: userInclude });
  return row ? toUserAccount(row) : null;
}

/* ------------------------------------------------------------------ *
 * The reviewer pool.
 * ------------------------------------------------------------------ */

/**
 * What one account's pool entry says, or null if it is not in the pool.
 *
 * **Holding the `reviewer` role is not being in the pool.** Registration
 * grants the role to anyone who asks for it; an editor's shortlist is built
 * from `ReviewerProfile`, and until this screen existed nothing wrote a row
 * there but the seed. That gap is why an account could hold the role for
 * months and never be offered to a single editor.
 *
 * Deliberately thin — the editorial module already owns the rich read
 * (`toReviewerProfile` computes lifetime stats from every assignment). This
 * returns only the three stored fields the admin form edits, so the form is
 * never the thing that has to explain a turnaround average.
 */
export type ReviewerPoolEntry = {
  expertise: string[];
  sections: string[];
  note?: string;
};

export async function getReviewerPoolEntry(
  userId: string,
): Promise<ReviewerPoolEntry | null> {
  if (!isUuid(userId)) return null;

  const row = await db.reviewerProfile.findUnique({
    where: { userId },
    select: { expertise: true, sections: true, note: true },
  });
  if (!row) return null;

  return {
    expertise: row.expertise,
    sections: row.sections,
    note: row.note ?? undefined,
  };
}

/**
 * True when this account is the only one holding `superAdmin`.
 *
 * The roles form states this before the box is unticked rather than refusing
 * the save afterwards: a journal with no super administrator cannot appoint
 * one, because nobody left holds `roles.manageAdmins`. The Server Action
 * repeats the check — this is the warning, not the guard.
 */
export async function isLastSuperAdmin(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  const holders = await db.userRole.findMany({
    where: { role: "superAdmin" },
    select: { userId: true },
  });
  return holders.length === 1 && holders[0].userId === id;
}

/** How many accounts hold each role. Used by the roles matrix. */
export async function roleHolderCounts(): Promise<Record<string, number>> {
  const rows = await db.userRole.groupBy({
    by: ["role"],
    _count: { role: true },
  });
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.role] = r._count.role;
  return counts;
}

/* ------------------------------------------------------------------ *
 * Audit trail.
 * ------------------------------------------------------------------ */

/**
 * One readable sentence from whatever shape an action stored.
 *
 * **Each caller of `recordAudit` writes its own `detail` shape** — roles store
 * `{ before, after, added, removed }`, editorial stores
 * `{ reference, decision, round }`, production stores a stage, settings store
 * `{ fields }`. This used to read a single `note` key, which only the seeded
 * rows carry, so every entry the application actually recorded rendered its
 * detail column as an em dash. An audit log whose newest rows say nothing is
 * the one failure this screen cannot afford.
 *
 * Unknown keys fall through to a `key: value` join rather than being dropped,
 * so a new action added later is legible here before anyone updates this
 * function.
 */
function summariseDetail(detail: Prisma.JsonValue): string | undefined {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) {
    return undefined;
  }
  const d = detail as Record<string, unknown>;
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : undefined);
  const list = (k: string) =>
    Array.isArray(d[k]) ? (d[k] as unknown[]).filter((v) => typeof v === "string") : [];

  if (typeof d.note === "string") return d.note;

  // Role changes: what moved, in the order an administrator would say it.
  const added = list("added");
  const removed = list("removed");
  if (added.length > 0 || removed.length > 0) {
    const parts: string[] = [];
    if (added.length > 0) parts.push(`Granted ${added.join(", ")}`);
    if (removed.length > 0) parts.push(`revoked ${removed.join(", ")}`);
    return `${parts.join("; ")}.`;
  }

  const bits: string[] = [];
  const decision = str("decision");
  const round = typeof d.round === "number" ? d.round : undefined;
  if (decision) bits.push(decision);
  if (str("label")) bits.push(str("label")!);
  if (str("title")) bits.push(str("title")!);
  if (str("name")) bits.push(str("name")!);
  if (str("from") && str("to")) bits.push(`${str("from")} → ${str("to")}`);
  if (str("stage")) bits.push(str("stage")!);
  if (str("state")) bits.push(str("state")!);
  if (str("format")) bits.push(str("format")!);
  if (typeof d.version === "number") bits.push(`v${d.version}`);
  if (str("status")) bits.push(str("status")!);
  if (str("reason")) bits.push(str("reason")!);
  const fields = list("fields");
  if (fields.length > 0) bits.push(`Changed ${fields.join(", ")}`);
  if (round !== undefined) bits.push(`round ${round}`);

  if (bits.length > 0) return bits.join(" · ");

  // Nothing recognised, but something was stored. Show it rather than an em
  // dash, so a new action's detail is visible before this function knows it.
  const rest = Object.entries(d)
    .filter(([k]) => k !== "reference")
    .map(([k, v]) => `${k}: ${String(v)}`)
    .slice(0, 3);
  return rest.length > 0 ? rest.join(" · ") : undefined;
}

/**
 * What the target column shows.
 *
 * `targetId` is a UUID for everything the application records, and a UUID
 * answers none of the questions this screen is opened to answer. A manuscript
 * reference or an issue label is stored in `detail` by the action that wrote
 * the row, so it is preferred; account names are resolved from `User` by the
 * caller and passed in here.
 *
 * The seeded rows keep a human label directly in `targetId`, which is why a
 * non-UUID `targetId` is shown as-is.
 */
function toAuditEntry(
  row: {
    id: string;
    occurredAt: Date;
    actorId: string | null;
    actorName: string;
    action: string;
    targetType: string;
    targetId: string | null;
    detail: Prisma.JsonValue;
  },
  names?: Map<string, string>,
): AuditEntry {
  const d =
    row.detail && typeof row.detail === "object" && !Array.isArray(row.detail)
      ? (row.detail as Record<string, unknown>)
      : {};

  const reference = typeof d.reference === "string" ? d.reference : undefined;
  const label = typeof d.label === "string" ? d.label : undefined;
  const resolved = row.targetId ? names?.get(row.targetId) : undefined;

  const target =
    reference ??
    resolved ??
    (row.targetId && !isUuid(row.targetId) ? row.targetId : undefined) ??
    (row.targetType === "issue" ? label : undefined) ??
    // Last resort, and deliberately not the bare UUID: a truncated id at least
    // reads as an identifier rather than as a name.
    (row.targetId ? `${row.targetType} ${row.targetId.slice(0, 8)}` : "");

  return {
    id: row.id,
    at: row.occurredAt.toISOString(),
    actorId: row.actorId ?? "",
    actorName: row.actorName,
    action: row.action,
    target,
    detail: summariseDetail(row.detail),
  };
}

export async function listAuditEntries(action?: string): Promise<AuditEntry[]> {
  const rows = await db.auditEntry.findMany({
    where: action ? { action } : undefined,
    orderBy: { occurredAt: "desc" },
  });

  /* Account names in one query rather than per row. Read live rather than
     stored on the entry, unlike `actorName`: the actor's name is deliberately
     frozen at the time of the act, but the *target* is a person being looked
     up now, and an administrator searching for someone needs the name that
     account answers to today. */
  const userIds = rows
    .filter((r) => r.targetType === "user" && r.targetId && isUuid(r.targetId))
    .map((r) => r.targetId as string);

  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const users = await db.user.findMany({
      where: { id: { in: [...new Set(userIds)] } },
      select: { id: true, name: true },
    });
    for (const u of users) names.set(u.id, u.name);
  }

  return rows.map((r) => toAuditEntry(r, names));
}

/**
 * How many of the rows on screen describe events that never happened.
 *
 * The seed writes its illustrative entries as `{ note: "..." }` and no action
 * in the application writes a `note` key — every one of them stores a typed
 * shape (`reference`, `added`/`removed`, `fields`, and so on). So the presence
 * of `note` is what separates the two, and the screen's notice can state a
 * number that falls to zero on its own rather than a hard-coded "eight" that
 * would quietly become wrong.
 */
export async function seededAuditCount(): Promise<number> {
  return db.auditEntry.count({ where: { detail: { path: ["note"], not: Prisma.DbNull } } });
}

/** The distinct actions present, for the filter. */
export async function auditActions(): Promise<string[]> {
  const rows = await db.auditEntry.findMany({
    distinct: ["action"],
    select: { action: true },
    orderBy: { action: "asc" },
  });
  return rows.map((r) => r.action);
}

/* ------------------------------------------------------------------ *
 * Statistics.
 *
 * Everything below is counted from the database. Nothing is estimated, and
 * nothing the application does not hold is reported — there is no analytics of
 * any kind on this platform, so there are no views, no downloads and no
 * geography, and the screen says so rather than showing a zero that reads as
 * "nobody visited".
 * ------------------------------------------------------------------ */

const statSubmissionSelect = {
  status: true,
  submittedAt: true,
  section: { select: { name: true } },
  type: true,
  decisions: { select: { decidedAt: true }, orderBy: { decidedAt: "asc" } },
} satisfies Prisma.SubmissionSelect;

type StatSubmissionRow = Prisma.SubmissionGetPayload<{
  select: typeof statSubmissionSelect;
}>;

export async function getJournalStats() {
  const [submissions, articleCount, issueCount, accountCount, reviewers] =
    await Promise.all([
      db.submission.findMany({ select: statSubmissionSelect }),
      db.article.count(),
      db.issue.count(),
      db.user.count(),
      // ReviewerProfile carries no stored counters — "with history" is
      // reviewers named on at least one completed assignment.
      db.reviewerProfile.findMany({ select: { userId: true } }),
    ]);

  const reviewersWithCompleted = new Set(
    (
      await db.reviewAssignment.findMany({
        where: {
          status: "completed",
          reviewerId: { in: reviewers.map((r) => r.userId) },
        },
        select: { reviewerId: true },
      })
    ).map((a) => a.reviewerId),
  );

  // Drafts are excluded from every count. An author still filling in the
  // wizard has not submitted anything, and counting it would inflate both the
  // total and the denominator of the acceptance rate.
  const submitted = submissions.filter(
    (s: StatSubmissionRow) => s.status !== "draft",
  );

  const isAccepted = (s: StatSubmissionRow) =>
    s.status === "accepted" ||
    s.status === "inProduction" ||
    s.status === "published";
  const isRejected = (s: StatSubmissionRow) =>
    s.status === "rejected" || s.status === "deskRejected";
  const isWithdrawn = (s: StatSubmissionRow) => s.status === "withdrawn";

  const accepted = submitted.filter(isAccepted);
  const rejected = submitted.filter(isRejected);
  const deskRejected = submitted.filter(
    (s: StatSubmissionRow) => s.status === "deskRejected",
  );
  const withdrawn = submitted.filter(isWithdrawn);
  const inProgress = submitted.filter(
    (s: StatSubmissionRow) =>
      !isAccepted(s) && !isRejected(s) && !isWithdrawn(s),
  );

  // The acceptance rate's denominator is only *decided* manuscripts. Including
  // those still under review would report a rate that falls every time a new
  // submission arrives, which is not a fact about the journal.
  const decided = accepted.length + rejected.length;

  const bySection = countBy(submitted, (s) => s.section.name);
  const byType = countBy(submitted, (s) => camelToKebab(s.type));

  return {
    submissions: {
      total: submitted.length,
      accepted: accepted.length,
      rejected: rejected.length,
      deskRejected: deskRejected.length,
      withdrawn: withdrawn.length,
      inProgress: inProgress.length,
      decided,
      /** Null rather than 0 when nothing has been decided — see the screen. */
      acceptanceRate: decided > 0 ? accepted.length / decided : null,
    },
    published: {
      articles: articleCount,
      issues: issueCount,
    },
    people: {
      accounts: accountCount,
      reviewers: reviewers.length,
      /** Reviewers who have completed at least one review. */
      reviewersWithHistory: reviewersWithCompleted.size,
    },
    bySection,
    byType,
  };
}

/**
 * Median days from submission to first decision.
 *
 * Median rather than mean, because on a handful of manuscripts one slow
 * outlier drags a mean somewhere no manuscript actually was. Returns null when
 * there is nothing to measure — a turnaround figure invented from two
 * manuscripts is worse than none, and the screen prints the sample size beside
 * whatever it gets.
 */
export async function getTurnaroundStats() {
  const rows = await db.submission.findMany({
    where: { decisions: { some: {} }, status: { not: "draft" } },
    select: {
      submittedAt: true,
      decisions: { select: { decidedAt: true }, orderBy: { decidedAt: "asc" } },
    },
  });

  const days = rows
    .map((s) =>
      Math.round(
        (+new Date(s.decisions[0].decidedAt) - +new Date(s.submittedAt)) /
          86_400_000,
      ),
    )
    .filter((d) => d >= 0)
    .sort((a, b) => a - b);

  if (days.length === 0) return { median: null, n: 0, min: null, max: null };

  const mid = Math.floor(days.length / 2);
  const median =
    days.length % 2 === 0
      ? Math.round((days[mid - 1] + days[mid]) / 2)
      : days[mid];

  return { median, n: days.length, min: days[0], max: days[days.length - 1] };
}

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
