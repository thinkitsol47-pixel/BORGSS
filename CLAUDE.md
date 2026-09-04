# BORJSS — project instructions

Blue Ocean Research Journal for Social Sciences. A scholarly journal publishing
platform: Next.js 14 App Router, TypeScript, Tailwind. Frontend only so far —
no backend, no database, no auth. Data comes from `src/lib/api/mock-data.ts`.

**Read `docs/PROGRESS.md` before starting work.** It says what is built, what is
pending, and where to pick up.

---

## Design rules (from the client — do not change without asking)

1. **Background is pure white everywhere.** No grey page grounds, no dark mode.
2. **Branding is bright sky blue.** One hue (199°); only lightness varies.
3. **One unified portal** for authors, editors, reviewers and publishers — not
   separate portals per role. Roles change what you see inside it.
4. **Every page works on a phone and on a desktop.** Not "mostly" — every
   component, every table, every card.
5. **When fixing mobile, do not change desktop.** The desktop layout is signed
   off. Mobile fixes go behind breakpoint prefixes.
6. **Professional, not decorative.** No gratuitous shadows on brand buttons, no
   animation for its own sake.

### Working style the client has asked for

- Small visual tweaks should be **quick**. Do not run a full audit, spin up test
  servers, or refactor for a padding change. Read the file, make the edit, stop.
- Answer questions as questions. If the client asks "should X be A or B?", give
  a recommendation — do not silently start building B.
- Client writes in Roman Urdu; reply in Roman Urdu.

---

## Colour system

Tokens live in `src/styles/globals.css`. Two brand steps exist for a reason:

| Token | Value | Use for |
|---|---|---|
| `--brand` | `199 89% 48%` | Fills, bars, panels, icons. ~3.1:1 — **surfaces only** |
| `--brand-dark` | `199 89% 42%` | Hover states, gradient end |
| `--brand-darker` | `199 85% 31%` | Text sitting on a tinted ground |
| `--primary` | `199 92% 37%` | Small text and links on white. ~4.6:1 — WCAG AA |
| `--brand-tint` | `199 90% 95%` | Panel backgrounds |
| `--brand-border` | `199 70% 85%` | Card and panel borders |
| `--muted-foreground` | `217 19% 35%` | ~7.2:1 — **do not lighten this** |

Never put `--brand` behind body text on white. Use `--primary`.

## Typography

Self-hosted variable fonts via `next/font/local` — Inter (sans) and Source Serif
4 (serif). No Google Fonts network call, so offline builds work. Serif is for
headings and article titles; sans for everything else.

## `.prose` and `.not-prose`

`.prose` styles long-form documentation body copy. **Every `.prose` selector is
scoped with `:not(.not-prose *)`.** This is load-bearing: without it, a button
placed inside a prose block inherits link styling and renders as blue underlined
serif text. Any component dropped inside `.prose` must be wrapped in
`.not-prose`.

## Custom Tailwind additions

- `xs: 420px` breakpoint, for small phones.
- `spacing: { "4.5": "1.125rem" }` — the default button size depends on it.

---

## Operational constraints — these have broken the app before

**Never delete `.next-build`, and never run an unsuffixed dev server** while the
client's dev server is running. Both processes share the build directory; when
the second one exits it cleans the directory out, and the client's app starts
throwing `clientModules` errors and 404s on every route.

To run a test server:

```bash
BORJSS_DIST_SUFFIX=check npx next dev -p 3100
# ... then always:
rm -rf .next-build-check
```

`next.config.mjs` reads `BORJSS_DIST_SUFFIX` and isolates both `distDir` and the
tsconfig path, so a suffixed server cannot touch the real build.

**Do not let Next.js rewrite `tsconfig.json`.** It appends build-type include
paths on every run, including paths to directories that no longer exist, which
fills the client's editor with errors. `.next-build-*` is in both `exclude` and
`.gitignore`. Keep it that way.

