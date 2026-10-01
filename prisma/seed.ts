// prisma/seed.ts
//
// Loads the mock fixtures under src/lib/api and src/config into the real
// database, in dependency order. Run with `npm run db:seed` (which shells out
// to `tsx prisma/seed.ts` via prisma.config.ts's migrations.seed).
//
// IDs: the schema uses `@db.Uuid` everywhere, but the mock data uses short
// human ids ("s1", "u4", "a1", ...) that also appear as URL params throughout
// src/app/(dashboard). To keep those routes resolvable once pages are rewired
// to read from the database, every mock id is mapped to a **deterministic**
// UUID (a stable MD5-based v3-style hash of the string) rather than a random
// one — the same mock id always produces the same UUID, both within one run
// and across re-runs, which is what makes this script idempotent without a
// lookup table. Where the schema has no natural place for the original id
// (there is none of note here — every id-bearing model uses `@db.Uuid`), the
// mapping is simply best-effort documentation via the deterministic hash.
//
// Idempotency: every table this script writes to is truncated (children
// before parents) inside one transaction before inserting, so re-running
// `npm run db:seed` is safe and produces the same result rather than hitting
// unique-constraint errors or duplicating rows.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
import { createHash } from "node:crypto";

import { mockArticles, mockIssues, mockBoard, mockPosts } from "../src/lib/api/mock-data";
import { mockSubmissions } from "../src/lib/api/mock-submissions";
import { mockQueueSubmissions } from "../src/lib/api/mock-queue-submissions";
import { mockReviewers } from "../src/lib/api/mock-reviewers";
import { mockReports } from "../src/lib/api/mock-reports";
import { mockEditorialIssues, mockDoiRecords } from "../src/lib/api/mock-issues";
import { mockProductionSubmissions, mockProductionJobs } from "../src/lib/api/mock-production";
import { mockUsers, mockAuditEntries } from "../src/lib/api/mock-users";
import { mockReviews } from "../src/lib/api/mock-reviews";
import { REVIEW_CRITERIA } from "../src/lib/validation/schemas";
import type {
  Submission as SubmissionT,
  Article as ArticleT,
  ProductionJob as ProductionJobT,
} from "../src/types";

/* ------------------------------------------------------------------ *
 * Client — same adapter pattern as src/lib/db.ts, pointed at DIRECT_URL
 * (this script runs outside Next, via the Prisma CLI / tsx, so it reads
 * process.env directly; prisma.config.ts has already loaded .env.local
 * then .env by the time `prisma db seed` invokes this file).
 * ------------------------------------------------------------------ */

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL (or DATABASE_URL) is not set. Check .env.local / .env.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/* ------------------------------------------------------------------ *
 * The public record is not seeded by default (2026-09-18).
 *
 * Portal demo data is harmless: it is behind a login and it shows the
 * client how the workflow runs. The *public* record is not. A board member
 * is a named scholar at a named institution, an article is a claim that
 * someone wrote it, and DOAJ and the ISSN centre verify both by writing to
 * the people named. Seeding them invented twelve academics' participation.
 *
 * So `SEED_PUBLIC=1` is required to write Issue, Article, Post and
 * BoardMember. Leave it unset for anything the client will see.
 * ------------------------------------------------------------------ */
const seedPublic = process.env.SEED_PUBLIC === "1";

/* ------------------------------------------------------------------ *
 * Deterministic id mapping: mock string id -> stable UUID.
 * ------------------------------------------------------------------ */

