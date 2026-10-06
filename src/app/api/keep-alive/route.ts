import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Keeps the Supabase project from being paused.
 *
 * **Why this exists.** A free-tier Supabase project is paused after about a
 * week with no activity, and the journal's first database was lost that way
 * (2026-09-30). A low-traffic journal can easily go a week without a visitor
 * reaching a page that queries the database, so the pause is not hypothetical.
 *
 * Vercel Cron calls this once a day (`vercel.json` → `crons`). It runs one
 * trivial query through the same pooled connection the app uses, which is
 * the activity Supabase counts.
 *
 * **Guarded by `CRON_SECRET`.** Vercel sends `Authorization: Bearer
 * <CRON_SECRET>` on every cron call when that variable is set; anything else
 * is refused, so the route cannot be used to hammer the database. If the
 * variable is missing the route refuses everything — set it in Vercel →
 * Settings → Environment Variables, or the cron does nothing.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    // A real table, not only `SELECT 1`, so the visit is unmistakably project
    // activity rather than a connection that touched nothing.
    const sections = await db.section.count();
    return NextResponse.json({ ok: true, at: new Date().toISOString(), sections });
  } catch (e) {
    // Reported, not thrown: a failure here shows in Vercel's cron log as a
    // 500, which is exactly where someone checking on it will look.
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "query failed" },
      { status: 500 },
    );
  }
}
