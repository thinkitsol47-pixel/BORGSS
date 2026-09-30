-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "aiDisclosure" TEXT,
ADD COLUMN     "conflictOfInterest" TEXT,
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "dataAvailability" TEXT,
ADD COLUMN     "declaredAt" TIMESTAMP(3),
ADD COLUMN     "funding" TEXT;