function uid(namespace: string, key: string): string {
  const hash = createHash("md5").update(`${namespace}:${key}`).digest("hex");
  // Stamp version 4 + variant bits so this is a syntactically valid UUID.
  const bytes = hash.slice(0, 32).split("");
  bytes[12] = "4";
  bytes[16] = ((parseInt(bytes[16], 16) & 0x3) | 0x8).toString(16);
  const h = bytes.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

const userId = (mockId: string) => uid("user", mockId);
const submissionId = (mockId: string) => uid("submission", mockId);
const articleId = (mockId: string) => uid("article", mockId);
const issueId = (mockId: string) => uid("issue", mockId);
const editorialIssueId = (mockId: string) => uid("editorial-issue", mockId);
const boardId = (mockId: string) => uid("board", mockId);
const postId = (mockId: string) => uid("post", mockId);
const sectionId = (name: string) => uid("section", name);
const contributorId = (submissionMockId: string, contribMockId: string) =>
  uid("contributor", `${submissionMockId}:${contribMockId}`);
/** Its own namespace: a published byline is not the submission's contributor. */
const articleContributorId = (articleMockId: string, contribMockId: string) =>
  uid("article-contributor", `${articleMockId}:${contribMockId}`);
const affiliationId = (name: string) => uid("affiliation", name);
const fileId = (submissionMockId: string, fileMockId: string) =>
  uid("file", `${submissionMockId}:${fileMockId}`);
const decisionId = (submissionMockId: string, decisionMockId: string) =>
  uid("decision", `${submissionMockId}:${decisionMockId}`);
const messageId = (submissionMockId: string, messageMockId: string) =>
  uid("message", `${submissionMockId}:${messageMockId}`);
const assignmentId = (submissionMockId: string, assignmentMockId: string) =>
  uid("assignment", `${submissionMockId}:${assignmentMockId}`);
const reportId = (mockId: string) => uid("report", mockId);
const reviewFormId = (version: number) => uid("review-form", String(version));
const jobId = (mockId: string) => uid("job", mockId);
const stageId = (jobMockId: string, stage: string) => uid("stage", `${jobMockId}:${stage}`);
const galleyId = (mockId: string) => uid("galley", mockId);
const correctionId = (mockId: string) => uid("correction", mockId);
const planItemId = (mockId: string) => uid("plan-item", mockId);
const articleGalleyId = (articleMockId: string, galleyMockId: string) =>
  uid("article-galley", `${articleMockId}:${galleyMockId}`);
const referenceId = (articleMockId: string, refMockId: string) =>
  uid("reference", `${articleMockId}:${refMockId}`);
const doiRecordId = (mockId: string) => uid("doi", mockId);
const auditId = (mockId: string) => uid("audit", mockId);

/** Every enum in schema.prisma whose wire value is kebab-case is declared as
 * a camelCase key with `@map("kebab-case")` (e.g. `deskReview @map("desk-review")`),
 * because Prisma enum members must be valid identifiers. The generated client
 * takes the camelCase key, not the mapped string — but the mock data (and the
 * frontend's own `src/types/index.ts` unions) use the kebab-case wire form
 * throughout. This converts "desk-review" -> "deskReview" etc.; enum values
 * with no hyphen (e.g. "accept", "draft") are unaffected. */
function toEnumKey(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** "10.xxxxx/…" DOIs are unregistered placeholders repeated across articles/
 * reviewer fixtures with no real Crossref prefix — see CLAUDE.md "known gaps".
 * We seed them as-is; the schema's `@unique` on doi still holds because each
 * mock DOI string is in fact distinct. */

/* ------------------------------------------------------------------ *
 * Section registry — the ten canonical subject areas from
 * /about/aims-scope, fixing the "Gender Studies" -> "Gender & Development"
 * drift on the way in (see CLAUDE.md "Known gaps").
 * ------------------------------------------------------------------ */

const CANONICAL_SECTIONS = [
  "Economics & Development",
  "Sociology & Anthropology",
  "Political Science & Governance",
  "Education",
  "Public Administration",
  "Psychology & Behavioural Science",
  "Media & Communication",
  "Gender & Development",
  "Urban & Regional Studies",
  "Environment & Society",
] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Fixes the documented drift: a submission's free-string `section` maps here.
 *
 * Every short or old name the fixtures use, mapped onto the registry's own
 * spelling. `ReviewerProfile.sections` is a plain `String[]` with no foreign
 * key behind it, and `sectionMatch` is an exact `sections.includes(...)`, so a
 * name that is merely *close* never matches: three seeded reviewers carried
 * "Public Policy" and "Psychology" and were invisible for their own subject,
 * with nothing on screen to explain it.
 */
const SECTION_ALIASES: Record<string, string> = {
  "Gender Studies": "Gender & Development",
  // Short forms used in mock-reviewers.ts.
  "Political Science": "Political Science & Governance",
  "Public Policy": "Public Administration",
  Psychology: "Psychology & Behavioural Science",
};

function resolveSectionName(raw: string): string {
  const resolved = SECTION_ALIASES[raw] ?? raw;

  // Fail loudly rather than seed a name no screen can match. A silent
  // pass-through is what produced the drift this function exists to fix: the
  // row saves, the reviewer never matches, and nothing reports a fault.
  if (!CANONICAL_SECTIONS.includes(resolved as (typeof CANONICAL_SECTIONS)[number])) {
    throw new Error(
      `Section "${raw}" is not a canonical section and has no alias. ` +
        `Add it to CANONICAL_SECTIONS or map it in SECTION_ALIASES.`,
    );
  }

  return resolved;
}

/* ------------------------------------------------------------------ *
 * Role mapping helper — src/config/roles.ts Role union matches the
 * Prisma `Role` enum member-for-member.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Enum mapping — several Prisma enums use camelCase members with
 * `@map("hyphenated-value")` so the database column stores the same
 * hyphenated string the mock data and src/types/index.ts already use, but
 * the generated Prisma Client enum type is keyed by the camelCase member
 * name, not the mapped value. Every hyphenated mock string has to be
 * translated before being handed to the client.
 * ------------------------------------------------------------------ */

const ARTICLE_TYPE_MAP: Record<string, string> = {
  research: "research",
  review: "review",
  "case-study": "caseStudy",
  editorial: "editorial",
  conceptual: "conceptual",
  "book-review": "bookReview",
};
const articleType = (t: string) => ARTICLE_TYPE_MAP[t] ?? t;

const SUBMISSION_STATUS_MAP: Record<string, string> = {
  draft: "draft",
  submitted: "submitted",
  "desk-review": "deskReview",
  "under-review": "underReview",
  "awaiting-decision": "awaitingDecision",
  "revision-requested": "revisionRequested",
  "revision-submitted": "revisionSubmitted",
  accepted: "accepted",
  "in-production": "inProduction",
  published: "published",
  "desk-rejected": "deskRejected",
  rejected: "rejected",
  withdrawn: "withdrawn",
};
const submissionStatus = (s: string) => SUBMISSION_STATUS_MAP[s] ?? s;

const DECISION_TYPE_MAP: Record<string, string> = {
  accept: "accept",
  "minor-revision": "minorRevision",
  "major-revision": "majorRevision",
  reject: "reject",
  "desk-reject": "deskReject",
};
const decisionType = (d: string) => DECISION_TYPE_MAP[d] ?? d;

const FILE_KIND_MAP: Record<string, string> = {
  manuscript: "manuscript",
  "title-page": "titlePage",
  "cover-letter": "coverLetter",
  figure: "figure",
  table: "table",
  supplementary: "supplementary",
  "response-to-reviewers": "responseToReviewers",
};
const fileKind = (k: string) => FILE_KIND_MAP[k] ?? k;

const RECOMMENDATION_MAP: Record<string, string> = {
  accept: "accept",
  "minor-revision": "minorRevision",
  "major-revision": "majorRevision",
  reject: "reject",
};
const recommendation = (r: string) => RECOMMENDATION_MAP[r] ?? r;

const ISSUE_STATE_MAP: Record<string, string> = {
  planned: "planned",
  "in-production": "inProduction",
  published: "published",
};
const issueState = (s: string) => ISSUE_STATE_MAP[s] ?? s;

const STAGE_STATE_MAP: Record<string, string> = {
  "not-started": "notStarted",
  "in-progress": "inProgress",
  "with-author": "withAuthor",
  done: "done",
};
const stageState = (s: string) => STAGE_STATE_MAP[s] ?? s;

const DEPOSIT_STATE_MAP: Record<string, string> = {
  registered: "registered",
  pending: "pending",
  failed: "failed",
  "not-deposited": "notDeposited",
};
const depositState = (s: string) => DEPOSIT_STATE_MAP[s] ?? s;

const ANNOUNCEMENT_CATEGORY_MAP: Record<string, string> = {
  "call-for-papers": "callForPapers",
  "policy-update": "policyUpdate",
  "issue-release": "issueRelease",
  general: "general",
};
const announcementCategory = (c?: string) => (c ? ANNOUNCEMENT_CATEGORY_MAP[c] ?? c : undefined);

const BOARD_CATEGORY_MAP: Record<string, string> = {
  "editor-in-chief": "editorInChief",
  "managing-editor": "managingEditor",
  "associate-editor": "associateEditor",
  "section-editor": "sectionEditor",
  "advisory-board": "advisoryBoard",
  "editorial-board": "editorialBoard",
};
const boardCategory = (c: string) => BOARD_CATEGORY_MAP[c] ?? c;

// AssignmentStatus has no "overdue" member — the schema derives it from
// `accepted` + a past-due `dueAt` rather than storing it (see the schema
// comment on `AssignmentStatus`). Mock rows marked "overdue" are stored as
// "accepted" so that derivation still works once real queries replace the
// mock reads.
const ASSIGNMENT_STATUS_MAP: Record<string, string> = {
  invited: "invited",
  accepted: "accepted",
  declined: "declined",
  completed: "completed",
  overdue: "accepted",
};
const assignmentStatus = (s: string) => ASSIGNMENT_STATUS_MAP[s] ?? s;

async function main() {
  console.log("Seeding BORJSS database...");

  await db.$transaction(
    async (tx) => {
      /* ============================================================ *
       * 0. CLEAR — reverse dependency order.
       * ============================================================ */
      await tx.auditEntry.deleteMany();
      await tx.doiRecord.deleteMany();
      await tx.reference.deleteMany();
      await tx.articleGalley.deleteMany();
      await tx.proofCorrection.deleteMany();
      await tx.productionGalley.deleteMany();
      await tx.productionStageRecord.deleteMany();
      await tx.productionJob.deleteMany();
      await tx.issuePlanItem.deleteMany();
      await tx.editorialIssue.deleteMany();
      await tx.reviewerReport.deleteMany();
      await tx.reviewAssignment.deleteMany();
      await tx.submissionMessage.deleteMany();
      await tx.submissionDecision.deleteMany();
      await tx.submissionFile.deleteMany();
      await tx.contributorAffiliation.deleteMany();
      await tx.contributor.deleteMany();
      // Before `affiliation`: both join tables hold a restricting foreign key
      // into it, so the registry cannot be cleared while either still points
      // at a row.
      await tx.articleContributorAffiliation.deleteMany();
      await tx.articleContributor.deleteMany();
      await tx.affiliation.deleteMany();
      await tx.submission.deleteMany();
      await tx.article.deleteMany();
      await tx.issue.deleteMany();
      await tx.reviewForm.deleteMany();
      await tx.section.deleteMany();
      await tx.post.deleteMany();
      await tx.boardMember.deleteMany();
      await tx.reviewerProfile.deleteMany();

      /* ------------------------------------------------------------ *
       * Accounts are cleared differently from everything above, and the
       * difference is load-bearing.
       *
       * `User.id` **is** the `auth.users` id (phase 1), so a row here can
       * belong to a real Supabase Auth account that this script knows nothing
       * about — `ceoborjss@gmail.com` was created through the admin API, not
       * from a fixture. A blanket `user.deleteMany()` wiped it, and because
       * `getCurrentUser()` joins the session to this table, sign-in then
       * succeeded and the portal still bounced the visitor back to /login with
       * no error anywhere. It cost a long debugging session; do not restore the
       * blanket delete.
       *
       * So: delete only the rows this script owns. Any account it did not
       * create is left alone, and a re-seed cannot lock the journal out of its
       * own portal.
       * ------------------------------------------------------------ */
      const seededUserIds = await tx.user
        .findMany({ select: { id: true, email: true } })
        .then((rows) =>
          rows
            .filter(
              (r) =>
                r.email.endsWith("@example.edu") ||
                r.email.endsWith("@borjss.example"),
            )
            .map((r) => r.id),
        );

      await tx.userRole.deleteMany({ where: { userId: { in: seededUserIds } } });
      await tx.user.deleteMany({ where: { id: { in: seededUserIds } } });

      /* ============================================================ *
       * 1. IDENTITY — User + UserRole.
       *
       * Union of: every account in mock-users.ts, the fixed mock user from
       * current-user.ts (already present as u4 / Dr. Ayesha Khan — same
       * email, so no duplicate is created), synthetic accounts for the
       * "author-N" ids referenced only in mock-queue-submissions.ts and
       * mock-production.ts, and any reviewer in mock-reviewers.ts who has
       * no corresponding row in mock-users.ts.
       * ============================================================ */

      type SeedUser = {
        mockId: string;
        name: string;
        email: string;
        roles: string[];
        status?: "active" | "invited" | "suspended";
        affiliation?: string;
        country?: string;
        orcid?: string;
        suspendedReason?: string;
        createdAt?: string;
        lastActiveAt?: string;
      };

      const seedUsers: SeedUser[] = mockUsers.map((u) => ({
        mockId: u.id,
        name: u.name,
        email: u.email,
        roles: u.roles,
        status: u.status,
        affiliation: u.affiliation,
        country: u.country,
        orcid: u.orcid,
        suspendedReason: u.suspendedReason,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
      }));

      const knownEmails = new Set(seedUsers.map((u) => u.email));

      // Reviewers in mock-reviewers.ts with no matching account by email.
      for (const r of mockReviewers) {
        if (!knownEmails.has(r.email)) {
          seedUsers.push({
            mockId: `reviewer-${r.id}`,
            name: r.name,
            email: r.email,
            roles: ["reviewer"],
            status: "active",
            affiliation: r.affiliation,
            country: r.country,
            orcid: r.orcid,
          });
          knownEmails.add(r.email);
        }
      }

      // Synthetic "author-N" accounts referenced as submittedById in
      // mock-queue-submissions.ts and mock-production.ts, but never defined
      // as a full account anywhere. One User row per distinct author-N id,
      // named/emailed from that submission's corresponding author.
      const authorPlaceholders = new Map<string, { name: string; email: string }>();
      const collectPlaceholderAuthor = (s: SubmissionT) => {
        if (!/^author-\d+$/.test(s.submittedById)) return;
        if (authorPlaceholders.has(s.submittedById)) return;
        const corresponding =
          s.contributors.find((c) => c.isCorresponding) ?? s.contributors[0];
        const name = corresponding
          ? `${corresponding.givenName} ${corresponding.familyName}`
          : s.submittedById;
        const email =
          corresponding?.email ?? `${s.submittedById}@example.edu`;
        authorPlaceholders.set(s.submittedById, { name, email });
      };
      for (const s of mockQueueSubmissions) collectPlaceholderAuthor(s);
      for (const s of mockProductionSubmissions) collectPlaceholderAuthor(s);

      for (const [mockId, who] of authorPlaceholders) {
        // Two distinct "author-N" placeholders can share a corresponding
        // author's email across independently written fixture files (here,
        // "author-2" in mock-queue-submissions.ts and "author-8" in
        // mock-production.ts both resolve to Bilal Ahmed's address). Each
        // mockId still needs its own User row for the foreign key to
        // resolve, so a collision is disambiguated by suffixing rather than
        // silently dropping the second account.
        let email = who.email;
        if (knownEmails.has(email)) email = `${mockId}.${email}`;
        seedUsers.push({
          mockId,
          name: who.name,
          email,
          roles: ["author"],
          status: "active",
        });
        knownEmails.add(email);
      }

      for (const u of seedUsers) {
        await tx.user.create({
          data: {
            id: userId(u.mockId),
            name: u.name,
            email: u.email,
            affiliation: u.affiliation,
            country: u.country,
            orcid: u.orcid,
            status: u.status ?? "active",
            suspendedReason: u.suspendedReason,
            createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
            lastActiveAt: u.lastActiveAt ? new Date(u.lastActiveAt) : undefined,
            roles: {
              create: u.roles.map((role) => ({ role: role as Prisma.UserRoleCreateWithoutUserInput["role"] })),
            },
          },
        });
      }

      // The fixed mock user (`current-user.ts` -> ME = "mock-user") is the
      // same person as u4 (Dr. Ayesha Khan, a.khan@example.edu). Every
      // submission whose submittedById is "mock-user" resolves to u4's id.
      const ME_MOCK_ID = "u4";

      /** Resolve any submittedById mock value (ME, "author-N", or a real
       * mock-users id) to the seeded user's mock id, for uid() purposes. */
      function resolveUserMockId(rawId: string): string {
        if (rawId === "mock-user") return ME_MOCK_ID;
        return rawId;
      }

      /** Reviewer name -> seeded user mock id, by matching mockReviewers'
       * emails against seedUsers (falls back to the synthetic reviewer-N
       * account created above). Used for ReviewAssignment.reviewerId, since
       * ReviewAssignment in the mock data only carries a display name. */
      const reviewerNameToMockId = new Map<string, string>();
      for (const r of mockReviewers) {
        const match = seedUsers.find((u) => u.email === r.email);
        if (match) reviewerNameToMockId.set(r.name, match.mockId);
      }
      // A handful of reviewer names appear only in decision letters /
      // assignments and not in mock-reviewers.ts at all (e.g. "Prof. Imran
      // Qureshi", "Dr. Ali Hussain"). Create accounts for those too, lazily,
      // the first time they're seen, so ReviewAssignment.reviewerId always
      // resolves to a real User row.
      const extraReviewerUsers = new Map<string, string>(); // name -> mockId

      async function reviewerMockIdFor(name: string): Promise<string> {
        const known = reviewerNameToMockId.get(name);
        if (known) return known;
        const cached = extraReviewerUsers.get(name);
        if (cached) return cached;

        const mockId = `extra-reviewer-${slugify(name)}`;
        const email = `${slugify(name)}@example.edu`;
        await tx.user.create({
          data: {
            id: userId(mockId),
            name,
            email,
            status: "active",
            roles: { create: [{ role: "reviewer" }] },
          },
        });
        extraReviewerUsers.set(name, mockId);
        return mockId;
      }

      /** Editor display name (from decision letters) -> seeded user mock id,
       * matched against mockUsers by name; created lazily otherwise. */
      const editorNameToMockId = new Map<string, string>();
      for (const u of seedUsers) editorNameToMockId.set(u.name, u.mockId);

      async function editorMockIdFor(name: string): Promise<string> {
        const known = editorNameToMockId.get(name);
        if (known) return known;
        const mockId = `extra-editor-${slugify(name)}`;
        const email = `${slugify(name)}@borjss.example`;
        await tx.user.create({
          data: {
            id: userId(mockId),
            name,
            email,
            status: "active",
            roles: { create: [{ role: "editorInChief" }] },
          },
        });
        editorNameToMockId.set(name, mockId);
        return mockId;
      }

      /* ============================================================ *
       * 2. REGISTRY — Section, ReviewForm.
       * ============================================================ */

      for (const [i, name] of CANONICAL_SECTIONS.entries()) {
        await tx.section.create({
          data: {
            id: sectionId(name),
            name,
            slug: slugify(name),
            active: true,
            sortOrder: i,
          },
        });
      }

      const reviewForm = await tx.reviewForm.create({
        data: {
          id: reviewFormId(1),
          version: 1,
          criteria: REVIEW_CRITERIA as unknown as Prisma.InputJsonValue,
          active: true,
        },
      });

      /* ============================================================ *
       * 3. REVIEWER PROFILES — mock-reviewers.ts.
       * ============================================================ */

      for (const r of mockReviewers) {
        const ownerMockId =
          seedUsers.find((u) => u.email === r.email)?.mockId ?? `reviewer-${r.id}`;
        await tx.reviewerProfile.create({
          data: {
            id: uid("reviewer-profile", r.id),
            userId: userId(ownerMockId),
            expertise: r.expertise,
            sections: r.sections.map(resolveSectionName),
            availability: r.availability,
            unavailableUntil: r.unavailableUntil ? new Date(r.unavailableUntil) : null,
            note: r.note,
          },
        });
      }

      /* ============================================================ *
       * 4. WORKFLOW — Submission and everything hanging off it.
       *
       * All three submission sources (author's own, queue, production) are
       * seeded through the same helper, since they share the `Submission`
       * shape.
       * ============================================================ */

      // Track which article mock id a submission points at, and vice versa,
      // for the Submission<->Article backlink (Submission.articleId).
      // Articles are seeded in step 6, but Submission rows are created here
      // and updated with articleId once the Article exists (avoids ordering
      // the whole script around a circular FK).
      const submissionsNeedingArticleLink: { submissionMockId: string; articleMockId: string }[] = [];

      async function seedSubmission(s: SubmissionT) {
        const authorMockId = resolveUserMockId(s.submittedById);
        const resolvedSectionName = resolveSectionName(s.section);
        const secId = sectionId(resolvedSectionName);

        await tx.submission.create({
          data: {
            id: submissionId(s.id),
            reference: s.reference,
            title: s.title,
            abstract: s.abstract,
            keywords: s.keywords,
            type: toEnumKey(s.type) as Prisma.SubmissionCreateInput["type"],
            sectionId: secId,
            submittedById: userId(authorMockId),
            status: toEnumKey(s.status) as Prisma.SubmissionCreateInput["status"],
            round: s.round,
            submittedAt: new Date(s.submittedAt),
            updatedAt: new Date(s.updatedAt),
            revisionDueAt: s.revisionDueAt ? new Date(s.revisionDueAt) : null,
          },
        });

        if (s.articleId) {
          submissionsNeedingArticleLink.push({ submissionMockId: s.id, articleMockId: s.articleId });
        }

        // Contributors + affiliations.
        for (const [i, c] of s.contributors.entries()) {
          const cId = contributorId(s.id, c.id);
          await tx.contributor.create({
            data: {
              id: cId,
              submissionId: submissionId(s.id),
              givenName: c.givenName,
              familyName: c.familyName,
              orcid: c.orcid,
              email: c.email,
              isCorresponding: c.isCorresponding ?? false,
              position: i + 1,
            },
          });
          for (const aff of c.affiliations) {
            const affId = affiliationId(aff.name);
            await tx.affiliation.upsert({
              where: { id: affId },
              create: {
                id: affId,
                name: aff.name,
                city: aff.city,
                country: aff.country,
                ror: aff.ror,
              },
              update: {},
            });
            await tx.contributorAffiliation.create({
              data: { contributorId: cId, affiliationId: affId },
            });
          }
        }

        // Files.
        for (const f of s.files) {
          await tx.submissionFile.create({
            data: {
              id: fileId(s.id, f.id),
              submissionId: submissionId(s.id),
              kind: fileKind(f.kind) as never,
              filename: f.filename,
              // No real storage backend yet — the mock data has no storage
              // path, so a synthetic one is recorded from the filename.
              storagePath: `mock/${s.id}/${f.filename}`,
              sizeBytes: BigInt(f.sizeBytes),
              round: f.round,
              uploadedAt: new Date(f.uploadedAt),
            },
          });
        }

        // Decisions.
        for (const d of s.decisions) {
          const decidedByMockId = await editorMockIdFor(d.decidedBy);
          await tx.submissionDecision.create({
            data: {
              id: decisionId(s.id, d.id),
              submissionId: submissionId(s.id),
              type: decisionType(d.type) as never,
              round: d.round,
              decidedById: userId(decidedByMockId),
              letter: d.letter,
              decidedAt: new Date(d.decidedAt),
            },
          });
        }

        // Messages.
        for (const m of s.messages) {
          // The "from" side is either the author (this submission's owner)
          // or "Editorial Office" / a named editor. Named senders are
          // resolved the same way as decision-letter signatories.
          const fromMockId =
            m.fromRole === "author"
              ? authorMockId
              : await editorMockIdFor(m.from === "Editorial Office" ? "Editorial Office" : m.from);
          await tx.submissionMessage.create({
            data: {
              id: messageId(s.id, m.id),
              submissionId: submissionId(s.id),
              fromId: userId(fromMockId),
              fromRole: m.fromRole,
              subject: m.subject,
              body: m.body,
              sentAt: new Date(m.sentAt),
            },
          });
        }

        // Review assignments.
        for (const ra of s.reviewAssignments) {
          const reviewerMockId = await reviewerMockIdFor(ra.reviewerName);
          await tx.reviewAssignment.create({
            data: {
              id: assignmentId(s.id, ra.id),
              submissionId: submissionId(s.id),
              reviewerId: userId(reviewerMockId),
              label: ra.label,
              round: ra.round,
              status: assignmentStatus(ra.status) as never,
              invitedAt: new Date(ra.invitedAt),
              respondedAt: ra.respondedAt ? new Date(ra.respondedAt) : null,
              dueAt: ra.dueAt ? new Date(ra.dueAt) : null,
              completedAt: ra.completedAt ? new Date(ra.completedAt) : null,
            },
          });
        }
      }

      for (const s of mockSubmissions) await seedSubmission(s);
      for (const s of mockQueueSubmissions) await seedSubmission(s);
      for (const s of mockProductionSubmissions) await seedSubmission(s);

      /* ============================================================ *
       * 5. REVIEWER REPORTS — mock-reports.ts, all against ReviewForm v1.
       *
       * Each report's assignmentId refers to a ReviewAssignment created
       * above; the mock assignment ids ("qra1", ...) are only unique within
       * mock-queue-submissions.ts, so the same (submissionId, assignmentId)
       * pair used at creation time is reused here for lookup.
       * ============================================================ */

      for (const r of mockReports) {
        await tx.reviewerReport.create({
          data: {
            id: reportId(r.id),
            assignmentId: assignmentId(r.submissionId, r.assignmentId),
            submissionId: submissionId(r.submissionId),
            reviewFormId: reviewForm.id,
            round: r.round,
            scores: r.body.scores as unknown as Prisma.InputJsonValue,
            recommendation: recommendation(r.body.recommendation) as never,
            commentsToAuthor: r.body.commentsToAuthor,
            commentsToEditor: r.body.commentsToEditor,
            concernsRaised: r.body.concernsRaised,
            submittedAt: new Date(r.body.submittedAt),
          },
        });
      }

      /* ============================================================ *
       * 4b. THE REVIEWER'S OWN TASKS — mock-reviews.ts.
       *
       * These four manuscripts (rv1-rv4) are deliberately *not* in
       * mock-submissions.ts: the fixed mock account (u4, "mock-user") holds
       * both `author` and `reviewer`, and a journal never sends someone their
       * own paper to review. So each becomes its own synthetic Submission,
       * authored by a throwaway account, with u4 as the sole reviewer.
       *
       * mock-reviews.ts has no ReviewAssignment id of its own (the fixture
       * predates that model existing as a separate row) — the review task's
       * own id doubles as the assignment id for uid() purposes, since each
       * submission here has exactly one assignment.
       * ============================================================ */

      for (const rv of mockReviews) {
        const authorMockId = `reviewer-task-author-${rv.id}`;
        await tx.user.create({
          data: {
            id: userId(authorMockId),
            name: "Corresponding Author (withheld)",
            email: `${rv.id}.author@example.edu`,
            status: "active",
            roles: { create: [{ role: "author" }] },
          },
        });

        const secId = sectionId(resolveSectionName(rv.section));

        // status: "submitted" (the report has been returned) maps to the
        // submission itself sitting at "under-review" or later; since these
        // four rows exist only to exercise the reviewer's own screens, the
        // submission's own status is not read by any page that also reads
        // this fixture, so "under-review" is a reasonable constant.
        await tx.submission.create({
          data: {
            id: submissionId(rv.id),
            reference: rv.reference,
            title: rv.title,
            abstract: rv.abstract,
            keywords: rv.keywords,
            type: articleType(rv.type) as never,
            sectionId: secId,
            submittedById: userId(authorMockId),
            status: "underReview",
            round: rv.round,
            submittedAt: new Date(rv.invitedAt),
            updatedAt: new Date(rv.completedAt ?? rv.dueAt ?? rv.invitedAt),
          },
        });

        for (const f of rv.files) {
          await tx.submissionFile.create({
            data: {
              id: fileId(rv.id, f.id),
              submissionId: submissionId(rv.id),
              kind: "manuscript",
              filename: f.filename,
              storagePath: `mock/${rv.id}/${f.filename}`,
              sizeBytes: BigInt(f.sizeBytes),
              round: rv.round - 1,
              uploadedAt: new Date(rv.invitedAt),
            },
          });
        }

        await tx.reviewAssignment.create({
          data: {
            id: assignmentId(rv.id, rv.id),
            submissionId: submissionId(rv.id),
            reviewerId: userId(ME_MOCK_ID),
            label: "Reviewer 1",
            round: rv.round,
            // ReviewTaskStatus adds "submitted" (the report has been
            // returned) on top of AssignmentStatus's four members; the
            // reviewer-facing "submitted" is the editorial-facing "completed".
            status: assignmentStatus(
              rv.status === "submitted" ? "completed" : rv.status,
            ) as never,
            invitedAt: new Date(rv.invitedAt),
            respondedAt: rv.respondedAt ? new Date(rv.respondedAt) : null,
            dueAt: rv.dueAt ? new Date(rv.dueAt) : null,
            completedAt: rv.completedAt ? new Date(rv.completedAt) : null,
            invitationNote: rv.invitationNote,
          },
        });

        if (rv.review) {
          await tx.reviewerReport.create({
            data: {
              id: reportId(rv.id),
              assignmentId: assignmentId(rv.id, rv.id),
              submissionId: submissionId(rv.id),
              reviewFormId: reviewForm.id,
              round: rv.round,
              scores: rv.review.scores as unknown as Prisma.InputJsonValue,
              recommendation: recommendation(rv.review.recommendation) as never,
              commentsToAuthor: rv.review.commentsToAuthor,
              commentsToEditor: rv.review.commentsToEditor,
              concernsRaised: rv.review.concernsRaised,
              submittedAt: new Date(rv.review.submittedAt),
            },
          });
        }
      }

      /* ============================================================ *
       * 6. PUBLISHED RECORD — Issue, Article (from mock-data.ts).
       * ============================================================ */

      for (const iss of seedPublic ? mockIssues : []) {
        await tx.issue.create({
          data: {
            id: issueId(iss.id),
            slug: iss.slug,
            volume: iss.volume,
            number: iss.number,
            year: iss.year,
            title: iss.title,
            coverUrl: iss.coverUrl,
            publishedAt: new Date(iss.publishedAt),
          },
        });
      }

      async function seedArticle(a: ArticleT) {
        const issueMockId = mockIssues.find((iss) => iss.articleIds.includes(a.id))?.id;
        await tx.article.create({
          data: {
            id: articleId(a.id),
            slug: a.slug,
            doi: a.doi,
            type: articleType(a.type) as never,
            title: a.title,
            subtitle: a.subtitle,
            abstract: a.abstract,
            keywords: a.keywords,
            issueId: issueMockId ? issueId(issueMockId) : null,
            volume: a.volume,
            issueNumber: a.issue,
            pages: a.pages,
            receivedAt: a.receivedAt ? new Date(a.receivedAt) : null,
            revisedAt: a.revisedAt ? new Date(a.revisedAt) : null,
            acceptedAt: a.acceptedAt ? new Date(a.acceptedAt) : null,
            publishedAt: new Date(a.publishedAt),
            license: a.license,
            funding: a.funding,
            conflictOfInterest: a.conflictOfInterest,
            ethicsStatement: a.ethicsStatement,
            dataAvailability: a.dataAvailability,
            views: a.metrics?.views ?? 0,
            downloads: a.metrics?.downloads ?? 0,
            citations: a.metrics?.citations,
          },
        });

        // The published byline. Its own rows, not the submission's — see the
        // note on `ArticleContributor` in schema.prisma. Affiliations are
        // upserted into the *shared* registry, so an institution stays one row
        // whether it is reached from a submission or from a published article.
        for (const [i, c] of a.contributors.entries()) {
          const acId = articleContributorId(a.id, c.id);
          await tx.articleContributor.create({
            data: {
              id: acId,
              articleId: articleId(a.id),
              givenName: c.givenName,
              familyName: c.familyName,
              orcid: c.orcid,
              email: c.email,
              isCorresponding: c.isCorresponding ?? false,
              position: i + 1,
            },
          });
          for (const aff of c.affiliations) {
            const affId = affiliationId(aff.name);
            await tx.affiliation.upsert({
              where: { id: affId },
              create: {
                id: affId,
                name: aff.name,
                city: aff.city,
                country: aff.country,
                ror: aff.ror,
              },
              update: {},
            });
            await tx.articleContributorAffiliation.create({
              data: { articleContributorId: acId, affiliationId: affId },
            });
          }
        }

        for (const g of a.galleys) {
          await tx.articleGalley.create({
            data: {
              id: articleGalleyId(a.id, g.id),
              articleId: articleId(a.id),
              label: g.label,
              url: g.url,
              mimeType: g.mimeType,
              sizeBytes: g.sizeBytes != null ? BigInt(g.sizeBytes) : null,
            },
          });
        }

        for (const [i, ref] of a.references.entries()) {
          await tx.reference.create({
            data: {
              id: referenceId(a.id, ref.id),
              articleId: articleId(a.id),
              raw: ref.raw,
              doi: ref.doi,
              position: i + 1,
            },
          });
        }
      }

      for (const a of seedPublic ? mockArticles : []) await seedArticle(a);

      // Now that Article rows exist, link back the Submission rows that
      // record a published articleId (s5 -> a1, via s.articleId).
      // Nothing to link when the public record was not seeded: the target
      // Article rows do not exist, and the update would be refused.
      for (const link of seedPublic ? submissionsNeedingArticleLink : []) {
        await tx.submission.update({
          where: { id: submissionId(link.submissionMockId) },
          data: { articleId: articleId(link.articleMockId) },
        });
      }

      /* ============================================================ *
       * 7. ISSUES IN PREPARATION — mock-issues.ts (EditorialIssue,
       *    IssuePlanItem) and the DOI deposit log.
       *
       * The two published EditorialIssue rows (ei1, ei2) mirror mockIssues'
       * i1/i2 by volume/number/year, but are kept as separate rows per the
       * schema comment: EditorialIssue is the planning-side record.
       * ============================================================ */

      for (const ei of mockEditorialIssues) {
        await tx.editorialIssue.create({
          data: {
            id: editorialIssueId(ei.id),
            volume: ei.volume,
            number: ei.number,
            year: ei.year,
            title: ei.title,
            state: issueState(ei.state) as never,
            targetDate: new Date(ei.targetDate),
            publishedAt: ei.publishedAt ? new Date(ei.publishedAt) : null,
            plannedArticles: ei.plannedArticles,
            slug: ei.slug,
          },
        });

        for (const item of ei.items) {
          await tx.issuePlanItem.create({
            data: {
              id: planItemId(`${ei.id}:${item.submissionId}`),
              editorialIssueId: editorialIssueId(ei.id),
              submissionId: submissionId(item.submissionId),
              position: item.position,
            },
          });
        }
      }

      // Every DOI record hangs off an Article, and Articles are only seeded
      // with SEED_PUBLIC=1 — without this guard a fresh database fails here on
      // the foreign key.
      for (const d of seedPublic ? mockDoiRecords : []) {
        await tx.doiRecord.create({
          data: {
            id: doiRecordId(d.id),
            articleId: articleId(d.articleId),
            doi: d.doi,
            state: depositState(d.state) as never,
            attempts: d.attempts,
            lastAttemptAt: d.lastAttemptAt ? new Date(d.lastAttemptAt) : null,
            registeredAt: d.registeredAt ? new Date(d.registeredAt) : null,
            failureReason: d.failureReason,
          },
        });
      }

      /* ============================================================ *
       * 8. PRODUCTION — mock-production.ts (ProductionJob, stages, galleys,
       *    corrections). Assignees are display names in the mock data
       *    ("Hina Aslam", ...); resolved to seeded User rows the same way
       *    editors/reviewers are, falling back to a lazily created account.
       * ============================================================ */

      const assigneeMockIdFor = editorMockIdFor; // same name->user resolution

      for (const job of mockProductionJobs as ProductionJobT[]) {
        await tx.productionJob.create({
          data: {
            id: jobId(job.id),
            submissionId: submissionId(job.submissionId),
            issueId: job.issueId ? editorialIssueId(job.issueId) : null,
            enteredAt: new Date(job.enteredProductionAt),
          },
        });

        for (const stage of job.stages) {
          const assignedToMockId = stage.assignee ? await assigneeMockIdFor(stage.assignee) : null;
          await tx.productionStageRecord.create({
            data: {
              id: stageId(job.id, stage.stage),
              jobId: jobId(job.id),
              stage: stage.stage,
              state: stageState(stage.state) as never,
              assignedToId: assignedToMockId ? userId(assignedToMockId) : null,
              startedAt: stage.startedAt ? new Date(stage.startedAt) : null,
              sentToAuthorAt: stage.sentToAuthorAt ? new Date(stage.sentToAuthorAt) : null,
              completedAt: stage.completedAt ? new Date(stage.completedAt) : null,
              dueAt: stage.dueAt ? new Date(stage.dueAt) : null,
              notes: stage.notes ?? [],
            },
          });
        }

        for (const g of job.galleys) {
          await tx.productionGalley.create({
            data: {
              id: galleyId(g.id),
              jobId: jobId(job.id),
              format: g.format,
              version: g.version,
              isFinal: g.isFinal,
              storagePath: `mock/production/${job.id}/${g.filename}`,
              sizeBytes: BigInt(g.sizeBytes),
              createdAt: new Date(g.createdAt),
            },
          });
        }

        for (const c of job.corrections) {
          await tx.proofCorrection.create({
            data: {
              id: correctionId(c.id),
              jobId: jobId(job.id),
              // Real columns since 20260914120000. They used to be packed into
              // one string here and split back apart on read.
              location: c.location,
              description: c.description,
              raisedBy: c.raisedBy,
              applied: c.state === "applied",
              declinedReason: c.state === "rejected" ? c.resolution : null,
              reportedAt: new Date(c.raisedAt),
            },
          });
        }
      }

      /* ============================================================ *
       * 9. SITE — Post, BoardMember (mock-data.ts).
       * ============================================================ */

      for (const p of seedPublic ? mockPosts : []) {
        await tx.post.create({
          data: {
            id: postId(p.id),
            kind: p.kind,
            slug: p.slug,
            title: p.title,
            summary: p.summary,
            body: p.body,
            publishedAt: new Date(p.publishedAt),
            category: announcementCategory(p.category) as never,
            expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
            eventStartsAt: p.event?.startsAt ? new Date(p.event.startsAt) : null,
            eventEndsAt: p.event?.endsAt ? new Date(p.event.endsAt) : null,
            eventLocation: p.event?.location,
            eventOnline: p.event?.online,
            eventRegisterUrl: p.event?.registerUrl,
            eventDeadline: p.event?.deadline ? new Date(p.event.deadline) : null,
            actionLabel: p.action?.label,
            actionHref: p.action?.href,
          },
        });
      }

      // `sortOrder` carries the fixture's own order, which is the order the
      // editorial office put the board in — seniority within each category,
      // not alphabetical. Leaving every row at the column default would have
      // let Postgres return the board in whatever order it liked.
      for (const [i, b] of (seedPublic ? mockBoard : []).entries()) {
        await tx.boardMember.create({
          data: {
            id: boardId(b.id),
            name: b.name,
            role: b.role,
            institution: b.institution,
            country: b.country,
            orcid: b.orcid,
            scholarUrl: b.scholarUrl,
            photoUrl: b.photoUrl,
            category: boardCategory(b.category) as never,
            sortOrder: i,
          },
        });
      }

      /* ============================================================ *
       * 10. AUDIT LOG — deliberately left empty.
       * ============================================================ *
       *
       * `mockAuditEntries` is NOT seeded, and must not be. An audit log is
       * read precisely when someone is not trusted, and eight invented rows
       * sitting in it — "granted sectionEditor", "reopened a review round in
       * error" — describe things nobody did. There is no safe way to show
       * those next to real entries: a reader who cannot tell them apart is
       * being misled about the one record that exists to be believed.
       *
       * They were there to show the shape of the log while nothing wrote to
       * it. `recordAudit()` now runs from 36 call sites, so the shape is
       * visible from the first real action and the fixtures have no remaining
       * job. `mock-users.ts` keeps the array; nothing reads it.
       *
       * The table starts empty and fills as the journal is used. That is the
       * correct starting state for an append-only record.
       */
    },
    // Generous on both counts because this may run against a remote database.
    // `maxWait` is how long Prisma waits to *acquire* a connection and start
    // the transaction: the 2s default is fine on localhost and not fine over
    // the internet, where it fails with "Unable to start a transaction in the
    // given time" before a single statement runs. `timeout` is the budget for
    // the ~1000 inserts once it has started.
    { maxWait: 60_000, timeout: 240_000 },
  );

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
