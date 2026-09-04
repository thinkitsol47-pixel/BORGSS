import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection for the dashboard.
 * SCAFFOLD: checks for a session cookie only. Replace with real Auth.js /
 * Supabase middleware (verify JWT, attach user, optionally check roles).
 */
const SESSION_COOKIE = "borjss_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/submissions") ||
    pathname.startsWith("/reviews") ||
    pathname.startsWith("/editorial") ||
    pathname.startsWith("/production") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile");

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    // NOTE: disabled during scaffold so the dashboard is browsable.
    // return NextResponse.redirect(url);
  }
  return NextResponse.next();
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
