-- Proof corrections: give `location` and `raisedBy` real columns.
--
-- Until now a correction stored its location inside the description string,
-- written by the seed as `format('%s: %s', location, description)` and split
-- back apart on read by `toCorrection()` in src/lib/api/production.ts. That was
-- tolerable while the screen was read-only. It is not tolerable now that
-- corrections are written from the portal: a form would have to re-encode the
-- delimiter, and any description containing ": " would round-trip wrong.
--
-- `raisedBy` was not stored at all -- `toCorrection()` hard-coded "author",
-- which is the common case and was wrong for every correction the proofreader
-- or copyeditor raised.
--
-- RLS: ProofCorrection is created in 20260907044807_init, so the loop in
-- 20260908120000_enable_rls already enabled RLS on it. Adding columns does not
-- change that, and no new ENABLE is needed here. (A new *table* would need
-- one -- see that migration's own note.)

CREATE TYPE "CorrectionRaisedBy" AS ENUM ('author', 'proofreader', 'copyeditor');

ALTER TABLE "ProofCorrection"
  ADD COLUMN "location" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "raisedBy" "CorrectionRaisedBy" NOT NULL DEFAULT 'author';

-- Backfill: split each existing description on its FIRST ": " only.
--
-- The first, deliberately: a location may itself contain a comma
-- ("References, Beck & Demirguc-Kunt") and a description may contain a colon,
-- so splitting on the last -- or on every -- separator would cut the wrong
-- string. Rows with no separator keep the whole text as the description and an
-- empty location, which is what the screen already renders for a missing one.
UPDATE "ProofCorrection"
SET
  "location" = split_part("description", ': ', 1),
  "description" = substring("description" FROM position(': ' IN "description") + 2)
WHERE position(': ' IN "description") > 0;

-- The defaults existed only to backfill; a new row must say what it means.
ALTER TABLE "ProofCorrection"
  ALTER COLUMN "location" DROP DEFAULT,
  ALTER COLUMN "raisedBy" DROP DEFAULT;
