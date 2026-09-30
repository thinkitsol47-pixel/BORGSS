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

/**
 * The name to address someone by, from a stored full name.
 *
 * `name.split(" ")[0]` was the obvious version and it is wrong for a journal:
 * academic names carry titles, so it rendered "Dr. Muhammad Sohaib" as
 * **"Dr."** — a sentence reading "Dr. can sign in and see an empty queue".
 * Wrong for every Dr., Prof., Mr and Ms in the directory, which in this
 * database is most of them.
 *
 * Titles are skipped rather than stripped by regex, so a name that is *only* a
 * title, or an unrecognised one, still returns something usable instead of an
 * empty string. A mononym returns itself.
 */
const HONORIFICS = new Set([
  "dr",
  "dr.",
  "prof",
  "prof.",
  "professor",
  "mr",
  "mr.",
  "mrs",
  "mrs.",
  "ms",
  "ms.",
  "miss",
  "sir",
  "eng",
  "eng.",
  "engr",
  "engr.",
]);

export function givenNameOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts.find((p) => !HONORIFICS.has(p.toLowerCase()));
  // Falls back to the whole string so a name consisting only of a title never
  // renders as a blank space mid-sentence.
  return first ?? fullName.trim();
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
