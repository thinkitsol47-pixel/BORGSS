export { cn } from "./cn";

/** Format an ISO date as e.g. "12 March 2026". */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Build a canonical absolute URL from a path. */
export function absoluteUrl(path: string): string {
  // `||`, not `??`: an environment variable set to an empty string is unset in
  // every way that matters here, and treating it as a base URL produces
  // sitemap entries like "/articles/foo" with no origin.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
