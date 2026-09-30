import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection for the portal, and the one place a session token is
 * refreshed.
 *
 * **Two jobs, and the second is easy to forget.** Supabase access tokens are
 * short-lived. A Server Component can read a refreshed token but cannot write
 * the cookie back — Next forbids setting cookies during a render — so without
 * middleware the session would expire in the browser however recently the
 * visitor clicked something. `getUser()` here performs the refresh, and the
 * response carries the new cookies out.
 *
 * `getUser()`, never `getSession()`. `getSession()` reads the cookie and
 * believes it; `getUser()` verifies the token with Supabase. A cookie is
 * attacker-controlled input, and this function decides whether someone reaches
 * the editorial queue.
 *
 * **There is no exception.** A demo door used to skip this redirect outside
 * production, so the whole portal was browsable with no account at all. It was
 * deleted once real accounts existed: a guard with a bypass is a guard nobody
 * can reason about, and "it only opens in development" is a claim that has to
 * stay true across every deployment target forever.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refreshes the token as a side effect. Do not remove even where the result
  // is unused: this call is what keeps a session alive.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Carried so sign-in returns the visitor to what they were reaching for.
    // The login page only accepts in-app paths, so this cannot become an open
    // redirect.
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/submissions/:path*",
    "/reviews/:path*",
    "/editorial/:path*",
    "/production/:path*",
    "/admin/:path*",
    "/profile/:path*",
  ],
};
