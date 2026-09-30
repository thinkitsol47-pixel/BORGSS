-- Enable Row Level Security on every table in the public schema, with no
-- policies attached.
--
-- Why: Supabase hands the browser a publishable (anon) key. With RLS off, that
-- key can read every row in this database through the auto-generated REST API
-- -- manuscripts under double-blind review, reviewer reports, contact messages.
-- The dashboard flags each such table as UNRESTRICTED.
--
-- Why no policies: this app never reads through the anon key. Every query goes
-- through Prisma over the Postgres connection string, which authenticates as
-- the table owner and is therefore exempt from RLS. So "RLS on, zero policies"
-- closes the anon door completely while changing nothing about how the app
-- reads. If a screen is ever built to query Supabase directly from the browser,
-- that is the point at which a policy gets written -- deliberately, for that
-- one table.
--
-- The loop covers tables that exist now and is re-runnable; a table added by a
-- later migration needs its own ENABLE, so keep this pattern in mind when the
-- schema grows.

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END
$$;
