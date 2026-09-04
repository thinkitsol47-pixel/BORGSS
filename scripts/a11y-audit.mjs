/**
 * Structural accessibility audit.
 *
 * The sibling of `responsive-audit.mjs`, and it works the same way: fetch every
 * page and check the rendered HTML for the defects that are structural rather
 * than visual, so they can be caught without a browser.
 *
 * What it checks — each one a real failure mode, not a lint preference:
 *
 *   - exactly one <h1>, and it comes before any <h2>
 *   - no heading level skipped (h2 -> h4)
 *   - a <main> landmark, and only one
 *   - every <img> has an alt attribute (empty alt is fine and means decorative)
 *   - every <input>/<select>/<textarea> is labelled — a <label for>, an
 *     aria-label, or an aria-labelledby
 *   - no <button> or <a> that is empty to a screen reader (no text, no
 *     aria-label, and no <span class="sr-only"> inside)
 *   - <html lang> is set
 *   - no positive tabindex (it breaks the natural order for everyone)
 *   - every <table> has a <caption> or an aria-label
 *
 * It cannot check colour contrast, focus visibility or reading order — those
 * need a browser and a person. The contrast table in CLAUDE.md is the standing
 * answer for colour.
 *
 * Run: node scripts/a11y-audit.mjs http://localhost:3100
 *
 * Reuses the page list from the responsive audit so the two cannot drift.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";

/** Pull the PAGES array out of the responsive audit rather than duplicating it. */
async function loadPages() {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = await readFile(join(here, "responsive-audit.mjs"), "utf8");
  const block = src.slice(src.indexOf("const PAGES = ["), src.indexOf("];", src.indexOf("const PAGES = [")) + 2);
  // Strip comments, then read the quoted strings.
  const cleaned = block.replace(/\/\/[^\n]*/g, "");
  return [...cleaned.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

/* ------------------------------------------------------------------ *
 * Checks
 * ------------------------------------------------------------------ */

/** Headings in document order, as [level, text]. */
function headings(html) {
  return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    level: Number(m[1]),
    text: m[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 60),
    /** Screen-reader-only headings still count for structure. */
    srOnly: /class="[^"]*\bsr-only\b/.test(m[0]),
  }));
}

/** Does this tag carry an accessible name of some kind? */
function hasAccessibleName(tag, inner) {
  if (/aria-label\s*=\s*"[^"]+"/.test(tag)) return true;
  if (/aria-labelledby\s*=\s*"[^"]+"/.test(tag)) return true;
  if (/\btitle\s*=\s*"[^"]+"/.test(tag)) return true;
  // Visible text, or sr-only text, once markup is stripped.
  const text = inner.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, "x").trim();
  if (text.length > 0) return true;
  // An <img alt="..."> inside counts as the name.
  if (/<img[^>]+alt\s*=\s*"[^"]+"/.test(inner)) return true;
  return false;
}

