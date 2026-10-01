import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/auth/supabase";

/**
 * Ends the session.
 *
 * `signOut()` revokes the Supabase session and clears its cookies; there is
 * nothing else to clear, since the Supabase session is the only identity the
 * app has.
 *
 * **POST only — a GET must never sign anyone out.** This used to be a GET behind
 * a `<Link>`, and in production Next prefetches every link that scrolls into
 * view: opening the account menu revealed "Sign out", the prefetch fired, and
 * the session was gone before anything was clicked — the next click landed on
 * /login. The topbar now posts a plain form, which still works without
 * JavaScript. The origin check stops another site's form from signing a
 * visitor out.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return new NextResponse(null, { status: 403 });
  }

  await supabaseServer().auth.signOut();
  // 303 so the browser follows with a GET, not a re-POST.
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin), 303);
}
