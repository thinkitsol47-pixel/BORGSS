import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/auth/supabase";

/**
 * Confirms an email address. Reached by the button on `/verify-email`.
 *
 * The emailed link carries a `token_hash` minted by `generateLink` in
 * `(auth)/actions.ts` — at registration, or from "Send the link again".
 * `verifyOtp` with `type: "email"` accepts both the signup and the magic-link
 * hash, confirms the address, and writes a session cookie, so the visitor
 * arrives in the portal already signed in.
 *
 * **POST only, and the email links to a page with a button rather than here.**
 * The token is single-use, and institutional mail filters (Outlook Safe Links
 * among them) open every link in a message to scan it. Had the link spent the
 * token on GET, the scanner would confirm the address — or, worse, use up the
 * link — before the person ever clicked, and they would land on "expired".
 *
 * Separate from `/auth/callback`, which exchanges a PKCE `code` for password
 * reset. A `token_hash` needs no verifier cookie, so this works on a phone even
 * when the account was created on a laptop.
 */
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const sentFrom = request.headers.get("origin");
  if (sentFrom && sentFrom !== origin) {
    return new NextResponse(null, { status: 403 });
  }

  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");

  if (!tokenHash) {
    return NextResponse.redirect(`${origin}/verify-email?error=missing`, 303);
  }

  const { error } = await supabaseServer().auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/verify-email?error=invalid`, 303);
  }

  return NextResponse.redirect(`${origin}/dashboard`, 303);
}