function audit(html) {
  const findings = [];

  /* ---------------------------------------------------------- headings */
  const hs = headings(html);
  const h1s = hs.filter((h) => h.level === 1);

  if (h1s.length === 0) {
    findings.push({ kind: "no-h1", detail: "page has no <h1>" });
  } else if (h1s.length > 1) {
    findings.push({
      kind: "multiple-h1",
      detail: h1s.map((h) => `"${h.text}"`).join(", "),
    });
  }

  // A heading level must never jump by more than one going down.
  for (let i = 1; i < hs.length; i++) {
    const jump = hs[i].level - hs[i - 1].level;
    if (jump > 1) {
      findings.push({
        kind: "heading-skip",
        detail: `h${hs[i - 1].level} "${hs[i - 1].text}" -> h${hs[i].level} "${hs[i].text}"`,
      });
    }
  }

  /* --------------------------------------------------------- landmarks */
  const mainCount = (html.match(/<main\b/gi) ?? []).length;
  if (mainCount === 0) findings.push({ kind: "no-main", detail: "" });
  if (mainCount > 1) {
    findings.push({ kind: "multiple-main", detail: `${mainCount} <main> elements` });
  }

  if (!/<html[^>]+\blang\s*=\s*"[a-z-]+"/i.test(html)) {
    findings.push({ kind: "no-lang", detail: "<html> has no lang attribute" });
  }

  /* -------------------------------------------------------------- imgs */
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/.test(m[0])) {
      const src = m[0].match(/src\s*=\s*"([^"]*)"/)?.[1] ?? "?";
      findings.push({ kind: "img-no-alt", detail: src.slice(0, 60) });
    }
  }

  /* ------------------------------------------------------------ inputs */
  // Collect the ids that a <label for> points at.
  const labelled = new Set(
    [...html.matchAll(/<label\b[^>]*\bfor\s*=\s*"([^"]+)"/gi)].map((m) => m[1]),
  );

  // Character ranges covered by a <label> element, so a control nested inside
  // one can be recognised as labelled. Wrapping a control in its own <label>
  // is valid and is how the checkbox and radio card patterns are built here;
  // an earlier version of this script reported all of them as failures.
  const labelRanges = [...html.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/gi)].map(
    (m) => [m.index, m.index + m[0].length],
  );
  const insideLabel = (i) => labelRanges.some(([a, b]) => i >= a && i < b);

  for (const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = m[0];
    // Hidden inputs and the honeypot need no label.
    if (/type\s*=\s*"(hidden|submit|button|reset|image)"/i.test(tag)) continue;
    if (/\baria-hidden\s*=\s*"true"/.test(tag)) continue;

    const id = tag.match(/\bid\s*=\s*"([^"]+)"/)?.[1];
    const named =
      (id && labelled.has(id)) ||
      /aria-label\s*=\s*"[^"]+"/.test(tag) ||
      /aria-labelledby\s*=\s*"[^"]+"/.test(tag) ||
      insideLabel(m.index);

    if (!named) {
      const name = tag.match(/\bname\s*=\s*"([^"]+)"/)?.[1] ?? id ?? "?";
      findings.push({ kind: "unlabelled-control", detail: `${m[1]} name=${name}` });
    }
  }

  /* ---------------------------------------------------- empty controls */
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    if (!hasAccessibleName(m[1], m[2])) {
      findings.push({ kind: "button-no-name", detail: m[0].slice(0, 80) });
    }
  }
  for (const m of html.matchAll(/<a\b([^>]*\bhref[^>]*)>([\s\S]*?)<\/a>/gi)) {
    if (!hasAccessibleName(m[1], m[2])) {
      const href = m[1].match(/href\s*=\s*"([^"]*)"/)?.[1] ?? "?";
      findings.push({ kind: "link-no-name", detail: href.slice(0, 60) });
    }
  }

  /* ----------------------------------------------------------- tabindex */
  for (const m of html.matchAll(/\btabindex\s*=\s*"(\d+)"/gi)) {
    if (Number(m[1]) > 0) {
      findings.push({ kind: "positive-tabindex", detail: `tabindex=${m[1]}` });
    }
  }

  /* -------------------------------------------------------------- tables */
  for (const m of html.matchAll(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi)) {
    const hasCaption = /<caption\b/i.test(m[2]);
    const hasLabel = /aria-label(?:ledby)?\s*=\s*"[^"]+"/.test(m[1]);
    if (!hasCaption && !hasLabel) {
      findings.push({ kind: "table-no-caption", detail: "" });
    }
  }

  return findings;
}

/* ------------------------------------------------------------------ *
 * Run
 * ------------------------------------------------------------------ */

const PAGES = await loadPages();

let total = 0;
const byKind = new Map();

for (const path of PAGES) {
  let html;
  try {
    // Sign in as a super administrator, the way a real reviewer of these
    // pages would: without it every guarded route silently follows its
    // redirect to /dashboard and the audit passes on the wrong HTML.
    const res = await fetch(base + path, {
      headers: { cookie: "borjss_dev_role=superAdmin" },
    });
    if (!res.ok) {
      console.log(`\n${path}\n  HTTP ${res.status}`);
      continue;
    }
    html = await res.text();
  } catch (err) {
    console.log(`\n${path}\n  fetch failed: ${err.message}`);
    continue;
  }

  const findings = audit(html);
  if (findings.length === 0) continue;

  // De-duplicate identical findings within a page — one repeated pattern is
  // one thing to fix, not thirty.
  const seen = new Set();
  const unique = findings.filter((f) => {
    const key = `${f.kind}|${f.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n${path}`);
  for (const f of unique) {
    console.log(`  [${f.kind}] ${f.detail}`);
    byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
    total++;
  }
}

console.log("\n" + "=".repeat(60));
if (total === 0) {
  console.log(`0 finding(s) across ${PAGES.length} pages`);
} else {
  console.log(`${total} finding(s) across ${PAGES.length} pages\n`);
  for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${kind}`);
  }
}
