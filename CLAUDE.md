# BORJSS — project instructions

Blue Ocean Research Journal for Social Sciences. A scholarly journal publishing
platform: Next.js 14 App Router, TypeScript, Tailwind, **PostgreSQL through
Prisma**.

The frontend is complete. The backend is part-built: every portal screen now
**reads** from the database, and much of the writing works too — the public
forms, the editorial decision and reviewer assignment, the reviewer's report,
profile settings, and the announcements CRUD all persist. **Authentication is
real** — Supabase Auth, with the middleware closing every portal route to
anyone without a session, and Row Level Security on across all 34 tables.
**Email works** (since 2026-10-01): `borjss.online` is verified at Resend, a new
account must confirm its address before it can sign in, and password reset is
delivered. File storage works for submissions: an author
can complete the wizard and the manuscript is uploaded, stored confidentially
and downloadable by the people entitled to it. **Production galleys upload and
download the same way**, every production stage transition and proof correction
persists, and an author whose manuscript comes back can **upload the revision**
through the portal. The workflow now joins up end to end: an editor's
acceptance **creates the production job** that carries a manuscript into
production, and an administrator can put an account **into the reviewer pool**
that editors are offered from — two links that had no code behind them until
2026-09-16. **Issue planning landed the same day**, which was the last unbuilt
feature and the last one that was purely code: an editor can open an issue,
place accepted manuscripts into it, set their running order and take them out
again. **Publishing an issue works too (2026-10-06), without DOIs** — see
Known gaps. What is left that money buys: a Crossref prefix, an ISSN and an
e-ISSN. (The domain, `borjss.online`, was bought and is live.)
`docs/PROGRESS.md` under "Backend progress" is the live record of what has
landed; `src/lib/api/mock-*.ts` now feeds `prisma/seed.ts` rather than the app.

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

**Never state on a page that a feature exists when the code shows a stub** —
and re-read the notices when a feature lands. Both directions have gone wrong
here. The indexing page once claimed OAI-PMH was "Active" while
`api/oai/route.ts` returned not-implemented. Later, a dozen screens still said
"there is no database" and "no file storage" weeks after both existed, and the
login page announced "Not live yet" above a working sign-in form. Stale notices
are the harder failure: nothing breaks, no test fails, and the reader stops
believing the rest of the page. **When you finish a feature, grep for the
notices that described its absence.**

**A replacement notice needs the same scrutiny as the one it replaces, and a
true sentence can still be in the wrong place.** Issue planning (2026-09-16)
produced four of these in one change, all found by walking the screens rather
than by any script: a *published* issue carried "this issue cannot be published
yet" beneath its own Published badge, offered an Edit button to a form that
refuses it, and told the reader to consult a list that is not rendered there;
and the issues list carried a publishing notice although it has no publish
control, directly under the section listing the published issues. Each sentence
was true of the feature and false of the screen. So: **write a notice about a
thing where that thing is decided, guard it on the state it describes, and then
open the page in the states it can actually be in** — a published issue, an
empty one, a phone.

**Every new table needs `ALTER TABLE "X" ENABLE ROW LEVEL SECURITY` in its own
migration.** A new table defaults to RLS off, and the loop in
`20260908120000_enable_rls` only covered what existed when it ran. Without the
line, Supabase's anon key can read the table through the auto-generated REST
API and the dashboard flags it UNRESTRICTED. All 34 tables are currently
protected — keep it that way.

---

## Testing

There is no browser automation installed, and installing Playwright/Puppeteer is
not worth it for this project. Two approaches are in use:

**Two structural audits**, both fetching every page and checking the rendered
HTML. Both currently report **0 findings across 96 pages** — keep them there.

**The audits sign in for real.** Portal routes are guarded, so without a session
they would grade the login page once per route and report a clean sweep of pages
they never saw. Set `AUDIT_EMAIL` and `AUDIT_PASSWORD` (a superAdmin account) in
`.env.local`; without them the audits print a warning saying the portal was not
audited. See `scripts/audit-session.mjs`.

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

