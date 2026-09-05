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
  // The deliberate override, for showing the client a stable URL.
  //
  // Preview deployments get a new hostname on every push, so demoing from one
  // means sending a fresh link each time. Setting BORJSS_DEMO=1 in the Vercel
  // project opens the demo on the production domain instead — and unsetting it
  // closes every demo route again with no code change and no deploy, which is
  // the property that makes it safe to leave this switch in the codebase.
  //
  // Read before the environment checks, so it can open demo mode where they
  // would close it. Any other value is off, so BORJSS_DEMO=0 reads as off.
  if (process.env.BORJSS_DEMO === "1") return true;

  // Any local run — `next dev`, and a local production build.
  if (!process.env.VERCEL) return process.env.NODE_ENV !== "production";

  // On Vercel: everything except the production domain.
  return process.env.VERCEL_ENV !== "production";
}
