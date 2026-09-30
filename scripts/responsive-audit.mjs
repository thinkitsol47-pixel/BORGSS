/**
 * Structural responsive audit.
 *
 * Fetches every public page and flags the class patterns that reliably break
 * layout on a narrow viewport:
 *
 *   - multi-column grids with no breakpoint prefix (never collapse)
 *   - fixed-column grid templates (e.g. [18rem_1fr]) with no breakpoint
 *   - tables not inside an overflow container
 *   - fixed widths wider than a 360px viewport
 *   - horizontal flex rows of buttons with no wrap
 *
 * Run: node scripts/responsive-audit.mjs http://localhost:3000
 */

import { auditCookie } from "./audit-session.mjs";

const base = process.argv[2] ?? "http://localhost:3000";

const PAGES = [
  "/",
  "/articles",
  "/articles?type=research",
  // A single article's page and a single issue's page were audited through
  // seeded slugs, removed with the rest of the invented public record
  // (2026-09-18). Both now 404. Add them back — by real slug — once the
  // journal publishes its first issue, since a detail page is where fixed
  // widths and unwrappable rows most often appear.
  "/issues",
  "/issues/current",
  "/about",
  "/about/aims-scope",
  "/about/editorial-board",
  "/about/journal-information",
  "/about/history",
  "/search",
  "/search?q=climate",
  "/contact",
  "/for-authors/guidelines",
  "/for-authors/submission-process",
  "/for-authors/templates",
  "/apc",
  "/for-reviewers/guidelines",
  "/for-reviewers/become-a-reviewer",
  "/indexing",
  // The three list pages only. A single post's page used to be audited
  // through a seeded slug, and those posts were removed with the rest of the
  // invented public record (2026-09-18) — a hardcoded slug here would 404 for
  // good. Add one back when the journal publishes a post of its own.
  "/announcements",
  "/news",
  "/events",
  // the seventeen editorial policies (step 10)
  "/policies/peer-review",
  "/policies/publication-ethics",
  "/policies/research-ethics",
  "/policies/research-integrity",
  "/policies/authorship",
  "/policies/conflict-of-interest",
  "/policies/reviewer-ethics",
  "/policies/editorial-independence",
  "/policies/plagiarism",
  "/policies/open-access",
  "/policies/copyright",
  "/policies/licensing",
  "/policies/ai-policy",
  "/policies/retraction-correction",
  "/policies/complaints-appeals",
  "/policies/data-availability",
  "/policies/privacy",
  // auth (step 11) — the query-string variants render different states
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/reset-password?token=demo",
  "/verify-email",
  "/verify-email?email=author%40example.edu",
  "/verify-email?token=demo",
  // the "Submit Manuscript" entry point — a real page until the wizard lands
  // The public how-to-submit page and the portal's own new-submission page.
  // Same task, two audiences, two shells — both need checking.
  "/for-authors/how-to-submit",
  "/submissions/new",
  // Wizard steps 2–6. `d1` is any draft id — the routes read the parameter but
  // no draft has to exist for the markup to render.
  "/submissions/new/d1/upload",
  "/submissions/new/d1/metadata",
  "/submissions/new/d1/contributors",
  "/submissions/new/d1/declarations",
  "/submissions/new/d1/review",
  // Editorial screens (phase 16). Phase 3 moved these ids from mock-data
  // fixtures to the seeded database — each id below is the real row matching
  // the same scenario the old comment described, found by querying for it
  // (an overdue accepted assignment; two reviewers disagreeing; a
  // still-`planned` issue), not by guessing. Re-derive with psql against the
  // seeded db if these ever stop matching after a reseed with different data.
  "/editorial/queue",
  "/editorial/f26b7674-200b-41f7-ac84-ab96e7a537d1", // overdue reviewer
  "/editorial/f26b7674-200b-41f7-ac84-ab96e7a537d1/reviewers",
  "/editorial/reviewers-db",
  // Decisions and issues (phase 17). The first id's two reviewers disagree,
  // so the decision screen renders its reports and warning; the second is
  // `in-production`, so its production tab is not the empty state. The issue
  // id is one still `planned` (being assembled).
  "/editorial/f647b92f-b568-48d8-b9d7-65dcbecf366c/decision",
  "/editorial/0cac8670-5330-4dc2-9194-2dc155f77714/production",
  "/editorial/issues",
  "/editorial/issues/e70b5ec4-08e5-4810-98ea-9b0964112e59",
  "/admin/doi",
  // Production (phase 18). The first id's job is at proofreading with open
  // corrections and three galleys; the second sits with the author at
  // copyediting; the third has nothing started — so the three stage screens
  // render their populated, waiting and empty states between them. Real
  // seeded submission ids, re-derived from the db the same way the editorial
  // ids above were once `production.ts` began reading Postgres; re-derive
  // with a Prisma query after a reseed if these stop matching.
  "/production",
  "/production/c1e487cf-fc6e-41b2-87c1-f2f2c0852a09/proofread", // proofread, corrections open
  "/production/c1e487cf-fc6e-41b2-87c1-f2f2c0852a09/galleys", // three galley versions
  "/production/0cac8670-5330-4dc2-9194-2dc155f77714/copyedit", // with the author
  "/production/2ae16c3a-390a-4e2f-8563-710c700756f5/copyedit", // nothing started
  "/admin/announcements",
  // Public-form queues (phase 4). Both are card lists with a filter rail and
  // per-row action controls — the same shape as the announcements screen.
  "/admin/messages",
  "/admin/reviewer-applications",
  // People and permissions (phase 19). The roles matrix is a 12x16 grid and
  // the users table is five columns, so both exercise the audit's table and
  // fixed-width rules harder than anything before them.
  "/admin/users",
  "/admin/users/new",
  // Dr. Mubashir Quddus — superAdmin + editorInChief, a multi-role account, so
  // the detail and edit screens exercise the role list. Re-derive after a
  // reseed: it is the deterministic UUID for mock id "u1" (see prisma/seed.ts).
  "/admin/users/6cc55e24-a677-4cc8-b25e-d1646e0527d2",
  "/admin/users/6cc55e24-a677-4cc8-b25e-d1646e0527d2/edit",
  // CRUD forms and controls. Each is a form or a set of buttons the audit has
  // not seen before, and forms are where fixed widths and unwrappable rows
  // most often creep in.
  "/admin/announcements/new",
  "/editorial/issues/new",
  "/editorial/issues/e70b5ec4-08e5-4810-98ea-9b0964112e59/edit",
  "/admin/roles",
  "/admin/statistics",
  "/admin/audit-log",
  "/admin/integrations",
  // Journal settings (phase 20) — the last five portal screens. All share
  // `settings-page.tsx`, whose horizontal tab rail is the piece most likely to
  // overflow on a phone.
  "/admin/settings/journal",
  "/admin/settings/sections",
  "/admin/settings/review-forms",
  "/admin/settings/email-templates",
  "/admin/settings/policies",
  // portal shell (step 12). The mock user holds author + reviewer +
  // sectionEditor, so the sidebar renders four of its seven sections here.
  "/dashboard",
  "/profile",
];