## The services — settled 2026-09-08

Supabase Postgres (database) · Supabase Auth (50k MAU free) · **Cloudinary**
(files and images, 25 GB free) · Resend, Brevo the fallback (email, Phase 6).
All free tiers, none near its limit.

**Two safeguards the free tiers need** (2026-10-06): a daily Vercel cron hits
`/api/keep-alive` (guarded by `CRON_SECRET`) so Supabase never pauses the
project for inactivity, and `.github/workflows/db-backup.yml` takes a weekly
**encrypted** dump (the repo is public — never upload one unencrypted). Restore
steps are in `docs/PROGRESS.md` → "Database backups".

**Cloudinary is the one with a catch, and it is worse than it looks.** Its
default is a permanently public URL, so every upload passes
`type: "authenticated"` and every read mints a short-lived signed URL after
checking entitlement. **But an `authenticated` upload still returns a
`secure_url` whose signature never expires** — verified against the live
account, it opens with a plain fetch, forever. Storing that URL would make
every manuscript one leaked column away from public.

So: **`src/lib/storage/` is the only caller of Cloudinary**, `putFile` returns
the `publicId` and never a URL, and reads go through `/files/<id>`, which
checks `lib/storage/entitlement.ts` and 302s to a ten-minute link. A `publicId`
on its own opens nothing (401). Never store a signed URL, email one, or log
one — it is a bearer token. `putPublicFile` is the deliberate exception, for
published articles, and is named so the difference is a decision rather than a
forgotten flag.

**Two kinds of file, two rules, one route.** `/files/<id>` serves a
`SubmissionFile`; `/files/galley:<id>` serves a `ProductionGalley`. They are
separate entitlement functions on purpose — a galley lives in a different table
with no author column, so extending the submission rule by analogy would have
meant guessing which branches still applied. `fileAccessFor()` allows
editorial/production staff, the submitting author, and an assigned reviewer
(never the title page or cover letter, which name the authors).
`galleyAccessFor()` is narrower: **production and editorial staff only, no
author branch and no reviewer branch at all** — an unapproved galley is not
something to hand an author a standing link to, and review is over by the time
anything is typeset. Keep both on the one route: one guard, one place a signed
URL is minted.

## Known gaps — do not present these as finished

**Nothing in the app reads a fixture** (settled 2026-09-17) — `src/lib/api/mock-*.ts`
is read only by `prisma/seed.ts`. **That is not the same as "no screen shows
invented data", and saying so here was wrong until 2026-09-18.** A row read
from Postgres is not real because it came from Postgres; the seed had put it
there. The public record — twelve named board members at real institutions,
seven articles with DOIs and bylines, two issues, ten posts — was invented
data served through a real query, on exactly the pages DOAJ and the ISSN
centre verify by writing to the people named.

**The public record is now empty, and the seed will not refill it.**
`SEED_PUBLIC=1` is required to seed `Issue`, `Article`, `Post` and
`BoardMember`; `scripts/clear-public-content.mjs` removes them (dry-run
unless `--apply`). **The portal demo data is gone from the live database too**
(2026-10-06, `scripts/clear-demo-portal.mjs`): no seeded submissions, issues
or profiles remain. **Never run `prisma db seed` against the live database** —
only the public record is gated, so it would refill the portal with
`@example.edu` accounts that bounce.

When emptying a table, **open the screens in the state they now render in**.
Three were wrong here: the board page had no empty state and would have shown
"0 members / 0 institutions / 0 countries"; `/articles` offered *Clear
filters* on an archive with nothing to reveal; the homepage asserted a
"6 wks median to first decision" that no query produced.

Two further things were removed earlier, and both should stay removed:

- **The audit log's eight seeded rows.** `prisma/seed.ts` no longer writes
  `mockAuditEntries` at all. An audit log is read precisely when someone is not
  trusted, and invented rows sitting beside real ones — "granted sectionEditor",
  "reopened a review round in error" — describe things nobody did. The table
  starts empty and fills as the journal is used, which is the correct starting
  state for an append-only record. The screen's notice derives its own count, so
  it corrects itself rather than asserting a number.
- **The two `alert()` controls on `/admin/announcements`.** Expiring and
  deleting a post now persist. `expirePost` sets `expiresAt` to **a second ago**,
  not to now: every public filter keeps a post while `expiresAt >= now`, so a
  timestamp of exactly now leaves it listed — verified against the database
  before the second was subtracted.

The only `alert()` left is on `/admin/doi`, and both its buttons are
**disabled** with the reason on the button itself. It is unreachable until a
Crossref prefix exists, so it promises nothing.

- **Email reaches anyone; most correspondence is still not built** (settled
  2026-10-01). `borjss.online` is verified at Resend and `EMAIL_FROM` is
  `BORJSS <editorial@borjss.online>`. **The domain has no inbox** — every
  message's `replyTo`, and every contact address in `site.config.ts`, is the
  owner's Gmail `ceoborjss@gmail.com`, by the owner's decision. Never point a
  contact address at the domain without a real mailbox behind it.
  *Sent:* address confirmation, the submission receipt, **decision letters**
  (2026-10-02, to the corresponding contributor; with the round's reviewer
  comments-to-author under their labels when "Send the reviewers' comments" is
  ticked — the query selects only `commentsToAuthor` and the label, never
  comments to the editor or a name), **reviewer invitations** (2026-10-03,
  title and abstract only), **review reminders** (a *Send reminder* button on
  the reviewers page — at most one per assignment per 24 hours, the gap read
  from `review.reminded` audit entries; nothing sends on a schedule), an
  office email when a reviewer accepts, declines or reports, **thanks and the
  outcome** to every reviewer who reported in the decided round (the decision
  only — never the letter or other reports), an office email when a
  revision is uploaded, contact-form and reviewer-application receipts plus office
  notifications, and password reset — the last one by **Supabase**, through
  custom SMTP to Resend (`no-reply@borjss.online`), configured in the Supabase
  dashboard, not here. Also sent (2026-10-03): a note to the author when
  copyedits or proofs await them (**no file or link** — the file still goes by
  hand), a revision reminder (*Remind the author*, once a day), and an account
  invitation from `/admin/users/new` (no password is set by anyone; the holder
  uses Forgot password, and `resetPassword` moves `invited` → `active`).
  Screens that say a message is not sent
  give that reason — "not built". `/admin/settings/email-templates` lists
  every message.
- Manuscript template files do not exist yet. The templates page says so
  honestly — leave it that way until the files are real.
- ~~Proof corrections~~ and ~~revision uploads~~ — **both built 2026-09-14.**
  Corrections needed `20260914120000_proof_correction_fields`, which gave
  `location` and `raisedBy` real columns; they used to share one string with
  the description, which a form cannot safely re-encode. Revisions needed no
  migration.
- **Issue planning — built 2026-09-16.** Creating and editing an issue, placing
  an accepted manuscript into one, reordering and removing all persist through
  `(dashboard)/editorial/issues/actions.ts`. No migration was needed; the tables
  were already there with RLS on. Two things to keep in mind when touching it:
  **two tables answer "which issue is this in"** — `IssuePlanItem` is the
  running order, `ProductionJob.issueId` is what the production queue reads for
  a job's target date — so every placement and removal writes both in one
  transaction, or the queue quietly stops showing deadlines. And **positions are
  kept contiguous**: a removal closes the gap, because a hole is invisible on
  screen and breaks the reorder controls silently.
