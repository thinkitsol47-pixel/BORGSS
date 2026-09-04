import "server-only";
import type { AccountStatus, AuditEntry, UserAccount } from "@/types";
import type { Role } from "@/config/roles";
import { mockUsers, mockAuditEntries } from "./mock-users";
import { mockSubmissions } from "./mock-submissions";
import { mockQueueSubmissions } from "./mock-queue-submissions";
import { mockProductionSubmissions } from "./mock-production";
import { mockArticles, mockIssues } from "./mock-data";
import { mockReviewers } from "./mock-reviewers";

/**
 * Server-side data access for the administration screens.
 * SCAFFOLD: reads mock data. Swap each body for a real query.
 */

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

export async function listUsers(query: UserQuery = {}) {
  const { q, role, status, sort = "name", page = 1 } = query;

  let items: UserAccount[] = [...mockUsers];

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.status === "active").length,
    invited: mockUsers.filter((u) => u.status === "invited").length,
    suspended: mockUsers.filter((u) => u.status === "suspended").length,
  };

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
  return mockUsers.find((u) => u.id === id) ?? null;
}

/** How many accounts hold each role. Used by the roles matrix. */
export function roleHolderCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const user of mockUsers) {
    for (const role of user.roles) {
      counts[role] = (counts[role] ?? 0) + 1;
    }
  }
  return counts;
}

/* ------------------------------------------------------------------ *
 * Audit trail.
 * ------------------------------------------------------------------ */

export async function listAuditEntries(action?: string): Promise<AuditEntry[]> {
  const items = action
    ? mockAuditEntries.filter((e) => e.action === action)
    : [...mockAuditEntries];
  return items.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

/** The distinct actions present, for the filter. */
export function auditActions(): string[] {
  return [...new Set(mockAuditEntries.map((e) => e.action))].sort();
}

/* ------------------------------------------------------------------ *
 * Statistics.
 *
 * Everything below is counted from the fixtures. Nothing is estimated, and
 * nothing that the application does not hold is reported — there is no
 * analytics of any kind on this platform, so there are no views, no downloads
 * and no geography, and the screen says so rather than showing a zero that
 * reads as "nobody visited".
 * ------------------------------------------------------------------ */

function everySubmission() {
  return [
    ...mockSubmissions,
    ...mockQueueSubmissions,
    ...mockProductionSubmissions,
  ];
}

export async function getJournalStats() {
  const submissions = everySubmission();

  // Drafts are excluded from every count. An author still filling in the
  // wizard has not submitted anything, and counting it would inflate both the
  // total and the denominator of the acceptance rate.
  const submitted = submissions.filter((s) => s.status !== "draft");

  const accepted = submitted.filter(
    (s) =>
      s.status === "accepted" ||
      s.status === "in-production" ||
      s.status === "published",
  );
  const rejected = submitted.filter(
    (s) => s.status === "rejected" || s.status === "desk-rejected",
  );
  const deskRejected = submitted.filter((s) => s.status === "desk-rejected");
  const withdrawn = submitted.filter((s) => s.status === "withdrawn");

  const inProgress = submitted.filter(
    (s) =>
      !accepted.includes(s) && !rejected.includes(s) && !withdrawn.includes(s),
  );

  // The acceptance rate's denominator is only *decided* manuscripts. Including
  // those still under review would report a rate that falls every time a new
  // submission arrives, which is not a fact about the journal.
  const decided = accepted.length + rejected.length;

  const bySection = countBy(submitted, (s) => s.section);
  const byType = countBy(submitted, (s) => s.type);

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
      articles: mockArticles.length,
      issues: mockIssues.length,
    },
    people: {
      accounts: mockUsers.length,
      reviewers: mockReviewers.length,
      /** Reviewers who have completed at least one review. */
      reviewersWithHistory: mockReviewers.filter((r) => r.completed > 0).length,
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
  const withDecision = everySubmission().filter((s) => s.decisions.length > 0);

  const days = withDecision
    .map((s) => {
      const first = [...s.decisions].sort(
        (a, b) => +new Date(a.decidedAt) - +new Date(b.decidedAt),
      )[0];
      return Math.round(
        (+new Date(first.decidedAt) - +new Date(s.submittedAt)) / 86_400_000,
      );
    })
    .filter((d) => d >= 0)
    .sort((a, b) => a - b);

  if (days.length === 0) return { median: null, n: 0, min: null, max: null };

  const mid = Math.floor(days.length / 2);
  const median =
    days.length % 2 === 0 ? Math.round((days[mid - 1] + days[mid]) / 2) : days[mid];

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
