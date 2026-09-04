import { NextResponse } from "next/server";

/** ORCID webhook / OAuth callback handling (stub). */
export async function POST(request: Request) {
  return NextResponse.json({ ok: true });
}