**Never state on a page that a feature exists when the code shows a stub.** This
already happened once: the indexing page claimed OAI-PMH was "Active" while
`api/oai/route.ts` returns not-implemented. Check the code, then write the copy.

---

## Testing

There is no browser automation installed, and installing Playwright/Puppeteer is
not worth it for this project. Two approaches are in use:

**Two structural audits**, both fetching every page and checking the rendered
HTML. Both currently report **0 findings across 87 pages** — keep them there.

- `node scripts/responsive-audit.mjs http://localhost:3100` — grids that never
  collapse, fixed column templates, tables without a scroll container,
  over-wide fixed widths, unwrappable flex rows.
- `node scripts/a11y-audit.mjs http://localhost:3100` — one `<h1>` and no
  skipped heading levels, a single `<main>`, `<html lang>`, alt on every image,
  a label on every control, an accessible name on every button and link, no
  positive tabindex, a caption on every table. It reads its page list out of
  the responsive audit, so the two cannot drift apart.

Neither can check colour contrast, focus visibility or reading order. The
contrast table above is the standing answer for colour; the rest needs a
browser and a person.

**TypeScript logic tests** — compile inside the project so imports resolve, then
run the plain `.mjs` scripts:

`tsconfig.build-check.json` extends `tsconfig.json`, which sets `noEmit`, so
the compile step has to override it or nothing is written. Each test script
takes the compiled `schemas.js` as its one argument:

```bash
npx tsc --outDir .tmp-test --noEmit false --declaration false -p tsconfig.build-check.json
node scripts/contact-schema.test.mjs  .tmp-test/src/lib/validation/schemas.js  # 19 tests
node scripts/reviewer-schema.test.mjs .tmp-test/src/lib/validation/schemas.js  # 37 tests
rm -rf .tmp-test
```

Always finish a change with `npm run typecheck`.

---

## Conventions

- **Server-side filtering and search.** Every filtered view has a shareable URL
  and works with JavaScript disabled. Pagination is links, not buttons.
- **Server Actions + Zod** for forms. Schemas in `src/lib/validation/schemas.ts`.
- **Honeypot on public forms** — a hidden field; if it is filled, report success
  to the sender and discard the message.
- **Accessibility is not optional.** Real labels wired to inputs, visible focus
  rings, landmarks, and colour contrast per the table above.
- `src/lib/search/index.ts` returns matched/unmatched text runs from
  `highlightParts()`. It never injects HTML — do not "simplify" it into
  `dangerouslySetInnerHTML`.

## Roles

`src/config/roles.ts` defines 12 roles. `superAdmin` holds four exclusive
permissions (`roles.manageAdmins`, `audit.view`, `workflow.override`,
`platform.manage`). `assignableRoles()` stops an ordinary admin from granting
admin or superAdmin.

---

## Known gaps — do not present these as finished

- Contact and reviewer-application forms validate but do not send. Both are
  marked `TODO(backend)`; they need a real mail provider. So does every other
  message the portal promises — `/admin/settings/email-templates` lists all 15.
- Manuscript template files do not exist yet. The templates page says so
  honestly — leave it that way until the files are real.
- **Nothing authenticates.** `src/middleware.ts` has its redirect commented
  out and `getCurrentUser()` returns a fixed mock user, so every portal route
  is browsable without signing in. `robots.ts` disallows them and both
  non-public layouts set `noindex`, but neither is a substitute for auth.
- **No Crossref prefix, no ISSN, no e-ISSN.** Every DOI in the app begins
  `10.xxxxx` and resolves nowhere. These three block a DOAJ application;
  `/admin/settings/journal` and `/admin/doi` both say so on screen.
- **A section-name drift in the fixtures.** Manuscripts are filed under
  "Gender Studies", which is not one of the ten subject areas declared on
  `/about/aims-scope` — the real name is "Gender & Development". Visible on
  `/admin/settings/sections`. A section is a free string with no registry
  behind it, which is what allows this.
