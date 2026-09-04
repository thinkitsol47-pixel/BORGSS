import { NextResponse } from "next/server";

/** Crossref deposit callback (stub). Records deposit success/failure. */
export async function POST(request: Request) {
  const body = await request.text();
  console.log("[crossref webhook]", body.slice(0, 500));
  return NextResponse.json({ ok: true });
}
