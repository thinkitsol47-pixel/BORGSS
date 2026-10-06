-- Publishing an issue through the app (2026-10-06), before the journal has a
-- Crossref prefix. Articles are published with `doi` null; a DOI is added
-- later, when there is a prefix to mint it under.
--
-- `issuePosition`: every article in an issue is published at the same moment,
-- so `publishedAt` cannot order the table of contents. The running order the
-- editor set on the issue is copied here.
--
-- `storagePath`: a published galley is served from the confidential upload
-- the production team marked final, through `/files/article:<id>`, rather
-- than from a second, permanently public copy. No new table, so RLS is
-- unaffected.
ALTER TABLE "Article" ADD COLUMN "issuePosition" INTEGER;
ALTER TABLE "ArticleGalley" ADD COLUMN "storagePath" TEXT;
