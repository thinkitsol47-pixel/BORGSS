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

const base = process.argv[2] ?? "http://localhost:3000";

const PAGES = [
  "/",
  "/articles",
  "/articles?type=research",
  "/articles/climate-adaptation-smallholder-farmers",
  "/issues",
  "/issues/current",
  "/issues/v1i1",
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
  "/announcements",
  "/announcements/call-for-papers-volume-2",
  "/news",
  "/news/crossref-membership-confirmed",
  "/events",
  "/events/writing-for-publication-workshop-2027",
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
  // Editorial screens (phase 16). `q2` is a fixture with an overdue reviewer,
  // so the queue and reviewers tab render their warning states here.
  "/editorial/queue",
  "/editorial/q2",
  "/editorial/q2/reviewers",
  "/editorial/reviewers-db",
  // Decisions and issues (phase 17). `q3` is the fixture whose two reviewers
  // disagree, so the decision screen renders its reports and warning; `s5` is
  // the only manuscript in production, so its production tab is not the empty
  // state. `ei3` is the issue being assembled.
  "/editorial/q3/decision",
  "/editorial/s5/production",
  "/editorial/issues",
  "/editorial/issues/ei3",
  "/admin/doi",
  // Production (phase 18). `pj5`/`s5` is the job at proofreading with open
  // corrections and three galleys; `p1` is the one sitting with the author,
  // and `p3` has nothing started, so the three stage screens render their
  // populated, waiting and empty states between them.
  "/production",
  "/production/s5/proofread",
  "/production/s5/galleys",
  "/production/p1/copyedit",
  "/production/p3/copyedit",
  "/admin/announcements",
  // People and permissions (phase 19). The roles matrix is a 12x16 grid and
  // the users table is five columns, so both exercise the audit's table and
  // fixed-width rules harder than anything before them.
  "/admin/users",
  "/admin/users/new",
  "/admin/users/u1",
  "/admin/users/u1/edit",
  // CRUD forms and controls. Each is a form or a set of buttons the audit has
  // not seen before, and forms are where fixed widths and unwrappable rows
  // most often creep in.
  "/admin/announcements/new",
  "/admin/announcements/announcement/call-for-papers-volume-2/edit",
  "/editorial/issues/new",
  "/editorial/issues/ei3/edit",
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
console.log(`${total} finding(s) across ${PAGES.length} pages`);
for (const [kind, n] of [...byKind].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${kind}`);
}
process.exit(0);
