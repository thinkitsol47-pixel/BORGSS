import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/auth/supabase";

/**
 * Where the emailed password-reset link lands. (Address verification uses
 * `/auth/confirm` instead — a `token_hash`, not a `code`.)
 *
 * Supabase does not put a usable token in the link. It sends a one-time `code`
 * that has to be exchanged for a session, and the exchange has to happen on the
 * server because it writes the session cookies. So the link cannot point
 * straight at `/reset-password`: that page would receive a code it cannot spend
 * and the visitor would type a new password against no session at all.
 *
 * After the exchange the browser holds a recovery session, which is what
 * `resetPassword` in `(auth)/actions.ts` acts on.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Only in-app paths, for the same reason `safeNext` exists in actions.ts:
  // this value arrives in a URL, and an emailed link is exactly where an open
  // redirect would be exploited.
  const raw = searchParams.get("next") ?? "/reset-password";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/reset-password";

  if (!code) {
    return NextResponse.redirect(`${origin}/reset-password?error=missing`);
  }

  const { error } = await supabaseServer().auth.exchangeCodeForSession(code);

  if (error) {
    // Expired, already spent, or issued for a different browser. The
    // reset-password page renders its own screen for this rather than showing
    // a form that cannot succeed.
    return NextResponse.redirect(`${origin}/reset-password?error=invalid`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
