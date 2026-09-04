/** Domain types shared across the frontend. Mirror these in the backend schema. */

// `Role` is defined in the config rather than here, because the role list and
// its permission matrix are one thing and must not drift apart.
import type { Role } from "@/config/roles";

export type ArticleType =
  | "research"
  | "review"
  | "case-study"
  | "editorial"
  | "conceptual"
  | "book-review";

export interface Affiliation {
  id: string;
  name: string;
  city?: string;
  country?: string;
  ror?: string;
}

export interface Contributor {
  id: string;
  givenName: string;
  familyName: string;
  affiliations: Affiliation[];
  orcid?: string;
  isCorresponding?: boolean;
  email?: string;
}

export interface Reference {
  id: string;
  raw: string;
  doi?: string;
}

export interface Galley {
  id: string;
  label: "PDF" | "HTML" | "XML";
  url: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface Article {
  id: string;
  slug: string;
  doi?: string;
  type: ArticleType;
  title: string;
  subtitle?: string;
  abstract: string;
  keywords: string[];
  contributors: Contributor[];
  references: Reference[];
  galleys: Galley[];

  volume: number;
  issue: number;
  pages?: string;

  receivedAt?: string;
  revisedAt?: string;
  acceptedAt?: string;
  publishedAt: string;

  license: string; // e.g. "CC BY 4.0"
  funding?: string;
  conflictOfInterest?: string;
  ethicsStatement?: string;
  dataAvailability?: string;

  metrics?: { views: number; downloads: number; citations?: number };
}

export interface Issue {
  id: string;
  slug: string;
  volume: number;
  number: number;
  year: number;
  title?: string;
  coverUrl?: string;
  publishedAt: string;
  articleIds: string[];
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  institution: string;
  country: string;
  orcid?: string;
  scholarUrl?: string;
  photoUrl?: string;
  category:
    | "editor-in-chief"
    | "managing-editor"
    | "associate-editor"
    | "section-editor"
    | "advisory-board"
    | "editorial-board";
}

/* ------------------------------------------------------------------ *
 * Dated posts — announcements, news and events share one shape so the
 * listing and detail pages can be written once.
 * ------------------------------------------------------------------ */

export type PostKind = "announcement" | "news" | "event";

export type AnnouncementCategory =
  | "call-for-papers"
  | "policy-update"
  | "issue-release"
  | "general";

export interface Post {
  id: string;
  kind: PostKind;
  slug: string;
  title: string;
  /** One-sentence summary used in listings and social cards. */
  summary: string;
  /** Body as paragraphs; rendered into the prose column. */
  body: string[];
  publishedAt: string;
  /** Announcements only: drives the badge and grouping. */
  category?: AnnouncementCategory;
  /** Announcements and events: hidden from the active list once past. */
  expiresAt?: string;
  /** Events only. */
  event?: {
    startsAt: string;
    endsAt?: string;
    location: string;
    /** True when the event is online rather than in a physical place. */
    online?: boolean;
    registerUrl?: string;
    deadline?: string;
  };
  /** Optional call-to-action shown at the end of the post. */
  action?: { label: string; href: string };
}

/* ------------------------------------------------------------------ *
 * SUBMISSIONS — a manuscript while it is still in the workflow.
 *
 * An `Article` is what a manuscript becomes once it is published; a
 * `Submission` is the same work on its way there, and the two are kept
 * separate because almost every field differs. A submission has a status, a
 * decision history and reviewer assignments; it has no volume, issue, DOI or
 * galleys until it is accepted.
 *
 * Seven of the eight portal phases read these types, so treat the shape as
 * load-bearing: adding a field later is cheap, renaming one is not.
 * ------------------------------------------------------------------ */

/**
 * Where a manuscript is in the process.
 *
 * Ordered as the author experiences it. `desk-review` is separate from
 * `under-review` because a desk rejection never reaches a reviewer, and the
 * distinction is what the author sees on their own dashboard.
 */
export type SubmissionStatus =
  /** Author is still filling in the wizard; not yet visible to editors. */
  | "draft"
  /** Received, awaiting the editor's first look. */
  | "submitted"
  /** Editor is checking scope and completeness before involving reviewers. */
  | "desk-review"
  /** Out with reviewers. */
  | "under-review"
  /** Reviews are in; a decision has been requested of the editor. */
  | "awaiting-decision"
  /** Author has been asked for changes; the clock is with them. */
  | "revision-requested"
  /** Author has returned a revised manuscript. */
  | "revision-submitted"
  | "accepted"
  /** Accepted and moving through copyediting, layout and proofreading. */
  | "in-production"
  | "published"
  /** Declined without review — out of scope, or fails a formal check. */
  | "desk-rejected"
  /** Declined after review. */
  | "rejected"
  /** Pulled by the author before a decision. */
  | "withdrawn";

/** The editor's verdict at a decision point. */
export type DecisionType =
  | "accept"
  | "minor-revision"
  | "major-revision"
  | "reject"
  | "desk-reject";

/** What a file attached to a submission is for. */
export type SubmissionFileKind =
  /** Anonymised — no author names anywhere, including document properties. */
  | "manuscript"
  /** Names, affiliations, ORCIDs, corresponding author. Kept from reviewers. */
  | "title-page"
  | "cover-letter"
  | "figure"
  | "table"
  | "supplementary"
  /** Author's point-by-point reply to reviewers, on a revision. */
  | "response-to-reviewers";

export interface SubmissionFile {
  id: string;
  kind: SubmissionFileKind;
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  /** Which round of revision this file belongs to; 0 is the original. */
  round: number;
}

/** One editorial decision, kept as history rather than overwritten. */
export interface SubmissionDecision {
  id: string;
  type: DecisionType;
  decidedAt: string;
  /** Display name of the deciding editor. */
  decidedBy: string;
  /** The letter sent to the author. Paragraphs, like `Post.body`. */
  letter: string[];
  /** Which review round produced it; 1 for the first. */
  round: number;
}

/** A message between the author and the editorial office. */
export interface SubmissionMessage {
  id: string;
  sentAt: string;
  /** Display name of the sender. */
  from: string;
  /** Drives alignment and labelling; the author sees their own on one side. */
  fromRole: "author" | "editor";
  subject: string;
  body: string[];
  /** Filenames attached to the message, if any. */
  attachments?: string[];
}

/**
 * A reviewer's involvement with one submission.
 *
 * Held on the submission rather than the review so an author-facing page can
 * show progress ("2 of 3 reviews returned") without ever exposing who the
 * reviewers are — the journal runs double-blind.
 */
export interface ReviewAssignment {
  id: string;
  /** Never shown to authors. Editors see it; author views show the label. */
  reviewerName: string;
  /** "Reviewer 1", "Reviewer 2" — what the author is shown instead. */
  label: string;
  invitedAt: string;
  respondedAt?: string;
  dueAt?: string;
  completedAt?: string;
  status: "invited" | "accepted" | "declined" | "completed" | "overdue";
  round: number;
}

export interface Submission {
  id: string;
  /** Human-facing identifier, e.g. "BORJSS-2026-0042". Quoted in all email. */
  reference: string;
  title: string;
  abstract: string;
  keywords: string[];
  type: ArticleType;
  /** Subject section it was submitted to, e.g. "Economics & Development". */
  section: string;

