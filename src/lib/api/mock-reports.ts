import type { ReviewerReport } from "@/types";

/**
 * SCAFFOLD MOCK DATA — the reports an editor reads before deciding.
 *
 * These attach to the completed `ReviewAssignment` rows in
 * `mock-queue-submissions.ts` by `assignmentId`. They are kept in their own
 * file rather than embedded in the submission because `Submission` is rendered
 * by author-facing screens: a report body sitting on it would be one careless
 * `.map()` away from reaching the author before the decision letter does.
 *
 * The set is chosen to make the editor's job real rather than tidy. On
 * `q3` — the manuscript awaiting a decision — the two reviewers **disagree**:
 * one recommends minor revision, the other rejects. An editor whose reviewers
 * always agree never has to exercise judgement, and a decision screen that
 * only handles agreement is not worth building.
 */

export const mockReports: ReviewerReport[] = [
  /* ------------------------------------------------------------------ *
   * q2 — under review, two of three reports in. The third is overdue, so
   * there is no report for `qra3` at all: that absence is what the decision
   * screen has to show honestly.
   * ------------------------------------------------------------------ */
  {
    id: "rp1",
    assignmentId: "qra1",
    submissionId: "q2",
    reviewerName: "Dr. Priya Raghavan",
    label: "Reviewer 1",
    round: 1,
    body: {
      scores: {
        originality: 4,
        methodology: 3,
        literature: 4,
        argument: 3,
        significance: 4,
        presentation: 3,
      },
      recommendation: "minor-revision",
      commentsToAuthor: [
        "This is a careful study of a question that deserves more attention than it has had, and the fieldwork is clearly substantial. The descriptive sections are the strongest part of the paper.",
        "My main reservation concerns the measure of attainment used in section 4. It is introduced without justification and does considerable work in the analysis that follows. Please explain why this measure was chosen over the more commonly used alternatives, and show whether the results hold under at least one of them.",
        "The literature review is thorough but stops in 2019. Several relevant studies have appeared since; the argument would be stronger for engaging with them.",
      ],
      commentsToEditor: [
        "Worth publishing after revision. The robustness question is answerable with data the authors already have, so I would not expect this to take them long.",
      ],
      submittedAt: "2026-07-28",
    },
  },
  {
    id: "rp2",
    assignmentId: "qra2",
    submissionId: "q2",
    reviewerName: "Dr. Mei-Ling Chen",
    label: "Reviewer 2",
    round: 1,
    body: {
      scores: {
        originality: 3,
        methodology: 4,
        literature: 3,
        argument: 4,
        significance: 3,
        presentation: 4,
      },
      recommendation: "minor-revision",
      commentsToAuthor: [
        "The identification strategy is sound and clearly explained, and I have no substantive concerns about the analysis itself.",
        "The paper would benefit from a shorter introduction. The argument does not begin until page four, and the first three pages restate context that the intended readership already has.",
        "Table 3 is difficult to read at its present width. Splitting it into two tables, or moving the secondary columns to an appendix, would help.",
      ],
      commentsToEditor: [
        "Straightforward minor revision from my side. Nothing here needs a second round of review.",
      ],
      submittedAt: "2026-08-04",
    },
  },

  /* ------------------------------------------------------------------ *
   * q3 — awaiting a decision, and the two reviewers disagree. This is the
   * case the decision screen exists for.
   * ------------------------------------------------------------------ */
  {
    id: "rp3",
    assignmentId: "qra4",
    submissionId: "q3",
    reviewerName: "Dr. Nadia Rahman",
    label: "Reviewer 1",
    round: 1,
    body: {
      scores: {
        originality: 4,
        methodology: 3,
        literature: 4,
        argument: 3,
        significance: 4,
        presentation: 4,
      },
      recommendation: "minor-revision",
      commentsToAuthor: [
        "The paper makes a genuine contribution to a literature that has relied heavily on secondary data, and the interview material is rich and well handled.",
        "The analysis section moves from the interviews to the general claim faster than the evidence supports. I would like to see the intermediate step made explicit: which accounts support which part of the claim, and how the cases that do not fit were treated.",
        "Minor: several quotations are given without any indication of who is speaking, even anonymously. A participant identifier would help the reader follow the argument across sections.",
      ],
      commentsToEditor: [
        "I would publish this after a revision. The gap I have identified is one of presentation rather than of evidence — I believe the authors have the material and have simply not shown their working.",
      ],
      submittedAt: "2026-06-18",
    },
  },
  {
    id: "rp4",
    assignmentId: "qra5",
    submissionId: "q3",
    reviewerName: "Prof. Imran Baig",
    label: "Reviewer 2",
    round: 1,
    body: {
      scores: {
        originality: 3,
        methodology: 2,
        literature: 3,
        argument: 2,
        significance: 3,
        presentation: 3,
      },
      recommendation: "reject",
      commentsToAuthor: [
        "The topic is important and the author has clearly spent time in the field. I am not persuaded, however, that the design can support the conclusions drawn from it.",
        "Twenty-two interviews recruited through a single organisation cannot establish the district-wide pattern claimed in section 6. The sampling is not a limitation to be noted in the discussion; it is the reason the central claim does not follow.",
        "The paper would be publishable as a case study of the organisation itself, with the generalising language removed throughout. That is a different paper from the one submitted, which is why I recommend rejection rather than revision.",
      ],
      commentsToEditor: [
        "I recognise Reviewer 1 may read this more generously and I do not think that would be unreasonable. My concern is that the fix is not a revision but a change of claim, and the author may not want to make it.",
        "If you do invite a revision, I would ask for the generalising claims to be withdrawn as a condition rather than left to the author's judgement.",
      ],
      concernsRaised:
        "None relating to integrity. My objection is methodological, not ethical.",
      submittedAt: "2026-08-30",
    },
  },

  /* ------------------------------------------------------------------ *
   * q4 — round 1 reports, which produced the major revision already in the
   * submission's decision history. Kept so the decision screen can show
   * what an earlier round said alongside the round now in progress.
   * ------------------------------------------------------------------ */
  {
    id: "rp5",
    assignmentId: "qra6",
    submissionId: "q4",
    reviewerName: "Dr. Fatima Siddiqui",
    label: "Reviewer 1",
    round: 1,
    body: {
      scores: {
        originality: 4,
        methodology: 2,
        literature: 3,
        argument: 2,
        significance: 4,
        presentation: 3,
      },
      recommendation: "major-revision",
      commentsToAuthor: [
        "The mapping of rotating credit associations is the most valuable part of this paper and is, as far as I know, new for these three cities.",
        "Section 5 claims that informal networks cause enterprise survival. The data are cross-sectional and the vendors who join these networks differ systematically from those who do not. Either address the selection problem directly or state the finding as an association.",
        "The sampling frame is described in one sentence. Given that the whole argument rests on it, this needs a full paragraph: how vendors were identified, who refused, and what that implies.",
      ],
      commentsToEditor: [
        "Worth a major revision. The descriptive contribution stands on its own even if the causal claim has to go.",
      ],
      submittedAt: "2026-06-02",
    },
  },
  {
    id: "rp6",
    assignmentId: "qra7",
    submissionId: "q4",
    reviewerName: "Prof. Helena Vargas",
    label: "Reviewer 2",
    round: 1,
    body: {
      scores: {
        originality: 3,
        methodology: 3,
        literature: 2,
        argument: 3,
        significance: 3,
        presentation: 2,
      },
      recommendation: "major-revision",
      commentsToAuthor: [
        "I agree with the general direction of the paper but found it hard going. The structure doubles back on itself, and the findings are introduced in section 3 before the method that produced them is described in section 4.",
        "The literature on rotating savings and credit associations outside this region is not engaged with at all. The paper reads as though the phenomenon were local, when there is a substantial comparative literature the argument should be placed against.",
        "The tables are not self-contained; several use abbreviations defined only in the text.",
      ],
      commentsToEditor: [
        "The revision needed here is largely structural. I am happy to look at it again if that is useful.",
      ],
      submittedAt: "2026-06-09",
    },
  },
];
