-- A Postgres sequence for manuscript reference numbers.
--
-- `Submission.reference` is quoted in every piece of correspondence about a
-- manuscript, so it must never repeat. A row count would: delete one
-- submission and the next author is issued a reference someone else has
-- already put in an email. A sequence never goes backwards, even across
-- deletions, rollbacks and concurrent submissions.
--
-- Not a Prisma default on the column, because the format interleaves the year
-- ("BORJSS-2026-0042") and the counter has to restart each January while
-- staying unique within the year. `nextSubmissionReference()` in
-- `submissions/actions.ts` reads this and formats it.

CREATE SEQUENCE IF NOT EXISTS submission_reference_seq START WITH 1;

-- Existing seeded references run to BORJSS-2026-0061, so start above them.
-- Without this the first real submission would collide with a seeded row and
-- fail on the unique index.
SELECT setval(
  'submission_reference_seq',
  GREATEST(
    (SELECT COALESCE(MAX(SUBSTRING(reference FROM '[0-9]+$')::int), 0)
     FROM "Submission"),
    1
  )
);