  contributors: Contributor[];
  /** Id of the account that owns the submission — the submitting author. */
  submittedById: string;

  status: SubmissionStatus;
  /** Which review round the manuscript is in; 1 until a revision is asked for. */
  round: number;

  submittedAt: string;
  updatedAt: string;
  /** Set when the author is asked for changes, so the page can show a countdown. */
  revisionDueAt?: string;

  files: SubmissionFile[];
  decisions: SubmissionDecision[];
  messages: SubmissionMessage[];
  reviewAssignments: ReviewAssignment[];

  /** Set once published, linking through to the public article. */
  articleId?: string;
}

/* ------------------------------------------------------------------ *
 * REVIEWS — a reviewer's side of the same manuscript.
 *
 * The mirror of `Submission`. Where the author's views hide reviewer
 * identities, these hide the author's: a `ReviewTask` carries the manuscript's
 * reference, title and abstract but no contributors, affiliations or files
 * that would name them. That is not a UI choice to be made per screen — the
 * type simply has nowhere to put an author, so a reviewer screen cannot leak
 * one by accident.
 * ------------------------------------------------------------------ */

export type ReviewTaskStatus =
  /** Invited; the reviewer has not yet accepted or declined. */
  | "invited"
  /** Accepted and in progress. */
  | "accepted"
  | "declined"
  /** Accepted, past its due date, not yet returned. */
  | "overdue"
  | "submitted";

/** The reviewer's overall verdict. Advisory — the editor decides. */
export type ReviewRecommendation =
  | "accept"
  | "minor-revision"
  | "major-revision"
  | "reject";

/**
 * One scored criterion on the review form.
 * Kept as data so the form and the read-only view render from one list, and so
 * phase 20's "review forms" settings screen can eventually edit it.
 */
export type ReviewCriterion =
  | "originality"
  | "methodology"
  | "literature"
  | "argument"
  | "significance"
  | "presentation";

/** 1–5, or null while unanswered. */
export type ReviewScore = 1 | 2 | 3 | 4 | 5 | null;

export interface ReviewSubmissionBody {
  scores: Record<ReviewCriterion, ReviewScore>;
  recommendation: ReviewRecommendation;
  /** Shown to the author with the decision letter. Paragraphs. */
  commentsToAuthor: string[];
  /** Editor only; never reaches the author. */
  commentsToEditor: string[];
  /** Reviewer flagged a possible ethics or integrity concern. */
  concernsRaised?: string;
  submittedAt: string;
}

/**
 * A review as the reviewer sees it.
 *
 * Note what is absent: no `contributors`, no author name, no title page. The
 * manuscript file a reviewer receives is the anonymised one.
 */
export interface ReviewTask {
  id: string;
  /** The manuscript's reference, e.g. "BORJSS-2026-0058". */
  reference: string;
  title: string;
  abstract: string;
  keywords: string[];
  type: ArticleType;
  section: string;
  /** Which review round this invitation belongs to. */
  round: number;