- **Publishing an issue — built 2026-10-06, without DOIs** (the owner's
  decision: DOIs are added once there is a Crossref prefix). The issue screen
  shows a *Publish* panel; `publishIssue` → `lib/api/publishing.ts` checks every
  placed manuscript (accepted, has authors, a **final PDF galley**, proofread
  **done**, **no open proof corrections**) and, in one transaction, creates the
  public `Issue`, an `Article` per manuscript (`doi` null, byline frozen into
  `ArticleContributor`, running order in `Article.issuePosition`), marks the
  submissions `published`, and then emails each corresponding author the link.
  `issueSchema` still does not accept `published` — the dropdown must never
  skip that work. **Galleys are not copied to a public file:**
  `ArticleGalley.storagePath` points at the final `authenticated` upload and
  `/files/article:<id>` streams it to anyone, the one public branch of the
  files route (`articleGalleyAccess`). Once published, a job leaves the
  production queue and its galleys cannot be changed.
- **The reviewer role and the reviewer pool are different things** (built
  2026-09-16). Registration grants `reviewer` to anyone; an editor's shortlist
  comes from `ReviewerProfile`, and nothing but the seed wrote one — an account
  could hold the role forever and reach no editor. `/admin/users/[userId]/edit`
  now has a *Reviewer pool* section. Sections there are checkboxes from the
  `Section` table and re-validated server-side, because `sectionMatch` is an
  exact `includes()` and a hand-typed name silently never matches. Availability
  is deliberately not offered — it is the reviewer's own statement, not the
  office's.
- **Accepting a manuscript creates its production job** (built 2026-09-16),
  inside `recordDecision`'s transaction, with all three stages `notStarted`.
  Before this, `productionJob.create` existed only in the seed and nothing ever
  entered production through the app.
- **Auth works end to end** (2026-10-01). Sign-in, registration, password
  reset and sign-out run on Supabase Auth, and `src/middleware.ts` redirects
  every portal route to `/login` without a session (it verifies the token
  locally with `getClaims()`; pages still call `getUser()`). **Registration
  creates an unconfirmed account** via `generateLink` and emails our own link;
  it opens `/verify-email?token_hash=…`, whose button POSTs to `/auth/confirm`
  — never confirm on GET, mail scanners open links and would spend the
  single-use token. **Sign-out is POST only** (`/logout`): a GET sign-out link
  was prefetched by Next and ended sessions when the menu opened. **The demo
  door is gone** — no cookie, no one-click entry, no environment bypass. One
  account can sign in (`ceoborjss@gmail.com`, superAdmin); the owner's test
  account `extra520631@gmail.com` is the only other `User` row.
- **No Crossref prefix, no ISSN, no e-ISSN.** Every DOI in the app begins
  `10.xxxxx` and resolves nowhere. These three block a DOAJ application;
  `/admin/settings/journal` and `/admin/doi` both say so on screen.
- **A section-name drift, now only in the fixtures.** `mock-submissions.ts`
  files manuscripts under "Gender Studies", which is not one of the ten subject
  areas on `/about/aims-scope` — the declared name is "Gender & Development".
  **Fixed everywhere the app actually reads:** `Section` is a real table with a
  foreign key, `/admin/settings/sections` edits it, and `prisma/seed.ts`
  corrects the name on the way in. It survives only in the source fixtures, so
  a new code path that reads those files directly instead of the database would
  reintroduce it.
- **Only twelve journal settings are editable, deliberately.**
  `/admin/settings/journal` saves the identifiers, contact addresses and social
  links to `JournalSetting`; the title, publisher, frequency, language and
  access model stay in `site.config.ts` because changing one changes the
  journal rather than its configuration. The config file is the default and a
  stored row is an override — clearing a field deletes its row rather than
  storing `""`. **Review forms, policies and email templates stay in code**;
  each screen states why, and those reasons are load-bearing (a review
  criterion is a key stored on every past report; a policy is audited prose; a
  template is a function with typed arguments).
