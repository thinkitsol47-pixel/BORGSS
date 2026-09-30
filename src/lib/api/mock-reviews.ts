import type { ReviewTask } from "@/types";

/**
 * SCAFFOLD MOCK DATA — review tasks as the reviewer sees them.
 *
 * Four states, chosen to exercise every branch of the reviewer screens: an
 * invitation still awaiting a response, one accepted and in progress, one past
 * its due date, and one already returned (which the read-only view renders).
 *
 * None of these carries an author name, affiliation or title page — the type
 * has nowhere to put one. The manuscripts below deliberately are *not* the
 * ones in `mock-submissions.ts`: the fixed mock account holds both `author` and
 * `reviewer`, and a journal never sends someone their own paper to review.
 */

export const mockReviews: ReviewTask[] = [
  /* ------------------------------------------------- awaiting a response */
  {
    id: "rv1",
    reference: "BORJSS-2026-0083",
    title:
      "Informal Credit Networks and Enterprise Survival During Economic Shock",
    abstract:
      "This paper examines how small enterprises in two urban centres used informal credit networks to survive a period of sharp currency depreciation. Drawing on a purpose-built panel of 480 firms observed before and after the shock, it finds that firms embedded in reciprocal lending arrangements were markedly more likely to remain trading, and that the effect operates through working-capital continuity rather than through lower borrowing costs.",
    keywords: [
      "informal credit",
      "enterprise survival",
      "economic shock",
      "small business",
    ],
    type: "research",
    section: "Economics & Development",
    round: 1,
    status: "invited",
    invitedAt: "2026-08-30",
    dueAt: "2026-10-11",
    wordCount: 8_400,
    files: [
      {
        id: "f1",
        filename: "manuscript-anonymised.pdf",
        sizeBytes: 512_000,
        stored: false,
      },
    ],
    invitationNote:
      "Your work on small-firm finance makes you well placed to assess the identification strategy in section 4. We would be grateful for a report within six weeks.",
  },

  /* -------------------------------------------------- accepted, in progress */
  {
    id: "rv2",
    reference: "BORJSS-2026-0077",
    title:
      "Community Radio and Civic Participation in Rural Districts: A Mixed-Methods Assessment",
    abstract:
      "Combining a listener survey (n=1,150) with sixteen focus groups, this study assesses whether community radio broadcasting is associated with higher civic participation in three rural districts. It reports a positive association with attendance at local council meetings, no measurable association with voting, and considerable variation by broadcast language.",
    keywords: [
      "community radio",
      "civic participation",
      "media effects",
      "mixed methods",
    ],
    type: "research",
    section: "Media & Communication",
    round: 1,
    status: "accepted",
    invitedAt: "2026-08-12",
    respondedAt: "2026-08-14",
    dueAt: "2026-09-25",
    wordCount: 9_100,
    files: [
      {
        id: "f1",
        filename: "manuscript-anonymised.pdf",
        sizeBytes: 604_000,
        stored: false,
      },
      {
        id: "f2",
        filename: "focus-group-protocol.pdf",
        sizeBytes: 98_000,
        stored: false,
      },
    ],
    invitationNote:
      "This one pairs a survey with qualitative work and we would value your judgement on whether the two strands are integrated or merely reported side by side.",
  },

  /* --------------------------------------------------------------- overdue */
  {
    id: "rv3",
    reference: "BORJSS-2026-0064",
    title:
      "Curriculum Reform and Teacher Autonomy: Evidence from a Provincial Rollout",
    abstract:
      "This paper evaluates a provincial curriculum reform using a staggered rollout across 42 districts. It finds that measured teacher autonomy fell in the first year following adoption and partially recovered in the second, with the decline concentrated in schools that received no accompanying training.",
    keywords: [
      "curriculum reform",
      "teacher autonomy",
      "education policy",
      "staggered adoption",
    ],
    type: "research",
    section: "Education",
    round: 2,
    status: "overdue",
    invitedAt: "2026-07-15",
    respondedAt: "2026-07-16",
    dueAt: "2026-08-26",
    wordCount: 7_600,
    files: [
      {
        id: "f1",
        filename: "manuscript-anonymised-r2.pdf",
        sizeBytes: 488_000,
        stored: false,
      },
      {
        id: "f2",
        filename: "response-to-reviewers.pdf",
        sizeBytes: 112_000,
        stored: false,
      },
    ],
    invitationNote:
      "You reviewed the first version of this manuscript. The authors have responded to your comments and we would be grateful for your view on whether they have been met.",
  },

  /* ------------------------------------------------------------- submitted */
  {
    id: "rv4",
    reference: "BORJSS-2026-0051",
    title:
      "Land Titling and Household Investment: A Regression Discontinuity Study",
    abstract:
      "Exploiting an administrative cutoff in a land titling programme, this paper estimates the effect of formal title on household investment in dwelling improvements. It reports a significant increase in investment among titled households in the two years after issuance.",
    keywords: ["land titling", "property rights", "household investment"],
    type: "research",
    section: "Economics & Development",
    round: 1,
    status: "submitted",
    invitedAt: "2026-05-20",
    respondedAt: "2026-05-21",
    dueAt: "2026-07-01",
    completedAt: "2026-06-27",
    wordCount: 8_900,
    files: [
      {
        id: "f1",
        filename: "manuscript-anonymised.pdf",
        sizeBytes: 546_000,
        stored: false,
      },
    ],
    review: {
      scores: {
        originality: 4,
        methodology: 3,
        literature: 4,
        argument: 3,
        significance: 4,
        presentation: 5,
      },
      recommendation: "major-revision",
      commentsToAuthor: [
        "This is a carefully executed study on an important question, and the writing is clear throughout. The administrative cutoff is a credible source of variation and the paper is right to exploit it.",
        "My substantive concern is with the bandwidth choice in section 5. The main result is reported at a single bandwidth with no sensitivity analysis, and given the sample size on either side of the cutoff I would expect the estimate to move considerably under alternative choices. Please report the standard sensitivity plot and discuss what it shows, including if it weakens the result.",
        "Second, the outcome measure combines structural improvements with maintenance spending. These respond to tenure security through different mechanisms and on different timescales, and I would find the paper more persuasive if they were reported separately as well as combined.",
        "Minor: table 3's units are not stated, and reference 14 appears twice.",
      ],
      commentsToEditor: [
        "Worth pursuing. The bandwidth issue is the one that matters — if the result survives a proper sensitivity analysis I would be content to see this accepted after revision. If it does not, the paper's central claim will need to be softened considerably.",
        "I have no reason to think I know who the authors are.",
      ],
      submittedAt: "2026-06-27",
    },
  },
];
