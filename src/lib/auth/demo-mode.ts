/**
 * Whether the demo sign-ins are available.
 *
 * They exist so the portal can be walked before there is an auth provider:
 * any password, and the email address picks the role. That is exactly the hole
 * an editorial platform must not ship with — so it is open in development and
 * on Vercel **preview** deployments, and closed on the production domain.
 *
 * `VERCEL_ENV` is set by Vercel on every build and request: "production" only
 * for the production domain, "preview" for branch and pull-request URLs. So a
 * preview link can be sent to the client and it will show every screen, while
 * the real domain refuses the same credentials — without a secret that has to
 * be shared, kept, and eventually leaked.
 *
 * Read through this one function rather than repeating the condition, so the
 * login form, the sign-in action and the role lookup cannot disagree about
 * whether demo mode is on.
 */
export function isDemoMode(): boolean {
  // Any local run — `next dev`, and a local production build.
  if (!process.env.VERCEL) return process.env.NODE_ENV !== "production";

  // On Vercel: everything except the production domain.
  return process.env.VERCEL_ENV !== "production";
}
