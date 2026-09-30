import type { Submission } from "@/types";

/**
 * SCAFFOLD MOCK DATA — manuscripts owned by *other* authors.
 *
 * Phases 13–15 needed only the signed-in author's own work, so every row in
 * `mock-submissions.ts` is owned by `mock-user`. An editorial queue that showed
 * one person's six manuscripts would not be a queue, and would hide the thing
 * these screens exist to make visible: whose manuscript has been waiting
 * longest, and which have nobody looking after them.
 *
 * These are kept in a separate file rather than appended to the author's
 * fixtures because they are answering a different question. The queue reads
 * both; the author's list still reads only their own.
 *
 * Chosen to exercise triage: one submitted a fortnight ago with no editor
 * assigned, one where two reviewers have reported and a third is overdue, one
 * with every review in and a decision now owed, a resubmission in round 2, and
 * a fresh arrival from this morning.
 */
export const mockQueueSubmissions: Submission[] = [
  /* ---------------------------------------------------------------- *
   * Sitting unassigned. The oldest thing in the queue, and the reason
   * the list sorts by "waiting longest" by default.
   * ---------------------------------------------------------------- */
  {
    id: "q1",
    reference: "BORJSS-2026-0074",
    title:
      "Land Tenure Reform and Agricultural Investment: Evidence from Punjab Districts",
    abstract:
      "Using district-level panel data from 2010 to 2024, this paper examines whether formal land titling raises agricultural investment. It finds a positive association concentrated in districts with functioning land registries, and no measurable effect where registry coverage is incomplete.",
    keywords: ["land tenure", "agricultural investment", "property rights", "Punjab"],
    type: "research",
    section: "Economics & Development",
    submittedById: "author-2",
    status: "submitted",
    round: 1,
    submittedAt: "2026-08-20",
    updatedAt: "2026-08-20",
    contributors: [
      {
        id: "qc1",
        givenName: "Bilal",
        familyName: "Ahmed",
        orcid: "0000-0002-4471-2280",
        isCorresponding: true,
        email: "b.ahmed@example.edu",
        affiliations: [
          {
            id: "qaf1",
            name: "University of Agriculture",
            city: "Faisalabad",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "qf1",
        kind: "manuscript",
        filename: "land-tenure-anonymised.docx",
        sizeBytes: 412_000,
        uploadedAt: "2026-08-20",
        round: 0,
        stored: false,
      },
      {
        id: "qf2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 28_000,
        uploadedAt: "2026-08-20",
        round: 0,
        stored: false,
      },
    ],
    decisions: [],
    messages: [],
    reviewAssignments: [],
  },

  /* ---------------------------------------------------------------- *
   * Mid-review with an overdue third reviewer — the case an editor has
   * to notice and chase.
   * ---------------------------------------------------------------- */
  {
    id: "q2",
    reference: "BORJSS-2026-0061",
    title:
      "Teacher Absenteeism and Learning Outcomes in Public Primary Schools",
    abstract:
      "Drawing on unannounced school visits across 180 public primary schools, this study links teacher absenteeism to standardised test performance. It reports a significant negative association that survives controls for school infrastructure and household background.",
    keywords: ["education", "teacher absenteeism", "learning outcomes", "schools"],
    type: "research",
    section: "Education",
    submittedById: "author-3",
    status: "under-review",
    round: 1,
    submittedAt: "2026-06-30",
    updatedAt: "2026-08-27",
    contributors: [
      {
        id: "qc2",
        givenName: "Sana",
        familyName: "Iqbal",
        isCorresponding: true,
        email: "s.iqbal@example.edu",
        affiliations: [
          {
            id: "qaf2",
            name: "Aga Khan University",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
      {
        id: "qc3",
        givenName: "Hassan",
        familyName: "Raza",
        affiliations: [
          {
            id: "qaf3",
            name: "Aga Khan University",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "qf3",
        kind: "manuscript",
        filename: "teacher-absenteeism-anonymised.docx",
        sizeBytes: 388_000,
        uploadedAt: "2026-06-30",
        round: 0,
        stored: false,
      },
      {
        id: "qf4",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 26_000,
        uploadedAt: "2026-06-30",
        round: 0,
        stored: false,
      },
    ],
    decisions: [],
    messages: [],
    reviewAssignments: [
      {
        id: "qra1",
        reviewerName: "Dr. Priya Raghavan",
        label: "Reviewer 1",
        invitedAt: "2026-07-08",
        respondedAt: "2026-07-10",
        dueAt: "2026-08-07",
        completedAt: "2026-08-04",
        status: "completed",
        round: 1,
      },
      {
        id: "qra2",
        reviewerName: "Dr. Mei-Ling Chen",
        label: "Reviewer 2",
        invitedAt: "2026-07-08",
        respondedAt: "2026-07-09",
        dueAt: "2026-08-07",
        completedAt: "2026-07-29",
        status: "completed",
        round: 1,
      },
      {
        id: "qra3",
        reviewerName: "Dr. Tariq Mehmood",
        label: "Reviewer 3",
        invitedAt: "2026-07-08",
        respondedAt: "2026-07-12",
        dueAt: "2026-08-11",
        status: "overdue",
        round: 1,
      },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Every review in, decision owed. The clock is with the editor here,
   * not the author or the reviewers.
   * ---------------------------------------------------------------- */
  {
    id: "q3",
    reference: "BORJSS-2026-0055",
    title:
      "Remittances and Women's Household Bargaining Power: A Mixed-Methods Study",
    abstract:
      "Combining a household survey of 640 remittance-receiving families with 32 in-depth interviews, this study asks whether remittance income shifts decision-making authority within households. Survey results show a modest shift; interviews suggest it is conditional on who controls the receiving account.",
    keywords: ["remittances", "gender", "household bargaining", "mixed methods"],
    type: "research",
    section: "Gender Studies",
    submittedById: "author-4",
    status: "awaiting-decision",
    round: 1,
    submittedAt: "2026-05-18",
    updatedAt: "2026-08-30",
    contributors: [
      {
        id: "qc4",
        givenName: "Zainab",
        familyName: "Malik",
        orcid: "0000-0001-9982-4471",
        isCorresponding: true,
        email: "z.malik@example.edu",
        affiliations: [
          {
            id: "qaf4",
            name: "Fatima Jinnah Women University",
            city: "Rawalpindi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "qf5",
        kind: "manuscript",
        filename: "remittances-anonymised.docx",
        sizeBytes: 496_000,
        uploadedAt: "2026-05-18",
        round: 0,
        stored: false,
      },
      {
        id: "qf6",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 31_000,
        uploadedAt: "2026-05-18",
        round: 0,
        stored: false,
      },
    ],
    decisions: [],
    messages: [],
    reviewAssignments: [
      {
        id: "qra4",
        reviewerName: "Dr. Nadia Rahman",
        label: "Reviewer 1",
        invitedAt: "2026-05-26",
        respondedAt: "2026-05-27",
        dueAt: "2026-06-25",
        completedAt: "2026-06-18",
        status: "completed",
        round: 1,
      },
      {
        id: "qra5",
        reviewerName: "Prof. Imran Baig",
        label: "Reviewer 2",
        invitedAt: "2026-05-26",
        respondedAt: "2026-05-30",
        dueAt: "2026-06-27",
        completedAt: "2026-08-30",
        status: "completed",
        round: 1,
      },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Round 2 — a revision has come back and needs re-review.
   * ---------------------------------------------------------------- */
  {
    id: "q4",
    reference: "BORJSS-2026-0037",
    title: "Informal Credit Networks Among Urban Street Vendors",
    abstract:
      "This paper maps informal lending among 210 street vendors in three cities, documenting rotating credit associations and their interaction with formal microfinance. It argues that informal networks persist because they price social collateral that formal lenders cannot observe.",
    keywords: ["informal credit", "street vendors", "urban economy", "ROSCAs"],
    type: "research",
    section: "Economics & Development",
    submittedById: "author-5",
    status: "revision-submitted",
    round: 2,
    submittedAt: "2026-02-11",
    updatedAt: "2026-08-25",
    contributors: [
      {
        id: "qc5",
        givenName: "Omar",
        familyName: "Farooq",
        isCorresponding: true,
        email: "o.farooq@example.edu",
        affiliations: [
          {
            id: "qaf5",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "qf7",
        kind: "manuscript",
        filename: "informal-credit-anonymised.docx",
        sizeBytes: 421_000,
        uploadedAt: "2026-02-11",
        round: 0,
        stored: false,
      },
      {
        id: "qf8",
        kind: "manuscript",
        filename: "informal-credit-revised.docx",
        sizeBytes: 447_000,
        uploadedAt: "2026-08-25",
        round: 1,
        stored: false,
      },
      {
        id: "qf9",
        kind: "response-to-reviewers",
        filename: "response-to-reviewers.docx",
        sizeBytes: 64_000,
        uploadedAt: "2026-08-25",
        round: 1,
        stored: false,
      },
    ],
    decisions: [
      {
        id: "qd1",
        type: "major-revision",
        decidedAt: "2026-06-14",
        decidedBy: "Dr. Ayesha Khan",
        round: 1,
        letter: [
          "Both reviewers see merit in the fieldwork but raise substantial concerns about the sampling frame and the claim of causality in section 5.",
          "I am inviting a major revision. Please address the sampling question directly rather than in a footnote, and either support the causal language or soften it.",
        ],
      },
    ],
    messages: [],
    reviewAssignments: [
      {
        id: "qra6",
        reviewerName: "Dr. Fatima Siddiqui",
        label: "Reviewer 1",
        invitedAt: "2026-03-02",
        respondedAt: "2026-03-03",
        dueAt: "2026-04-01",
        completedAt: "2026-03-24",
        status: "completed",
        round: 1,
      },
      {
        id: "qra7",
        reviewerName: "Prof. Helena Vargas",
        label: "Reviewer 2",
        invitedAt: "2026-03-02",
        respondedAt: "2026-03-06",
        dueAt: "2026-04-05",
        completedAt: "2026-04-02",
        status: "completed",
        round: 1,
      },
      {
        id: "qra8",
        reviewerName: "Dr. Fatima Siddiqui",
        label: "Reviewer 1",
        invitedAt: "2026-08-27",
        status: "invited",
        round: 2,
      },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Arrived this morning. Nothing has happened to it yet — the newest
   * end of the queue.
   * ---------------------------------------------------------------- */
  {
    id: "q5",
    reference: "BORJSS-2026-0079",
    title:
      "Digital Payment Adoption Among Small Retailers: Barriers Beyond Infrastructure",
    abstract:
      "Interviews with 95 small retailers across two cities find that digital payment adoption stalls not on connectivity but on settlement delay and record-keeping obligations. The paper argues that adoption policy has misdiagnosed the constraint.",
    keywords: ["digital payments", "small business", "financial inclusion", "adoption"],
    type: "research",
    section: "Economics & Development",
    submittedById: "author-6",
    status: "submitted",
    round: 1,
    submittedAt: "2026-09-03",
    updatedAt: "2026-09-03",
    contributors: [
      {
        id: "qc6",
        givenName: "Ravi",
        familyName: "Deshmukh",
        orcid: "0000-0002-6653-1194",
        isCorresponding: true,
        email: "r.deshmukh@example.edu",
        affiliations: [
          {
            id: "qaf6",
            name: "Tata Institute of Social Sciences",
            city: "Mumbai",
            country: "India",
          },
        ],
      },
    ],
    files: [
      {
        id: "qf10",
        kind: "manuscript",
        filename: "digital-payments-anonymised.docx",
        sizeBytes: 356_000,
        uploadedAt: "2026-09-03",
        round: 0,
        stored: false,
      },
      {
        id: "qf11",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 24_000,
        uploadedAt: "2026-09-03",
        round: 0,
        stored: false,
      },
    ],
    decisions: [],
    messages: [],
    reviewAssignments: [],
  },
];