  status: ReviewTaskStatus;
  invitedAt: string;
  respondedAt?: string;
  dueAt?: string;
  /** Set once the reviewer returns the report. */
  completedAt?: string;
  /** Present only after submission. */
  review?: ReviewSubmissionBody;

  /** Word count of the anonymised manuscript, so the reviewer can judge effort. */
  wordCount?: number;
  /** Filenames the reviewer may open — never the title page. */
  files: { id: string; filename: string; sizeBytes: number }[];
  /** The handling editor's note accompanying the invitation. */
  invitationNote?: string;
}

/* ------------------------------------------------------------------ *
 * REVIEWER DIRECTORY — the people an editor picks from.
 *
 * This is the one place in the portal where a reviewer's identity is the
 * subject rather than something to be hidden. Double-blind hides reviewers
 * from authors and authors from reviewers; it has never meant hiding reviewers
 * from the editor who has to choose them.
 *
 * Read by `/editorial/reviewers-db` and `/editorial/[id]/reviewers`.
 * ------------------------------------------------------------------ */

/**
 * Whether the reviewer is currently taking invitations.
 *
 * `unavailable` is set by the reviewer with an end date (leave, fieldwork);
 * `overloaded` is derived by the system from how many reviews they already
 * hold, so an editor does not have to count. The two are distinct because one
 * is the reviewer's own statement and the other is the journal's inference.
 */
export type ReviewerAvailability = "available" | "unavailable" | "overloaded";

export interface ReviewerProfile {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  country: string;
  orcid?: string;
  /** Subject areas, used for matching against a manuscript's keywords. */
  expertise: string[];
  /** Sections they normally review for. */
  sections: string[];

  availability: ReviewerAvailability;
  /** Set when `unavailable`, so the editor knows when to ask again. */
  unavailableUntil?: string;
  /** Open invitations and accepted reviews not yet returned. */
  activeReviews: number;

  /** Lifetime totals. `completed` excludes declines and expiries. */
  completed: number;
  declined: number;
  /** Invitations that were never answered — worth seeing before inviting. */
  unanswered: number;
  /**
   * Mean days from accepting to returning a report, over completed reviews.
   * Null when they have not completed one, so the column can say "—" rather
   * than imply a zero-day turnaround.
   */
  averageTurnaroundDays: number | null;
  /** ISO date of the most recent completed review, if any. */
  lastReviewedAt?: string;

