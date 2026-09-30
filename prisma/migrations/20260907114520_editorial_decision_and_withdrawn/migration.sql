-- AlterEnum
ALTER TYPE "AssignmentStatus" ADD VALUE 'withdrawn';

-- AlterTable
ALTER TABLE "SubmissionDecision" ADD COLUMN     "internalNote" TEXT;
