-- A published article's byline gets its own tables.
--
-- Until now nothing in the schema connected an Article to its authors.
-- `Contributor` hangs off `Submission`, and `Submission.articleId` exists, so
-- in principle an article could reach a byline through the submission it came
-- from. In practice it cannot: only one of the seven seeded articles has a
-- submission behind it, so the public site would have rendered six of seven
-- articles with no author names -- and an article page without a byline cannot
-- form a citation.
--
-- Borrowing `Contributor` would also have been wrong even where a submission
-- existed. A submission stays editable after publication -- a spelling, an
-- affiliation, a withdrawn co-author -- and none of those corrections should
-- silently rewrite a citation already sitting in other people's
-- bibliographies. The published record is frozen at publication, so it carries
-- its own rows.
--
-- Affiliations are NOT duplicated: both join tables point at the same
-- `Affiliation` registry, which is what keeps an institution one row and makes
-- affiliation-based conflict checking possible at all.
--
-- RLS: both tables are NEW, so the loop in 20260908120000_enable_rls did not
-- cover them and they would default to RLS *off* -- readable by the anon key
-- through Supabase's auto-generated REST API, and flagged UNRESTRICTED on the
-- dashboard. The two ENABLE statements at the bottom are not optional. This
-- takes the protected count from 32 tables to 34.

CREATE TABLE "ArticleContributor" (
    "id" UUID NOT NULL,
    "articleId" UUID NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "orcid" TEXT,
    "email" TEXT,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ArticleContributor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArticleContributorAffiliation" (
    "articleContributorId" UUID NOT NULL,
    "affiliationId" UUID NOT NULL,

    CONSTRAINT "ArticleContributorAffiliation_pkey" PRIMARY KEY ("articleContributorId","affiliationId")
);

CREATE INDEX "ArticleContributor_articleId_idx" ON "ArticleContributor"("articleId");

ALTER TABLE "ArticleContributor"
    ADD CONSTRAINT "ArticleContributor_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArticleContributorAffiliation"
    ADD CONSTRAINT "ArticleContributorAffiliation_articleContributorId_fkey"
    FOREIGN KEY ("articleContributorId") REFERENCES "ArticleContributor"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArticleContributorAffiliation"
    ADD CONSTRAINT "ArticleContributorAffiliation_affiliationId_fkey"
    FOREIGN KEY ("affiliationId") REFERENCES "Affiliation"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Every new table needs this in its own migration. See the note above.
ALTER TABLE "ArticleContributor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArticleContributorAffiliation" ENABLE ROW LEVEL SECURITY;