  /** Editor-only note, e.g. "thorough on quantitative methods". */
  note?: string;
}

/* ------------------------------------------------------------------ *
 * EDITORIAL DECISIONS — the reports an editor reads before deciding.
 *
 * `ReviewAssignment` records that a reviewer was asked and whether they
 * answered; it deliberately carries no report body, because it is embedded in
 * `Submission`, which author-facing screens render. The report itself lives
 * here and is only ever loaded by editorial screens.
 *
 * The body is `ReviewSubmissionBody` — the same shape the reviewer's own form
 * produces — so what the editor reads is literally what the reviewer wrote,
 * with no second representation to drift out of step.
 * ------------------------------------------------------------------ */

export interface ReviewerReport {
  id: string;
  /** The `ReviewAssignment.id` this report answers. */
  assignmentId: string;
  submissionId: string;
  /** Editors see this; it never reaches an author-facing screen. */
  reviewerName: string;
  /** "Reviewer 2" — what the author sees in the decision letter. */
  label: string;
  round: number;
  body: ReviewSubmissionBody;
}

/* ------------------------------------------------------------------ *
 * ISSUES IN PREPARATION — the editorial side of `Issue`.
 *
 * `Issue` above is the published record the public archive reads: it has a
 * publication date and a settled article list. An issue being assembled has
 * neither. It has a state, a target date that may move, and accepted
 * manuscripts placed in a running order, so the two are kept apart rather than
 * making half of `Issue` optional.
 * ------------------------------------------------------------------ */

export type IssueState =
  /** Open for accepted manuscripts to be placed into. */
  | "planned"
  /** Contents fixed; going through production and proofs. */
  | "in-production"
  | "published";

export interface IssuePlanItem {
  /** `Submission.id` of an accepted manuscript placed in this issue. */
  submissionId: string;
  /** Position in the table of contents, from 1. */
  position: number;
  /** Set once production has assigned page numbers. */
  pages?: string;
}

export interface EditorialIssue {
  id: string;
  volume: number;
  number: number;
  year: number;
  title?: string;
  state: IssueState;
  /** Intended publication date. Moves while `planned`. */
  targetDate: string;
  /** Set only once `published`; the public `Issue` is created from it. */
  publishedAt?: string;
  /** Editorial planning target, not a cap. */
  plannedArticles?: number;
  items: IssuePlanItem[];
  /** Slug of the published issue, once there is one. */
  slug?: string;
}

/* ------------------------------------------------------------------ *
 * DOI DEPOSITS — the Crossref register, as a log rather than a flag.
 *
 * A deposit is an event with an outcome, not a boolean on the article: a
 * failed deposit is retried, and both attempts matter when someone asks why a
 * DOI does not resolve.
 * ------------------------------------------------------------------ */

export type DepositState = "registered" | "pending" | "failed" | "not-deposited";

export interface DoiRecord {
  id: string;
  /** The DOI itself, e.g. "10.00000/borjss.2026.0041". */
  doi: string;
  /** `Article.id` of the published article it identifies. */
  articleId: string;
  /** `Article.slug`, so the register can link to the public page. */
  articleSlug: string;
  articleTitle: string;
  /** Issue it appeared in, for grouping the log. */
  issueLabel: string;
  state: DepositState;
  /** Last attempt, whatever its outcome. */
  lastAttemptAt?: string;
  /** Set once Crossref accepted the deposit. */
  registeredAt?: string;
  /** Crossref's message when `failed`; shown verbatim. */
  failureReason?: string;
  attempts: number;
}

/* ------------------------------------------------------------------ *
 * PRODUCTION — an accepted manuscript on its way to a published article.
 *
 * `SubmissionStatus` has one member for all of this: `in-production`. That is
 * right for the author and for the editor, who both want one answer to "where
 * is it?" — but useless to the person doing the work, who needs to know
 * whether it is being copyedited, typeset or proofread.
 *
 * So the detail lives here rather than being pushed into `SubmissionStatus`.
 * Splitting that enum would have changed what every author-facing screen,
 * every filter and every badge renders, to serve three screens; and it would
 * have leaked production's internal stages to authors, who have no use for
 * them. A `ProductionJob` hangs off a submission by id instead.
 * ------------------------------------------------------------------ */

/** The three stages, in the order they happen. */
export type ProductionStage = "copyedit" | "galleys" | "proofread";

/**
 * How one stage is going.
 *
 * `with-author` is a state of its own rather than a flag on `in-progress`,
 * because it is the one state where the hold-up is not production's: an author
 * sitting on copyedits for three weeks is the single most common reason an
 * issue slips, and a queue that cannot show it cannot be chased.
 */
export type StageState =
  | "not-started"
  | "in-progress"
  /** Sent to the author for approval; production is waiting, not working. */
  | "with-author"
  | "done";

export interface ProductionStageRecord {
  stage: ProductionStage;
  state: StageState;
  /** Display name of whoever holds it. Absent when nobody has picked it up. */
  assignee?: string;
  startedAt?: string;
  /** Set when sent to the author, so the queue can age the wait. */
  sentToAuthorAt?: string;
  completedAt?: string;
  dueAt?: string;
  /** Production-side notes, kept per stage rather than per manuscript. */
  notes?: string[];
}

/**
 * A file produced by production, as opposed to one the author submitted.
 *
 * Deliberately not the `Galley` above. That one is what a *published* article
 * offers a reader: a label, a URL and a MIME type. This is the same file while
 * it is still being made, and the fields that matter are the ones a reader
 * never sees — which version it is, and whether it is the final one. The
 * published `Galley` is created from the final `ProductionGalley`.
 */
export type GalleyFormat = "pdf" | "xml" | "html" | "epub";

export interface ProductionGalley {
  id: string;
  format: GalleyFormat;
  label: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  /** Version, from 1. A galley is regenerated after every proof correction. */
  version: number;
  /** True once it is the version that will be, or was, published. */
  isFinal: boolean;
}

/**
 * One correction raised at the proofreading stage.
 *
 * Proof corrections are tracked individually because the question at the end
 * of proofreading is never "is it done" but "which of these were actually
 * applied" — and an author who reported five and sees three fixed needs to
 * know what happened to the other two.
 */
export interface ProofCorrection {
  id: string;
  /** Where in the galley, as the proofreader described it, e.g. "p. 4, ¶2". */
  location: string;
  description: string;
  raisedBy: "author" | "proofreader" | "copyeditor";
  raisedAt: string;
  state: "open" | "applied" | "rejected";
  /** Why, when `rejected`. Never left blank — a silent refusal is the bug. */
  resolution?: string;
}

export interface ProductionJob {
  id: string;
  /** `Submission.id` this job is producing. */
  submissionId: string;
  /** Denormalised so the queue renders without loading every submission. */
  reference: string;
  title: string;
  /** Issue it is scheduled into, if any; `EditorialIssue.id`. */
  issueId?: string;
  stages: ProductionStageRecord[];
  galleys: ProductionGalley[];
  corrections: ProofCorrection[];
  enteredProductionAt: string;
  /** Target publication date, inherited from the issue when there is one. */
  targetDate?: string;
}

/* ------------------------------------------------------------------ *
 * ACCOUNTS — the people who can sign in.
 *
 * Distinct from `ReviewerProfile`, which is a *pool entry*: expertise,
 * availability and turnaround, existing so an editor can choose someone. An
 * account is the login — email, roles, whether it is active. The two overlap
 * (most reviewers have accounts) but answer different questions, and merging
 * them would put review turnaround on the screen where roles are granted.
 * ------------------------------------------------------------------ */

/**
 * Whether an account can sign in, and why not when it cannot.
 *
 * `suspended` is separate from deletion because accounts are almost never
 * deleted: a suspended author still owns submissions, and a suspended
 * reviewer still appears in the history of manuscripts they reviewed.
 * `invited` covers an account created by an administrator whose owner has not
 * yet set a password.
 */
export type AccountStatus = "active" | "invited" | "suspended";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: AccountStatus;
  affiliation?: string;
  country?: string;
  orcid?: string;
  createdAt: string;
  /** Absent for an account that has never signed in — including every invite. */
  lastActiveAt?: string;
  /** Why the account was suspended. Never blank when `status` is suspended. */
  suspendedReason?: string;
}

/**
 * One entry in the audit trail.
 *
 * Append-only by design: an audit log that can be edited is not an audit log.
 * The actor is stored as a name *and* an id because the log has to remain
 * readable after an account is renamed or suspended — it records what was true
 * at the time, not what is true now.
 */
export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  /** Dotted verb, e.g. "roles.granted" — matches the permission vocabulary. */
  action: string;
  /** What was acted on, in human terms: a manuscript reference, an account. */
  target: string;
  /** One line of detail, e.g. "granted sectionEditor". */
  detail?: string;
}