/** Tailwind breakpoint prefixes that make a utility conditional. */
// `xs` is this project's own 420px breakpoint (tailwind.config.ts), so it
// counts as a breakpoint prefix here just like Tailwind's built-in ones.
const BP = /(?:^|[\s:])(xs|sm|md|lg|xl|2xl):/;

/**
 * Returns each class attribute together with the markup that follows it, so a
 * check can ask whether the element's children carry a shrink guard.
 */
function classLists(html) {
  return [...html.matchAll(/class="([^"]*)"/g)].map((m) => ({
    cls: m[1],
    after: html.slice(m.index, m.index + 1200),
    before: html.slice(Math.max(0, m.index - 800), m.index),
  }));
}

/** Splits a class string into tokens, keeping any breakpoint prefix. */
function tokens(cls) {
  return cls.split(/\s+/).filter(Boolean);
}

function hasUnprefixed(tokenList, re) {
  return tokenList.some((t) => !BP.test(t) && re.test(t));
}

function audit(path, html) {
  const findings = [];
  const lists = classLists(html);

  for (const { cls, after, before } of lists) {
    const t = tokens(cls);
    if (!t.includes("grid") && !t.includes("flex")) continue;

    // A grid with 2+ columns and no responsive column count at all.
    const fixedCols = t.find(
      (x) => /^grid-cols-([2-9]|1[0-2])$/.test(x) && !BP.test(x),
    );
    const hasResponsiveCols = t.some(
      (x) => BP.test(x) && /grid-cols-/.test(x),
    );
    // `hidden lg:flex` wrappers (the desktop mega-menu) never render on a
    // phone, so a fixed column count inside them is not a mobile problem.
    const desktopOnly =
      /hidden[^"]*lg:(flex|block|grid)/.test(before) ||
      /invisible[^"]*group-hover:visible/.test(before);

    if (fixedCols && !hasResponsiveCols && !desktopOnly) {
      findings.push({ kind: "grid-never-collapses", detail: fixedCols, cls });
    }

    // An explicit fixed-width column template with no breakpoint, e.g.
    // grid-cols-[18rem_1fr] — the sidebar cannot stack.
    // A breakpoint-prefixed grid-cols on the same element means the base value
    // is the small-screen case and is overridden further up — that is the
    // documented way to fix mobile without touching desktop, not a finding.
    const fixedTemplate = t.find(
      (x) => /^grid-cols-\[.*(rem|px).*\]$/.test(x) && !BP.test(x),
    );
    if (fixedTemplate && !hasResponsiveCols) {
      findings.push({ kind: "fixed-column-template", detail: fixedTemplate, cls });
    }

    // Fixed width wider than a 360px phone (22.5rem).
    for (const x of t) {
      const m = x.match(/^w-\[(\d+(?:\.\d+)?)(rem|px)\]$/);
      if (!m || BP.test(x)) continue;
      const px = m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1]);
      if (px > 360) findings.push({ kind: "too-wide", detail: x, cls });
    }

    // A horizontal flex row that cannot wrap is an overflow risk — but only
    // when nothing inside it is allowed to shrink. `min-w-0`, `shrink-0`,
    // `truncate` and `flex-1` on the row or a child are the accepted ways of
    // making such a row safe, so a row carrying them is not reported.
    // A row with a single child cannot overflow from justify-between: count
    // the element children that open immediately inside it.
    const inner = after.slice(after.indexOf(">") + 1);
    const close = inner.indexOf("</div>");
    const childCount = (
      inner.slice(0, close === -1 ? 400 : close).match(/<(?:div|span|p|a|label|button|dt|dd|h[1-6])/g) ?? []
    ).length;

    const rowIsGuarded =
      t.some((x) => /^(min-w-0|shrink|shrink-0|truncate|flex-1)$/.test(x)) ||
      /\b(min-w-0|shrink-0|truncate|flex-1|break-words|break-all)\b/.test(after);
    if (
      t.includes("flex") &&
      !t.includes("flex-wrap") &&
      !t.includes("flex-col") &&
      !rowIsGuarded &&
      childCount > 1 &&
      !t.some((x) => BP.test(x) && /flex-(wrap|col)/.test(x)) &&
      t.some((x) => /^gap-\d/.test(x)) &&
      t.some((x) => /^justify-between$/.test(x))
    ) {
      findings.push({ kind: "nowrap-row", detail: "flex + justify-between, no wrap", cls });
    }
  }

  // Tables must sit inside a horizontal scroller.
  const tableCount = (html.match(/<table/g) ?? []).length;
  const scrollerCount = (html.match(/overflow-x-auto/g) ?? []).length;
  if (tableCount > scrollerCount) {
    findings.push({
      kind: "table-without-scroller",
      detail: `${tableCount} table(s), ${scrollerCount} scroller(s)`,
      cls: "",
    });
  }

  // A viewport meta tag must exist for any of this to matter.
  if (!/name="viewport"/.test(html)) {
    findings.push({ kind: "missing-viewport", detail: "", cls: "" });
  }

  return findings;
}

