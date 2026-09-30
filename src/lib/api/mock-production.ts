import type { ProductionJob, Submission } from "@/types";

/**
 * SCAFFOLD MOCK DATA — manuscripts in production.
 *
 * Two files' worth of fixtures in one, for the same reason phase 16 kept the
 * editorial queue separate from the author's own list: production reads a
 * different set from either. `mock-submissions.ts` holds one manuscript at
 * `in-production` (`s5`) and `mock-queue-submissions.ts` holds none, so a
 * production queue built from those alone would have a single row and could
 * not show a queue's own problems — a stalled stage, an author sitting on
 * proofs, a manuscript with no issue to go into.
 *
 * `mockProductionSubmissions` adds the accepted manuscripts production is
 * working on; `mockProductionJobs` is the production-side record for each,
 * including `s5`.
 */

/* ------------------------------------------------------------------ *
 * The manuscripts. Accepted, so they carry a full decision history.
 * ------------------------------------------------------------------ */

export const mockProductionSubmissions: Submission[] = [
  {
    id: "p1",
    reference: "BORJSS-2026-0044",
    title:
      "Remittances and Household Schooling Decisions in Rural Sindh",
    abstract:
      "Using a two-wave household panel, this paper estimates the effect of remittance receipt on children's school enrolment and attendance. It finds a substantial enrolment effect concentrated among girls, and shows that the effect operates through the relaxation of a cash constraint at the start of the school year rather than through changed preferences.",
    keywords: ["remittances", "education", "household economics", "gender"],
    type: "research",
    section: "Economics & Development",
    submittedById: "author-7",
    status: "in-production",
    round: 2,
    submittedAt: "2026-01-19",
    updatedAt: "2026-08-14",
    contributors: [
      {
        id: "pc1",
        givenName: "Sana",
        familyName: "Bhutto",
        orcid: "0000-0002-7734-1190",
        isCorresponding: true,
        email: "s.bhutto@example.edu",
        affiliations: [
          {
            id: "paf1",
            name: "Sindh Institute of Development Economics",
            city: "Hyderabad",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "pf1",
        kind: "manuscript",
        filename: "remittances-schooling-accepted.docx",
        sizeBytes: 486_000,
        uploadedAt: "2026-07-30",
        round: 1,
        stored: false,
      },
      {
        id: "pf2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 38_000,
        uploadedAt: "2026-01-19",
        round: 0,
        stored: false,
      },
    ],
    decisions: [
      {
        id: "pd1",
        type: "minor-revision",
        decidedAt: "2026-05-22",
        decidedBy: "Dr. Ayesha Khan",
        round: 1,
        letter: [
          "Both reviewers recommend publication after minor revision. Please address the measurement question raised by Reviewer 2 in section 3.",
        ],
      },
      {
        id: "pd2",
        type: "accept",
        decidedAt: "2026-08-14",
        decidedBy: "Dr. Ayesha Khan",
        round: 2,
        letter: [
          "The revision answers both reviewers fully, and I am pleased to accept the paper for publication.",
          "It will now move to copyediting. You will receive the copyedited manuscript for approval before it is typeset.",
        ],
      },
    ],
    messages: [],
    reviewAssignments: [],
  },

  {
    id: "p2",
    reference: "BORJSS-2026-0021",
    title:
      "Teacher Absence and Learning Outcomes: Evidence from Unannounced School Visits",
    abstract:
      "Drawing on 340 unannounced visits to 85 government primary schools, this study documents teacher absence rates and links them to pupil performance on a standardised assessment. It finds absence to be concentrated in a minority of schools rather than spread evenly, which has direct implications for how monitoring resources are allocated.",
    keywords: ["teacher absence", "school monitoring", "learning outcomes", "education policy"],
    type: "research",
    section: "Education",
    submittedById: "author-8",
    status: "in-production",
    round: 2,
    submittedAt: "2025-11-04",
    updatedAt: "2026-06-27",
    contributors: [
      {
        id: "pc2",
        givenName: "Bilal",
        familyName: "Ahmed",
        isCorresponding: true,
        email: "b.ahmed@example.edu",
        affiliations: [
          {
            id: "paf2",
            name: "Aga Khan University Institute for Educational Development",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
      {
        id: "pc3",
        givenName: "Rukhsana",
        familyName: "Jamil",
        orcid: "0000-0001-3390-8842",
        isCorresponding: false,
        email: "r.jamil@example.edu",
        affiliations: [
          {
            id: "paf3",
            name: "Aga Khan University Institute for Educational Development",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "pf3",
        kind: "manuscript",
        filename: "teacher-absence-accepted.docx",
        sizeBytes: 512_000,
        uploadedAt: "2026-06-10",
        round: 1,
        stored: false,
      },
    ],
    decisions: [
      {
        id: "pd3",
        type: "accept",
        decidedAt: "2026-06-27",
        decidedBy: "Prof. Mubashir Quddus",
        round: 2,
        letter: [
          "Thank you for a careful revision. The paper is accepted for publication.",
        ],
      },
    ],
    messages: [],
    reviewAssignments: [],
  },

  {
    id: "p3",
    reference: "BORJSS-2026-0068",
    title: "Water Access and Time Poverty in Peri-Urban Settlements",
    abstract:
      "This paper measures the time households spend obtaining water in four peri-urban settlements and examines how that burden is distributed within the household. It finds that the time cost falls almost entirely on women and adolescent girls, and that reductions in collection distance translate into school attendance rather than into leisure.",
    keywords: ["water access", "time poverty", "gender", "urban services"],
    type: "research",
    section: "Gender Studies",
    submittedById: "author-9",
    status: "accepted",
    round: 1,
    submittedAt: "2026-03-30",
    updatedAt: "2026-09-01",
    contributors: [
      {
        id: "pc4",
        givenName: "Zainab",
        familyName: "Iqbal",
        orcid: "0000-0003-5521-7734",
        isCorresponding: true,
        email: "z.iqbal@example.edu",
        affiliations: [
          {
            id: "paf4",
            name: "University of Karachi",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "pf4",
        kind: "manuscript",
        filename: "water-access-accepted.docx",
        sizeBytes: 445_000,
        uploadedAt: "2026-03-30",
        round: 0,
        stored: false,
      },
    ],
    decisions: [
      {
        id: "pd4",
        type: "accept",
        decidedAt: "2026-09-01",
        decidedBy: "Dr. Ayesha Khan",
        round: 1,
        letter: [
          "Both reviewers recommend acceptance without revision, which is uncommon and deserved. The paper is accepted as it stands.",
        ],
      },
    ],
    messages: [],
    reviewAssignments: [],
  },
];

/* ------------------------------------------------------------------ *
 * The production records.
 *
 * Four jobs chosen so the queue has something to say about each. In order:
 * one just accepted and untouched, one waiting on the author, one stalled at
 * typesetting, and one nearly finished with corrections still open.
 * ------------------------------------------------------------------ */

export const mockProductionJobs: ProductionJob[] = [
  /* ------------------------------------ nothing started; nobody assigned */
  {
    id: "pj3",
    submissionId: "p3",
    reference: "BORJSS-2026-0068",
    title: "Water Access and Time Poverty in Peri-Urban Settlements",
    enteredProductionAt: "2026-09-01",
    stages: [
      { stage: "copyedit", state: "not-started" },
      { stage: "galleys", state: "not-started" },
      { stage: "proofread", state: "not-started" },
    ],
    galleys: [],
    corrections: [],
  },

  /* ------------------------------------------- copyedits with the author */
  {
    id: "pj1",
    submissionId: "p1",
    reference: "BORJSS-2026-0044",
    title: "Remittances and Household Schooling Decisions in Rural Sindh",
    issueId: "ei3",
    targetDate: "2027-06-30",
    enteredProductionAt: "2026-08-14",
    stages: [
      {
        stage: "copyedit",
        state: "with-author",
        assignee: "Hina Aslam",
        startedAt: "2026-08-18",
        sentToAuthorAt: "2026-08-29",
        dueAt: "2026-09-12",
        notes: [
          "Reference list converted to house style; six entries were missing DOIs and have been completed.",
          "Table 2 column headings shortened to fit the measure; flagged for the author to confirm the meaning is unchanged.",
        ],
      },
      { stage: "galleys", state: "not-started" },
      { stage: "proofread", state: "not-started" },
    ],
    galleys: [],
    corrections: [],
  },

  /* ------------------------------------ typesetting, and it has stalled */
  {
    id: "pj2",
    submissionId: "p2",
    reference: "BORJSS-2026-0021",
    title:
      "Teacher Absence and Learning Outcomes: Evidence from Unannounced School Visits",
    issueId: "ei3",
    targetDate: "2027-06-30",
    enteredProductionAt: "2026-06-27",
    stages: [
      {
        stage: "copyedit",
        state: "done",
        assignee: "Hina Aslam",
        startedAt: "2026-07-01",
        sentToAuthorAt: "2026-07-14",
        completedAt: "2026-07-25",
        notes: [
          "Author accepted all copyedits without change.",
        ],
      },
      {
        stage: "galleys",
        state: "in-progress",
        assignee: "Faisal Nadeem",
        startedAt: "2026-07-28",
        dueAt: "2026-08-15",
        notes: [
          "Figure 3 supplied at 96 dpi; author asked for a print-resolution version on 6 August and has not replied.",
        ],
      },
      { stage: "proofread", state: "not-started" },
    ],
    galleys: [
      {
        id: "g-p2-1",
        format: "pdf",
        label: "PDF galley",
        filename: "borjss-2026-0021-v1.pdf",
        // A placeholder path, deliberately not under `submissions/`, so
        // `isStoredFile()` reports false and the screen renders a plain row
        // instead of a download link to a file that was never uploaded.
        storagePath: "mock/p2/borjss-2026-0021-v1.pdf",
        sizeBytes: 1_240_000,
        createdAt: "2026-08-04",
        version: 1,
        isFinal: false,
      },
    ],
    corrections: [],
  },

  /* --------------------- proofreading, with corrections still unresolved */
  {
    id: "pj5",
    submissionId: "s5",
    reference: "BORJSS-2025-0004",
    title:
      "Financial Inclusion and SME Growth: Evidence from Small Firms in Pakistan",
    issueId: "ei3",
    targetDate: "2027-06-30",
    enteredProductionAt: "2026-06-05",
    stages: [
      {
        stage: "copyedit",
        state: "done",
        assignee: "Hina Aslam",
        startedAt: "2026-06-08",
        sentToAuthorAt: "2026-06-20",
        completedAt: "2026-07-02",
      },
      {
        stage: "galleys",
        state: "done",
        assignee: "Faisal Nadeem",
        startedAt: "2026-07-06",
        completedAt: "2026-07-24",
      },
      {
        stage: "proofread",
        state: "in-progress",
        assignee: "Nida Sheikh",
        startedAt: "2026-08-03",
        sentToAuthorAt: "2026-08-10",
        dueAt: "2026-09-10",
        notes: [
          "Author returned nine corrections on 24 August; six applied, one rejected, two still open.",
        ],
      },
    ],
    galleys: [
      {
        id: "g-s5-1",
        format: "pdf",
        label: "PDF galley",
        filename: "borjss-2025-0004-v1.pdf",
        storagePath: "mock/s5/borjss-2025-0004-v1.pdf",
        sizeBytes: 1_180_000,
        createdAt: "2026-07-24",
        version: 1,
        isFinal: false,
      },
      {
        id: "g-s5-2",
        format: "pdf",
        label: "PDF galley",
        filename: "borjss-2025-0004-v2.pdf",
        storagePath: "mock/s5/borjss-2025-0004-v2.pdf",
        sizeBytes: 1_196_000,
        createdAt: "2026-08-28",
        version: 2,
        isFinal: false,
      },
      {
        id: "g-s5-3",
        format: "xml",
        label: "JATS XML",
        filename: "borjss-2025-0004-v2.xml",
        storagePath: "mock/s5/borjss-2025-0004-v2.xml",
        sizeBytes: 148_000,
        createdAt: "2026-08-28",
        version: 2,
        isFinal: false,
      },
    ],
    corrections: [
      {
        id: "pc-1",
        location: "p. 3, ¶2",
        description:
          "\"significiant\" should read \"significant\".",
        raisedBy: "author",
        raisedAt: "2026-08-24",
        state: "applied",
      },
      {
        id: "pc-2",
        location: "Table 1, row 4",
        description:
          "Employment growth for the smallest size band is given as 4.2%; the accepted manuscript says 4.7%.",
        raisedBy: "author",
        raisedAt: "2026-08-24",
        state: "applied",
      },
      {
        id: "pc-3",
        location: "p. 11, footnote 14",
        description:
          "Footnote marker appears after the full stop; house style places it before.",
        raisedBy: "proofreader",
        raisedAt: "2026-08-25",
        state: "applied",
      },
      {
        id: "pc-4",
        location: "Abstract",
        description:
          "Author asks to add a sentence on policy implications to the abstract.",
        raisedBy: "author",
        raisedAt: "2026-08-24",
        state: "rejected",
        // A refusal always carries its reason. A correction that simply
        // disappears is what an author chases the editorial office about.
        resolution:
          "Declined at proof stage: this adds a claim that was not in the accepted manuscript and was not seen by the reviewers. The author was offered the change as a correction notice after publication if they consider it material.",
      },
      {
        id: "pc-5",
        location: "Figure 2 caption",
        description:
          "Caption refers to \"panel (c)\" but the figure has only two panels.",
        raisedBy: "author",
        raisedAt: "2026-08-24",
        state: "open",
      },
      {
        id: "pc-6",
        location: "References, Beck & Demirgüç-Kunt",
        description:
          "Page range is missing from the journal reference.",
        raisedBy: "proofreader",
        raisedAt: "2026-08-25",
        state: "open",
      },
    ],
  },
];
