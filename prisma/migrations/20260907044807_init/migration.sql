-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superAdmin', 'admin', 'journalManager', 'editorInChief', 'managingEditor', 'sectionEditor', 'editorialBoard', 'reviewer', 'author', 'copyeditor', 'layoutEditor', 'proofreader');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'invited', 'suspended');

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('research', 'review', 'case-study', 'editorial', 'conceptual', 'book-review');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted', 'desk-review', 'under-review', 'awaiting-decision', 'revision-requested', 'revision-submitted', 'accepted', 'in-production', 'published', 'desk-rejected', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('accept', 'minor-revision', 'major-revision', 'reject', 'desk-reject');

-- CreateEnum
CREATE TYPE "SubmissionFileKind" AS ENUM ('manuscript', 'title-page', 'cover-letter', 'figure', 'table', 'supplementary', 'response-to-reviewers');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('invited', 'accepted', 'declined', 'completed');

-- CreateEnum
CREATE TYPE "ReviewRecommendation" AS ENUM ('accept', 'minor-revision', 'major-revision', 'reject');

-- CreateEnum
CREATE TYPE "ReviewerAvailability" AS ENUM ('available', 'unavailable', 'overloaded');

-- CreateEnum
CREATE TYPE "IssueState" AS ENUM ('planned', 'in-production', 'published');

-- CreateEnum
CREATE TYPE "ProductionStage" AS ENUM ('copyedit', 'galleys', 'proofread');

-- CreateEnum
CREATE TYPE "StageState" AS ENUM ('not-started', 'in-progress', 'with-author', 'done');

-- CreateEnum
CREATE TYPE "GalleyFormat" AS ENUM ('pdf', 'xml', 'html', 'epub');

-- CreateEnum
CREATE TYPE "DepositState" AS ENUM ('registered', 'pending', 'failed', 'not-deposited');

-- CreateEnum
CREATE TYPE "PostKind" AS ENUM ('announcement', 'news', 'event');

-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('call-for-papers', 'policy-update', 'issue-release', 'general');

-- CreateEnum
CREATE TYPE "BoardCategory" AS ENUM ('editor-in-chief', 'managing-editor', 'associate-editor', 'section-editor', 'advisory-board', 'editorial-board');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "affiliation" TEXT,
    "country" TEXT,
    "orcid" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'invited',
    "suspendedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","role")
);

-- CreateTable
CREATE TABLE "ReviewerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "expertise" TEXT[],
    "sections" TEXT[],
    "availability" "ReviewerAvailability" NOT NULL DEFAULT 'available',
    "unavailableUntil" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "ReviewerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewForm" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT[],
    "type" "ArticleType" NOT NULL,
    "sectionId" UUID NOT NULL,
    "submittedById" UUID NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'draft',
    "round" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revisionDueAt" TIMESTAMP(3),
    "articleId" UUID,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "orcid" TEXT,
    "email" TEXT,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "ror" TEXT,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributorAffiliation" (
    "contributorId" UUID NOT NULL,
    "affiliationId" UUID NOT NULL,

    CONSTRAINT "ContributorAffiliation_pkey" PRIMARY KEY ("contributorId","affiliationId")
);

