import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

/**
 * Crawl rules.
 *
 * The portal is not one path. `(dashboard)` is a route group, so it contributes
 * nothing to the URL — the 43 portal screens live at seven different top-level
 * paths, and an earlier version of this file disallowed only `/dashboard`,
 * leaving the other 42 crawlable.
 *
 * That matters more here than on most sites: these routes are currently
 * reachable without signing in, because there is no auth and no middleware. A
 * crawler could index an editorial queue listing author names alongside
 * manuscripts under review. Disallowing them is not a substitute for the auth
 * that has to come — it is the part that can be done today.
 *
 * The auth routes are excluded too. A sign-in form has no reason to be in a
 * search index, and `/verify-email?token=` and `/reset-password?token=` carry
 * single-use credentials in the query string.
 */

/** Every top-level path the portal occupies. Keep in step with `(dashboard)`. */
const PORTAL_PATHS = [
  "/dashboard",
  "/submissions",
  "/reviews",
  "/editorial",
  "/production",
  "/admin",
  "/profile",
];

/** Auth screens: nothing to index, and two of them carry tokens. */
const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PORTAL_PATHS, ...AUTH_PATHS, "/api"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