const cookie = await auditCookie();
if (!cookie) {
  console.log(
    "\nNo session - set AUDIT_EMAIL and AUDIT_PASSWORD in .env.local.\n" +
      "Portal routes redirect to /login and are NOT being audited.\n",
  );
}

let total = 0;
const byKind = new Map();
// Pages that never returned HTML. Counted separately because a page that was
// not fetched was not audited, and folding it into the total would report a
// clean sweep of pages nobody looked at — the dev server drops connections
// part-way through a run under this many rapid renders, which is exactly when
// that lie would be told.
const unreachable = [];

for (const path of PAGES) {
  let html;
  try {
    // A real signed-in session, because the portal routes are guarded and a
    // signed-out request is redirected to /login. Without it the audit would
    // grade the login page once per route and report a clean sweep of pages it
    // never saw. See scripts/audit-session.mjs.
    const res = await fetch(base + path, {
      headers: cookie ? { cookie } : {},
    });
    if (!res.ok) {
      console.log(`\n${path}\n  HTTP ${res.status}`);
      unreachable.push(`${path} (HTTP ${res.status})`);
      continue;
    }
    html = await res.text();
  } catch (err) {
    console.log(`\n${path}\n  fetch failed: ${err.message}`);
    unreachable.push(`${path} (fetch failed)`);
    continue;
  }

  const findings = audit(path, html);
  if (findings.length === 0) continue;

  // De-duplicate identical class strings within a page.
  const seen = new Set();
  const unique = findings.filter((f) => {
    const key = `${f.kind}|${f.detail}|${f.cls}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (unique.length === 0) continue;

  console.log(`\n${path}`);
  for (const f of unique) {
    total++;
    byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
    console.log(`  [${f.kind}] ${f.detail}`);
    if (f.cls) console.log(`     ${f.cls.slice(0, 130)}`);
  }
}

console.log(`\n${"=".repeat(60)}`);
// The denominator is pages actually audited, never the list length. Reporting
// "0 findings across 96 pages" when 14 of them never loaded is the kind of
// quietly-wrong number that stops anyone believing the rest of the run.
const audited = PAGES.length - unreachable.length;
console.log(`${total} finding(s) across ${audited} of ${PAGES.length} pages`);
for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${kind}`);
}

if (unreachable.length > 0) {
  console.log(
    `\n${unreachable.length} page(s) were NOT audited — this run is incomplete:`,
  );
  for (const p of unreachable) console.log(`  ${p}`);
  console.log(
    "\nRestart the dev server and run again before trusting the number above.",
  );
}

// Non-zero on findings *or* on an incomplete run, so a failed sweep cannot pass
// for a clean one in a script or a CI step.
process.exit(total > 0 || unreachable.length > 0 ? 1 : 0);