-- CreateTable
CREATE TABLE "SubmissionFile" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "kind" "SubmissionFileKind" NOT NULL,
    "filename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionDecision" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "type" "DecisionType" NOT NULL,
    "round" INTEGER NOT NULL,
    "decidedById" UUID NOT NULL,
    "letter" TEXT[],
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionMessage" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "fromId" UUID NOT NULL,
    "fromRole" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAssignment" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'invited',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "invitationNote" TEXT,

    CONSTRAINT "ReviewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerReport" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "reviewFormId" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "scores" JSONB NOT NULL,
    "recommendation" "ReviewRecommendation" NOT NULL,
    "commentsToAuthor" TEXT[],
    "commentsToEditor" TEXT[],
    "concernsRaised" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewerReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionJob" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "issueId" UUID,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStageRecord" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "stage" "ProductionStage" NOT NULL,
    "state" "StageState" NOT NULL DEFAULT 'not-started',
    "assignedToId" UUID,
    "startedAt" TIMESTAMP(3),
    "sentToAuthorAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "notes" TEXT[],

    CONSTRAINT "ProductionStageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionGalley" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "format" "GalleyFormat" NOT NULL,
    "version" INTEGER NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "storagePath" TEXT NOT NULL,
    "sizeBytes" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionGalley_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofCorrection" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "declinedReason" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "doi" TEXT,
    "type" "ArticleType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT[],
    "issueId" UUID,
    "volume" INTEGER NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "pages" TEXT,
    "receivedAt" TIMESTAMP(3),
    "revisedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "license" TEXT NOT NULL DEFAULT 'CC BY 4.0',
    "funding" TEXT,
    "conflictOfInterest" TEXT,
    "ethicsStatement" TEXT,
    "dataAvailability" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "citations" INTEGER,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleGalley" (
    "id" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT,

    CONSTRAINT "ArticleGalley_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "raw" TEXT NOT NULL,
    "doi" TEXT,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT,
    "coverUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialIssue" (
    "id" UUID NOT NULL,
    "volume" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT,
    "state" "IssueState" NOT NULL DEFAULT 'planned',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "plannedArticles" INTEGER,
    "slug" TEXT,

    CONSTRAINT "EditorialIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuePlanItem" (
    "id" UUID NOT NULL,
    "editorialIssueId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "IssuePlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoiRecord" (
    "id" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "doi" TEXT NOT NULL,
    "state" "DepositState" NOT NULL DEFAULT 'not-deposited',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "DoiRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "kind" "PostKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "category" "AnnouncementCategory",
    "expiresAt" TIMESTAMP(3),
    "eventStartsAt" TIMESTAMP(3),
    "eventEndsAt" TIMESTAMP(3),
    "eventLocation" TEXT,
    "eventOnline" BOOLEAN,
    "eventRegisterUrl" TEXT,
    "eventDeadline" TIMESTAMP(3),
    "actionLabel" TEXT,
    "actionHref" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardMember" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "orcid" TEXT,
    "scholarUrl" TEXT,
    "photoUrl" TEXT,
    "category" "BoardCategory" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "detail" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "UserRole_role_idx" ON "UserRole"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerProfile_userId_key" ON "ReviewerProfile"("userId");

-- CreateIndex
CREATE INDEX "ReviewerProfile_availability_idx" ON "ReviewerProfile"("availability");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_key" ON "Section"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_slug_key" ON "Section"("slug");

-- CreateIndex
CREATE INDEX "Section_active_idx" ON "Section"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewForm_version_key" ON "ReviewForm"("version");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_reference_key" ON "Submission"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_articleId_key" ON "Submission"("articleId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_sectionId_idx" ON "Submission"("sectionId");

-- CreateIndex
CREATE INDEX "Submission_submittedById_idx" ON "Submission"("submittedById");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- CreateIndex
CREATE INDEX "Contributor_submissionId_idx" ON "Contributor"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliation_name_key" ON "Affiliation"("name");

-- CreateIndex
CREATE INDEX "SubmissionFile_submissionId_idx" ON "SubmissionFile"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionDecision_submissionId_idx" ON "SubmissionDecision"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionMessage_submissionId_idx" ON "SubmissionMessage"("submissionId");

-- CreateIndex
CREATE INDEX "ReviewAssignment_submissionId_idx" ON "ReviewAssignment"("submissionId");

-- CreateIndex
CREATE INDEX "ReviewAssignment_reviewerId_idx" ON "ReviewAssignment"("reviewerId");

-- CreateIndex
CREATE INDEX "ReviewAssignment_status_idx" ON "ReviewAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerReport_assignmentId_key" ON "ReviewerReport"("assignmentId");

-- CreateIndex
CREATE INDEX "ReviewerReport_submissionId_idx" ON "ReviewerReport"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionJob_submissionId_key" ON "ProductionJob"("submissionId");

-- CreateIndex
CREATE INDEX "ProductionJob_issueId_idx" ON "ProductionJob"("issueId");

-- CreateIndex
CREATE INDEX "ProductionStageRecord_state_idx" ON "ProductionStageRecord"("state");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStageRecord_jobId_stage_key" ON "ProductionStageRecord"("jobId", "stage");

-- CreateIndex
CREATE INDEX "ProductionGalley_jobId_idx" ON "ProductionGalley"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionGalley_jobId_format_version_key" ON "ProductionGalley"("jobId", "format", "version");

-- CreateIndex
CREATE INDEX "ProofCorrection_jobId_idx" ON "ProofCorrection"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_doi_key" ON "Article"("doi");

-- CreateIndex
CREATE INDEX "Article_issueId_idx" ON "Article"("issueId");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "ArticleGalley_articleId_idx" ON "ArticleGalley"("articleId");

-- CreateIndex
CREATE INDEX "Reference_articleId_idx" ON "Reference"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_slug_key" ON "Issue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_volume_number_key" ON "Issue"("volume", "number");

-- CreateIndex
CREATE INDEX "EditorialIssue_state_idx" ON "EditorialIssue"("state");

-- CreateIndex
CREATE UNIQUE INDEX "EditorialIssue_volume_number_key" ON "EditorialIssue"("volume", "number");

-- CreateIndex
CREATE UNIQUE INDEX "IssuePlanItem_submissionId_key" ON "IssuePlanItem"("submissionId");

-- CreateIndex
CREATE INDEX "IssuePlanItem_editorialIssueId_idx" ON "IssuePlanItem"("editorialIssueId");

-- CreateIndex
CREATE UNIQUE INDEX "DoiRecord_articleId_key" ON "DoiRecord"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "DoiRecord_doi_key" ON "DoiRecord"("doi");

-- CreateIndex
CREATE INDEX "DoiRecord_state_idx" ON "DoiRecord"("state");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_kind_slug_key" ON "Post"("kind", "slug");

-- CreateIndex
CREATE INDEX "BoardMember_category_idx" ON "BoardMember"("category");

-- CreateIndex
CREATE INDEX "AuditEntry_actorId_idx" ON "AuditEntry"("actorId");

-- CreateIndex
CREATE INDEX "AuditEntry_occurredAt_idx" ON "AuditEntry"("occurredAt");

-- CreateIndex
CREATE INDEX "AuditEntry_targetType_targetId_idx" ON "AuditEntry"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerProfile" ADD CONSTRAINT "ReviewerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorAffiliation" ADD CONSTRAINT "ContributorAffiliation_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorAffiliation" ADD CONSTRAINT "ContributorAffiliation_affiliationId_fkey" FOREIGN KEY ("affiliationId") REFERENCES "Affiliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFile" ADD CONSTRAINT "SubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionDecision" ADD CONSTRAINT "SubmissionDecision_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionDecision" ADD CONSTRAINT "SubmissionDecision_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMessage" ADD CONSTRAINT "SubmissionMessage_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMessage" ADD CONSTRAINT "SubmissionMessage_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerReport" ADD CONSTRAINT "ReviewerReport_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ReviewAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerReport" ADD CONSTRAINT "ReviewerReport_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerReport" ADD CONSTRAINT "ReviewerReport_reviewFormId_fkey" FOREIGN KEY ("reviewFormId") REFERENCES "ReviewForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionJob" ADD CONSTRAINT "ProductionJob_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionJob" ADD CONSTRAINT "ProductionJob_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "EditorialIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStageRecord" ADD CONSTRAINT "ProductionStageRecord_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ProductionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStageRecord" ADD CONSTRAINT "ProductionStageRecord_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionGalley" ADD CONSTRAINT "ProductionGalley_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ProductionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofCorrection" ADD CONSTRAINT "ProofCorrection_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ProductionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleGalley" ADD CONSTRAINT "ArticleGalley_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuePlanItem" ADD CONSTRAINT "IssuePlanItem_editorialIssueId_fkey" FOREIGN KEY ("editorialIssueId") REFERENCES "EditorialIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuePlanItem" ADD CONSTRAINT "IssuePlanItem_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoiRecord" ADD CONSTRAINT "DoiRecord_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
