import type { Article } from "@/types";

/**
 * Client-independent search over published articles.
 *
 * This is a scaffold implementation: it scores in memory over the full set,
 * which is fine while the corpus is small. Swap the body of `searchArticles`
 * for a real index (Postgres full-text, Meilisearch, Typesense) when the
 * archive grows — the return shape is what the page depends on, not the
 * mechanism.
 */

export type SearchField = "all" | "title" | "author" | "keyword" | "abstract";

export type SearchHit = {
  article: Article;
  score: number;
  /** Where the match was found, for the "matched in" line on a result. */
  matchedIn: string[];
  /** Abstract excerpt around the first match, or the opening if none. */
  snippet: string;
};

/** Field weights: a title match matters far more than one buried in an abstract. */
const WEIGHTS = {
  title: 10,
  keyword: 6,
  author: 5,
  abstract: 2,
  doi: 8,
} as const;

function normalise(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/** Splits a query into terms, honouring "quoted phrases". */
export function parseQuery(raw: string): string[] {
  const terms: string[] = [];
  const re = /"([^"]+)"|(\S+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(raw)) !== null) {
    const term = (m[1] ?? m[2] ?? "").trim();
    if (term.length > 1) terms.push(normalise(term));
  }
  return terms;
}

function countOccurrences(haystack: string, needle: string) {
  if (!needle) return 0;
  let count = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    count++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return count;
}

/** Extracts ~30 words of abstract centred on the first matching term. */
function buildSnippet(abstract: string, terms: string[]): string {
  const lower = normalise(abstract);
  const at = terms
    .map((t) => lower.indexOf(t))
    .filter((i) => i !== -1)
    .sort((a, b) => a - b)[0];

  if (at === undefined) {
    return abstract.length > 220 ? `${abstract.slice(0, 220).trimEnd()}…` : abstract;
  }

  const start = Math.max(0, abstract.lastIndexOf(" ", Math.max(0, at - 110)) + 1);
  const end = Math.min(
    abstract.length,
    abstract.indexOf(" ", Math.min(abstract.length, at + 130)),
  );
  const slice = abstract.slice(start, end === -1 ? abstract.length : end).trim();

  return `${start > 0 ? "…" : ""}${slice}${
    end !== -1 && end < abstract.length ? "…" : ""
  }`;
}

export function searchArticles(
  articles: Article[],
  rawQuery: string,
  field: SearchField = "all",
): SearchHit[] {
  const terms = parseQuery(rawQuery);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];

  for (const article of articles) {
    const fields = {
      title: normalise(article.title + " " + (article.subtitle ?? "")),
      keyword: normalise(article.keywords.join(" ")),
      author: normalise(
        article.contributors
          .map((c) => `${c.givenName} ${c.familyName} ${c.affiliations.map((a) => a.name).join(" ")}`)
          .join(" "),
      ),
      abstract: normalise(article.abstract),
      doi: normalise(article.doi ?? ""),
    };

    let score = 0;
    const matchedIn = new Set<string>();
    // Every term must appear somewhere — AND semantics, which is what users
    // expect from a scholarly search box.
    let allTermsFound = true;

    for (const term of terms) {
      let termScore = 0;

      for (const [name, weight] of Object.entries(WEIGHTS) as [
        keyof typeof WEIGHTS,
        number,
      ][]) {
        // A field-scoped search ignores the other fields entirely.
        if (field !== "all" && field !== name) continue;

        const n = countOccurrences(fields[name], term);
        if (n > 0) {
          termScore += weight * n;
          matchedIn.add(name);
        }
      }

      if (termScore === 0) {
        allTermsFound = false;
        break;
      }
      score += termScore;
    }

    if (!allTermsFound) continue;

    // Nudge whole-phrase title matches to the top.
    if (fields.title.includes(normalise(rawQuery.trim()))) score += 25;

    hits.push({
      article,
      score,
      matchedIn: [...matchedIn],
      snippet: buildSnippet(article.abstract, terms),
    });
  }

  return hits.sort(
    (a, b) =>
      b.score - a.score ||
      +new Date(b.article.publishedAt) - +new Date(a.article.publishedAt),
  );
}

/**
 * Splits text into matched / unmatched runs so the caller can wrap matches in
 * <mark> without ever injecting HTML.
 */
export function highlightParts(
  text: string,
  terms: string[],
): { text: string; match: boolean }[] {
  if (terms.length === 0) return [{ text, match: false }];

  const lower = normalise(text);
  const ranges: [number, number][] = [];

  for (const term of terms) {
    let i = lower.indexOf(term);
    while (i !== -1) {
      ranges.push([i, i + term.length]);
      i = lower.indexOf(term, i + term.length);
    }
  }
  if (ranges.length === 0) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);

  // Merge overlaps so nested terms don't produce split marks.
  const merged: [number, number][] = [ranges[0]];
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });

  return parts;
}
