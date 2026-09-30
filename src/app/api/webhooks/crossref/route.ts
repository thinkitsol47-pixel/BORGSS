import { NextResponse } from "next/server";

/**
 * Crossref deposit callback (stub). Will record deposit success/failure once
 * the journal has a prefix. Until then it is unauthenticated and does nothing,
 * so it says so rather than logging whatever anyone posts to it.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Crossref deposits are not set up yet" },
    { status: 501 },
  );
}
