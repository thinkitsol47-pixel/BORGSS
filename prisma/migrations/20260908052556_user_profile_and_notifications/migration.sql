-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "notifyEditorialMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyIssuePublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyJournalNews" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyNewInvitations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyReviewReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySubmissionStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "position" TEXT;
