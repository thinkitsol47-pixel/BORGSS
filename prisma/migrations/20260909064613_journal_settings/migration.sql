-- CreateTable
CREATE TABLE "JournalSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" UUID,

    CONSTRAINT "JournalSetting_pkey" PRIMARY KEY ("key")
);

-- Row Level Security, the same as every other table.
--
-- A new table defaults to RLS off, so the loop in `20260908120000_enable_rls`
-- does not cover it — that migration ran before this table existed. Without
-- this line the anon key could read the journal's settings through Supabase's
-- REST API, and the dashboard would flag it UNRESTRICTED.
ALTER TABLE "JournalSetting" ENABLE ROW LEVEL SECURITY;
