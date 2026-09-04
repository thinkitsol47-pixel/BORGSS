import type { Submission } from "@/types";

/**
 * SCAFFOLD MOCK DATA — manuscripts in the workflow.
 *
 * Separate from `mock-data.ts`, which holds published articles: an Article is
 * what a Submission becomes, and mixing them would blur that.
 *
 * Chosen to exercise the screens rather than to look tidy. Between them these
 * cover: a manuscript waiting on the author, one mid-review with a partly
 * returned reviewer set, a desk rejection, an accepted paper in production, a
 * second review round with two decisions in its history, a brand-new
 * submission with no history at all, and a withdrawal. Anything the author
 * pages have to render is present in at least one row.
 *
 * `submittedById` is "mock-user" throughout — the fixed account in
 * `current-user.ts` — so the author views have something to own.
 */

const ME = "mock-user";

export const mockSubmissions: Submission[] = [
  /* ---------------------------------------------------------------- *
   * Waiting on the author. Two decisions in history, so the revisions
   * page has a real round to show.
   * ---------------------------------------------------------------- */
  {
    id: "s1",
    reference: "BORJSS-2026-0042",
    title:
      "Microfinance Access and Household Resilience in Rural Sindh: A Panel Study",
    abstract:
      "This study tracks 1,240 households across four districts of rural Sindh between 2021 and 2025 to assess whether access to microfinance improves resilience to income shocks. Using a fixed-effects panel specification, it finds a modest but statistically significant effect on consumption smoothing, concentrated among households with existing non-farm income.",
    keywords: ["microfinance", "household resilience", "rural development", "Sindh"],
    type: "research",
    section: "Economics & Development",
    submittedById: ME,
    status: "revision-requested",
    round: 2,
    submittedAt: "2026-03-14",
    updatedAt: "2026-08-19",
    revisionDueAt: "2026-10-17",
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        email: "a.khan@example.edu",
        affiliations: [
          {
            id: "af1",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
      {
        id: "c2",
        givenName: "Bilal",
        familyName: "Ahmed",
        orcid: "0000-0002-1694-233X",
        affiliations: [
          {
            id: "af2",
            name: "Lahore University of Management Sciences",
            city: "Lahore",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        kind: "manuscript",
        filename: "microfinance-resilience-anonymised.docx",
        sizeBytes: 486_000,
        uploadedAt: "2026-03-14",
        round: 0,
      },
      {
        id: "f2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 32_000,
        uploadedAt: "2026-03-14",
        round: 0,
      },
      {
        id: "f3",
        kind: "cover-letter",
        filename: "cover-letter.pdf",
        sizeBytes: 71_000,
        uploadedAt: "2026-03-14",
        round: 0,
      },
      {
        id: "f4",
        kind: "manuscript",
        filename: "microfinance-resilience-r1.docx",
        sizeBytes: 512_000,
        uploadedAt: "2026-06-28",
        round: 1,
      },
      {
        id: "f5",
        kind: "response-to-reviewers",
        filename: "response-to-reviewers-r1.pdf",
        sizeBytes: 104_000,
        uploadedAt: "2026-06-28",
        round: 1,
      },
    ],
    decisions: [
      {
        id: "d1",
        type: "major-revision",
        decidedAt: "2026-05-22",
        decidedBy: "Dr. Sana Malik",
        round: 1,
        letter: [
          "Thank you for submitting your manuscript to the Blue Ocean Research Journal for Social Sciences. It has now been assessed by two reviewers, whose comments are appended below.",
          "Both reviewers see merit in the panel design and in the length of the observation window, which is unusual for this literature. Both also raise substantive concerns about the identification strategy, and Reviewer 2 questions whether the non-farm income interaction is adequately supported by the data as presented.",
          "I am therefore inviting a major revision. Please address each point in a numbered response, and highlight changes in the manuscript itself. A revision does not guarantee acceptance; the revised manuscript will be returned to at least one of the original reviewers.",
        ],
      },
      {
        id: "d2",
        type: "minor-revision",
        decidedAt: "2026-08-19",
        decidedBy: "Dr. Sana Malik",
        round: 2,
        letter: [
          "Thank you for your revised manuscript and for the detailed response to the reviewers.",
          "Reviewer 1 is satisfied that the identification concerns have been met. Reviewer 2 accepts the revised treatment of the interaction term but asks for two clarifications in the methods section, listed below.",
          "These are minor and I do not expect the manuscript to need another round of external review. Please return the revision within eight weeks.",
        ],
      },
    ],
    messages: [
      {
        id: "m1",
        sentAt: "2026-03-16",
        from: "Editorial Office",
        fromRole: "editor",
        subject: "Submission received — BORJSS-2026-0042",
        body: [
          "Thank you for your submission. It has passed the initial completeness check and has been assigned to a handling editor.",
          "Please quote the reference BORJSS-2026-0042 in any correspondence about this manuscript.",
        ],
      },
      {
        id: "m2",
        sentAt: "2026-06-28",
        from: "Ayesha Khan",
        fromRole: "author",
        subject: "Revised manuscript uploaded",
        body: [
          "I have uploaded the revised manuscript along with a point-by-point response to both reviewers.",
          "One clarification: Reviewer 2 asked for the 2019 wave to be included. That wave used a different sampling frame and is not comparable, which I have explained in section 3.2 rather than adding the data.",
        ],
        attachments: ["response-to-reviewers-r1.pdf"],
      },
      {
        id: "m3",
        sentAt: "2026-08-19",
        from: "Dr. Sana Malik",
        fromRole: "editor",
        subject: "Decision: minor revision",
        body: [
          "The decision letter for round 2 is now available on the submission page.",
          "The remaining points are small. Please return the revision by 17 October 2026.",
        ],
      },
    ],
    reviewAssignments: [
      {
        id: "ra1",
        reviewerName: "Prof. Imran Qureshi",
        label: "Reviewer 1",
        invitedAt: "2026-03-20",
        respondedAt: "2026-03-22",
        dueAt: "2026-05-03",
        completedAt: "2026-04-29",
        status: "completed",
        round: 1,
      },
      {
        id: "ra2",
        reviewerName: "Dr. Fatima Sheikh",
        label: "Reviewer 2",
        invitedAt: "2026-03-20",
        respondedAt: "2026-03-21",
        dueAt: "2026-05-03",
        completedAt: "2026-05-11",
        status: "completed",
        round: 1,
      },
      {
        id: "ra3",
        reviewerName: "Dr. Fatima Sheikh",
        label: "Reviewer 2",
        invitedAt: "2026-07-02",
        respondedAt: "2026-07-03",
        dueAt: "2026-08-14",
        completedAt: "2026-08-11",
        status: "completed",
        round: 2,
      },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Mid-review: three invited, one still out. Exercises the "2 of 3
   * returned" progress line and an overdue reviewer.
   * ---------------------------------------------------------------- */
  {
    id: "s2",
    reference: "BORJSS-2026-0058",
    title:
      "Teacher Absenteeism and Learning Outcomes in Public Primary Schools: Evidence from Punjab",
    abstract:
      "Drawing on unannounced visits to 310 public primary schools, this paper documents a teacher absence rate of 18 percent and estimates its association with pupil performance in standardised numeracy assessments. It finds that absence is concentrated in a minority of schools and that its effect on learning is mediated by whether an absent teacher's class is covered.",
    keywords: ["education", "teacher absenteeism", "learning outcomes", "Punjab"],
    type: "research",
    section: "Education",
    submittedById: ME,
    status: "under-review",
    round: 1,
    submittedAt: "2026-06-02",
    updatedAt: "2026-08-25",
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        email: "a.khan@example.edu",
        affiliations: [
          {
            id: "af1",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        kind: "manuscript",
        filename: "teacher-absenteeism-anonymised.docx",
        sizeBytes: 604_000,
        uploadedAt: "2026-06-02",
        round: 0,
      },
      {
        id: "f2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 28_000,
        uploadedAt: "2026-06-02",
        round: 0,
      },
      {
        id: "f3",
        kind: "supplementary",
        filename: "school-visit-protocol.pdf",
        sizeBytes: 156_000,
        uploadedAt: "2026-06-02",
        round: 0,
      },
    ],
    decisions: [],
    messages: [
      {
        id: "m1",
        sentAt: "2026-06-04",
        from: "Editorial Office",
        fromRole: "editor",
        subject: "Submission received — BORJSS-2026-0058",
        body: [
          "Thank you for your submission. It has passed the initial completeness check and has been assigned to a handling editor.",
        ],
      },
    ],
    reviewAssignments: [
      {
        id: "ra1",
        reviewerName: "Dr. Nadia Rehman",
        label: "Reviewer 1",
        invitedAt: "2026-06-18",
        respondedAt: "2026-06-19",
        dueAt: "2026-08-01",
        completedAt: "2026-07-28",
        status: "completed",
        round: 1,
      },
      {
        id: "ra2",
        reviewerName: "Prof. Hassan Raza",
        label: "Reviewer 2",
        invitedAt: "2026-06-18",
        respondedAt: "2026-06-25",
        dueAt: "2026-08-08",
        completedAt: "2026-08-06",
        status: "completed",
        round: 1,
      },
      {
        id: "ra3",
        reviewerName: "Dr. Zara Iqbal",
        label: "Reviewer 3",
        invitedAt: "2026-07-10",
        respondedAt: "2026-07-12",
        dueAt: "2026-08-21",
        status: "overdue",
        round: 1,
      },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Brand new — no decisions, no reviewers, one message. The emptiest
   * a real submission gets, so the detail tabs must cope.
   * ---------------------------------------------------------------- */
  {
    id: "s3",
    reference: "BORJSS-2026-0071",
    title:
      "Digital Payment Adoption Among Women Traders: A Qualitative Study of Three Karachi Markets",
    abstract:
      "Based on 46 semi-structured interviews conducted across three wholesale markets in Karachi, this study examines why adoption of digital payment systems among women traders remains low despite widespread smartphone ownership. It identifies trust in cash settlement, the visibility of transaction records to family members, and inconsistent merchant acceptance as the three dominant constraints.",
    keywords: ["digital payments", "financial inclusion", "gender", "qualitative"],
    type: "research",
    section: "Gender & Development",
    submittedById: ME,
    status: "submitted",
    round: 1,
    submittedAt: "2026-08-28",
    updatedAt: "2026-08-28",
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        email: "a.khan@example.edu",
        affiliations: [
          {
            id: "af1",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        kind: "manuscript",
        filename: "digital-payments-women-traders-anonymised.docx",
        sizeBytes: 398_000,
        uploadedAt: "2026-08-28",
        round: 0,
      },
      {
        id: "f2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 30_000,
        uploadedAt: "2026-08-28",
        round: 0,
      },
    ],
    decisions: [],
    messages: [
      {
        id: "m1",
        sentAt: "2026-08-29",
        from: "Editorial Office",
        fromRole: "editor",
        subject: "Submission received — BORJSS-2026-0071",
        body: [
          "Thank you for your submission. It has passed the initial completeness check and has been assigned to a handling editor.",
          "You can expect a first response within four weeks.",
        ],
      },
    ],
    reviewAssignments: [],
  },

  /* ---------------------------------------------------------------- *
   * Desk rejection — declined without review, so no reviewers at all.
   * The letter has to stand on its own.
   * ---------------------------------------------------------------- */
  {
    id: "s4",
    reference: "BORJSS-2026-0019",
    title: "A Proposed Framework for Blockchain Governance in Municipal Utilities",
    abstract:
      "This conceptual paper proposes a governance framework for the application of distributed ledger technology to municipal utility billing, drawing on three international pilot deployments.",
    keywords: ["blockchain", "governance", "municipal utilities"],
    type: "conceptual",
    section: "Public Administration",
    submittedById: ME,
    status: "desk-rejected",
    round: 1,
    submittedAt: "2026-01-22",
    updatedAt: "2026-02-03",
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        email: "a.khan@example.edu",
        affiliations: [
          {
            id: "af1",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        kind: "manuscript",
        filename: "blockchain-governance-framework.docx",
        sizeBytes: 212_000,
        uploadedAt: "2026-01-22",
        round: 0,
      },
      {
        id: "f2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 26_000,
        uploadedAt: "2026-01-22",
        round: 0,
      },
    ],
    decisions: [
      {
        id: "d1",
        type: "desk-reject",
        decidedAt: "2026-02-03",
        decidedBy: "Prof. Tariq Mahmood",
        round: 1,
        letter: [
          "Thank you for considering the Blue Ocean Research Journal for Social Sciences for your work.",
          "I have read the manuscript and have decided not to send it for external review. The journal publishes empirical and theoretical research in the social sciences, and while the governance questions you raise are social-scientific, the manuscript is primarily a technical proposal evaluated against technical criteria. It would be better served by a journal in information systems or public technology policy.",
          "This decision reflects fit rather than quality, and it is not a judgement on the merit of the work. You are welcome to submit other work to the journal in future.",
        ],
      },
    ],
    messages: [
      {
        id: "m1",
        sentAt: "2026-01-24",
        from: "Editorial Office",
        fromRole: "editor",
        subject: "Submission received — BORJSS-2026-0019",
        body: [
          "Thank you for your submission. It has passed the initial completeness check and has been assigned to a handling editor.",
        ],
      },
    ],
    reviewAssignments: [],
  },

  /* ---------------------------------------------------------------- *
   * Accepted and in production — the happy path, and the only row that
   * links out to a published article.
   * ---------------------------------------------------------------- */
  {
    id: "s5",
    reference: "BORJSS-2025-0004",
    title:
      "Financial Inclusion and SME Growth: Evidence from Small Firms in Pakistan",
    abstract:
      "This study examines the relationship between access to formal financial services and the growth of small and medium enterprises. Using firm-level survey data, it finds a positive and significant association between account ownership, credit access, and employment growth.",
    keywords: ["financial inclusion", "SME", "development finance", "Pakistan"],
    type: "research",
    section: "Economics & Development",
    submittedById: ME,
    status: "in-production",
    round: 2,
    submittedAt: "2025-09-11",
    updatedAt: "2026-08-30",
    articleId: "a1",
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        email: "a.khan@example.edu",
        affiliations: [
          {
            id: "af1",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        kind: "manuscript",
        filename: "financial-inclusion-sme-anonymised.docx",
        sizeBytes: 442_000,
        uploadedAt: "2025-09-11",
        round: 0,
      },
      {
        id: "f2",
        kind: "title-page",
        filename: "title-page.docx",
        sizeBytes: 29_000,
        uploadedAt: "2025-09-11",
        round: 0,
      },
      {
        id: "f3",
        kind: "manuscript",
        filename: "financial-inclusion-sme-r1.docx",
        sizeBytes: 468_000,
        uploadedAt: "2026-01-08",
        round: 1,
      },
      {
        id: "f4",
        kind: "response-to-reviewers",
        filename: "response-to-reviewers.pdf",
        sizeBytes: 88_000,
        uploadedAt: "2026-01-08",
        round: 1,
      },
    ],
    decisions: [
      {
        id: "d1",
        type: "minor-revision",
        decidedAt: "2025-11-30",
        decidedBy: "Dr. Sana Malik",
        round: 1,
        letter: [
          "Both reviewers recommend publication subject to minor revision. Their comments are appended below.",
          "The main request is for clarity on how firm size was banded, and for the robustness check described in section 4 to be reported in full rather than summarised.",
        ],
      },
      {
        id: "d2",
        type: "accept",
        decidedAt: "2026-02-14",
        decidedBy: "Dr. Sana Malik",
        round: 2,
        letter: [
          "I am pleased to accept your manuscript for publication in the Blue Ocean Research Journal for Social Sciences.",
          "The manuscript now moves to production, where it will be copyedited and typeset. You will receive proofs to check before publication; please treat that stage as a check for errors rather than an opportunity to revise the text.",
        ],
      },
    ],
    messages: [
      {
        id: "m1",
        sentAt: "2026-02-14",
        from: "Dr. Sana Malik",
        fromRole: "editor",
        subject: "Accepted for publication",
        body: [
          "Your manuscript has been accepted. Congratulations.",
          "Production will be in touch about proofs. Nothing is payable until the article is scheduled, and the waiver you applied for at submission has been approved.",
        ],
      },
    ],
    reviewAssignments: [
      {
        id: "ra1",
        reviewerName: "Prof. Imran Qureshi",
        label: "Reviewer 1",
        invitedAt: "2025-09-25",
        respondedAt: "2025-09-26",
        dueAt: "2025-11-07",
        completedAt: "2025-11-02",
        status: "completed",
        round: 1,
      },
      {
        id: "ra2",
        reviewerName: "Dr. Ali Hussain",
        label: "Reviewer 2",
        invitedAt: "2025-09-25",
        respondedAt: "2025-09-30",
        dueAt: "2025-11-07",
        completedAt: "2025-11-14",
        status: "completed",
        round: 1,
      },
    ],
  },

  /* ---------------------------------------------------------------- *
   * Withdrawn — a terminal state that is neither success nor rejection.
   * ---------------------------------------------------------------- */
  {
    id: "s6",
    reference: "BORJSS-2026-0033",
    title:
      "Remittance Flows and Urban Housing Demand: A Preliminary Analysis",
    abstract:
      "This paper examines the relationship between inward remittance flows and residential property demand in three secondary cities, using transaction-level data from 2018 to 2024.",
    keywords: ["remittances", "housing", "urban economics"],
    type: "research",
    section: "Urban & Regional Studies",
    submittedById: ME,
    status: "withdrawn",
    round: 1,
    submittedAt: "2026-02-18",
    updatedAt: "2026-04-05",
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        email: "a.khan@example.edu",
        affiliations: [
          {
            id: "af1",
            name: "Institute of Business Administration",
            city: "Karachi",
            country: "Pakistan",
          },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        kind: "manuscript",
        filename: "remittances-housing-anonymised.docx",
        sizeBytes: 356_000,
        uploadedAt: "2026-02-18",
        round: 0,
      },
    ],
    decisions: [],
    messages: [
      {
        id: "m1",
        sentAt: "2026-04-05",
        from: "Ayesha Khan",
        fromRole: "author",
        subject: "Request to withdraw",
        body: [
          "I would like to withdraw this manuscript. A data access agreement covering the 2023–24 transactions has lapsed and I cannot currently support the analysis in section 4.",
          "I intend to resubmit once the agreement is renewed. Apologies for the inconvenience.",
        ],
      },
      {
        id: "m2",
        sentAt: "2026-04-05",
        from: "Editorial Office",
        fromRole: "editor",
        subject: "Withdrawal confirmed",
        body: [
          "Your manuscript has been withdrawn and no reviewers were approached. Nothing further is required from you.",
          "A resubmission would be treated as a new submission and would receive a new reference.",
        ],
      },
    ],
    reviewAssignments: [],
  },
];
