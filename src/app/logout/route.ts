import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/auth/supabase";

/**
 * Ends the session.
 *
 * `signOut()` revokes the Supabase session and clears its cookies; there is
 * nothing else to clear, since the Supabase session is the only identity the
 * app has. A GET route rather than a Server Action, so the topbar's control can
 * stay a link and work without JavaScript.
 */
export async function GET(request: NextRequest) {
  await supabaseServer().auth.signOut();
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
}
