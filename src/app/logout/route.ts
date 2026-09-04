import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE } from "@/lib/auth/current-user";

/**
 * Ends a demo sign-in.
 *
 * There is no session to destroy — only the development cookie a demo sign-in
 * set. Clearing it and returning to the sign-in page is the whole of it, and
 * the control in the topbar is no longer a link that pretends.
 *
 * When real auth lands this becomes the actual sign-out: destroy the session
 * server-side, clear its cookie, then redirect.
 */
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  res.cookies.delete(ROLE_COOKIE);
  return res;
}
