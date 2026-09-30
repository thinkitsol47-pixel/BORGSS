import type { ReviewerProfile } from "@/types";

/**
 * This fixture predates the `userId` field on `ReviewerProfile` (added when
 * `inviteReviewer` needed the `User` id a `ReviewAssignment` points at). The
 * app reads the database now, not this file — only `prisma/seed.ts` still
 * imports it — so `userId` is filled from the mock id at export rather than
 * hand-written on every row.
 */
const withUserId = (rows: Omit<ReviewerProfile, "userId">[]): ReviewerProfile[] =>
  rows.map((r) => ({ ...r, userId: r.id }));

/**
 * SCAFFOLD MOCK DATA — the reviewer directory.
 *
 * Chosen to exercise the editor's judgement rather than to look tidy. Between
 * them these cover: a fast and reliable reviewer, one who is thorough but slow,
 * one currently on leave with a return date, one the system has marked
 * overloaded, a promising new reviewer with no history at all, one who declines
 * most invitations, and one who has stopped answering them.
 *
 * Those last two matter most. An editor picking on turnaround alone would
 * invite both and hear nothing back — the decline and unanswered counts are
 * what stop a week being lost.
 */
export const mockReviewers: ReviewerProfile[] = withUserId([
  {
    id: "r1",
    name: "Dr. Fatima Siddiqui",
    email: "f.siddiqui@example.edu",
    affiliation: "Lahore University of Management Sciences",
    country: "Pakistan",
    orcid: "0000-0001-7291-4432",
    expertise: [
      "development economics",
      "microfinance",
      "panel data",
      "poverty measurement",
    ],
    sections: ["Economics & Development"],
    availability: "available",
    activeReviews: 1,
    completed: 24,
    declined: 3,
    unanswered: 0,
    averageTurnaroundDays: 16,
    lastReviewedAt: "2026-07-28",
    note: "Reliable on quantitative methods. Flags weak identification strategies early.",
  },
  {
    id: "r2",
    name: "Prof. Imran Baig",
    email: "i.baig@example.edu",
    affiliation: "Quaid-i-Azam University",
    country: "Pakistan",
    orcid: "0000-0002-3348-9910",
    expertise: [
      "political sociology",
      "qualitative methods",
      "ethnography",
      "social movements",
    ],
    sections: ["Sociology & Anthropology", "Political Science"],
    availability: "available",
    activeReviews: 2,
    completed: 41,
    declined: 6,
    unanswered: 1,
    // Slow, and worth it — the note is here so an editor sorting by turnaround
    // does not quietly stop using their most careful reviewer.
    averageTurnaroundDays: 39,
    lastReviewedAt: "2026-06-11",
    note: "Unusually thorough on qualitative work; expect 5–6 weeks, not 3.",
  },
  {
    id: "r3",
    name: "Dr. Nadia Rahman",
    email: "n.rahman@example.edu",
    affiliation: "University of Dhaka",
    country: "Bangladesh",
    orcid: "0000-0003-1122-8845",
    expertise: ["gender studies", "labour economics", "informal sector"],
    sections: ["Economics & Development", "Gender Studies"],
    availability: "unavailable",
    unavailableUntil: "2026-11-30",
    activeReviews: 0,
    completed: 18,
    declined: 2,
    unanswered: 0,
    averageTurnaroundDays: 21,
    lastReviewedAt: "2026-05-02",
    note: "On fieldwork until end of November.",
  },
  {
    id: "r4",
    name: "Dr. Samuel Okonkwo",
    email: "s.okonkwo@example.edu",
    affiliation: "University of Ibadan",
    country: "Nigeria",
    orcid: "0000-0002-9087-3321",
    expertise: [
      "public administration",
      "governance",
      "institutional reform",
      "comparative politics",
    ],
    sections: ["Political Science", "Public Policy"],
    // Derived, not declared: four open reviews is the journal's inference, and
    // the screen says so rather than implying he refused.
    availability: "overloaded",
    activeReviews: 4,
    completed: 33,
    declined: 4,
    unanswered: 2,
    averageTurnaroundDays: 24,
    lastReviewedAt: "2026-08-14",
  },
  {
    id: "r5",
    name: "Dr. Priya Raghavan",
    email: "p.raghavan@example.edu",
    affiliation: "Jawaharlal Nehru University",
    country: "India",
    orcid: "0000-0001-5567-2290",
    expertise: ["education policy", "human capital", "survey design"],
    sections: ["Education", "Public Policy"],
    availability: "available",
    activeReviews: 0,
    // No history at all. The screens must not render this as a zero-day
    // turnaround or a poor record — it is an absence, not a result.
    completed: 0,
    declined: 0,
    unanswered: 0,
    averageTurnaroundDays: null,
    note: "Joined the reviewer pool in August 2026; not yet invited.",
  },
  {
    id: "r6",
    name: "Prof. Helena Vargas",
    email: "h.vargas@example.edu",
    affiliation: "Universidad de Buenos Aires",
    country: "Argentina",
    expertise: ["urban studies", "migration", "spatial inequality"],
    sections: ["Sociology & Anthropology"],
    availability: "available",
    activeReviews: 0,
    completed: 7,
    // Declines most of what she is sent. Visible so an editor can weigh it.
    declined: 14,
    unanswered: 1,
    averageTurnaroundDays: 19,
    lastReviewedAt: "2026-02-19",
    note: "Accepts roughly one invitation in three; worth asking for a close match.",
  },
  {
    id: "r7",
    name: "Dr. Tariq Mehmood",
    email: "t.mehmood@example.edu",
    affiliation: "University of Peshawar",
    country: "Pakistan",
    expertise: ["conflict studies", "regional security", "qualitative methods"],
    sections: ["Political Science"],
    availability: "available",
    activeReviews: 0,
    completed: 11,
    declined: 1,
    // Stopped answering. Nothing here says why, and the screen should not
    // guess — it shows the count and the date of the last completed review.
    unanswered: 5,
    averageTurnaroundDays: 27,
    lastReviewedAt: "2025-09-30",
  },
  {
    id: "r8",
    name: "Dr. Mei-Ling Chen",
    email: "m.chen@example.edu",
    affiliation: "National Taiwan University",
    country: "Taiwan",
    orcid: "0000-0003-7734-1102",
    expertise: [
      "behavioural economics",
      "experimental design",
      "household finance",
    ],
    sections: ["Economics & Development", "Psychology"],
    availability: "available",
    activeReviews: 1,
    completed: 29,
    declined: 5,
    unanswered: 0,
    averageTurnaroundDays: 14,
    lastReviewedAt: "2026-08-25",
    note: "Fastest reliable turnaround in the pool. Strong on experimental design.",
  },
]);
