-- CreateEnum
CREATE TYPE "ContactTopic" AS ENUM ('submission', 'review', 'editorial', 'technical', 'charges', 'permissions', 'other');

-- CreateEnum
CREATE TYPE "ReviewerApplicationDegree" AS ENUM ('phd', 'doctoral-candidate', 'masters', 'other');

-- CreateEnum
CREATE TYPE "ReviewerApplicationStatus" AS ENUM ('pending', 'accepted', 'declined');

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "affiliation" TEXT,
    "topic" "ContactTopic" NOT NULL,
    "manuscriptId" TEXT,
    "message" TEXT NOT NULL,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerApplication" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "degree" "ReviewerApplicationDegree" NOT NULL,
    "orcid" TEXT,
    "scholarUrl" TEXT,
    "subjects" TEXT[],
    "methods" TEXT[],
    "keywords" TEXT NOT NULL,
    "experience" TEXT,
    "capacity" TEXT NOT NULL,
    "status" "ReviewerApplicationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_handledAt_idx" ON "ContactMessage"("handledAt");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ReviewerApplication_status_idx" ON "ReviewerApplication"("status");

-- CreateIndex
CREATE INDEX "ReviewerApplication_createdAt_idx" ON "ReviewerApplication"("createdAt");
