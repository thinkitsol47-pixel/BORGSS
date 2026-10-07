# BORJSS — build progress

**Last updated:** 2026-09-16
**Status: the frontend is complete; the backend is nearly so.** All 92 routes
are built, no stubs remain, and **step 22 (final polish) is done**.
`/kitchen-sink` has been deleted, which is why the count is 92 rather than 93.

Standing checks, all green: `npm run typecheck`, `next lint`, a production
build, **0 findings** from both the responsive audit and the accessibility
audit across 96 pages, and both schema suites (19 + 37).

**Backend: phases 1 – 5 done; 6 blocked on a domain, and 7 behind it.**
Issue planning was the last unbuilt feature, and it landed 2026-09-16.

| Phase | State |
|---|---|
| 1 — Foundation | ✅ Supabase Postgres, 34 tables, seeded, RLS on all of them |
| 2 — Auth | ✅ Supabase Auth. The demo door is deleted; one account can sign in |
| 3 — Reading | ✅ All six portal readers query the database. **The public site is a separate count** — see `docs/PUBLIC-SITE-WIRING.md` |
| 4 — Writing | ✅ Every portal write persists — production, corrections and **issue planning** |
| 5 — File storage | ✅ Cloudinary. Submissions, **revisions** and **production galleys** |
| 6 — Email | 🟡 Resend connected, but **no domain**, so it reaches one address only |
| 7 — Scheduled work | ❌ Reminders and Crossref deposit. Both wait on phase 6 |

Counted from the source, not estimated: `find src/app -name page.tsx` gives the
route total and `grep -rl Placeholder src/app --include=page.tsx` the stub
count. Re-run both rather than trusting the numbers here. Earlier revisions of
this file said "88 pages", a guess made before the routes existed. The
remaining work is not frontend at all — it is the backend.

| Area | Routes | Built | Stub |
|---|---|---|---|
| Public site (marketing + policies) | 44 | 44 | 0 |
| Auth | 5 | 5 | 0 |
| Portal (`(dashboard)`) | 43 | 43 | 0 |
| **Total** | **92** | **92** | **0** |

`/kitchen-sink` was deleted in step 22. Note that "how do I submit?"
exists twice on purpose — `/for-authors/how-to-submit` for public visitors and
`/submissions/new` inside the portal; see the section on that button below.

> New session? Read this file and `CLAUDE.md`, then continue from
> **"Where to pick up"** at the bottom.

---

## ► NEXT (as of 2026-09-16)

**Everything below "Backend progress" is the detail. This is the short answer.**

### 0. The full walkthrough, submission → published article — by the owner

The demo manuscripts are gone (2026-10-06), so this starts from a real
submission: submit → assign reviewer → report → **Accept** → `/production`:
copyedit → typesetting (upload a PDF galley, **Mark final**) → proofreading
(complete it; apply or decline every correction) → `/editorial/issues`: create
an issue, place the manuscript → **Publish this issue** on the issue's page.
Then check the article page, its PDF, `/issues`, and the author's email.

### Publishing an issue (2026-10-06) — without DOIs

The last missing step of the workflow: nothing could ever reach the public
site. Built on the owner's choice to publish now and add DOIs when a Crossref
prefix exists. Code: `lib/api/publishing.ts` (readiness + the one transaction),
`publishIssue` in `editorial/issues/actions.ts`, `components/portal/publish-issue.tsx`,
`articlePublishedEmail`, and the `article:` branch of `/files/[fileId]`.
Migration `20261006120000_publish_without_doi` adds `Article.issuePosition`
and `ArticleGalley.storagePath` (applied live).

**Ready means**, per placed manuscript: accepted/in production, at least one
author, a final PDF galley, proofreading done, no open proof correction. The
panel lists what blocks each one and links to its production page; the check
is repeated inside the transaction.

Also changed with it: the article page links to **its own** issue (was always
`/issues/current`) and no longer shows "Views 0 / Downloads 0", which are not
collected; the production queue drops published jobs and refuses edits to
them; the author's *Published* card links to the article. Public pages that
said every article carries a Crossref DOI — `/indexing` (Crossref was marked
**Active**), `/policies/open-access`, `/about/journal-information`,
`/for-authors/submission-process`, `/apc` — now say DOIs come once membership
is in place, including for articles already published.

**Verified** against the live database with a throwaway Vol. 99 manuscript
(13 logic checks: blocked → ready → published → refused twice) and a test
server (21 page checks: article, PDF served without login as `application/pdf`
inline, 404 for unknown ids, issue, archive, sitemap, home, production queue,
editorial screen), then every row and the Cloudinary file were deleted.

**When the Crossref prefix arrives:** mint `Article.doi` for existing
articles, create their `DoiRecord`s, deposit, and flip `/indexing`'s Crossref
row back to live.

### 1. ~~Buy a domain~~ — done; live at www.borjss.online (2026-09-30 → 10-02)

**Where it runs now.** The repo moved to the owner's GitHub
(`thinkitsol47-pixel/BORGSS`, public — Vercel Hobby blocks collaborator
commits on private repos). Vercel project `borgss` on the owner's account,
functions in **`hnd1` (Tokyo)** beside the database. The original Supabase
project was lost with its account; a **new project `ohymquynkknuznxzdbue`
(ap-northeast-1)** was migrated (all 10) and seeded (portal demo only), and
`ceoborjss@gmail.com` recreated as superAdmin. Anything created through the
old app — including `BORJSS-2026-0079`'s production progress in item 0 — is
gone; item 0 restarts from the seeded state.

**Email.** `borjss.online` verified at Resend (Tokyo); app mail from
`editorial@borjss.online`, Supabase auth mail (password reset) via custom
SMTP from `no-reply@borjss.online`. The domain has no inbox — all replies and
contact addresses are `ceoborjss@gmail.com` by the owner's decision.
Registration now creates an unconfirmed account and emails a confirmation
link (`generateLink` → `/verify-email?token_hash=` → POST `/auth/confirm`);
"Send the link again" works, at most once a minute. Every "no domain" notice
was re-read: the ones that still say a message is not sent now say why — it
is not built (reviewer invitations, production hand-offs, account invites).

**Decision letters are emailed** (2026-10-02). `recordDecision` sends
`decisionLetterEmail` to the corresponding contributor after the transaction;
the outcome screen reports sent / failed / no address and, unless sent, hands
the letter back to copy.

**Reviewer invitations are emailed** (2026-10-03). `inviteReviewer` sends
`reviewInvitationEmail` (title, abstract, due date, note — no authors) with a
link to `/reviews/<assignmentId>`; accept, decline and a returned report each
email the office (`reviewUpdateOfficeEmail`). The decision form's long-ignored
"Send the reviewers' comments" checkbox is now honoured in the decision email.
Inviting is now refused for a manuscript's own authors (submitter or a
contributor address) and for decided or withdrawn manuscripts — both found in
live testing.

**Review reminders** (2026-10-03): *Send reminder* on the reviewers page, for
an unanswered invitation or an outstanding report; one per assignment per 24
hours, enforced from the audit log. Manual only — a scheduled reminder would
need a cron (Vercel Hobby allows one a day).

**Reviewers are thanked** (2026-10-03): recording a decision emails
`reviewOutcomeEmail` to everyone who returned a report in that round — the
decision only. The outcome screen states how many were emailed.

**Revision received** (2026-10-03): `uploadRevision` emails the office.

**The rest of correspondence** (2026-10-03): "Send to author" in production
emails the corresponding author (copyedit/proofread only; no file, no link);
*Remind the author* on the editor's manuscript page while a revision is
outstanding (once a day, audit-log gap); and `/admin/users/new` now creates an
account and emails an invitation (`createInvitedUser`, roles through
`assignableRoles()`). Setting a password moves an account from `invited` to
`active` — previously nothing ever did. The portal still never emails a file.

**Keep-alive** (2026-10-06): a Vercel cron calls `/api/keep-alive` daily at
03:00 UTC, which runs one query so the free Supabase project is never paused
for inactivity (the first database was lost that way). Needs `CRON_SECRET` in
Vercel; without it the route refuses every call. Check it under Vercel →
project → Settings → Cron Jobs.

### Database backups (2026-10-06)

`.github/workflows/db-backup.yml` runs every Sunday 21:00 UTC (and on demand
from Actions → *Database backup* → *Run workflow*). It dumps the `public`
schema in full plus the data of `auth.users` and `auth.identities`, encrypts
the bundle with AES-256 under `BACKUP_PASSPHRASE`, and keeps it as an artifact
for 90 days. **The repo is public, so nothing is ever uploaded unencrypted.**
Secrets: `BACKUP_DATABASE_URL` (the `DIRECT_URL`) and `BACKUP_PASSPHRASE`
(kept offline by the owner — lose it and every backup is unreadable). Files
in Cloudinary are not part of this; they live in Cloudinary.

**To restore** (into the same or a fresh Supabase project):

```bash
gpg --decrypt borjss-db-YYYY-MM-DD.tar.gz.gpg > backup.tar.gz   # asks for the passphrase
tar -xzf backup.tar.gz                                           # public.sql, auth.sql
# Fresh project: drop the empty public schema first, so the dump recreates it.
psql "$DIRECT_URL" -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
psql "$DIRECT_URL" -f public.sql
psql "$DIRECT_URL" -f auth.sql     # restores logins; skip if the accounts already exist
```

Then point `.env.local` and Vercel at the project, as in the 2026-09-30
migration above. Test a restore into a throwaway project at least once —
a backup nobody has restored is a hope, not a backup.

First run on demand 2026-10-06: success, artifact `borjss-db-2026-10-06`.

### Portal demo data cleared (2026-10-06)

`scripts/clear-demo-portal.mjs --apply` ran against the live database after
that backup. Gone: all 19 submissions (18 seeded plus the owner's test
`BORJSS-2026-0002`) with everything cascading from them, the 3 seeded
editorial issues (two marked "published"), the 39 `User` rows with no login,
10 orphaned affiliations, and the 2 real uploads in Cloudinary. Kept: the two
accounts that can sign in (`ceoborjss@gmail.com`, `extra520631@gmail.com`),
sections, the review form, contact messages and the audit log.
`submission_reference_seq` was reset, so the first real manuscript is
`BORJSS-2026-0001`. A signed-in sweep of every audited page on the empty
database found no NaN, error or demo text.

**Two consequences.** Never run `prisma db seed` against the live database —
it would put the demo portal back (only the public record is gated by
`SEED_PUBLIC`). And the audits' detail pages (`/editorial/<id>`,
`/production/<id>/…`, `/editorial/issues/<id>`) name seeded ids that no longer
exist live; they are meaningful only against a seeded local database.
Item 0's production walkthrough now starts from a manuscript submitted for
real.

**Ops note:** Resend had `ceoborjss@gmail.com` on its suppression list, so
every office email and reset link to it was silently dropped while the API
returned success. If office mail stops, check resend.com → Emails → status,
then Suppressions.

**The portal is the primary submission route** — `/for-authors/how-to-submit`
and the author guidelines already said so, and the privacy policy, which
claimed the opposite, was brought into line (2026-10-03). Email remains the
secondary route. The same sweep corrected `/about/history` (it claimed two
published issues and Crossref DOIs; neither exists) and `/indexing` ("published
its first issue in 2026").

### 2. ~~Galley uploads, proof corrections, revision uploads~~ — all done 2026-09-14

**Every piece of building that did not need a domain is finished.** Galley
upload and download, all five production stage transitions, proof corrections
(with their migration), and the author's revision upload round. See "Phase 4/5
— production" and "Phase 5 — revision uploads" below.

What remains is **not code**: a domain (which unblocks all email and phase 7),
a Crossref prefix, an ISSN and an e-ISSN.

### 3. ~~The `/admin/users` role screen~~ — done 2026-09-09

Roles and account status now save. See "Phase 4 — the `/admin/users` role
screen" below. What is still not possible from that screen is **creating** an
account, which waits on a domain like everything else email-shaped.

### 4. ~~Issue planning~~ — built 2026-09-16

Creating and editing an issue, placing an accepted manuscript into one,
reordering and removing all persist. No migration was needed: `EditorialIssue`
and `IssuePlanItem` were already there with RLS on, so this was
actions-and-forms work, as recorded. See "Phase 4 — issue planning" below for
what it had to reconcile.

**Publishing an issue stays blocked**, and now has no code path at all rather
than a disabled control: `issueSchema` does not accept `published`, so the form
cannot reach the state. It mints DOIs and there is no Crossref prefix.

### Not code, and needed before a DOAJ application

A **Crossref prefix** (every DOI in the app is `10.xxxxx` and resolves
nowhere), an **ISSN** and an **e-ISSN**. `/admin/settings/journal` now saves all
three the moment they exist.

**Known annoyances**, documented below in full:

- The dev server crashes part-way through the structural audits (connection
  pressure, ~96 rapid renders). **Both were re-run on 2026-09-16 after issue
  planning landed: 0 findings across 96 of 96 pages each.** The crash is real
  and it bit again — the a11y run reported two dozen `fetch failed` pages
  against a server the responsive run had just finished with, and passed
  cleanly on a fresh one. Run each against a freshly started suffixed server,
  and check the "96 of 96" count, not only the finding count.
- ~~"Downloads are not wired into this screen yet"~~ — fixed 2026-10-07.
  `/production/[id]/copyedit` and `/editorial/[id]/production` now list files
  through `FileLink`, like the editorial overview.
- ~~`mock-reviewers.ts` section drift~~ — corrected at source 2026-10-07 (the
  four short names now match the `Section` table). `mock-submissions.ts` still
  says "Gender Studies"; `resolveSectionName()` maps it.

---

## The plan at a glance

The frontend is being built in 22 steps, grouped in three phases.

| Phase | Steps | What it covers | State |
|---|---|---|---|
| Foundation | 0 | Design tokens, UI kit, layout shells | ✅ Done |
| Public site | 1 – 10 | Everything a visitor sees without logging in | ✅ Done |
| Application | 11 – 22 | Auth, then the unified portal, then final polish | ✅ Done |

---

## Completed

### Step 0 — Foundation ✅
Design tokens in `globals.css`, self-hosted fonts, and the primitive kit in
`src/components/ui/`: button, badge, card, field (input/textarea/select/label/
fieldset/checkbox/radio), table, breadcrumb, pagination, alert, skeleton,
empty-state, separator. Header, footer, and the `DocPage` documentation shell.

### Steps 1 – 9 — Public site ✅ (26 pages)

| Area | Pages |
|---|---|
| Home | Landing page with hero, founder card, current issue, recent articles |
| Articles | List (filterable), article detail |
| Issues | Archive, current issue, single issue |
| About | About, aims & scope, editorial board, journal information, history |
| For authors | Guidelines, submission process, templates, APC |
| For reviewers | Guidelines, become a reviewer |
| Search | Full search page with real weighted scoring |
| Contact | Contact form (Server Action + Zod + honeypot) |
| Indexing | Indexing and archiving status |
| News | Announcements, news, events — list and detail pages for each |

Supporting work done alongside: the search engine (`src/lib/search/index.ts`),
validation schemas, expanded mock data (7 articles, 2 issues, 12 board members,
10 posts), the responsive audit script, and two test suites.

**Responsive pass:** 84 raw findings → 5 real bugs fixed → script refined →
**0 findings across 29 pages.** The real bugs were: four stat-box grids that
never collapsed; no Login link at all below 640px; the founder card crushing its
own text; long email addresses overflowing five definition tables; and the
article card date squeezing its badge.

---

## Step 10 — Editorial policies ✅ (17 of 17 done)

Seventeen policy pages, written in four sub-steps. No stubs remain — a grep for
`Placeholder` under `policies/` returns nothing.

The shared shell is **`src/components/layout/policy-page.tsx`**. It wraps
`DocPage` and provides the breadcrumb, the "On this page" rail, the last-updated
date, a related-policies panel, an editorial-office contact panel, and a COPE /
DOAJ standards note appended to every policy. It also exports the `POLICIES`
array and the `PolicySlug` type. **Each policy page file contains only its own
prose** — see `policies/peer-review/page.tsx` as the pattern to copy.

### Step 10A — Core process and ethics ✅
- [x] **Peer Review** — 9 sections: double-blind model, desk assessment,
      reviewer selection, assessment criteria, decisions, timelines, reviewer
      disagreement, confidentiality, appeals
- [x] **Publication Ethics** — 9 sections: COPE basis, duties of authors /
      reviewers / editors / publisher, a misconduct table, the investigation
      procedure (including institutional referral), sanctions, how to raise a
      concern
- [x] **Research Ethics** — 10 sections: scope, ethics approval, the
      no-committee route, informed consent, vulnerable participants,
      confidentiality, secondary and online data, fieldwork risk, the required
      declaration, breach handling
- [x] **Research Integrity** — 8 sections: principles, method reporting,
      an analysis-failure table, data and image integrity, self-reuse,
      what the journal screens for, correcting the record, responsibility
- [x] **Authorship** — 10 sections: ICMJE criteria, acknowledgement,
      an improper-authorship table, author order, corresponding author,
      CRediT contribution statement, affiliations and ORCID, changes,
      disputes, deceased authors

### Step 10B — Conduct and independence ✅
- [x] **Conflict of Interest** — 9 sections: the appearance test, a
      competing-interest table (financial and non-financial), disclosure by
      authors / reviewers / editors, funding and funder veto, submissions from
      editors, what readers see, undisclosed interests
- [x] **Peer Reviewer Ethics** — 10 sections: the role, accepting or declining,
      confidentiality, the generative-AI prohibition, conducting the review,
      tone, anonymity, suspected misconduct, a reviewer-misconduct table,
      recognition
- [x] **Editorial Independence** — 10 sections: statement, publisher does /
      does not table, fees kept away from decisions, institutional and
      political pressure, no advertising, the team's own work, a who-decides
      table, transparency reporting, reporting pressure
- [x] **Plagiarism** — 10 sections: definition, a forms-of-plagiarism table,
      self-plagiarism, screening, why no percentage threshold is published,
      quoting and paraphrasing, found before / after publication, the
      second-language passage, avoidance checklist

### Step 10C — Access and rights ✅
- [x] **Open Access** — 9 sections: the statement, what it means for readers
      and for authors, how it is paid for, a self-archiving table (preprint /
      accepted / published), preservation, text and data mining, why this
      model, BOAI and DOAJ standards
- [x] **Copyright** — 10 sections: authors retain copyright, the non-exclusive
      grant, the publishing agreement, employer and Crown copyright, a
      third-party material table, obtaining CC BY-compatible permission, moral
      rights, reusing your own article, reader rights, infringement
- [x] **Licensing** — 10 sections: CC BY 4.0, a permissions table, the three
      conditions, a credit-line example, why not NC or ND, data and
      supplementary material (CC0 recommended), material outside the licence,
      site and identity, machine-readable licence, changes
- [x] **AI-Assisted Writing** — 11 sections: three principles, AI cannot be an
      author, a disclose-this table, what needs no disclosure, prohibited use,
      a disclosure-statement example, accountability, reviewers, editors, why
      no AI detectors are used, undisclosed use

Consistency check done while writing 10C: `/apc`, `/about/journal-information`
and `/indexing` were read first, and these four pages match what they already
state — CC BY 4.0, authors retain copyright, no embargo, waiver criteria, and
third-party preservation described as being established rather than live.

### Step 10D — Corrections and data ✅
- [x] **Retraction & Correction** — 11 sections: the three commitments, a
      four-instrument table (correction / expression of concern / retraction /
      removal), grounds for each, what a retraction is *not*, the process,
      what a notice contains, what happens to the article, requesting one
- [x] **Complaints & Appeals** — 12 sections: appeal vs complaint table,
      grounds and non-grounds for appeal, how to appeal and how it is handled,
      complaint categories and process, complaints about the Editor-in-Chief,
      a timelines table, no-disadvantage undertaking, referral to COPE
- [x] **Data Availability** — 10 sections: statement required but open data
      encouraged not required, what counts as data, a seven-option statement
      table, legitimate grounds for withholding, qualitative data, where to
      deposit, citing and licensing (CC0 recommended), code, retention
- [x] **Privacy** — 14 sections: an explicit "what this site does today"
      section, a collection table marking planned items as planned, cookies
      and analytics, who sees your data, privacy in peer review, what becomes
      permanently public, a retention table, rights and their two limits,
      security, children, changes

Privacy was written against the code, not against a template. Verified before
writing: no analytics or tracking scripts anywhere, no cookie set on the public
site, both Server Actions still `TODO(backend)` so form data is neither stored
nor transmitted, and `middleware.ts` auth is a disabled scaffold. Everything
not yet real is labelled "planned" on the page.

---

## Steps 11 – 22 — the application

### Step 11 — Auth ✅ (5 pages)

Forms and validation only. **Nothing authenticates anyone.** Every action
validates and returns; none creates an account, sends an email or sets a
session cookie. Each page carries a visible "Not live yet" notice saying so —
the alternative is a user concluding their own credentials were wrong.

| Page | Notes |
|---|---|
| Sign in | Carries `?next=` through for the eventual middleware redirect; only in-app paths are accepted, so it cannot become an open-redirect |
| Register | The largest form: name, email, institution, country, optional ORCID, intended role, password + confirm, policy consent, honeypot |
| Forgot password | Honeypot; the TODO notes the live version must not reveal whether an account exists |
| Reset password | Handles the missing-token case with its own screen rather than letting someone type a password twice before failing |
| Verify email | Three states off the query string: `?token=` (link followed), `?email=` (just registered), neither (landed directly) |

Supporting work: `loginSchema`, `registerSchema`, `forgotPasswordSchema`,
`resetPasswordSchema` and a shared `passwordSchema` in
`src/lib/validation/schemas.ts`, plus `passwordStrength()` — used by both the
schema and the meter so the two can never disagree. Shared pieces live in
`src/components/auth/auth-parts.tsx`: `AuthHeading`, `ScaffoldNotice`,
`SubmitButton`, and `PasswordField` (show/hide toggle, optional strength
meter). The `(auth)` layout was rebuilt to use the brand gradient and the real
tokens rather than the plain scaffold it shipped as.

**When the backend lands:** wire the five `TODO(backend)` sections in
`src/app/(auth)/actions.ts`, remove the five `ScaffoldNotice` blocks, and
uncomment the redirect in `middleware.ts`.

**Design revision (client feedback: the auth pages read as blank boxes).** The
`(auth)` layout is now a two-column split — form on the left, an
`AuthBrandPanel` on the right carrying the journal's identity and four true
claims (double-blind review, CC BY with no embargo, one portal, waivers).
The panel is `hidden lg:block`: on a phone the form is the whole job, so it is
dropped rather than stacked below. Register was also split into two labelled
sections ("About you", "Choose a password") because eight fields in one
unbroken run read as a wall, and institution/country now share a row on `sm`.

### `/submissions/new` — the "Submit Manuscript" button

That button sat in the site header pointing at a bare `Placeholder` stub, so
every visitor who clicked the most prominent call to action on the site landed
on an empty page. It is now a real page: it states plainly that online
submission is not available yet, gives the email route that does work today
(with the exact list of files the editorial office needs), links the three
pages that prevent most desk rejections, and notes that nothing is charged at
submission.

**Now two pages, one task, two audiences (both caught by the client).**

First round: the page had been built under `(dashboard)`, so clicking the site
header's most prominent button dropped a *logged-out visitor* into the
editorial portal — sidebar, editorial queue, user administration and all. It
was moved to `(marketing)`.

Second round: that fixed the visitor and broke the author. From inside the
portal, "New Submission" in the sidebar now threw a *signed-in author* out to a
public page, losing the sidebar mid-task. Moving one page back and forth cannot
satisfy both, because the two audiences need different shells.

So there are two pages:

| Route | Shell | For |
|---|---|---|
| `/for-authors/how-to-submit` | Site header/footer | Public visitors; the header's "Submit Manuscript" button and every marketing CTA point here |
| `/submissions/new` | Portal sidebar | Signed-in authors; the sidebar's "New Submission" and the dashboard panel point here |

They cannot share a URL — Next resolves one path to one route regardless of
group — hence the rename of the public one. Both explain the email route while
the wizard is unbuilt; the portal version also links back to `/submissions`.

The public page carries an "About accounts" section with Sign in and Create an
account buttons. Sending people straight to `/register` was considered and
rejected: it is the wrong page for someone who already has an account, it skips
the guidelines that prevent most desk rejections, and — with no wizard yet — an
account leads nowhere.

**When the wizard lands (phase 15):** `(dashboard)/submissions/new` creates a
draft and redirects to `/submissions/new/[draftId]/details`; its five step
routes are already stubbed. The public page can then send visitors to
`/login?next=/submissions/new`, which the login page already supports.

### Step 12 — The portal shell ✅

The shell every portal screen lives in: the authenticated layout, the role-aware
navigation, and the dashboard. Built against all 12 roles, not the three obvious
ones — the mock user in `current-user.ts` holds author + reviewer +
sectionEditor precisely so the multi-role case is the default while developing.

**Navigation is a function of permissions, not roles.** `getDashboardNav()`
already filtered on `Permission`, and the dashboard now does the same: each
panel declares one permission and appears if the user holds it. Adding a role
therefore requires no navigation change, and a user holding three roles sees
each area once rather than three overlapping dashboards.

What was fixed in the Step 0 scaffold:

- **The sidebar did not exist below `md`.** It was `hidden md:block` with no
  fallback, so on a phone the entire portal — every queue, every role's work —
  was unreachable. `DashboardSidebar` now renders a rail from `md` up and a
  drawer below it, both from one `NavSections` component so the two cannot
  drift. Desktop markup is unchanged.
- **The active nav link was invisible.** Active state was `bg-background` on a
  `bg-background` sidebar — white on white — and hover was the same white. Now
  `bg-brand-tint` with `text-brand-darker`, plus `aria-current="page"`.
- **`/submissions` lit up while on `/submissions/new`.** Both are separate nav
  items; prefix matching marked both active. `isActive()` is now shared and
  the mobile bar labels the deepest match.
- **Double page padding.** The layout applied `p-4 md:p-8` and then `PageShell`
  applied `container py-10` inside it. The layout no longer pads; portal pages
  use the new `PortalPage` instead.
- **Two nav items pointed at routes that did not exist** — `/admin/audit-log`
  and `/admin/integrations` both 404'd. Both are now real pages, guarded with
  `requireRoles(["superAdmin"])`, since `audit.view` and `platform.manage` are
  two of the four permissions deliberately withheld from `admin`.
- The topbar gained a working account menu (click-outside and Escape both
  close it), a "View site" link back to the journal, and the brand gradient on
  the mark. Sign-out links to `/login` rather than pretending to end a session
  that does not exist.
- The layout gained a skip-to-content link.

**`src/components/layout/portal-page.tsx` is the shell for the ~40 screens in
steps 13–21.** `PageShell` is the marketing wrapper: it centres a narrow
measure inside `container`. The portal sits inside a sidebar column and needs
the opposite — full column width, tighter padding, and a title row that takes
actions beside it and wraps them below on phones. Use `PortalPage` for portal
screens and leave `PageShell` to the public site.

The dashboard carries a visible "Portal preview" alert. Nothing is connected to
a backend, the user is a fixed placeholder, and no counts are shown — a
hard-coded "3 reviews due" is a claim the app cannot keep.

### Steps 13 – 21 — Portal screens (~40 pages)
The screens themselves, inside the shell above. All 40 routes already exist
under `(dashboard)` as `Placeholder` stubs, so no route needs creating — each
phase replaces stub bodies with real content.

**Forty stubs were split into 8 phases of 5; none remain.** Grouped so that each
phase shares one data shape and one user's job: the pattern is written once in
the phase that needs it first, then reused. `grep -rl Placeholder src/app
--include=page.tsx` is the live count — it should fall by 5 per phase and reach
0 at the end of phase 21.

Phases are ordered by dependency, not by page count. 13 and 14 come first
because every later phase reuses their table, status badge, filter bar and
empty state. The admin phases come last because they depend on nothing.

| Phase | Theme | Pages |
|---|---|---|
| **13** ✅ | **Author's own work** — establishes the list + detail + status pattern | `/submissions`, `/submissions/[id]`, `/submissions/[id]/revisions`, `/submissions/[id]/messages`, `/submissions/[id]/decision` |
| **14** ✅ | **Reviewer's work** — the review form is the first complex form | `/reviews`, `/reviews/[reviewId]`, `/profile`, `/profile/orcid`, `/profile/notifications` |
| **15** ✅ | **Submission wizard, part 1** — multi-step draft state | `/submissions/new/[draftId]/details`, `.../upload`, `.../metadata`, `.../contributors`, `.../declarations` |
| **16** ✅ | **Editorial queue and triage** — the first screens that see everyone's work | `/submissions/new/[draftId]/review`, `/editorial/queue`, `/editorial/[submissionId]`, `/editorial/[submissionId]/reviewers`, `/editorial/reviewers-db` |
| **17** ✅ | **Decisions and issues** — where editorial work is completed | `/editorial/[submissionId]/decision`, `/editorial/[submissionId]/production`, `/editorial/issues`, `/editorial/issues/[issueId]`, `/admin/doi` |
| **18** ✅ | **Production** — copyediting through to galleys | `/production`, `/production/[id]/copyedit`, `/production/[id]/galleys`, `/production/[id]/proofread`, `/admin/announcements` |
| **19** ✅ | **People and permissions** — `assignableRoles()` finally gets a UI | `/admin/users`, `/admin/roles`, `/admin/audit-log`, `/admin/integrations`, `/admin/statistics` |
| **20** ✅ | **Journal settings** — five sibling screens, one shared shell | `/admin/settings/journal`, `.../sections`, `.../review-forms`, `.../email-templates`, `.../policies` |

Phase 21 is held for the overflow every project of this size produces —
screens that turn out to need splitting, and a consistency pass across all 40
once they exist. If nothing overflows, it folds into Step 22.

**Before phase 13:** `src/lib/api/mock-data.ts` holds published articles, not
manuscripts in workflow. Phase 13 has to add submission fixtures (status,
dates, files, decision history) and phase 14 review fixtures. Every later phase
reads from those two, so getting their shape right matters more than the first
screens' looks.

### Step 22 — Final polish
Full accessibility pass, production build, metadata and Open Graph, sitemap,
404 and 500 pages, and removal of the development-only pages.

---

### Notes from the portal build

Everything below was written as each phase landed. Kept because the reasoning
is what a later change has to argue against, not because anything here is
outstanding — the phase headings say which are done.

**Fixed during step 12:** clicking an "On this page" link landed with the heading hidden
under the sticky header, so the reader arrived at a bare paragraph. `SiteHeader`
stacks three strips (~11rem tall) but the anchors only cleared `scroll-mt-28`
(7rem). There is now a single `--header-offset` token in `globals.css` used by
the prose headings, by a general `[id]` rule covering the section-per-heading
pages outside `.prose` (APC, indexing), and by the `DocPage` sticky rail's own
`top`. Smooth scrolling was enabled alongside it, under the existing
reduced-motion guard. Change the header height → change that one token.

**Responsive audit: passing at 57 pages, 0 findings.** `/dashboard` and
`/profile` were added to `scripts/responsive-audit.mjs` alongside the policy,
auth and `/submissions/new` routes. Keep it at 0.

### Phase 13 — the author's own work ✅

Five pages built; **35 stubs remain** (`grep -rl Placeholder src/app
--include=page.tsx`). What phase 13 established, and that later phases reuse:

**`Submission` types in `src/types/index.ts`.** Deliberately separate from
`Article`: an Article is what a Submission becomes, and almost every field
differs — a submission has a status, decision history and reviewer assignments;
it has no volume, issue, DOI or galleys until accepted. `SubmissionStatus` has
13 members, including `desk-rejected` as distinct from `rejected`, because a
desk rejection never reaches a reviewer and the author needs to see which
happened.

**`StatusBadge` (`src/components/portal/status-badge.tsx`).** One `Record<
SubmissionStatus, …>`, so adding a status without giving it a label is a type
error rather than a blank chip. Also exports `statusDescription()` for detail
headings and `AUTHOR_FILTER_STATUSES` for the filter bar.

**`src/lib/api/submissions.ts`.** Filtering, sorting and pagination live here,
not in the page, so the same rules survive the move to a real query. Page
numbers are clamped rather than 404'd — a stale bookmark to page 5 of a list
that has shrunk shows the last page. `reviewProgress()` counts only the current
round, since a reviewer who reported in round 1 has not reported for round 2.

**`src/lib/api/mock-submissions.ts`** — six manuscripts chosen to exercise the
screens rather than to look tidy: one awaiting revision with two decisions in
history, one mid-review with an overdue third reviewer, a brand-new submission
with no history at all, a desk rejection, an accepted paper in production, and
a withdrawal. Every branch the author pages render is covered by at least one.

**The list pattern** — `SubmissionFilters` is a plain GET form, so filtered
views are shareable URLs that work without JavaScript, matching the public
site. Cards below `md`, table from `md` up: a six-column table on a phone is
unreadable however it scrolls.

**The detail-with-tabs pattern** — `SubmissionHeader` + `SubmissionTabs`. Each
tab is a real route, not client state, so it can be linked from an email.
`/editorial/[id]` and `/production/[id]` are the same manuscript seen by a
different role and should reuse both components.

**Double-blind is enforced in the view.** `ReviewAssignment` carries both
`reviewerName` and a `label` ("Reviewer 2"); author-facing pages render only
the label. Phase 16's editorial screens are where `reviewerName` is allowed to
appear.

**Honest about what does not work.** Uploading, downloading and replying are
all absent rather than mocked — a download link that 404s is worse than none —
and each says so with the email route that does work today.

### Dashboard and wizard step 1 — rebuilt after client feedback

Two things the client rejected, both fairly:

**The dashboard was a grid of links.** Every tile pointed at another page, so
it repeated the sidebar and told the reader nothing. It now leads with counts
drawn from real data (`getAuthorStats`), then "Needs your attention" listing
the actual manuscripts awaiting a revision with their due dates, then recent
activity. Links are what the numbers are wrapped in, not the content. Sections
below the author's own work stay as links because phases 14 and 16 have not
produced their data yet — a hard-coded "4 reviews due" is a claim the app
cannot keep.

**`/submissions/new` was reading material, not a form.** It carried three
cards linking to the public author guidelines, which is the wrong thing to show
someone who has just clicked "New submission" inside the portal. It is now
wizard step 1 with real fields: article type (five radio cards with hints),
section, working title with a counter, and two eligibility checks. The guidance
that is genuinely useful survives as hints beside the fields.

**Two sidebar items lit up at once.** `/submissions` and `/submissions/new` are
separate nav entries, and the active test was a plain prefix match, so standing
on the child turned both blue. Phase 12's notes claimed this was fixed; the
comment was written but the logic never changed. `activeHref()` now resolves
one winner for the whole list — the longest matching route — so the child wins
on its own page and the parent still wins on `/submissions/[id]`, which has no
nav entry. Verified across seven route cases.

**Charts on the dashboard.** Two, both from the author's real data:

- **"Where your manuscripts are"** — a horizontal bar per stage of the process.
  Deliberately a **single hue**, with magnitude carried by bar length alone.
  Colour was tried first: three steps of the house hue (199°) fail the palette
  validator — pushed far enough apart to clear the normal-vision separation
  floor, the dark step falls out of the usable lightness band and reads grey.
  Since length already encodes the quantity, hue would have been decoration, so
  every bar is the same blue and each row prints its count. Nothing is
  colour-only. Empty stages stay listed rather than disappearing: "nothing under
  review" is information, and a chart whose rows come and go cannot be compared
  over time.
- **"Your turnaround so far"** — submission-to-first-decision and
  invitation-to-report, in days. Two numbers rather than a plot, because a
  handful of submissions has no distribution worth drawing. Each states what it
  is averaged over, and the card says plainly that it is the author's own
  history and not a journal-wide figure — the journal has not measured one, and
  publishing a number it cannot support would be the indexing-page mistake
  again.

Supporting work: `submissionStartSchema` and `ARTICLE_TYPES` in
`schemas.ts`, `startSubmission` in `(dashboard)/submissions/actions.ts`, and
`WizardSteps` — the six-step progress rail that phase 15's four remaining steps
will reuse.

**Why "under review elsewhere?" is asked on screen one** rather than at the
declarations step: a yes means the submission cannot proceed at all, and it is
better to find that out before uploading files.

The action validates and returns; no draft row is created, so there is no
`draftId` to redirect to. The success screen says exactly that and shows what
would have been saved, rather than sending the author to a step that cannot
load.

---

### Phase 14 — the reviewer's work ✅

Five pages; **30 stubs remain**.

**Double-blind is enforced by the type, not by each screen.** `ReviewTask` has
no `contributors` field, no author name, no title page — there is nowhere to
put one, so a reviewer screen cannot leak an identity by oversight. This is the
mirror of phase 13, where author-facing pages render `ReviewAssignment.label`
("Reviewer 2") and never `reviewerName`. The mock reviews are deliberately
*different manuscripts* from `mock-submissions.ts`: the fixed account holds both
`author` and `reviewer`, and a journal never sends someone their own paper.

**The form moved to its own route** (`/reviews/[reviewId]/submit`) after the
client asked whether it should be separate. It should, and this is what
Editorial Manager, ScholarOne and OJS all do — for practical reasons, not
aesthetic ones: a review takes hours and is written across sittings, so it
needs a URL that can be bookmarked and that a reminder email can link to; and
the task page is read by someone deciding whether to accept, or checking a
deadline, who should not scroll past a six-part form to reach the abstract. The
abstract and file list are repeated in the form page's sticky sidebar, so
nothing sends the reviewer back mid-sentence. The route redirects to the task
page unless the status is `accepted` or `overdue` — an invitation must be
accepted first, and a returned report cannot be edited.

**The review form** is the portal's first complex form:
six scored criteria, a recommendation, comments to author and to editor, an
ethics-concern box, and two declarations. Notes on it:

- Scores are 1–5 buttons where **the number is the label**, so a choice is
  never conveyed by highlight colour alone.
- `commentsToAuthor` has a 200-character floor. A two-line report helps nobody,
  and the reviewer ethics policy asks for specific, actionable comments.
- The two declarations — no competing interest, and **no generative AI** — are
  required. The AI one exists because an unpublished manuscript is
  confidential, and pasting it into a chatbot discloses it to a third party;
  the reviewer ethics policy already prohibits this, so the form asks.
- On a validation error the long text fields are echoed back. Losing a written
  review to a failed submit would be unforgivable.

**Declining opens a reason box** rather than firing immediately — a decline
naming a better-placed colleague is worth far more to an editor than a bare no.
It is never required; forcing an explanation only produces empty ones and slows
the honest "no time" that editors most need to hear.

**`DueDate`** says deadlines the way a reviewer reads them — "Due in 9 days",
"11 days overdue" — with the date alongside, since a relative phrase alone
cannot be put in a calendar. Colour is never the only signal.

**Profile** is three tabs reusing `SubmissionTabs`' construction. `/profile/orcid`
reuses `OrcidField` from the register form, so check-digit validation behaves
identically in both places, and states plainly that typing an iD is a claim, not
proof — the real flow signs in at orcid.org. `/profile/notifications` lists what
is **always sent** (decisions, revision requests, account security) rather than
letting someone believe they have silenced everything.

**The dashboard gained a real reviewer section** now that the data exists —
counts plus the actionable queue, replacing the placeholder link card.

---

### Phase 15 — the submission wizard ✅

Five routes; **25 stubs remain**.

**Draft state was the decision, and the answer was not to fake it.** A
client-side store keyed by `draftId` was considered and rejected: it would
survive a click and vanish on a refresh, which is worse than no persistence
because the author would not know which. So each step validates its own fields
and stops, and `WizardShell` puts the same standing notice on every screen —
*drafts are not saved yet, nothing carries to the next step*. Better to say
that on screen 2 than to let someone fill in five and discover it at the end.
When the backend lands, `startSubmission` creates the draft row and each step
writes to it; the `TODO(backend)` markers are in place.

| Step | Route | What it asks |
|---|---|---|
| 1 | `/submissions/new` | Type, section, title, two eligibility checks |
| 2 | `.../upload` | Manuscript, title page, supplementary, cover letter |
| 3 | `.../metadata` | Title, abstract, keywords, funding, competing interests |
| 4 | `.../contributors` | Authors in order, one corresponding |
| 5 | `.../declarations` | Five declarations, AI and data statements |

`.../details` is a `redirect()` to `/submissions/new` — step 1 is the screen
that would *create* the draft, so it has no `draftId` of its own, but the route
exists so a Back from step 2 cannot 404.

Notes on individual steps:

- **Files.** No upload endpoint exists, so the chosen filename is mirrored into
  a hidden field and the action checks a file *was* selected. Oversize files
  are caught client-side against `MAX_FILE_BYTES`. The `TODO(backend)` records
  what the real handler must do — including scanning the manuscript's document
  properties for author names, which is where anonymisation usually fails.
- **Metadata.** Keywords are a comma-separated field that renders the parsed
  result as chips underneath, so nobody discovers at submission that their four
  keywords were read as one. Competing interests cannot be blank: "None" is
  itself a declaration, and a blank field is ambiguous.
- **Authors.** Rows are indexed (`givenName-0`, `givenName-1`, …) rather than an
  array, because a plain form post has no array encoding and the portal's forms
  all work without JavaScript where they can. The action re-indexes errors so
  each row shows its own. Order is explicit with Up/Down controls — author
  order is a claim about contribution, so the list must not sort itself.
  Exactly one corresponding author is enforced; none and several are both
  errors.
- **Declarations.** Five separate checkboxes, not one "I agree to everything",
  because a single tick over five distinct claims is not a meaningful
  declaration and leaves no record of which was confirmed. Each links to the
  policy it comes from — all seven links verified against real routes. The AI
  field is worded as *disclosure, not permission*, matching the AI policy.

**`WizardSteps` now links completed steps** and leaves those ahead unlinked,
since a step opened out of order would start empty.

---

### Wizard step 6 — review and submit ✅

The wizard's final screen, finished ahead of the rest of phase 16 so the five
steps behind it lead somewhere. **21 stubs remain.**

**The summary is empty, and says so.** With no draft storage there is nothing
to gather from steps 1–5. Inventing plausible values would be worst on this
screen of all — a confirmation page is where someone reads least carefully, and
they would be confirming data that was never theirs. So each of the five rows
names its step, states it has nothing to show, and links back to it.

**The success state does not say "valid".** Every other step ends with a green
"this step is valid". This one cannot borrow that: an author who reaches the end
of a submission wizard and sees a green tick will believe their manuscript is
with the journal. `SubmitOutcome` leads with *Checked, but not submitted*, in
the warning tone rather than success, states that no manuscript ID was issued,
and then gives the email route that does work today.

**No manuscript ID is invented.** A number the editorial office cannot look up
is worse than none, because the author would quote it in correspondence.

`wizardSubmitSchema` asks only two confirmations — the summary is accurate, and
the author understands where this goes. Everything factual was validated on
steps 1–5; repeating it here would invite ticking past a summary already
stopped being read. The note to the editor is optional throughout.

The `TODO(backend)` in `submitSubmission` records the five things the real
handler must do — re-validate every step server-side (steps 2–5 are reachable
by URL, so the per-step checks are a courtesy, not a guarantee), move the draft
to `submitted` in one transaction, take the ID from a sequence rather than a
count, email the corresponding author a receipt, and redirect to
`/submissions/[id]`.

**Two audit-script bugs found while verifying this**, both pre-existing:

- `BP` did not include `xs`, this project's own 420px breakpoint. Any mobile fix
  written behind `xs:` — the documented way to fix mobile without touching
  desktop — was invisible to the script and reported as a finding.
- `fixed-column-template` fired even when a breakpoint-prefixed `grid-cols` sat
  on the same element, so a correctly responsive base value counted as a bug.

Both fixed, and the pipeline chart's label column now narrows below `xs`
(desktop unchanged). The five wizard step routes were added to the audit list:
**0 findings across 63 pages.**

---

### Phase 16 — editorial queue and triage ✅

Four screens; **20 stubs remain**. The first phase where a screen sees
*everyone's* work, so it is also where `reviewerName` finally renders.

**The routes are `[submissionId]`, not `[id]`.** Earlier revisions of this file
said `/editorial/[id]`; the scaffold had always used `[submissionId]`, matching
`/submissions/[submissionId]` and `/production/[submissionId]`. Next resolves
one dynamic segment name per level, so the two cannot coexist — the folder that
already held the phase 17 stubs won. The table above has been corrected.

**"Waiting on" is derived, not stored, and it is the point of the queue.** A
status says what stage a manuscript is at; it does not say whose desk it is
sitting on. A manuscript marked `under-review` with every report already in is
waiting on the *editor*, and an editor scanning a status column alone would
never see it. `waitingOn()` in `src/lib/api/editorial.ts` resolves this, and
`WaitingBadge` renders it beside `StatusBadge` rather than replacing it —
the two answer different questions and an editor needs both.

**The queue sorts by "waiting longest" by default, not newest.** A queue exists
to surface what has been ignored; newest-first buries exactly the manuscript
that most needs finding.

**Editors search by author name.** The one thing the author-facing list
deliberately cannot do. `listEditorialQueue` matches contributors as well as
reference, title and keywords.

**Drafts never appear.** `editorVisible()` filters them out at the data layer.
An author still filling in the wizard has not handed anything over, and an
editorial screen that showed it would be reading work that was never submitted.

**New fixtures, in a new file.** `mock-queue-submissions.ts` holds five
manuscripts owned by *other* authors — every row in `mock-submissions.ts` is
`mock-user`, and a queue showing one person's six manuscripts would not be a
queue. Kept separate rather than appended because the two answer different
questions: the author's list still reads only its own file. The five cover an
unassigned arrival two weeks old, a round with an overdue third reviewer, one
where every report is in and a decision is owed, a round-2 resubmission, and a
manuscript that arrived this morning.

**`mock-reviewers.ts` — eight reviewers chosen to make the editor choose.** A
fast reliable one, a slow and thorough one, one on fieldwork with a return date,
one the system marks overloaded, a new reviewer with no history, one who
declines most invitations, and one who has stopped answering them. `declined`
and `unanswered` are shown because an editor picking on turnaround alone would
invite the last two and lose a week hearing nothing.

**A reviewer with no completed review shows "—", never 0 days.** An absence of
history is not a fast record. `sortReviewers` also sinks those rows rather than
letting a null sort to the top of "fastest turnaround".

**Blocked reviewers are shown greyed with the reason, not hidden.** An editor
who cannot see that the obvious choice shares the author's department will keep
searching for them. Matching shows *which* keywords matched rather than a bare
score — on eight reviewers a hidden ranking would be trusted more than it
deserves.

**Conflict detection is honest about its limits.** Only a shared affiliation is
detected, and the page says so on screen: co-authorship, supervision and
reviewer-declared conflicts all need the backend.

Nothing on these screens changes anything — no invitation can be sent, no
assignment edited. Each screen says so and gives the email route that works
today. Verified separately: no reviewer name appears on any author-facing page.

**Reuse:** `PortalPage` for the two list screens; the detail screens use a plain
padded wrapper like `/submissions/[submissionId]`, because `EditorialHeader`
*is* their title block. `EditorialHeader` is a sibling of `SubmissionHeader`
rather than a rewrite of it — the author's version hard-wires
`/submissions/[id]` tabs and shows no author list, which is exactly what this
screen must show.

**Responsive audit: 0 findings across 67 pages** with the four editorial routes
added.

---

### Phase 17 — decisions and issues ✅

Five screens; **15 stubs remain**.

**The report bodies are not on `Submission`, and that is the point.**
`ReviewAssignment` records that a reviewer was asked and whether they answered;
it carries no report, because it is embedded in `Submission`, which
author-facing screens render. A report body sitting there would be one
careless `.map()` away from reaching the author before the decision letter
does. So `ReviewerReport` is its own type in `src/types`, its own fixture file
(`mock-reports.ts`), and is loaded only by `getReportsForSubmission` —
editorial-side functions that no author page calls. Verified by fetching
`/submissions/s5`, `/submissions/s5/decision`, `/reviews` and `/dashboard` and
grepping for all six reviewer names: none appears.

**The reports use `ReviewSubmissionBody` — the reviewer's own shape.** What the
editor reads is literally what the reviewer wrote, with no second
representation to drift. `ReviewerReportCard` renders from `REVIEW_CRITERIA`
and `REVIEW_RECOMMENDATIONS`, the same two lists the review form is built
from, so a criterion cannot be scored under one name and read back under
another.

**The fixtures make the editor choose.** On `q3` — the manuscript awaiting a
decision — Reviewer 1 recommends minor revision and Reviewer 2 rejects, and the
screen names the disagreement rather than leaving it to be noticed. An editor
whose reviewers always agree never has to exercise judgement, and a decision
screen that only handles agreement is not worth building.

**A missing report is shown as a missing report.** `getDecisionContext` returns
`missing` — assignments in the current round that never reported — listed under
"Still outstanding" with the reviewer's name and status. The queue's status
column cannot show this, and deciding without noticing is exactly the mistake
this screen exists to prevent. The warning sits *above* the decision radios,
not below: an editor who reads it after choosing has already made up their mind.

**Earlier rounds are dimmed, not hidden.** On a resubmission the question the
editor is really answering is whether the author did what round 1 asked, which
cannot be judged without round 1 on screen.

**Comments to the editor are labelled, not merely placed lower.** A
confidential note pasted into a decision letter by mistake is the failure that
label exists to prevent, and the "send the reports" checkbox says in its own
hint that they are never sent whether it is ticked or not.

**`availableDecisions()` is status-dependent.** Desk rejection is offered only
before review has begun — once a reviewer has read the manuscript the rejection
is no longer "desk", and recording it as one would misdescribe the process on
the author's own history. `decisionBlockedReason()` states *why* there is no
form when there is none, rather than leaving an editor to wonder if it broke.

**The outcome screen is not a green tick.** Same reasoning as the wizard's
final step, and stronger here: an editor who records a decision and sees
success will believe the author has been written to, and someone else's
manuscript is waiting on it. `DecisionOutcome` leads with *Checked, but not
recorded*, in the warning tone — and gives the letter back on screen, because
"nothing is saved" is only fair advice if the hour's writing is still there to
copy.

**Production is the handover, not the workspace.** `/editorial/[id]/production`
answers what an editor needs — has it reached production, which issue is it
going into, what was handed over — in five derived stages. Copyediting,
typesetting and proofreading collapse into one "in progress" stage because
`in-production` is the only status the data has; inventing three would be
precision the app does not hold. The workspaces themselves are phase 18.

**Issues are two types, deliberately.** `Issue` in `src/types` is the published
record the public archive reads. `EditorialIssue` is one being assembled: a
state, a target date that moves, and accepted manuscripts in a running order.
Making half of `Issue` optional would have blurred the two. A placement
pointing at a manuscript that cannot be found renders as a gap in the table of
contents rather than being dropped — a silently shortened TOC is the harder bug.

**"Accepted, not yet scheduled" is on both issue screens.** What is waiting is
as much a part of planning an issue as what is in it, and the author has
already been told their paper is accepted.

**`/admin/doi` is written against the journal's real state.** Every DOI in the
data begins `10.xxxxx` — a placeholder no registry issues — because BORJSS has
no Crossref prefix. So the page leads with that, and `hasCrossrefPrefix()`
derives it from the data rather than hard-coding false, so the banner
disappears by itself when real DOIs land. Every row is `not-deposited`; a mix
of registered and failed rows was considered and rejected, because an editor
reading "Registered" would quote a DOI to an author that does not resolve —
the indexing-page mistake again, and worse. The other three states exist in
`DepositState` and the screen renders all four; the data claims none of them.
Gated with `requireGroup("staff")`, not `superAdmin` — depositing is
journal-management work, not an audit-log-class power.

**The Server Action re-guards.** `/editorial/*` pages call
`requireGroup("editorial")`, but a Server Action is its own entry point and can
be invoked without the page that renders its form ever loading, so
`recordDecision` repeats the check rather than assuming it.

Supporting work: `ReviewerReport`, `EditorialIssue`, `IssuePlanItem`,
`IssueState`, `DoiRecord` and `DepositState` in `src/types`; `mock-reports.ts`
and `mock-issues.ts`; `getDecisionContext`, `availableDecisions`,
`decisionBlockedReason`, the issue functions and the DOI register in
`editorial.ts`; `DECISION_TYPES` and `decisionSchema` in `schemas.ts`;
`ReviewerReportCard` / `RecommendationBadge` and `DecisionForm` in
`src/components/portal/`.

**Responsive audit: 0 findings across 72 pages** with the five new routes
added.

---

### Phase 18 — production ✅

Five screens; **10 stubs remain**.

**The stage detail is a new type, not a bigger `SubmissionStatus`.** Phase 17
left this as the first decision to make, and the answer was `ProductionJob`
hanging off a submission by id. Splitting `SubmissionStatus` into copyedit /
galleys / proofread would have changed what every author-facing screen, every
filter and every badge renders — to serve three screens — and would have leaked
production's internal stages to authors, who have no use for them. One status
(`in-production`) is the right answer for the author and the editor; the
person doing the work reads `ProductionJob.stages`.

**`with-author` is a state, not a flag.** A stage sitting with the author is
production doing *nothing* while the clock runs, and it is the single most
common reason an issue slips. A progress bar cannot show it and a boolean
buried on `in-progress` would not be filterable. `productionWaitingOn()`
derives it, and `ProductionWaitingBadge` renders beside `StageBadge` — the
mirror of `WaitingBadge` next to `StatusBadge` on the editorial side, for the
same reason: what is happening and whose move it is are different questions.

**`currentStage()` is the first stage not *done*, not the first in progress.**
A job nobody has picked up has nothing in progress at all, and it is still *at*
copyediting. Returning null only when all three are done gives "ready to
publish" one unambiguous meaning.

**The queue ages jobs from whatever actually started the wait** — sent to the
author, stage started, or entering production for a job nobody has touched.
"Untouched for six weeks" is exactly what a production queue exists to surface,
and measuring from the stage start would have shown 0 days for it. Default sort
is "stalled longest", matching the editorial queue's reasoning.

**Proof corrections are tracked one by one.** The question at the end of
proofreading is never "is it done" but "which of these were actually applied" —
an author who reported five and sees three fixed writes to the editorial
office, and the answer has to exist somewhere. A declined correction keeps its
row *and* its reason; where a reason is missing the screen says so in the
warning tone rather than rendering an empty block, because the missing reason
is itself the thing to fix.

**Galleys are versioned, never replaced.** Every version is listed, newest
first, with the superseded ones dimmed. A correction produces a new version and
"which one did the author approve?" is unanswerable from a single overwritten
file. `ProductionGalley` is deliberately *not* the existing `Galley` type: that
one is what a published article offers a reader (label, URL, MIME type), and
this is the same file while it is still being made, where the fields that
matter are version and `isFinal`. The published `Galley` is created from the
final `ProductionGalley`.

**Missing JATS XML is called "Required — missing", not "Optional".** Its
absence is the usual reason a journal fails an indexing application, and the
typesetting screen says so even though none has been produced.

**Each stage screen states what it cannot do rather than mocking it.** No
tracked changes, no downloads, no upload, no "mark applied" button — there is
no file storage. A dead download link is worse than none, so galleys carry a
line saying they cannot be opened. The two order warnings (typesetting before
copyediting is approved, proofreading before there is a galley) are stated on
screen rather than implied by an empty list.

**The checklists are short on purpose.** Six items on copyediting and five on
proofreading — a twenty-point list is read once and then ignored. Proofreading's
last item is the one that matters most: a change that alters what the reviewers
accepted is refused at proof and offered as a post-publication correction.

**`/admin/announcements` manages all three post kinds, not announcements
alone.** `Post` already covers announcements, news and events under one shape
with one lifecycle; three near-identical admin screens would have been the
alternative. The one fact it adds that no public page can show is **expiry** —
a call for papers past its deadline vanishes from the public list, and whoever
wrote it needs to see that it has. Scheduled posts (dated in the future) are
called out for the same reason: they are already in the data and will appear on
their own.

Supporting work: `ProductionStage`, `StageState`, `ProductionStageRecord`,
`ProductionGalley`, `GalleyFormat`, `ProofCorrection` and `ProductionJob` in
`src/types`; `mock-production.ts` (three accepted manuscripts plus four jobs —
untouched, with-author, stalled at typesetting, and proofreading with open
corrections); `src/lib/api/production.ts`; `ProductionHeader`, `StageBadge` /
`ProductionWaitingBadge`, `StagePanel` and `ProductionFilters` in
`src/components/portal/`.

**Responsive audit: 0 findings across 78 pages** with the six new routes added.

**Note on verifying these screens:** the mock user holds `author + reviewer +
sectionEditor`, none of which is in the `production` role group, so
`/production/*` redirects to `/dashboard` in the browser. Verification was done
by temporarily adding `journalManager` to `current-user.ts`, running the audit
and route checks, then restoring the file. Do the same rather than leaving the
role widened.

---

### Phase 19 — people and permissions ✅

Five screens; **5 stubs remain**, all of them phase 20's settings forms.

**`assignableRoles()` is stated on screen, not applied silently.** The rule —
an ordinary `admin` cannot grant `admin` or `superAdmin` — was already in
`src/config/roles.ts` and enforced nowhere visible. Both the users screen and
the roles screen now name the roles the reader may *not* grant, and say why. A
dropdown that quietly omits `admin` teaches an administrator that the page is
broken; a sentence explaining that only a super administrator grants
administrator roles teaches them the rule.

**Verified against a real `admin`, not just described.** With the mock user
temporarily set to `["author", "reviewer", "admin"]`: the roles page reported
"You may grant 10 of the 12 roles" with Super Administrator and Administrator
marked *Not yours to grant*, and `/admin/audit-log` returned **307 → /dashboard**.
The `audit.view` restriction is a real guard, not a hidden link.

**The matrix is rendered from `PERMISSIONS`, never retyped.** A 12×16 grid that
cannot drift from what the app enforces: adding a permission to a role changes
the page. Both cell states are icons *with* text alternatives — a blank cell
reads as "not filled in" rather than "no". The grid scrolls inside its own
container, which is the one honest answer for a matrix this wide.

**The four withheld permissions get their own section, each with its reason.**
`roles.manageAdmins`, `audit.view`, `workflow.override`, `platform.manage` —
written out because a Super Administrator is not an administrator with more
switches, and without the reasons the separation reads as bureaucracy.
`audit.view` is the subtle one: an administrator must not be able to inspect,
and eventually curate, the log of their own actions.

**`UserAccount` is separate from `ReviewerProfile`.** The reviewer profile is a
*pool entry* — expertise, availability, turnaround — existing so an editor can
choose someone. An account is the login. Merging them would put review
turnaround on the screen where roles are granted. The fixture names are reused
from the existing data on purpose: the reviewers, the editors who signed
decision letters, and the copyeditor and typesetter from phase 18 all appear
as accounts, because at a real journal they are the same people.

**Suspended, not deleted, and explained.** A suspended account still owns
submissions and appears in the decision history of manuscripts it touched, so
deleting it would break the record. Every suspension carries a stated reason,
and the users screen has a short section saying why the account is kept.
`invited` is a third status with **no `lastActiveAt` at all** — the table prints
"Never", not a dash, because a dash reads as missing data rather than as a fact.

**The audit log leads with the admission that it is fabricated.** Nothing on
this platform records anything, and an audit log is the one screen where a
convincing invention is worst — it is consulted precisely when someone is not
trusted. The warning sits above the table, in the warning tone. The rows are
kept because the shape is the specification, and a section below records the
five properties the real log must have: append-only, actor stored as id *and*
name, reads recorded as well as writes, and a stated retention period.

**Integrations renders no credential fields at all.** A form that looks like it
stores a secret and does not is the worst thing that screen could contain —
someone would paste a live Crossref key into it. Instead, six services with
what each one's absence *actually costs*, each linking to where that cost is
already visible: the DOI register, the ORCID profile note, the plagiarism
policy, the privacy policy, the indexing page. The Crossref line is derived
from `hasCrossrefPrefix()` rather than asserted, so it stops claiming "no
prefix" on its own once real DOIs land.

**Statistics reports only what the data holds.** These are the numbers a
journal quotes in a DOAJ application, so an invented one is a false statement
to an indexing service. What is counted: submissions by outcome, acceptance
rate, median time to first decision, counts by section and type. What is
**not** measured gets its own section rather than being omitted — views,
downloads, geography, citations — because a statistics page that simply leaves
out downloads invites the reader to assume the number is zero, when it was
never collected.

Three calculation decisions worth keeping:

- **Drafts are excluded everywhere.** An author still in the wizard has not
  submitted anything; counting them inflates the total and the acceptance
  rate's denominator.
- **The acceptance rate's denominator is decided manuscripts only.** Including
  those still under review would report a rate that falls every time a new
  submission arrives — not a fact about the journal. It is `null`, rendered
  "—", when nothing has been decided: a rate over an empty denominator is not
  0%, and 0% would say the journal rejects everything.
- **Turnaround is a median with the range printed beside it.** On a handful of
  manuscripts one slow outlier drags a mean somewhere no manuscript ever was.
  The sample size is always stated.

**It is deliberately not a chart page.** Fourteen manuscripts across five
sections is a set of counts; a pie chart over it would be decoration standing
in for data. The one place a shape helps — relative section size — is a
single-hue bar whose length carries the magnitude with the count printed
beside it, so nothing is conveyed by colour. Same reasoning as the phase 13
dashboard chart.

Supporting work: `AccountStatus`, `UserAccount` and `AuditEntry` in
`src/types` (which now imports `Role` from the config, so the role list and its
permission matrix stay one thing); `mock-users.ts`; `src/lib/api/admin.ts`;
`UserFilters` in `src/components/portal/`.

**Responsive audit: 0 findings across 83 pages** with the five new routes added.

**Verifying these screens** needs a wider mock user, as in phase 18: three of
the five are `adminOnly` and two are `superAdmin`-only. Set `current-user.ts`
to include `superAdmin`, run the checks, then restore it — and check the
`admin` case too, since that is the one `assignableRoles()` actually
constrains.

---

### Phase 20 — journal settings ✅

Five screens; **0 stubs remain.** Every route in the application is now built.

**A shared shell first, as with the policies.** `settings-page.tsx` holds the
five-tab rail, `SettingRow` and `SourceNote`, so adding a sixth settings screen
is a line in one array rather than a sixth copy of the layout. The rail is
horizontal, not a second sidebar: the portal already sits inside one, and a
nested vertical nav on a phone would be two columns of links before any content.

**Every screen ends with `SourceNote` — which file holds these values.** None
of the five can save anything, so the useful thing they can tell an
administrator is where the switch actually is. Without that, a read-only
settings page is a form that silently does nothing.

**Journal settings leads with what is *not* set.** Six fields are empty or
placeholder — ISSN, e-ISSN, the Crossref prefix, a postal address still
containing a literal `[city]`, no telephone, no social accounts — and the first
three block a DOAJ application. Those gaps are invisible in a config file until
someone goes looking, and surfacing them is the entire reason this screen beats
a link to `site.config.ts`. `SettingRow` states an unset value ("Not assigned
yet") rather than rendering a blank, which would read as "not loaded".

**The sections screen found a real defect on its first run.** Manuscripts are
filed under **"Gender Studies"**, which is not one of the ten subject areas on
the public aims & scope page — the declared name is **"Gender & Development"**.
A submission's `section` is a plain string with no registry behind it, so
nothing prevented it. Two names for one subject area split its queue filter in
half and split its statistics. The screen lists undeclared names in place,
marked, rather than filtering them out — hiding them is how the drift survives.
**This is a live data bug worth fixing:** reconcile the fixture names, and make
sections a real registry (name, slug, active flag, referenced by id) when the
backend lands, which is what makes the warning impossible rather than merely
visible.

**Review forms is not a form builder, and says why.** Phase 14's notes
anticipated this screen editing `REVIEW_CRITERIA`; writing it, the honest
answer turned out narrower. The criteria are not just questions — they are the
axis every returned report is scored on. Adding or removing one mid-life leaves
old and new reports incomparable, and an editor reading two reports at a
decision would be comparing different instruments without being told. A real
editor needs **versioning** before it needs a drag handle: a report stores which
form version produced it, old versions stay readable, and a review in progress
finishes on the form it started on. Until that exists, editing the list is a
code change and a deploy — slow, and safe.

**Email templates is a specification, like the audit log.** No mail provider,
no template file, nothing sent. What the screen can do is enumerate the
**15 messages the portal has already promised elsewhere** — every
`TODO(backend)` that says "email the author" — grouped by area, each naming
where the promise was made and linking to it. Six are marked as having **no
manual alternative**: a decision letter can be sent by hand from the editorial
office, a password reset cannot. Those six gate the launch rather than merely
slowing it. A closing section records the six things the real templates must
get right, including the one that loses reviewers — reminders must stop when
the thing is done.

**Policy pages: the list and the review clock, not an editor.** Each policy is
a React component with its prose inline, which is what makes the pages
typechecked, their links build-verified, and a change reviewable as a diff. The
cost is that they cannot be edited here, and for an editorial policy that is
the right trade — a policy is a commitment to authors and should be harder to
change than a notice. What the screen gives instead is what an editorial board
actually needs between rewrites: all seventeen, the months since review
computed from the date, a stated 24-month interval, and a five-step checklist
for changing one — which begins with "check what else says it", because
licensing, copyright, open access and the APC page all state the same facts.

**The one duplication this screen used to carry is gone (2026-09-14).** The
review date lived in each policy page as `updated=` *and* again as a constant
on this screen, so a policy revised in its own file left the settings screen
reporting the old date. It is now a `reviewedAt` field on the `POLICIES` array
and nowhere else: `PolicyPage` takes no `updated` prop at all and reads
`policyReviewedAt(slug)` instead, which is what made the typechecker find every
page still passing one. The screen shows per-policy dates and takes its
headline figure from the *oldest* policy — an average would hide the single
forgotten policy the figure exists to surface.

Supporting work: `settings-page.tsx` (`SettingsPage`, `SETTINGS_TABS`,
`SettingRow`, `SourceNote`) in `src/components/layout/`.

**Responsive audit: 0 findings across 88 pages** with the five new routes
added. A pre-existing lint error in `/editorial/[submissionId]/reviewers` (an
unescaped apostrophe) was fixed at the same time; `next lint` is now clean.

---

## Step 22 — final polish ✅

The last step. All 93 routes were built; `/kitchen-sink` was deleted, leaving
**92**.

**`/kitchen-sink` is gone.** Nothing linked to it — checked before deleting —
and it was removed from the responsive audit's page list at the same time.

**A second audit script now exists: `scripts/a11y-audit.mjs`.** The sibling of
the responsive audit, and it works the same way: fetch every page and check the
rendered HTML for the defects that are structural rather than visual. It reads
its page list *out of* `responsive-audit.mjs` rather than keeping a copy, so
the two cannot drift. What it checks: one `<h1>` per page and no skipped
heading level, a single `<main>`, `<html lang>`, alt on every image, a label on
every control, an accessible name on every button and link, no positive
tabindex, and a caption on every table. It cannot check contrast, focus
visibility or reading order — those need a browser and a person; the contrast
table in `CLAUDE.md` is the standing answer for colour.

**It found 25 real findings on its first run, in four groups. All fixed:**

1. **Password fields were unlabelled.** `PasswordField` passed `htmlFor={name}`
   to `Field`, which renders `<label for="password">`, but never gave the
   `Input` a matching `id` — so the label pointed at nothing and the control was
   unlabelled to a screen reader. One line, and it fixed six pages.
2. **The five auth pages had no `<main>`.** The marketing and portal layouts
   both have one; `(auth)/layout.tsx` used a plain `<div>`, so there was no
   landmark to skip to on the pages where a form is the entire content.
3. **Six tables had no caption.** Fixed at the component: `Table` now takes a
   **required** `caption` prop, rendered `sr-only` by default since every one of
   these already sits under a heading that names it on screen. Required, not
   optional, so a new table cannot ship without one. All seven call sites were
   given a caption describing their columns.
4. **Two heading skips.** `/articles` went h1 → h3 because the card headings had
   no region heading above them; the result count is now an `h2`, styled as body
   text — the level is structure, not size. The proofread screen had an h4 in a
   correction card sitting under an h2.

One finding was a **script bug, not a page bug**: a control wrapped directly
inside its own `<label>` is properly labelled, and the checkbox and radio card
patterns are built that way. The script now tracks label element ranges and
recognises it.

**Result: 0 findings across 87 pages,** and the responsive audit still 0.

**`robots.ts` had a real defect.** It disallowed `/dashboard` only — but
`(dashboard)` is a route group and contributes nothing to the URL, so the other
42 portal screens sat at seven different top-level paths and were all
crawlable. It now disallows all seven, plus the five auth routes: a sign-in form
has no reason to be indexed, and `/reset-password?token=` and
`/verify-email?token=` carry single-use credentials in the query string. The
seven paths match `src/middleware.ts`'s matcher exactly.

**`sitemap.ts` was missing pages and then emitting duplicates.** It walked
`mainNav` plus articles and issues, which missed every announcement, news and
event *detail* page — the nav carries only the three listing pages — and
`/search`. Adding the posts and the `POLICIES` array then produced each policy
twice, since they are in the nav as well; a dedupe pass on the whole list fixed
it. **58 unique URLs, 0 duplicates,** and no portal or auth path in it.

**`noindex` on the portal and the auth pages.** The root layout sets
`index: true` for the public site, and that was inherited by all 48 non-public
routes. Both layouts now override it. This does a different job from
`robots.txt`: robots asks a crawler not to *fetch*, the meta tag asks it not to
*index* a page it reached another way. Neither substitutes for the auth that has
to come — they are the part that can be done today.

**A Twitter card was added,** as `summary` rather than `summary_large_image`,
because no OG image exists anywhere; claiming the large-image card would render
a broken share preview.

**The production build passes: 98 static pages, no warnings.** Run with
`BORJSS_DIST_SUFFIX=check`, never unsuffixed. Both schema suites pass — 19 and
37.

**Correcting an earlier note in this file:** step 22's original list said
"404 and 500 pages — neither exists" and implied there was no middleware.
Both were wrong. `not-found.tsx`, `error.tsx`, `global-error.tsx`, `sitemap.ts`
and `robots.ts` were all already present, and `src/middleware.ts` exists with
its redirect deliberately commented out. They needed checking, not creating.

---

## Backend progress

Follows `docs/BACKEND-PLAN.md`'s phases. This section is the log of what has
actually landed; BACKEND-PLAN.md stays the design document and is not
rewritten as work completes.

### Moved to Supabase ✅ (2026-09-08)

Development ran against a local PostgreSQL 18 while there was no Supabase
account. There is one now, and the database is on it: **PostgreSQL 17.6 in
`ap-southeast-2` (Sydney)**, all four migrations applied with
`prisma migrate deploy`, and seeded. Verified by reading back through the
pooler — 39 users, 18 submissions, 10 sections, 20 review assignments, 7
reports, 7 articles, 10 posts, 2 issues, 8 audit entries — and by loading the
site against it: the public pages, `/admin/users` and `/editorial/queue` all
render real rows. The "Gender & Development" fix survived the move.

It was, as predicted, a two-line env change — `DATABASE_URL` and `DIRECT_URL`
in `.env.local`. **One thing did need a code change**, and it will bite anyone
seeding a remote database again:

> `prisma/seed.ts` wraps ~1000 inserts in one transaction and passed only
> `{ timeout: 60_000 }`. Against Supabase it failed with **"Unable to start a
> transaction in the given time" (P2028)** — note *start*, not finish: that is
> `maxWait`, which defaults to 2 seconds and is the time Prisma waits to
> *acquire* a connection. Fine on localhost, not fine to Sydney. Now
> `{ maxWait: 60_000, timeout: 240_000 }`.

The local database still exists and both old connection strings are commented in
`.env.local`, so falling back is a two-line edit if Supabase is ever
unreachable mid-session. **Switch both or neither** — a Supabase `DATABASE_URL`
beside a local `DIRECT_URL` would read one database and migrate the other.

**Still not done:** Supabase *Auth*. This is the database move only —
`getCurrentUser()` still returns a demo identity and nothing checks a password.

### Phase 1 — Foundation ✅ (originally on local Postgres)

No Supabase account exists yet. Development runs against a **local
PostgreSQL 18** instance instead — `prisma.config.ts` and `src/lib/db.ts` read
`DATABASE_URL`/`DIRECT_URL` from `.env.local` exactly as they would a Supabase
connection string, so moving to Supabase later is a two-line env change, not a
code change.

- `prisma/schema.prisma` (843 lines, ~27 models) migrated: `npx prisma migrate
  dev` created 28 tables in the local `borjss` database.
- Both schema decisions from BACKEND-PLAN.md are in the schema and confirmed
  live in the seeded data: `Section` is a registry table (`Submission.sectionId`
  is a foreign key), and `ReviewForm` is versioned (every seeded
  `ReviewerReport` points at `ReviewForm` v1).
- `prisma/seed.ts` (~1000 lines) loads every `src/lib/api/mock-*.ts` fixture
  into the database, mapping each short mock id (`"s1"`, `"u4"`, ...) to a
  deterministic UUID so re-seeding is idempotent. Both known data defects were
  fixed on the way in: "Gender Studies" now resolves to "Gender & Development",
  and the ten canonical sections come from `/about/aims-scope`, not the
  fixtures.
- One seeding gap found and fixed after the fact: `mock-reviews.ts` (the fixed
  user's own review tasks, `rv1`–`rv4`) was never imported into `seed.ts`, so
  `/reviews` had no data even after phase 1 "completed". Added as its own step
  in `seed.ts` — four synthetic submissions, `u4` as sole reviewer, and the
  one returned report.
- **Verified directly against the database with `psql`, not by trusting a
  report** — row counts for every major table, the section list, and the
  fixed Gender & Development drift were all checked by query, not assumed.

### Phase 2 — Auth: only the identity swap done, not auth itself

`getCurrentUser()` (`src/lib/auth/current-user.ts`) now reads the current
user's row from the database (keyed by the same email each demo identity
always used) instead of returning a hardcoded object. **This is not
authentication** — the demo-role cookie system, `isDemoMode()`, and the
credential-free sign-in on `/login` are all unchanged. Nothing checks a
password or sets a real session. The rest of phase 2 (Supabase Auth, the
`middleware.ts` redirect, deleting the demo door) has not started.

### Phase 3 — Reading: complete, 6 of 6 files done

| File | Status |
|---|---|
| `submissions.ts` | ✅ Rewired — author's own list, detail, revisions, messages, decisions |
| `reviews.ts` | ✅ Rewired — reviewer's own tasks, double-blind preserved |
| `editorial.ts` | ✅ Rewired — queue, waiting-on logic, reviewer directory, decisions, issues, DOI register |
| `production.ts` | ✅ Rewired — production queue, stage/waiting-on logic, stage screens, galleys, proof corrections |
| `admin.ts` | ✅ Rewired — account directory, roles matrix counts, audit log, journal statistics, turnaround |

**This phase covered the portal only, and that distinction was never written
down until 2026-09-16.** All 52 portal pages read Postgres; nine *public* pages
were still on `src/lib/api/mock-data.ts`, which was harmless while nothing wrote
articles or issues and stopped being harmless the moment issue planning landed —
an editor could assemble an issue the public archive could never show.

**All nine were wired the same day**, in the three stages
`docs/PUBLIC-SITE-WIRING.md` records: issues and board members first (no
migration), then `20260916120000_article_contributors` to give a published
article its own byline, then the articles themselves. **No page under `src/`
imports a fixture any more** — `mock-*.ts` is read only by `prisma/seed.ts`.

Two things that only showed up in the doing, both recorded in full in that file:
the seed had never written `BoardMember.sortOrder`, so ordering by it would have
returned the board in any order at all; and a `publishedAt <= now` filter on
articles had to be taken back out, because the seeded Vol. 1 No. 2 carries a
cover date of 2026-12-31 and the filter emptied its table of contents while the
issue went on being listed.

Each rewired file was verified the same way: `npm run typecheck`, a suffixed
dev server (`BORJSS_DIST_SUFFIX=check`, port 3100, never the unsuffixed
server) hit with real routes and checked for real database content (not just
a 200), `next lint`, and — after `editorial.ts` and again after
`production.ts` — both structural audits re-run against the full site
(0 findings across 94 pages, both).

**`production.ts` — what the rewrite had to reconcile.** The pure functions
(`currentStage`, `productionWaitingOn`, `stalledDays`, `sortJobs`, the queue
filter) were left untouched — they operate on an already-mapped
`ProductionJob` and the mapper feeds them the same shape the mock data did.
Only the loaders changed, and three mismatches between the mock `ProductionJob`
and the schema had to be bridged in the mapper:

1. **The manuscript is loaded through `editorial.ts`.** `getProductionSubmission`
   now delegates to `getEditorialSubmissionById`, so a production screen renders
   the identical `Submission` the editorial and author screens do — same
   double-blind mapping, same section-registry fix — rather than a second
   mapper that could drift.
2. **`ProductionGalley` has no `label` or `filename` column.** The schema keeps
   `storagePath`, `format`, `version`, `isFinal`; the type wants a label and a
   filename. Label is derived from `format` (the stage screens carry their own
   `FORMAT_LABEL` anyway, so this only has to be present), and the filename is
   recovered as the basename of `storagePath` — which the seed built from the
   filename, so the round-trip is exact.
3. **`ProofCorrection` is stored flatter than the type.** The `description`
   column holds `"{location}: {rest}"` (seed's doing) and is split back apart;
   one `applied` boolean plus an optional `declinedReason` becomes the
   three-value `state` (`applied` / `rejected` / `open`); `resolution` is
   `declinedReason`. `raisedBy` is **not stored** — it defaults to `"author"`,
   the common case and the only value the screen distinguishes for tone. When
   the write path lands (phase 4) the column should be added rather than left
   guessed.

`daysSince` (exported, used by `stalledDays`) and `targetDate` are the other
denormalisation: the mock job carried `reference`, `title` and `targetDate`
inline; the schema puts `reference`/`title` on `Submission` and `targetDate`
on `EditorialIssue`, all joined in by the mapper.

**Audit script fix, same as the editorial one.** `scripts/responsive-audit.mjs`
had the four production routes hard-coded to pre-database mock ids (`s5`, `p1`,
`p3`) — now non-UUIDs, so `production.ts` 404s them and the audit was silently
skipping them. Re-derived each as a real seeded submission id with the matching
state (proofreading with open corrections; a stage with the author; nothing
started) and swapped them in, with a comment on how to re-derive after a
reseed. `a11y-audit.mjs` reads its list from the responsive audit, so it needed
no change.

**Two defects found and fixed while rewiring, both real:**

1. **Prisma's generated enums are camelCase; `src/types` is kebab-case.**
   `@map("kebab-case")` in the schema only renames the database column, not
   the TypeScript enum the client generates (`deskReview`, not
   `"desk-review"`). Every rewired file now converts both directions with a
   small `camelToKebab`/`kebabToCamel` helper — silently trusting one string
   union for the other would have been a runtime bug typecheck could not
   catch on its own (the two happen to overlap for several enum values,
   which is what let it pass a first pass unnoticed).
2. **A non-UUID id crashed the page instead of 404ing.** Every id column is
   `@db.Uuid`, but old mock ids (`"s1"`, `"rv4"`) are still reachable from
   browser history and hard-coded links written before this phase. Passing one
   straight to `findUnique` threw a Postgres syntax error instead of returning
   `null`. Fixed with `isUuid()` in `src/lib/db.ts`, checked before every
   lookup-by-id — confirmed old ids now 404 cleanly and real ids still 200.

**A related fix in the test tooling:** `scripts/responsive-audit.mjs` had four
routes hard-coded to pre-database mock ids (`q2`, `q3`, `s5`'s editorial
routes, `ei3`) chosen to exercise specific fixture states (an overdue
reviewer, disagreeing reviewers, an in-production manuscript, a still-planned
issue). Re-derived each as a real database id with the matching state via
`psql` and swapped them in, with a comment on how to re-derive them again
after a reseed. `scripts/a11y-audit.mjs` needed no change — it reads its page
list from the responsive audit.

**Operational note for whoever runs the audits next:** running both
structural audits back-to-back against the local dev server hung it twice
(Postgres connection pressure from 94 pages fetched in quick succession, most
likely) — each time recovered by killing the process and restarting with a
clean `.next-build-check`. Give the server a few seconds between the two
audits rather than chaining them immediately.

**`admin.ts` — the last reader, rewired.** Same pattern as the four before it:
signatures unchanged, `isUuid()` before every lookup-by-id, `camelToKebab` for
the one enum that needs it (`ArticleType`, in the statistics breakdown —
`Role` and `AccountStatus` carry no `@map()` so they pass through). What the
rewrite had to reconcile:

1. **`roleHolderCounts()` and `auditActions()` had to become `async`.** They
   were synchronous helpers reading a mock array; a database query is not. Both
   call sites (`/admin/roles`, `/admin/audit-log`) are already `async`
   components and now `await` them. No other signature changed.
2. **The audit log's `target` was being dropped on seed.** `mock-users.ts`
   names each entry's target as a human label ("BORJSS-2026-0068",
   "Dr. Ayesha Khan"), but `seed.ts` was writing `targetId: null` and only
   keeping `detail`. `AuditEntry.targetType`/`targetId` in the schema expect a
   typed reference the mock data does not have. Fixed by storing the label in
   `targetId` and mapping it back in `toAuditEntry` — the seed was re-run.
   When the write path lands, audit entries should carry a real `targetType` +
   UUID `targetId` and this mapping can tighten.
3. **`/admin/users` now lists every seeded account, ~39 of them.** The mock
   directory was 14 hand-written accounts; the seed also creates an account for
   every reviewer in `mock-reviewers.ts` and a synthetic `author-N` account for
   every `submittedById` in the queue/production fixtures. Some of those have
   placeholder names ("Corresponding Author (withheld)") and there are a couple
   of near-duplicates. This matches how `editorial.ts` shows every seeded
   submission rather than a curated subset — it is real data, not a fixture
   list — but the synthetic accounts could be given better names in `seed.ts`
   if the screen needs to look tidier.

**Audit-script fix, as with editorial and production.**
`scripts/responsive-audit.mjs` had `/admin/users/u1` and `/admin/users/u1/edit`
hard-coded — now non-UUIDs, so `admin.ts` 404s them and the audit was skipping
them. Swapped in the real seeded UUID for mock id `u1` (Dr. Mubashir Quddus, a
multi-role account), with a comment on re-deriving it. `a11y-audit.mjs` reads
its list from the responsive audit, so it needed no change.

**Verified:** `npm run typecheck`, `next lint`, a suffixed dev server on port
3100 with `/admin/users`, `/admin/roles`, `/admin/audit-log` and
`/admin/statistics` all showing real database content (a non-UUID id 404s
cleanly; the `admin` role still 307s away from `/admin/audit-log`), and both
structural audits re-run — **0 findings across 94 pages, both.**

### Phase 4 — Writing: started with the two public forms

The two forms a signed-out visitor can submit now persist. Everything else
(the wizard, reviews, editorial, profile, admin CRUD, auth) still
validates-and-returns.

| Form | Action | Lands in |
|---|---|---|
| `/contact` | `submitContact` | `ContactMessage` (`handledAt` null until worked) |
| `/for-reviewers/become-a-reviewer` | `submitReviewerApplication` | `ReviewerApplication` (`status` = `pending`) |

**Schema.** Two new models plus their enums, added at the end of
`schema.prisma` under a `PUBLIC FORMS` heading; migration
`20260907083643_public_form_submissions`. Nothing existing was touched. Design
notes on the models:

- `ContactTopic` mirrors `CONTACT_TOPICS` in `schemas.ts` exactly (`submission`,
  `review`, `editorial`, `technical`, `charges`, `permissions`, `other`).
- `ReviewerApplicationDegree` needs the kebab→camel map (`doctoral-candidate` →
  `doctoralCandidate`); the action carries a small `DEGREE` lookup for it. The
  other three values are identical in both.
- `ReviewerApplication` is deliberately **not** a `ReviewerProfile` and **not**
  a `User` — it is the raw application, worked by hand, and becomes a profile
  only if accepted. That accept-flow is not built; applications sit at
  `pending`.

**What is still missing for these two forms** (both known, both out of scope
here):

1. **No email.** Neither the sender's confirmation nor the office's
   notification is sent — there is no mail provider (Phase 6). The on-screen
   notices on both pages still say the message is not delivered, and stay until
   that is true. There is also no in-portal *reply* — the office reads the
   address on each row and replies from its own mailbox.

### Phase 4 — the two admin queues for those forms

Built straight after, so the rows the public forms write have somewhere to be
read and worked:

| Screen | Reads | Actions |
|---|---|---|
| `/admin/messages` | `ContactMessage` | Mark handled / reopen (sets `handledAt`) |
| `/admin/reviewer-applications` | `ReviewerApplication` | Accept / decline / reopen (sets `status`) |

- **Guard:** `requireGroup("adminOnly")` on the page (superAdmin + admin +
  journalManager) and again in every action — a Server Action is its own entry
  point, the `recordDecision` pattern. Nav entries gate on `users.manage`, the
  same permission, so the two lists appear for exactly that set.
- **`src/lib/api/inbox.ts`** — the read side: list + filter + counts for both,
  plus `contactMessageExists` / `reviewerApplicationExists` for the actions to
  guard on. No enum conversion needed — `ContactTopic` and the
  reviewer-application enums carry no `@map()`.
- **`src/lib/api/audit.ts` — `recordAudit()`, the first real writer of
  `AuditEntry`.** Every one of these four actions writes an entry
  (`message.handled`, `reviewer-application.accepted`, …). `actorId` is stored
  only when `getCurrentUser()` returns a real UUID — the mock fallback id
  (`"mock-user"`) would violate the `@db.Uuid` column, so those rows keep just
  `actorName`. Verified end-to-end: a POST to each action updated the row *and*
  left an audit entry naming the acting demo identity.
- **Accept does not create an account.** Turning an accepted application into a
  `ReviewerProfile` + `User` needs the accounts system, which is not built, so
  Accept sets `status` and nothing more — the screen says so in an alert rather
  than implying a profile now exists.
- **Responsive audit list** gained both routes; one real finding fixed —
  `/admin/messages`'s three-up stat row did not collapse on a small phone, now
  `grid-cols-1 xs:grid-cols-3`. Both structural audits: **0 findings across 96
  pages.**

**Still no email** — see point 1 above. Both screens tell the reader to reply
from their own mailbox.

**Honeypot and validation unchanged.** A filled `website` field still reports
success and writes nothing; a failed Zod parse still echoes the form back
without persisting.

**`/policies/privacy` was corrected.** It stated the contact and
reviewer-application forms store nothing — three places (the "what this site
does today" list and two rows of the collection table). All three now say the
forms *are* stored for the editorial office but that no email is sent yet. The
retention table already covered both ("Enquiries and correspondence — 2
years", "Reviewer records — until you ask to be removed"), so it was left.

**Verified:** `npm run typecheck`, `next lint`, a direct round-trip test
against both tables (insert with the exact shape each action builds, enum
mapping, defaults, array columns, delete), both form pages still 200, and both
structural audits — **0 findings across 94 pages, both.**

### Phase 4 — editorial actions (`(dashboard)/editorial/actions.ts`)

The editor's decision and reviewer-assignment actions now write. No email from
any of them — the decision letter, the reviewer invitation, and the
"a decision was reached" notice all need a mail provider (Phase 6), so the
screens say the message goes out from the office by hand and these actions
only move the database.

**Schema migration** `20260907114520_editorial_decision_and_withdrawn` — both
additive, nothing existing touched:

- `AssignmentStatus.withdrawn` — a pulled invitation is kept and greyed, not
  deleted, so the next editor sees the reviewer was approached and released.
  Chosen over a row delete because this schema keeps history everywhere
  (append-only decisions, suspended-not-deleted accounts, versioned galleys).
- `SubmissionDecision.internalNote` — `decisionSchema` already collected it and
  there was nowhere to put it.

**`recordDecision` — rewritten to persist.** One `db.$transaction`: create the
`SubmissionDecision` (type via `kebabToCamel`, letter split into paragraphs on
blank lines, `internalNote`), then move `Submission.status`
(accept → `accepted`; minor/major → `revisionRequested` with `revisionDueAt`
at +42 days and `round` incremented; reject → `rejected`; desk-reject →
`deskRejected`). The status move and the decision row land together or not at
all — a half-recorded decision would leave the queue lying about whose desk
the manuscript is on. Re-guards server-side: `requireGroup("editorial")`,
`decisionBlockedReason`, and `availableDecisions` (the form posts straight to
the action). Writes an audit entry. The outcome screen changed from *Checked,
but not recorded* to *Decision recorded* — but still leads with **the author
has not been emailed** and gives the letter back to copy into that email.

**`inviteReviewer` (new).** Creates a `ReviewAssignment` for the current
round: `status = invited`, a `dueAt`, the editor's note, and a label that is
the next free "Reviewer N" across the whole manuscript (never reused — a label
in a year-old decision letter must still mean the same person). Guards: the
reviewer is in the pool, not already assigned this round (a withdrawn one does
not block), and does not share an affiliation with an author (the one conflict
this can detect, same limit the matching screen states). Audit entry. No
email — the panel says "send it by hand".

**`withdrawAssignment` (new).** Moves an `invited`/`accepted` assignment to
`withdrawn`. Refuses if a report has been returned — that stays on the record.
Audit entry.

**Supporting changes:**

- `ReviewerProfile` gained `userId` (the `User` id a `ReviewAssignment` points
  at; `ReviewerProfile.id` is the pool-entry id, not the account). Mapped in
  `editorial.ts`; `mock-reviewers.ts` fills it from the mock id at export
  since only `seed.ts` still reads that file.
- `roundProgress`, `getDecisionContext`'s `missing` list, and
  `getReviewerMatches`'s `alreadyAssigned` set all now exclude `withdrawn` —
  it is neither a report the round waits on nor a reason not to re-invite.
- `ReviewAssignment.status` in `src/types` and the reviewers page's
  `ASSIGNMENT_TONE` map gained `withdrawn`.
- `InviteReviewerButton` and `AssignmentActions` were `alert()` stubs; they are
  now real `useFormState` forms.

**Verified:** `npm run typecheck`, `next lint`, a DB simulation of all three
actions (decision transaction + status move + round bump + `revisionDueAt`;
invite label sequencing; withdraw; audit entries) with a full revert, and
`recordDecision` end-to-end via a real HTTP POST — status moved
`under-review` → `revision-requested`, round 1 → 2, `revisionDueAt` set, the
decision row and its `internalNote` stored, and an audit entry
`decision.recorded` written with the actor and a detail JSON. Both structural
audits: **0 findings across 96 pages.**

### Phase 4 — review actions (`(dashboard)/reviews/actions.ts`)

The other half of the editorial work above: the editor invites, and this is the
reviewer answering and reporting. No schema change was needed — `ReviewAssignment`
and `ReviewerReport` already carried everything. No email from either action;
the handling editor is told by the office, and the screens say so.

**`respondToInvitation`** — accept or decline now persists. Sets the
assignment's `status`, `respondedAt`, and on a decline the `declineReason`
(asked for, never required — forcing an explanation only produces empty ones).
Refuses an invitation that has already been answered, naming which. Audit entry.

**`submitReview`** — one `db.$transaction`:

1. Creates the `ReviewerReport` — scores as a `Record<criterion, 1..5>` JSON
   built from `REVIEW_CRITERIA` so a criterion cannot be stored under a name the
   form does not use; `recommendation` through `kebabToCamel`; both comment
   fields split into paragraphs on blank lines, matching the `String[]` columns.
2. Moves the assignment to `completed` with `completedAt`.
3. **Closes the round when this was the last report.** If every assignment in
   the round that is not `declined` or `withdrawn` now has a report, the
   submission moves to `awaiting-decision` — but only from `under-review` or
   `desk-review`, so it can never override a decision an editor has already
   recorded. This is what puts the manuscript in the editor's column the moment
   the last report lands, which is the whole point of the queue's "waiting on"
   column.

A half-written report that left the assignment `accepted` would keep the
manuscript sitting in the reviewers' column forever, which is why all three are
one transaction. Refuses a second report on the same assignment (a returned
review cannot be edited), and refuses one on an assignment that was never
accepted. Audit entry carrying the recommendation.

**Ownership is checked in every action, and the read was fixed too.**
`ownAssignment()` loads the assignment and compares `reviewerId` against the
signed-in user — `requireUser()` on the page proves only that *someone* is
signed in, not that this review is theirs, and a Server Action is its own entry
point. The same hole existed on the read side: `getReviewTaskById` in
`reviews.ts` looked up any assignment by id, so another reviewer's confidential
manuscript was one guessed UUID away. It is now scoped to the current user —
someone else's task is *not found*, not merely unlisted.

**Verified end-to-end via real HTTP POSTs**, not just a DB simulation:

- `respondToInvitation` — status `invited` → `accepted`, `respondedAt` set,
  audit `review.accepted` written with the reference and label.
- `submitReview` — assignment → `completed`, the report stored with all six
  scores, `minorRevision`, three author paragraphs and one editor paragraph,
  the active `ReviewForm` id and the right round; **and the submission moved
  `under-review` → `awaiting-decision`** because it was the round's only
  assignment.
- **The loop closes:** the editor's `/editorial/[id]/decision` screen then
  rendered that report's actual paragraphs, its recommendation and the reviewer
  label — a report written through the reviewer's form reaching the editor who
  has to decide on it. All test data was reverted afterwards.

`npm run typecheck`, `next lint`, and both structural audits — **0 findings
across 96 pages.**

### Phase 4 — profile actions (`(dashboard)/profile/actions.ts`)

The account's own details. All three actions act **only on the signed-in
user's row** — none of these forms carries a user id, and none should: a
profile action that took one would be an account takeover waiting to be tried.
`requireUser()` is both the guard and the target.

**Schema migration** `20260908052556_user_profile_and_notifications` — all
additive, existing rows take the defaults:

- `department`, `position`, `bio` on `User`. The form already collected all
  three and there was nowhere to put them.
- `bio` is deliberately **not** `ReviewerProfile.note`. That is an editor's
  private assessment of a reviewer, written by someone else about them; this is
  the account's own words. Merging them would let a reviewer read, and
  eventually edit, an editor's notes on their own work.
- Six `notify*` booleans rather than one JSON blob: each is a real named
  setting worth documenting, and a typo in a JSON key would silently mean
  "off" where a wrong column name is a compile error. Defaults match what the
  page ships checked — on for anything tied to a deadline, off for anything
  promotional.

**`saveProfile`** persists name, affiliation (the form calls it "institution";
the column is `affiliation`, which is what the reviewer directory uses),
department, position, country and bio.

**The email address is refused, not applied.** It is the login *and* the
address every decision letter goes to, so changing it has to be confirmed from
the new address first — and there is no mail provider to send that with.
Applying it silently could lock someone out of their own account, so the action
saves everything else and the message says the address was not changed and to
ask the editorial office. Verified by posting a different address: the original
row survived and no row appeared under the new address, while the other edits
on the same submit still saved.

**`saveOrcid`** stores or clears the iD — and still says what it is. Storing a
typed string is not verification; the real flow signs the person in at
orcid.org and gets the iD back from ORCID itself. The page's "records an iD; it
does not verify one" notice stays.

**`saveNotifications`** writes all six booleans. An unchecked checkbox posts
nothing at all, so each is read explicitly as `=== "on"` — that is what makes
"the user turned this off" and "the browser never sent it" resolve to the same
thing, which is what the form intends. Verified by posting only two of the six
and confirming the other four became `false` rather than being left alone.

**Reads were wired too, not just writes.** `CurrentUser` gained the editable
fields and the notification block, so `/profile` and `/profile/notifications`
now prefill from the database instead of rendering empty inputs over stored
values — the bug that would have made every visit look like an empty profile.

**Three stale notices corrected.** Both forms' success alerts said *Not saved*;
`/profile/notifications` claimed preferences are "off by default until you
save" (four ship on) and that saving "stores nothing" (it now stores). The page
now says the choices **are** saved but that no email is sent yet, so nothing
switched on will arrive and nothing switched off was going to.

**Verified:** `npm run typecheck`, `next lint`, all three actions end-to-end via
real HTTP POSTs with the rows checked afterwards and everything reverted, the
migration's defaults confirmed on an existing row, and the prefill confirmed by
re-fetching `/profile` and seeing the saved values rendered. Responsive audit:
**0 findings across 96 pages**, no fetch failures.

**The a11y audit has not completed against these changes.** Two attempts both
ended with the dev server dying part-way — the first reported `fetch failed` on
`/dashboard` and `/profile` (so its "0 findings" covered 94 pages, not 96), and
the second died before writing any output. This is the connection-pressure
crash the operational note above already describes, not something specific to
the profile work; warming the routes first did not prevent it. **Re-run
`node scripts/a11y-audit.mjs` against a freshly started server before trusting
the a11y number for this change.** The pages involved are three forms built
from the same `Field`/`CheckOption`/`Alert` primitives as every other portal
form that already passes, so a finding is unlikely — but unlikely is not
checked, and it is recorded here rather than assumed.

### Phase 4 — announcements, news and events (`/admin/announcements`)

The first screen where the portal writes content the **public site** reads.
Everything before this was internal — a decision, a report, a profile — so a
stale cache was invisible. Here it is the front page, which is why every action
revalidates the public list and detail path as well as the admin screen.

No schema change: `Post` already had every column, including the flattened
event fields and the `@@unique([kind, slug])` this depends on.

**Reads first — `articles.ts` is now half rewired.** `getPosts`,
`getPostBySlug` and `getPostSlugs` query Prisma; `getLatestAnnouncements`
follows from `getPosts`. **Articles, issues and board members deliberately stay
on fixtures** — they have their own tables and admin screens to come, and
rewiring them here would be a separate change with a much wider blast radius
across the public site. `mockPosts` is now read only by `prisma/seed.ts`, which
is the correct remaining job for it.

> **Superseded 2026-09-16.** The other half was wired the day issue planning
> landed, and for exactly the reason this paragraph gives for the posts: an
> editor could now assemble an issue that the public archive — reading a
> separate copy — could never show. `articles.ts` imports no fixture at all now.
> See `docs/PUBLIC-SITE-WIRING.md`.

The post sort stays in JS rather than becoming an `ORDER BY`: an event orders
by `eventStartsAt` when it has one and `publishedAt` when it does not, which is
a choice between two columns per row.

**`postSchema`** (new, in `schemas.ts`) validates what the one shared form
collects for all three kinds, with the conditional rules the kind selector
implies:

- An event needs a start date and a location — "Online" is a location.
- A category belongs to an announcement. Storing one on a news item would put
  a "Call for papers" badge on a list that cannot filter it.
- Dates that contradict each other each get their own message: an end before a
  start, an expiry before publication, a registration deadline after the event
  has begun.
- The slug is validated, not generated. An editor who can see and edit it can
  keep a link stable when a title is reworded, which is the whole reason a slug
  is a separate field.

**`createPost` / `updatePost` / `deletePost`** each re-guard with
`requireGroup("adminOnly")` and write an audit entry. Both write paths share
one `rowData()` builder so they cannot drift — an edit that wrote a field the
create path did not would only be found by someone comparing two posts.

Two details worth keeping:

1. **Switching kind clears what belongs to the old kind.** A post moved from
   event to news has its start date and location nulled; one moved off
   announcement loses its category. Leaving them would make a news item sort
   like an event and carry a badge nothing can filter.
2. **An update revalidates both the old and the new public URL.** Changing a
   slug or a kind moves the page; without revalidating where it *was*, the
   previous URL keeps serving a cached copy of a post that no longer lives
   there.

**Deleted, not archived** — unlike an account or a decision. A post has no
foreign key hanging off it and no record anyone is entitled to appeal against.
The audit entry keeps the kind, slug and title of what was removed, which is
the part that has to survive.

**Four false notices removed.** The list, new and edit pages all said "there is
no database" and that nothing saves. They now say these are live, and the edit
page warns that changing the address or the list moves the URL and breaks every
link already pointing at it — including any already emailed out.

**Verified end-to-end through the real forms**, with the database returned to
its seeded state afterwards:

- **Create** → 303 redirect, row correct (body split to paragraphs, category
  null on a news item, no event fields), audit entry — and it appeared on the
  public `/news` list *and* rendered at its detail page, a slug that did not
  exist at build time.
- **Duplicate slug** → refused with the error on the field, nothing created.
- **Edit** changing both kind and slug → category applied, no new row, **the
  old public URL 404s and the new one returns 200**, proving the
  both-URLs revalidation works.
- **Delete** → row gone, count back to 10, audit entry retained.

`npm run typecheck` and `next lint` are clean.

**The structural audits did not complete against this change.** The dev server
crashed part-way through the responsive run — the same connection-pressure
failure described in the operational note above, which also cost the profile
work its a11y run. Warming the routes first did not help. **Run both audits
against a freshly started server before trusting their numbers for the
announcements or profile changes.**

The remaining Phase 4 work (the wizard's draft persistence, the admin settings
screens, and auth) has not started.

---

### Row Level Security — enabled on all 31 tables ✅ (2026-09-08)

Done immediately before starting auth, and it had to be: Supabase hands the
browser a **publishable (anon) key**, and with RLS off that key can read every
row through the auto-generated REST API — manuscripts under double-blind
review, reviewer reports, contact messages. The dashboard was flagging all 31
tables as `UNRESTRICTED`, which is what Advisor's 31 critical findings were.
Auth is the change that first puts that key in a browser, so the door had to be
shut before, not after.

**RLS on, zero policies.** The app never reads through the anon key: every
query goes through Prisma over the Postgres connection string, which
authenticates as the table owner and is exempt from RLS. So enabling it closes
the anon door completely and changes nothing about how the app reads. Writing
per-table policies would have been work with no reader to serve. If a screen is
ever built to query Supabase directly from the browser, that is the moment a
policy gets written — deliberately, for that one table.

`prisma/migrations/20260908120000_enable_rls/` does it in a `DO` block looping
over `pg_tables`, so it covers what exists rather than a hand-typed list of 30
model names that would drift. **A table added by a later migration is not
covered** — new tables default to RLS off, so each new migration needs its own
`ENABLE ROW LEVEL SECURITY`.

Verified after applying: RLS on 31 of 31 public tables, and Prisma still reads
normally (9 affiliations, 18 submissions, 39 users). `npm run typecheck` clean.

### Phase 2 — Auth: done, on Supabase Auth ✅ (2026-09-09)

**Signing in works, and the portal is closed to anyone who has not.** The
middleware redirect is live, `getCurrentUser()` reads a verified session, and
registration creates a real account.

**Two stores, one id.** Supabase Auth holds the credentials and the session;
this app's `User` table holds the name, roles, affiliation and notification
settings the portal renders. `User.id` *is* the `auth.users` id — the phase 1
decision that made this a join rather than a synchronisation problem.

**Roles are read from the database on every call, never from the token.** A JWT
minted before someone was made an editor would otherwise keep saying they are
not one until it expired. This is why `getCurrentUser()` queries after
`getUser()` rather than reading claims.

**`getUser()`, never `getSession()`**, in both the middleware and
`current-user.ts`. `getSession()` reads the cookie and believes it; `getUser()`
verifies the token with Supabase. A cookie is attacker-controlled input, and
this is the check that decides who reaches the editorial queue.

**The middleware does a second job that is easy to lose.** Supabase access
tokens are short-lived, and a Server Component may read a refreshed token but
cannot write the cookie back — Next forbids setting cookies during a render. So
the `getUser()` call in `middleware.ts` is what keeps a session alive; the
`supabaseServer()` cookie setter swallows the write failure it gets from a
render, deliberately, and lets the middleware persist it on the next request.

**What landed:**

| File | What it does now |
|---|---|
| `src/lib/auth/supabase.ts` | Three clients: the visitor's (`supabaseServer`), the service-role one (`supabaseAdmin`), and the key readers. The admin client is never given a request's cookies |
| `src/lib/auth/current-user.ts` | Real session first; the demo path runs only when there is no session **and** `isDemoMode()` |
| `src/middleware.ts` | Redirect live, session refreshed, demo door still honoured |
| `src/app/(auth)/actions.ts` | Sign in, register, reset request, reset — all real |
| `src/app/(auth)/auth/callback/route.ts` | **New.** Exchanges Supabase's one-time code for a session |
| `src/app/logout/route.ts` | Revokes the Supabase session *and* clears the demo cookie |

**The reset link could not point at `/reset-password`.** Supabase does not put a
usable token in the email; it sends a one-time `code` that must be exchanged for
a session server-side, because the exchange writes cookies. So the link goes to
`/auth/callback`, which spends the code and redirects. The page's old `?token=`
check is gone — **the session is the token now**, which is stricter: a page
trusting `?token=` would show the form to anyone who typed one.

**Registration confirms addresses on creation, and that is a temporary lie
worth knowing about.** `email_confirm: true` is set because no mail provider is
connected: leaving it false would create accounts that can never sign in, since
the confirmation link would never arrive. **Set it back to `false` when Resend
lands.** `resendVerification` says plainly that nothing is waiting on it rather
than reporting a send that did not happen.

**Registration cleans up after itself.** If the auth account is created and the
profile insert then fails, the auth account is deleted — `getCurrentUser()`
returns null for exactly that half-created state, so the visitor would
authenticate straight into a redirect loop. Deleting it leaves the address free
to register again.

**One message for "no such account" and "wrong password".** Distinguishing them
tells an attacker which addresses are registered — the same account-enumeration
leak the reset flow was already written to avoid.

**`safeNext()` guards the post-login redirect.** `next` arrives in the URL, so
without it an emailed `/login?next=https://elsewhere.example` turns the
journal's own sign-in page into an open redirect. Only in-app paths pass;
protocol-relative `//host` is rejected too. `/auth/callback` repeats the check
for its own `next`.

**The scaffold notices were not simply deleted — they were made true.** Sign-in
and password-reset lost theirs because both now work. Register kept one, saying
the account is real but the address is unverified. Forgot-password kept one
saying delivery is still being set up. Verify-email kept one saying nothing is
waiting on it. Deleting all five would have been the indexing-page mistake: a
page claiming a feature the code does not have.

**The demo door is still open, deliberately.** It is the only way to walk the
portal as roles nobody has a password for. `isDemoMode()` still guards it, and
"The demo door" below lists what gets deleted when it goes.

**Verified end to end**, against the live Supabase project:

1. Account created through the admin API, profile row written — ✅
2. Sign-in with the publishable key issues a token — ✅
3. Wrong password rejected — ✅
4. Profile joined by auth id, roles read back — ✅
5. Anon key reading `Submission` — **blocked**, RLS holding — ✅
6. Production build, demo closed: `/dashboard`, `/submissions`, `/reviews`,
   `/editorial/queue`, `/admin/users`, `/profile` all **307 → `/login?next=…`** — ✅
7. Same build, real session cookie: those routes **200**, and the dashboard
   renders the signed-in account's own name — ✅
8. Public pages (`/`, `/articles`, `/contact`, `/login`, `/register`) stay 200 — ✅

Test accounts deleted afterwards; the 39 seeded users are untouched.
`npm run typecheck` and `next lint` both clean.

**Still open in phase 2:** nothing, except what phase 6 owns — a reset link may
not be delivered, and addresses are not verified. Both say so on screen.

### The invented public record — removed ✅ (2026-09-18)

**Found by the client, and the finding corrected a claim I had made twice.**
After the public site was wired to Postgres (2026-09-16) I reported that
"nothing in the app reads a fixture, and no screen shows invented data." The
first half was true and remains true: `src/` imports no `mock-*` file. The
second half was false, and the distinction is the whole point of this entry:

```
mock-*.ts  →  prisma/seed.ts  →  DATABASE  →  page  →  screen
  (invented)                     (invented)           (shown as fact)
```

Reading a row from Postgres does not make its contents real. The pipeline was
real; the content was seeded. `/about/editorial-board` was listing **twelve
named scholars** — with institutions (LUMS, IBA, Aga Khan, Manchester, JNU,
Qatar University), ORCID badges and a "12 members · 11 institutions · 4
countries" counter — none of whom had agreed to anything. Seven articles
carried DOIs and author bylines for research nobody wrote.

This is the page DOAJ and the ISSN centre verify, and they verify it by
**writing to the people named**. A rejected DOAJ application is not a bug to
fix later; it is a journal's standing.

**What was removed** (`scripts/clear-public-content.mjs`, dry-run by default):

| Table | Rows |
|---|---|
| `BoardMember` | 12 |
| `Article` | 7 |
| `Issue` | 2 |
| `Post` | 10 |
| `Affiliation` | 4 of 13 — only those nothing else referenced |

**What deliberately stayed.** The portal's demo data — 18 submissions, 20
review assignments, 8 reviewer profiles, 4 production jobs, 39 profile rows.
It sits behind a login, no indexer or applicant can see it, and it is what
shows the client how the workflow actually runs. An empty portal demonstrates
nothing. `Section` stayed too: those ten subject areas are the journal's own.

**The seed no longer writes the public record by default.** `SEED_PUBLIC=1` is
required for `Issue`, `Article`, `Post` and `BoardMember`; without it those
four loops iterate an empty array. Clearing the database alone would have been
undone by the next `npm run seed`. The submission→article back-link is guarded
by the same flag — its target rows do not exist otherwise, and the update
would be refused.

**Emptying a table is only half the change — the screens had to be re-checked
in the state they now render in.** Three were wrong:

- `/about/editorial-board` had **no empty state at all**. It would have shown
  "0 members · 0 institutions · 0 countries" above a blank page, which reads
  as a broken site rather than as a journal that has not announced a board.
  The counter is now hidden while the board is empty, and a proper empty state
  explains that appointments are being confirmed.
- `/articles` offered **"No articles match those filters"** with a *Clear
  filters* button — true of a filtered search, false of an empty archive,
  where clearing the filters reveals nothing more. The two cases are now
  distinguished on `all.length`.
- The homepage `StatStrip` asserted **"6 wks — median to first decision"**, a
  figure no query produced and no manuscript had ever tested, sitting where a
  prospective author weighs a submission against it. Replaced with
  "Double-blind — peer review", which the journal can stand behind.

`scripts/responsive-audit.mjs` had three seeded post slugs hardcoded in its
page list, which 404'd once the posts were gone; they were dropped rather than
replaced, since any hardcoded slug would break the same way.

**Verified:** all four public tables at 0, all portal tables intact,
`/`, `/articles`, `/issues`, `/issues/current`, `/about/editorial-board`,
`/news`, `/announcements`, `/events` all HTTP 200 with the correct empty-state
copy rendered. Responsive audit **0 findings across 92 of 92 pages**.
`npm run typecheck` and `next lint` both clean.

**What the client must now supply**, and no code can substitute for it: each
real board member's name, affiliation, country, ORCID iD, role, and their
**written agreement to be listed**. Articles are different — the journal has
published none, so an empty archive is not a gap but the truth, and it fills
itself through the workflow that already works end to end.

**Still open from this change:** the portal's demo data carries no marker.
18 submissions with references in the journal's own format
(`BORJSS-2026-0044`) are indistinguishable from real ones, so a client
walking the portal has no way to tell that none of them arrived. A marker
should be derived from the data rather than set by a flag — the
`seededAuditCount()` pattern — so that it disappears by itself as real work
replaces the demo rows. Not built: where it belongs on screen is the client's
call, not mine.

### Notice boxes — the always-on `<Alert>` sweep 🟡 (2026-09-17/18)

The client asked three times, the third time pointedly, before this was done
properly. The mistake was removing them one screen at a time between other
work: 13 files were left importing `Alert` after their last box was gone —
dead imports that lint would have caught if it had been run at the end rather
than the middle. All 13 are now clean.

The rule that came out of it: a box that is always visible is not a warning,
it is decoration, and a reader who learns to skip it skips the one box that
matters. An essential fact belongs in the page's `lead`; a box is for
something conditional on state.

Boxes deliberately **kept**, each guarded or sitting where the decision is
made: `/editorial/[id]/decision` (directly above the submit — the letter is
still sent by hand), `/editorial/[id]/reviewers` (two facts needed *before*
inviting), `/admin/integrations` (answers "where does the key go?"),
`/submissions/[id]/messages` (gives the author the address and reference).

### The audit log, and the last two `alert()` controls ✅ (2026-09-17)

- **The eight seeded audit rows are gone**, from the database and from
  `prisma/seed.ts`. An audit log is read precisely when someone is not
  trusted, and invented rows beside real ones — "granted sectionEditor",
  "reopened a review round in error" — describe things nobody did. The table
  starts empty and fills as the journal is used, which is the correct starting
  state for an append-only record. The screen derives its own count rather
  than asserting one.
- **The display was wrong in two ways**, both found by the client's own live
  role-change test: the target column printed a raw UUID, and the detail
  column was empty because `summariseDetail()` only read a `note` key that
  only seeded rows carried. It now reads every detail shape the app writes
  (all eight verified), and `listAuditEntries` batch-resolves user names in
  one query.
- **`expirePost` and `deletePost` now persist** — the last two `alert()`
  stubs outside `/admin/doi`. `expirePost` sets `expiresAt` to **a second
  ago**, not to now: every public filter keeps a post while
  `expiresAt >= now`, so exactly-now leaves it listed. Verified against the
  database before the second was subtracted.
- **`getCurrentUser()` retries once after 400ms on P1001.** It runs on every
  portal render, and a transient pooler drop was turning a blip into a
  sign-out.

### Phase 4 — issue planning ✅ (2026-09-16)

The last unbuilt feature. `(dashboard)/editorial/issues/actions.ts` is new;
`IssueForm` and `issue-contents-controls.tsx` lost their `alert()` handlers. No
migration — the tables were already there with RLS on, as recorded.

**Two tables answer "which issue is this in", and both are written together.**
`IssuePlanItem` is the table of contents and its running order.
`ProductionJob.issueId` is what `/production` reads to show a job its target
date, and the seed already sets it independently — two jobs carry an `issueId`
with no `IssuePlanItem` behind it. Writing only the first would have left a
manuscript placed in an issue whose production row shows no deadline: nothing
breaks, no test fails, and the queue quietly stops answering the question it
exists for. So `placeInIssue` and `removeFromIssue` each write both inside one
transaction.

**Positions are kept contiguous.** A removal closes the gap rather than leaving
a hole. The list renders in order either way, so a gap is invisible on screen
while it breaks the reorder controls — the worst combination. `moveIssueItem`
swaps through a temporary `-1` rather than assuming contiguity, so the swap
stays correct if a row ever does slip, and stays valid if `position` is made
unique later.

**Publishing has no code path, rather than a disabled control.** `issueSchema`
accepts `planned` and `in-production` only, so the form cannot reach
`published` at all. A greyed-out option was considered and rejected: it is
still a promise, and it invites "when does this open?". The screens say the
Crossref prefix is what is missing. Every action also refuses to touch a
published issue, since the seed contains two and their citations are in other
people's bibliographies.

**A duplicate placement is an ordinary mistake, not a 500.**
`IssuePlanItem.submissionId` is unique — one manuscript, one issue — so
`placeInIssue` catches `P2002`, looks up where the manuscript already sits, and
names that issue. The same is done for `EditorialIssue`'s unique
`(volume, number)`, reported against both fields.

**Verified** by replaying each action's statements against the live database:
place, duplicate rejected `P2002`, move up, remove with the gap closed,
positions contiguous afterwards, and the seeded state restored. Both audits
re-run: **0 findings across 96 of 96 pages** each. `npm run typecheck` and
`next lint` clean.

**Then walked by hand, which found four things the scripts could not.** All
four were the same failure — a screen stating something that was not true of
what the reader was looking at — and all four were introduced by this change,
not inherited:

1. A published issue carried the *"This issue cannot be published yet"* notice,
   directly beneath its own **Published** badge.
2. A published issue offered an **Edit issue** button, although `saveIssue`
   refuses one. A button leading to a form that will not save is worse than no
   button; the edit screen's own notice now says plainly that it will not save,
   rather than only explaining why it should not.
3. A published issue's empty table of contents said *"Accepted manuscripts
   waiting for one are listed below"* — pointing at the "Available to place"
   section, which is deliberately not rendered there.
4. **The list screen's publishing notice is gone entirely.** That screen has no
   publish control and never had one, so the note answered a question nobody
   had asked — and it sat immediately below the *Published* section, reading as
   a denial of the two issues listed above it. Publishing is a question that
   arises on one issue, so the notice lives on `[issueId]/page.tsx` and is
   shown only while that issue is unpublished.

The lesson is the one already in `CLAUDE.md`, in its less common direction: a
notice can be perfectly true and still be wrong, if it is placed where the
reader can see it contradicted.

**Still open:** page numbers are not recorded on `IssuePlanItem` — they are
settled in production once galleys are final, and the screen says so — and
publishing, which waits on the Crossref prefix.

### Phase 5 — File storage: the confidential path is built and proven 🟡 (2026-09-09)

Cloudinary is connected, and the part that had to be right first — a manuscript
under review staying confidential — is built and verified against the live
account. **What is not done: no screen uploads or downloads yet.** The wizard's
upload step and the file lists still say they cannot, which is still true.

**The finding that shaped the design.** `upload()` returns a `secure_url` that
carries a baked-in signature (`s--2T3iEDMx--`) and **opens with a plain fetch,
forever**, even on an `authenticated` upload. That URL is a permanent bearer
token for a confidential file. Had it been stored in `SubmissionFile` — the
obvious thing to do with a URL an API hands back — every manuscript in the
journal would have been one leaked database column away from public.

So `putFile` **does not return it**. It returns the `publicId` and the byte
count, and there is no code path in `lib/storage/` that can hand a caller the
permanent link. Verified in the same run: a `publicId` on its own opens nothing
— `/raw/authenticated/<id>`, `/raw/upload/<id>` and the versioned form all
answer 401 or 404 — which is what makes the id safe to store and to pass around
inside the app.

**Reads go through `/files/<id>`**, which is a stable, shareable, useless-on-
its-own URL. It checks entitlement, then mints a **ten-minute** signed URL and
302s to it, `Cache-Control: no-store, private`. Someone who copies a portal
link sends a colleague to the guard, which asks who *they* are; someone who
copies the redirected URL sends a key that has already expired. No signed URL is
ever stored, emailed or logged.

**Not-found and forbidden answer identically (404).** Probing ids would
otherwise reveal which manuscripts exist, and on a double-blind journal that is
itself disclosure.

**The entitlement rule is its own module** (`lib/storage/entitlement.ts`), apart
from the route handler, because it *is* the confidentiality guarantee —
`signedUrlFor` signs whatever it is given and nothing downstream asks again. A
mistake there is not a bug in one screen, it is every screen.

**A reviewer gets the manuscript and not the title page.** `HIDDEN_FROM_REVIEWERS`
covers `titlePage` and `coverLetter`, both of which name the authors. This is
the same rule `ReviewTask` enforces by having no author field — stated twice
deliberately, because a file download is a second door into the same
information. Entitlement also requires a **live** assignment (`accepted` or
`completed`): a declined invitation is not a standing key.

**Verified against the seeded database**, on a real manuscript with a real
assignment:

| Reader | Manuscript | Title page |
|---|---|---|
| The author | allowed | allowed |
| Assigned reviewer | allowed | **denied** |
| A reviewer with no assignment on it | denied | denied |
| An outsider with no staff role | denied | denied |

Storage round-trip verified separately: upload → signed URL opens it → the id
alone is refused (401) → delete → the previously working signed URL is gone
(404). An expired signature is refused (401).

**Published articles are the deliberate exception.** `putPublicFile` is a
separate, differently-named function, because an open-access journal exists to
be read and a published PDF *should* have a permanent URL. Keeping it separate
means publishing something is a decision someone made rather than a flag
someone forgot.

**`SubmissionFile.storagePath` now documents what it holds** — the Cloudinary
`publicId`, and only that. Its previous comment described Supabase Storage and a
private bucket, which was the pre-Cloudinary plan.

### The stale-notice sweep — every screen re-checked against the code ✅ (2026-09-09)

**Found by the client, not by a test.** The login page announced "Not live yet"
above a working sign-in form. `ScaffoldNotice` had its heading hard-coded to
that string, written when nothing authenticated anyone; the wording inside was
updated as features landed and the heading never was. The heading is a prop now.

That prompted a sweep of every screen, and the same rot was widespread. Roughly
a dozen notices still claimed **"there is no database"**, **"no file storage"**
or **"no backend"** — each true when written, all false for weeks. This is the
failure CLAUDE.md names first, and it had accumulated in the one place nobody
re-reads: text that was correct when it was typed.

| Screen | Claimed | Actually |
|---|---|---|
| `/dashboard` | "Portal preview — the account is a placeholder and nothing is saved" | Real account, real data. **Notice deleted** |
| Reviewer assignment | "No invitation goes anywhere" | Saved to `ReviewAssignment` and visible in the reviewer's queue; only the email is missing |
| `/admin/audit-log` | "Nothing writes an audit entry, every row is invented" | Announcements, messages, reviewer applications and settings all write entries |
| `/admin/statistics` | "There is no database — computed from mock fixtures" | Computed from the database |
| `/admin/users`, issues, production ×4 | "There is no database / no file storage" | Both exist; these screens genuinely do not save, which is a different sentence |
| `/admin/integrations` | "No backend to hold a credential" | Credentials live in the environment, by design |

**The privacy policy was the one that mattered.** It is a legal document, and
it was wrong in three places: it said the portal was "in development" when it
is built, it said signing in *will* set a cookie "when the portal launches"
when signing in sets one today, and it marked manuscript submission, peer
review and accounts as "(planned)". All corrected. Its claim that *reading* the
site sets no cookie was left alone — still true, since the session cookie is
only set at sign-in.

**What was deliberately not changed:** the public site still routes authors to
email rather than the portal. The wizard works end to end, but no receipt can
be delivered — an author would submit, see a reference number, and then hear
nothing at all, with no way to recover a forgotten password either. Advertising
it in that state would cost more trust than it gains. That page changes the day
a domain is verified, and it is a one-line change.

Both audits still **0 findings across 96 pages**; typecheck, lint and a
production build clean.

### Admin settings — two screens moved to the database, three deliberately not ✅ (2026-09-09)

**The interesting decision was which screens to leave alone.** Moving all five
to a database would have been the obvious reading of "make settings editable",
and three of them would have been made worse by it.

| Screen | Where it lives now | Why |
|---|---|---|
| **Journal settings** | 12 fields in `JournalSetting`, 9 read-only from config | The editable ones are facts the journal *acquires* — an ISSN, a Crossref prefix, an office address. The rest are decisions |
| **Sections** | `Section` table, full CRUD | Already a real table with a foreign key; only the UI was missing |
| **Review forms** | Code | A criterion is a **key stored on every report ever returned**, not a label. Renaming one in a database leaves older reports scored against a criterion nothing can name |
| **Policies** | Code | 17 documents of long-form prose with tables and cross-links, styled by `.prose` and checked by the a11y audit. A database editor replaces all of that with pasted HTML — and a journal's ethics policy is the last thing that should be editable without review |
| **Email templates** | Code | Functions taking typed arguments. A mistyped placeholder in a database editor becomes an email that goes out with a blank where the manuscript number should be |

**`JournalSetting` is key-value, not a one-row table with twenty columns.**
`site.config.ts` holds around forty values and only twelve are settings; the
rest are decisions. And those twelve arrive one at a time as the journal
acquires them — an ISSN this year, a Crossref prefix next — where a column each
would mean a migration each time.

**The config file stays the default; a row is an override.** No row means the
file's value stands, so a fresh database renders exactly as before. **Clearing
a field deletes its row rather than storing `""`** — an empty string would
assert that the journal *has* no ISSN, overriding a file value someone set.
Verified: no row → file value; saved → override; cleared → file value again.

**A settings screen that saves but changes nothing would have been the worst
outcome**, so the readers were moved too: `/about/journal-information` now
reads the stored values, and an ISSN entered in the portal appears there the
same day. `hasRealDoiPrefix()` (has a prefix been *entered*) is deliberately
separate from `hasCrossrefPrefix()` (do the minted DOIs *use* one) — the two
differ for as long as it takes to re-mint placeholders, and that gap is worth
being able to see.

**Sections found a real bug on the way.** The wizard's section dropdown
rendered `REVIEWER_SUBJECTS` — a list maintained for the reviewer directory —
so an author could choose a subject with no `Section` row and the action would
reject a choice the form had just offered. It reads the registry now.

**Sections are deactivated, never deleted.** One holding manuscripts cannot be
removed without breaking their history, and an empty one may still be named on
the public aims & scope page. The control says "Stop offering". Verified:
deactivating left 9 sections on offer while 3 manuscripts stayed filed under
the tenth.

**Renaming carries the manuscripts, and that is the whole point of a
registry.** Verified against live data: renaming "Gender & Development" moved
all 3 of its manuscripts, because they hold a foreign key rather than a copy of
the name. **The "Gender Studies" drift is confirmed closed in the database** —
it survives only in the source fixtures.

**Two warnings remain on the sections screen, and both should.** A registry
stops section names diverging from each other but not from `/about/aims-scope`,
which holds its ten areas as prose — the one list still without a single
source. So the screen warns when a section is offered but not advertised, and
when an advertised area has no section for an author to choose.

**Both actions write an audit entry** — these are the values that appear on the
public site and in every metadata record, and "who changed the ISSN" is exactly
what an audit log is for. The entry records **which keys changed, never their
values**: an audit row is read by people not otherwise entitled to the contents.

**`JournalSetting` needed its own `ENABLE ROW LEVEL SECURITY`.** A new table
defaults to RLS off, and the loop in `20260908120000_enable_rls` ran before
this table existed. Verified afterwards: **32 of 32 tables protected, none
unrestricted.** Any future migration that adds a table must do the same.
*(The count is 34 as of 2026-09-16 — `20260916120000_article_contributors`
added two and enabled RLS on both. The rule held.)*

**ISSN check digits are validated** (ISO 7064 MOD 11-2, `isValidIssn`), for the
same reason as the ORCID check digit: a wrong ISSN is not discovered until an
indexing service rejects the application months later. Tested against five real
ISSNs and four corrupted ones — 9 of 9 correct.

Production build clean; **both audits 0 findings across 96 pages**;
`npm run typecheck` and `next lint` clean.

### Phase 5, part 2 — the wizard submits, and files download ✅ (2026-09-09)

**An author can now submit a manuscript end to end**, which is the journal's
actual job and the thing every phase before this was building towards.

**Step 1 creates the draft; every later step writes to it.** A draft is a
`Submission` at status `draft`, which every editorial read already excluded —
so a half-finished wizard was already invisible to editors before this landed.
`.../details` still redirects to `/submissions/new`, and step 1 now redirects
forward to `/submissions/new/<id>/upload` with a real id.

**The reference comes from a Postgres sequence**, created in
`20260909120000_submission_reference_sequence` and seeded past the existing
fixtures so the first real submission cannot collide. Never a row count: delete
one submission and a count reissues a reference another author has already
quoted in an email.

**Every step re-checks ownership.** `ownedDraft()` runs on each write rather
than trusting the `draftId` in the form — a Server Action is its own entry
point. It accepts only status `draft`, so a stale tab left open on step 3
cannot rewrite a manuscript an editor is already reading. Someone else's draft
id gets the same answer as a nonexistent one.

**Step 6 re-validates everything from the database, not from the form.** The
per-step checks are a courtesy to the author; steps 2–5 are reachable directly
by URL and any of them can be skipped. So `submitSubmission` reads the draft
back and names what is missing — manuscript, title page, abstract, keywords,
competing interests, author list, corresponding author, declarations — rather
than submitting an empty shell. Verified: an empty draft is refused with all
eight named.

**Double submission is refused by the query, not by a flag.** The update
carries `status: "draft"` in its `where`, so a double-clicked button finds no
matching row. Verified.

**Contributors are replaced wholesale, never diffed.** Author order is a claim
about contribution, and reconciling an edited list against stored rows is
exactly where an order changes silently. Deleting and rewriting cannot reorder
anything the author did not reorder themselves; `position` stores the index.

**New columns on `Submission`** (`20260909130000_submission_wizard_fields`):
`funding`, `conflictOfInterest`, `aiDisclosure`, `dataAvailability`,
`declaredAt`, `coverLetter`. All nullable, because a draft acquires them step
by step. `declaredAt` is one timestamp rather than five booleans: the five
declarations are only ever accepted as a set, and what a later dispute needs to
know is *when* they were made.

**Downloads landed on three screens** — the editorial detail page, the author's
revisions page, and the reviewer's task page — all through `FileLink` or the
same `/files/<id>` href. **A reviewer's file list now also excludes the cover
letter**, not just the title page: both name the authors. `entitlement.ts`
already refused it, but a file listed and then refused reads as a broken
portal, so it is not listed either.

**`SubmissionFile.stored` is a boolean, deliberately not the storage path.**
The `publicId` has no business in a rendered page — a component holding one is
a component that could one day build a URL from it. Rows from the seed carry
placeholder paths (`mock/s1/...`) and render as plain text rather than as a
download that 404s.

**The wizard's standing "drafts are not saved" notice is gone**, because it is
no longer true. `WizardShell` carries no notice at all now.

**Verified end to end**, against the live database and Cloudinary: draft
created with a sequence reference → two files uploaded to
`submissions/<id>/…` → metadata, contributors and declarations saved →
completeness check passed → status `submitted` → **double submit refused** →
visible to the editorial queue. An incomplete draft was refused and named all
eight missing pieces, and stayed invisible to editors. Production build clean;
**both audits 0 findings across 96 pages**; `npm run typecheck` and
`next lint` clean.

**What remained in phase 5 when this was written:** galley uploads in
production, and revision uploads. **Galley uploads landed on 2026-09-14** — see
"Phase 4/5 — production" below. Revision uploads are still open and do not
block a submission.

### The seed used to delete the only account that can sign in — fixed 2026-09-14

**Symptom, because it is worth recognising again:** sign-in succeeds — Supabase
returns a session, the Network tab shows `POST /login 200` and `/dashboard`
compiling — and then the portal lands back on `/login` with the fields blank
and **no error anywhere**. The server log gives it away with
`WHERE "UserRole"."userId" IN (NULL)`.

**Cause.** `User.id` *is* the `auth.users` id (phase 1), so the session is
joined to this table on every request. `prisma/seed.ts` cleared accounts with a
blanket `user.deleteMany()`, which is correct for the 39 fixture profiles and
catastrophic for `ceoborjss@gmail.com` — the one account that can actually sign
in, created through the Supabase admin API and therefore unknown to the seed.
Running `npm run db:seed` deleted its profile row while leaving the Auth
account intact. `getCurrentUser()` then returned null for a perfectly valid
session, and `requireUser()` redirected to `/login`.

**Fix.** The clear step now deletes only rows the seed owns — those with
`@example.edu` or `@borjss.example` addresses, which is every fixture and
nothing else. A re-seed can no longer lock the journal out of its own portal.

**If it happens again** (an account created outside the seed, on a domain the
filter does not cover), recreate the profile row with the *auth* id as its
primary key:

```ts
await db.user.create({
  data: { id: <auth.users id>, name, email, status: "active",
          roles: { create: [{ role: "superAdmin" }] } },
});
```

### Phase 5 — revision uploads ✅ (2026-09-14)

**An author whose manuscript comes back can now return it through the portal.**
Until now `/submissions/<id>/revisions` carried two notices telling them to
email the editorial office instead.

**The round is derived, never accepted from the form.** It is
`Submission.round`, read on the server. A client that could name its own round
could file against a round the editor has already closed, or overwrite round 1
from a tab left open for a fortnight. Files are stored as `manuscript-r<round>`
so a second revision cannot overwrite the first — the history is the entire
point of that screen.

**`revisableSubmission()` is deliberately not `ownedDraft()`.** The wizard's
helper accepts only status `draft`, because it must not rewrite a manuscript an
editor is reading. This one accepts only `revisionRequested`, which is the
exact opposite case. Sharing one helper would have meant a status list long
enough to permit both, and that list *is* the guard.

**Uploading does not advance the status.** Putting the manuscript back under
review is the editor's decision, taken on the editorial screens; an author who
could move their own manuscript into review would be skipping the desk check.
The form says so above the button rather than below it — an author who reads
that after submitting has been told too late.

**The response to reviewers is required, and typed rather than attached.** Same
choice the cover letter makes on a new submission: it is stored as a
`SubmissionMessage` so the editor reads it beside the reports instead of
opening a file. Required because a revision with no point-by-point reply is the
most common reason an editor sends one straight back. It is split into
paragraphs on the way in, because `SubmissionMessage.body` is `String[]`.

No migration: `responseToReviewers` was already a `SubmissionFileKind` and
`SubmissionFile.round` already existed.

### Phase 4/5 — production: stages, galleys and corrections ✅ (2026-09-14)

**The production screens write.** Until now every control on all three of them
was an `alert()` saying nothing was built — nine of them — so a journal could
accept a manuscript and then had nowhere to record what happened to it.

**One writer for every stage transition.** `moveStage()` in
`(dashboard)/production/actions.ts` is the only thing that changes a stage,
because the five transitions differ *only* in which timestamp they set, and
five near-identical actions is precisely how `startedAt` ends up set on one
path and forgotten on another. It `upsert`s on `@@unique([jobId, stage])`: the
three stage rows are created lazily, so the first thing that happens to an
untouched stage is its creation, and a double-clicked button finds the row
already there rather than making a second one.

**`sentToAuthorAt` is cleared when the work comes back.** Setting it is
obvious; clearing it on the return leg is the part that would have been missed,
and without it the queue would keep ageing a wait that had already ended —
`stalledDays()` reads that column first.

**Reopening goes to `in-progress`, not `not-started`.** Somebody still holds
the stage, and the completion that was undone stays in the audit trail rather
than being erased from it.

**The assignee is an account id, never a typed name.** The three screens
offered three hard-coded names as plain strings, so a stage could be assigned
to someone with no account — who then cannot open it. `getProductionTeam()`
reads active accounts holding a `ROLE_GROUPS.production` role, and
`assignStage` **re-checks the id against the same role list** rather than
trusting the option that was rendered. An empty team is stated on screen rather
than left as a select with one disabled option, which reads as a broken
control.

**Galleys upload to confidential storage**, through the same `putFile` path as
a manuscript — `type: "authenticated"`, no URL ever returned or stored. The
version is **derived server-side** as one higher than the highest existing,
never accepted from the form: letting a client send it is how two files end up
claiming to be version 2, which is the whole point of versioning them.
`markGalleyFinal` clears the other finals *in the same format* inside one
transaction, because two finals is not a state anyone could later resolve from
the data alone.

**Galley reads needed their own entitlement rule, and that was the one piece
worth slowing down for.** `entitlement.ts` only knew `SubmissionFile`;
`ProductionGalley` is a different table with no author column to compare
against, so extending the existing rule by analogy would have meant guessing
which of its branches still applied — and most do not. `galleyAccessFor()` is
therefore its own function: **production and editorial staff only**, no author
branch and no reviewer branch at all. An author is not given a portal link to
an unapproved galley (they would get every intermediate version), and review is
finished by the time anything is typeset. Both reasons are written into the
function, so a later change has to argue with them.

Both kinds of file go through the **one** `/files/<id>` route, a galley via a
`galley:` prefix — one guard, one place where a signed URL is minted, rather
than a second handler that could drift from the first.

**`ProductionGalley.storagePath` is now on the type**, so a screen can ask
`isStoredFile()` whether there is really a file behind a row. The four seeded
galleys predate storage and carry `mock/...` paths: they render as plain text,
not as a download that 404s. A dead link reads as a broken portal, not as a
file that was never uploaded.

**The stale notices went with the feature**, per the standing rule — and this
is the direction that has gone wrong here before. Four screens said production
was "not built yet"; all four now say what is true. The proofreading one is
deliberately **split**: the stage controls above the correction list save and
the correction controls below it do not, and one notice covering both would
have been wrong in one direction or the other.

**Proof corrections landed too, with the migration they needed**
(`20260914120000_proof_correction_fields`). `location` and `raisedBy` are real
columns now. They had to be: the location used to be packed into the front of
`description` and split back out on read, which is tolerable for a read-only
screen and impossible once a form has to re-encode the delimiter — any
description containing `": "` would round-trip wrong. `raisedBy` was not stored
at all, and `toCorrection()` hard-coded `"author"`, which was wrong for every
correction the proofreader or copyeditor raised.

**The backfill splits on the FIRST `": "`, deliberately.** A location may
contain a comma (`"References, Beck & Demirgüç-Kunt"`) and a description may
contain a colon, so splitting on the last — or on every — separator would cut
the wrong string. Verified against the live database afterwards: all six
seeded corrections split correctly, including both hard cases.

**One thing the verification caught.** `raisedBy` came out of the migration as
`"author"` on all six rows — correct behaviour, since the column's backfill
default was the only thing available and the old rows carried no such data, but
wrong as *data*: two of the six were raised by the proofreader. The truth only
existed in the fixtures, so a reseed restored it. Checked again after:
`proofreader` on the footnote and reference rows, `author` on the other four.
Worth remembering that a migration reporting success is not the same as a
migration having produced the right data.

**Applying a correction clears any decline reason.** A correction that was
refused and is now being applied must not keep a refusal that no longer
happened.

**Two audit-script bugs found while verifying this, both pre-existing and both
fixed.** Each script printed `across ${PAGES.length} pages` no matter how many
actually loaded — a `fetch failed` route is skipped with `continue` and was
still counted. A run where fourteen portal routes never loaded therefore
reported "0 findings across 96 pages", which is the exact failure mode
CLAUDE.md warns about: nothing breaks, no test fails, and the number stops
being believable. Both now report *audited of listed*, list every page that did
not load, and **exit non-zero on an incomplete run** so a failed sweep cannot
pass for a clean one.

Checks: `npm run typecheck` and `next lint` clean. No migration was needed —
`ProductionGalley.storagePath` already existed.

### The reviewer pool, and two missing links in the workflow ✅ (2026-09-16)

A guided manual walkthrough of the reviewer and production paths, which found
that **two steps of the journal's workflow had no code behind them at all**.
Both were invisible from the screens: nothing errored, the data simply never
appeared where the next person would look for it.

#### 1. The `reviewer` role and the reviewer pool were never joined

Registration grants `reviewer` to anyone who asks. But an editor's shortlist is
built from `ReviewerProfile`, and **`reviewerProfile.create` existed only in
`prisma/seed.ts`** — no form, no action, no admin screen wrote one. An account
could hold the role indefinitely and never be offered to a single editor, with
nothing on any screen explaining the silence. `/admin/reviewer-applications`
says on its face that accepting "does not create an account", which covered
half the gap; the other half — an account that exists but is not in the pool —
was undocumented.

**Built:** a *Reviewer pool* section on `/admin/users/[userId]/edit`, between
Roles and Status.

- `reviewerPoolSchema` (`schemas.ts`), `getReviewerPoolEntry()` (`admin.ts`),
  `saveReviewerPool` / `removeFromReviewerPool` (users `actions.ts`),
  `ReviewerPoolForm` (client).
- **Expertise is a line-per-term textarea**, because `getReviewerMatches`
  compares each term against a manuscript's keywords in *both* directions
  (substring either way). Prose would match nothing.
- **Sections are checkboxes built from the `Section` table, never free text**,
  and the action re-validates against the live registry. `sectionMatch` is an
  exact `sections.includes(...)`, so a hand-typed name silently never matches —
  which is exactly the state three seeded profiles were in (below).
- **Availability is deliberately not offered.** The field distinguishes the
  reviewer's own statement ("unavailable until March") from the journal's
  inference ("holding three already"); an administrator setting either would be
  putting words in someone else's mouth. A new entry starts `available`.
- Removal refuses while the reviewer holds an open invitation — a
  `ReviewAssignment` points at the `User`, not the profile, so it would outlive
  the pool entry and sit in their queue with nobody expecting a report.
- Guarded on `adminOnly`, audited as `reviewerPool.added` / `.updated` /
  `.removed`, and revalidates `/editorial/reviewers-db` plus the dynamic
  `/editorial/[submissionId]/reviewers`. **That last call is the only
  literal-segment `revalidatePath(..., "page")` in the codebase and is
  unverified** — if a stale shortlist is ever reported after a pool edit, look
  there first.

No migration: `ReviewerProfile` already existed with RLS on.

#### 2. Accepting a manuscript never created a production job

`DECISION_EFFECT.accept` set the status to `accepted` and stopped.
**`productionJob.create` appeared only in `prisma/seed.ts`** — the string
"production" did not occur anywhere in `editorial/actions.ts`. Every production
job in the database had arrived with the fixtures; **no manuscript had ever
entered production through the app.** The editor saw a decision recorded and
production saw nothing arrive.

Fixed inside `recordDecision`'s existing transaction, so a manuscript cannot be
accepted without its job or carry a job for a decision that rolled back. All
three stage rows are created `notStarted` up front, because `currentStage()`
walks them in order and the production queue reads "done of three" — a job with
no stage rows reads as *finished* rather than as *not started*. Re-acceptance
is guarded by a `findUnique` on the `@unique` `submissionId`; an existing job is
left exactly as it is, since it may already carry galleys and corrections.

**Verified against live data before the client used it:** the four pre-existing
jobs were byte-identical after the change (stage, galley and correction counts
unchanged), a simulated double-accept produced no second job, and the three
stages came out `copyedit=notStarted, galleys=notStarted, proofread=notStarted`.

#### 3. A status guard that stranded finished manuscripts

`submitReview` advanced a submission to `awaitingDecision` only from
`underReview` or `deskReview`. But inviting a reviewer straight from the queue
is one click and leaves the status at `submitted`, so such a manuscript
collected every report it would ever get and **never appeared in the editor's
"decision owed" count**. The report was reachable only by opening the
manuscript and already knowing to look. `submitted` added to the guard; the two
stranded rows (`0079`, `0051`) were advanced by hand.

#### 4. Section-name drift, fixed at source this time

Three seeded profiles carried sections outside the registry — "Public Policy"
(×2) and "Psychology" — and so matched nothing for their own subject. Repaired
in the database, **and `resolveSectionName()` in the seed was extended** from
two hard-coded `if`s to a `SECTION_ALIASES` map plus a **throw on any name that
is neither canonical nor aliased**. Silent pass-through is what produced the
drift in the first place: the row saves, the reviewer never matches, and
nothing reports a fault. All 14 distinct fixture section values were run
through it and resolve cleanly; the guard fires on an unknown name.

The *fixtures* still carry the bad names, so `mock-reviewers.ts` remains wrong
at source — the alias map now absorbs it rather than the database inheriting it.

#### 5. Stale notices — four more, all in the "denies a feature that works" direction

The failure mode this project hits most, per `CLAUDE.md`:

- `/production` claimed proof corrections were "not built" — built 2026-09-14.
- `/reviews/[reviewId]` printed "Downloads become available when the file store
  is connected" **unconditionally**, above files that download perfectly well.
  Now conditional, and worded as the editorial overview words it.
- `review-form.tsx`'s success panel said "Once the backend is connected,
  submitting marks the assignment complete, notifies the handling editor…" —
  all of which now happens except the notification, which is stated as the gap
  it is rather than left inside a promise about the future.
- `/editorial/reviewers-db` said "there is no database behind it… the counts
  come from scaffold data". Both untrue: every figure is computed from real
  `ReviewAssignment` rows. This one actively taught editors to distrust numbers
  that were real.

Also fixed: `name.split(" ")[0]` rendered "Dr. Muhammad Sohaib" as **"Dr."** in
two places. `givenNameOf()` in `lib/utils` skips honorifics and falls back to
the whole string, so a title-only name never renders as a blank.

#### What the walkthrough proved

Reviewer path end to end, on real data: pool entry → editor's shortlist (3
matched keywords, section chip) → invite (42-day window) → accept → report →
read-only. **Double-blind held at every screen** — the author's name appears on
the editorial pages and on none of the reviewer ones, enforced by `ReviewTask`
having no author field rather than by hiding it. The 200-character floor and
both mandatory declarations refuse a short or undeclared report.

Production path: accept → job created → copyediting assigned, sent to author,
approved, done (1 of 3). **Typesetting onward is untested** — see "► NEXT".

Standing checks green throughout: `npm run typecheck` and `next lint` after
every change. **Neither structural audit has been re-run** — see the annoyances
list at the top.

---

### Phase 4 — the `/admin/users` role screen ✅ (2026-09-09)

Roles and account status save. Until now they did not, so **nobody could be
made an editor, copyeditor or managing editor** — every role came from what
someone chose at registration (author, reviewer, or both), and the whole
editorial and production side of the portal had screens with nobody able to
reach them.

**The rule was already written; nothing enforced it.** `assignableRoles()` has
been in `src/config/roles.ts` since phase 12 and was applied nowhere:

- a `superAdmin` grants all twelve roles, `admin` and `superAdmin` included
- an ordinary `admin` grants the other ten, and neither of those two

**It is applied to both directions of every change.** Granting a withheld role
and *revoking* one are the same escalation — an administrator who could strip
`superAdmin` from the account above them would have found the back door. So
`saveUserRoles` diffs before against after and refuses if either the added or
the removed set contains a role the actor may not grant.

**Suspension obeys the same rule as revocation**, because it removes access
just as completely. An ordinary administrator cannot suspend an `admin` or a
`superAdmin`; without that, suspending the account above you would have been
the escalation by another route. Nobody may change their own status either —
an administrator who locks themselves out has no way back in.

**The last super administrator cannot lose the role.** A journal with none
cannot appoint one, because nobody left holds `roles.manageAdmins`, so the
platform would be permanently unrecoverable. `isLastSuperAdmin()` in `admin.ts`
warns on the form *before* the box is unticked; `saveUserRoles` counts the
other holders and refuses regardless — the warning is a courtesy, the count is
the guard.

**Every action re-guards.** The pages call `requireGroup("adminOnly")`, but a
Server Action is its own entry point and can be invoked without the page that
renders its form ever loading — the same reasoning as `recordDecision` in phase
17. Every disabled checkbox and greyed button on these screens is a courtesy to
the reader; the server refuses independently, because a form post is trivially
forged.

**Roles are replaced wholesale, not diffed.** `UserRole` is keyed on (userId,
role) and carries nothing else, so there is no state to preserve, and a
delete-then-insert inside one transaction cannot leave a half-applied set the
way a sequence of individual grants can.

**Two forms, not one.** Roles and status are separate decisions with separate
rules — an ordinary administrator may change ten roles on an ordinary account
and nothing at all on an administrator's — so one combined form would have had
to refuse the whole submission over either half.

**The audit entry stores both sides.** `{ before, after, added, removed }`
rather than just the new set: "who granted admin, and what did they take away
to do it" is the question that log is read to answer.

**`/admin/users/new` no longer carries a form.** It collected a name, an
address and a set of roles and saved nothing. With everything around it now
saving, a form that does not would be the worse failure — a reader would
reasonably assume it works. An invited account is only useful if the invitation
arrives, and the journal owns no domain, so the account would sit `invited`
forever with nobody able to set its password. The page now states the route
that works today: the person registers themselves, an administrator grants the
roles afterwards. `user-form.tsx` was deleted with it.

**The stale notices went with the feature**, per the standing rule: the users
screen said "Account management is not built yet", the edit screen said "This
form does not save yet", and `UserRowActions` and `UserDangerZone` both raised
`alert("there is no database")`. All four are gone. What replaced them says
what *is* still true — accounts cannot be created here, and why.

**Deletion is still refused, deliberately.** A suspended account owns
submissions, appears in decision history and may be an author on a published
article. `UserDangerZone` keeps its type-the-name confirmation and now asks for
the suspension reason in the same step, since a suspension nobody can explain
later is not defensible against an appeal.

**Checks:** `npm run typecheck` and `next lint` clean; responsive audit **0
findings across 96 pages** with a real session. **The a11y audit was not
completed** — the dev server hit the documented connection-pressure failure
part-way through and the run was abandoned. Run it against a freshly started
server before trusting its numbers.

### Phase 6 — Email: connected, but it can only reach one address 🟡 (2026-09-09)

Resend is wired up and sending. **The journal does not own a domain yet**, so
Resend delivers only to the account owner's own address and only from
`onboarding@resend.dev`; mail addressed to an author or a reviewer is accepted
by this code and refused by the provider with a 403. That is the whole of what
is missing, and it is a purchase, not a code change.

**One module calls Resend.** `src/lib/email/send.ts`, for the same reason
`storage.ts` will be the only caller of Cloudinary: a provider reached from
thirty places cannot be swapped, rate-limited or audited. Brevo remains the
documented fallback, and switching should be a change to that file alone.

**Nothing throws into a Server Action.** A decision letter that fails to send
must not roll back the decision — the editor's hour of writing is worth more
than the notification, and the office can resend by hand. `sendEmail` returns a
result; callers decide what to say. Every current caller treats the database
row as the record and the mail as a courtesy, in that order.

**`canReachRecipients()` exists so no screen lies.** It is false while
`EMAIL_FROM` is still a `resend.dev` address, and it drives *wording*, not
sending. The contact form's success text therefore says the message reached the
editorial office — true, the row is written — and does not tell the sender to
watch an inbox that will receive nothing. Registration's message branches on
the actual send result rather than assuming either outcome.

**Six of the fifteen templates are written**, and deliberately only those whose
trigger exists in the code today: welcome, account invite, contact receipt,
contact office notification, reviewer-application receipt, reviewer-application
office notification. A template with no caller is a promise the app cannot
keep, so the remaining nine are added as their phases land.
`/admin/settings/email-templates` still enumerates all fifteen.

**Text first, HTML optional.** Every message reads correctly with no HTML,
because a decision letter that only renders in a graphical client is one some
authors cannot read. None carries an unsubscribe link — these are
transactional, the consequence of something the recipient did or of a decision
about their own manuscript; `/profile/notifications` governs a different set.

**The reply-to address is `siteConfig.contact.editorialOffice`**, never the
sending mailbox, which nobody reads. Read from config rather than repeated in
the templates, so the address printed on `/contact` and the one an author
replies to cannot drift apart. The two office notifications set reply-to to the
*sender* instead, so the office can answer without copying an address out of
the portal.

**Verified against the live Resend account:** the welcome, contact-receipt and
contact-office messages all delivered to the owner address (inbox, not spam);
a send to a non-owner address returned **403 — "verify a domain"**, which is
exactly the state `canReachRecipients()` reports. `npm run typecheck` and
`next lint` clean.

**What unblocks the rest:** buy the journal's domain, verify it at
resend.com/domains, and set `EMAIL_FROM` to an address on it. No code moves.
Until then, **do not** switch `register`'s `email_confirm` back to `false` —
that would create accounts whose confirmation link cannot be delivered.

### Supabase Auth keys — in place (2026-09-08)

`.env.local` now carries all three. Supabase has **renamed its keys**: what the
docs and this file call `anon` / `service_role` appear in the dashboard under
Project Settings → API Keys as **Publishable key** (`sb_publishable_…`) and
**Secret key** (`sb_secret_…`). Same roles, new names — the env variables keep
the conventional names so `@supabase/ssr` and every tutorial still line up.

---

## Where to pick up — the backend

**Read "► NEXT" at the top of this file first** — it is the short answer, and
this section is the standing detail behind it.

The frontend is finished and the backend nearly is. Auth, file storage and the
database are all done; an author can submit a manuscript end to end and the
people entitled to it can download it, and an administrator can grant the roles
that open the editorial and production side. Galley and revision uploads landed
2026-09-14, and the two missing workflow links — putting an account into the
reviewer pool, and creating a production job on acceptance — landed 2026-09-16.
**Issue planning landed the same day**, which was the last unbuilt feature.

What remains is **a domain** (which unblocks all email) and **finishing the
production walkthrough** that is currently in flight. Every remaining item is
something money buys rather than something to write. The ► NEXT block at the
top of this file carries the exact next actions in order.

### The services, settled 2026-09-08

A Supabase project now exists. Every piece is on a free tier, and none of them
is close to its limit at this journal's scale:

| Layer | Service | Free tier | Note |
|---|---|---|---|
| Database | Supabase Postgres | 500 MB | Paused after a week idle on free. **The shared pooler also drops the odd connection** — see the note below |
| Auth | Supabase Auth | 50,000 monthly active users | A journal will have hundreds. Its built-in mailer is test-only, so verification and reset mail goes through the provider below |
| Files and images | **Cloudinary** | 25 GB | Chosen over Supabase Storage (1 GB) on capacity. **See the confidentiality caveat** in the file-storage bullet below — this is the one choice with a real cost attached |
| Email | Resend (Brevo the fallback) | 3,000/month · 9,000/month | Phase 6. Not needed to decide until then |

`docs/BACKEND-PLAN.md` carries the reasoning and, for Cloudinary, the exact
flags that keep a manuscript private.

#### "Can't reach database server" — the pooler, not an outage (2026-09-17)

The client hit `Invalid prisma.user.findUnique() invocation: Can't reach
database server` as a full-page runtime error on a portal route. Both
connection strings were verified reachable a minute later, so this was the
shared pooler dropping a connection rather than anything being down.

**Why it took the whole portal down rather than one query.**
`getCurrentUser()` runs on every portal render, so a single dropped connection
does not fail a page — it replaces the portal with a crash screen, for a fault
that is over before the reader has finished reading it.

`loadProfile()` in `src/lib/auth/current-user.ts` now **retries that one query
once**, after 400ms, and only on Prisma's `P1001`. A real outage still throws,
and should: signing someone in against a database nobody can reach would mean
rendering a portal with no roles in it. Nothing else in the app retries —
a failed query on one screen is a failed screen, which is the honest outcome.

When diagnosing this, note that `.env.local` carries **commented-out**
`localhost` fallbacks for `DATABASE_URL` and `DIRECT_URL` directly beneath the
live Supabase pair. A grep that does not exclude `#` lines reports the variable
twice and looks like a misconfiguration. It is not.

### The two known defects in the data — fixed in the seeded database, still open in the fixtures

Neither is a UI bug, and both are now corrected everywhere the app reads from
the database — which, after phase 3, is every portal reader. They are listed
here because the **source fixtures** (`mock-submissions.ts` etc.) still carry
the original drift, so any new code path that reads those files directly
instead of the database would reintroduce it:

1. **Section name drift.** Manuscripts are filed under "Gender Studies", which
   is not one of the ten subject areas on `/about/aims-scope` — the declared
   name is "Gender & Development". `/admin/settings/sections` shows it. Fixing
   the fixtures is a five-minute change; preventing it needs sections to become
   a registry rather than a free string on each submission. **Already true of
   the database** — `Section` is a real table and the seed script corrected
   the name on the way in.

   **Wider than recorded here, and now contained (2026-09-16).**
   `mock-reviewers.ts` carried three more: "Public Policy" (×2) and
   "Psychology", which left those reviewers matching nothing for their own
   subject. `resolveSectionName()` is now an alias map that **throws on any
   name that is neither canonical nor aliased**, so the seed cannot introduce a
   fourth silently. The fixtures themselves are still wrong; the map absorbs
   them on the way in.
2. ~~**`/admin/settings/policies` duplicates the review date**~~ — **fixed
   2026-09-14.** `reviewedAt` is now a field on the `POLICIES` array in
   `policy-page.tsx`, and it is the only place the date lives. `PolicyPage` no
   longer takes an `updated` prop at all — it reads `policyReviewedAt(slug)` —
   so the seventeen pages cannot drift from what the settings screen reports.
   Removing the prop rather than defaulting it is what made the typechecker
   find every page still passing its own. The settings screen now shows
   genuinely per-policy dates and derives its headline figure from the
   *oldest* policy rather than one hard-coded constant, since an average would
   hide the single forgotten policy that the figure exists to surface. Its
   "changing a policy" steps now say to edit `reviewedAt`, not `updated=`.
   Note that four non-policy `DocPage` callers (`/about/journal-information`,
   `/about/aims-scope`, `/for-authors/guidelines`,
   `/for-reviewers/guidelines`) still pass their own `updated=` — that prop is
   a general `DocPage` feature and was never the duplication; only the
   seventeen policies were.

### What the backend has to do

Every `TODO(backend)` in the codebase is one of these. In rough dependency
order:

- **Auth — done, on Supabase Auth.** Sign-in, registration, password reset and
  sign-out are real; the middleware redirect is live and verified against a
  production build. What remains is not auth: address verification and reset
  delivery both wait on phase 6, and the demo door is deliberately still open
  (see "The demo door" below for what to delete when it closes).
- **A database — done, on Supabase.** All
  six portal readers (`submissions.ts`, `reviews.ts`, `editorial.ts`,
  `production.ts`, `admin.ts` and `current-user.ts`) now query the database.
  See "Backend progress" above for what each rewrite had to reconcile. What
  remains is Supabase itself (a two-line env change) and phase 4, writing.
- **A mail provider.** `/admin/settings/email-templates` enumerates all 15
  messages the portal has promised, six of which have no manual alternative.
  **Resend**, with Brevo as the fallback if its 3,000/month free tier ever
  proves tight — which on this journal's volume it will not.
- **File storage — Cloudinary, not Supabase Storage.** Chosen on capacity:
  25 GB free against Supabase's 1 GB. The trade is that **confidentiality
  becomes opt-in**: Cloudinary's default is a permanently public URL, so every
  upload needs `type: "authenticated"` and every read needs a short-lived
  signed URL minted after the entitlement check. `docs/BACKEND-PLAN.md` carries
  the code and the reasoning. Manuscript upload, galleys, and every download
  link that is currently absent rather than broken all wait on this.
- **Crossref membership.** No prefix means no DOI resolves; `/admin/doi` and
  `/admin/settings/journal` both say so.
- **An ISSN and e-ISSN.** With the prefix, these are the three fields that block
  a DOAJ application.

### The demo door — deleted (2026-09-09)

**It is gone, and nothing replaces it.** The portal used to be walkable with no
credentials at all: `/login` carried an "Enter as super administrator" button
that set a `borjss_dev_role` cookie, six demo addresses worked with any
password, and the middleware skipped its redirect wherever `isDemoMode()` was
true — which was every local run and every preview deployment.

Deleted in full: `signInAsDemoAdmin`, `DemoAdminEntry`, `DemoAccounts`,
`DEMO_ACCOUNTS`, `IDENTITIES`, `devRole()`, `ROLE_COOKIE`, the `demoMode` prop,
`isDemoMode()`, `src/lib/auth/demo-mode.ts` itself, and `BORJSS_DEMO` from both
env files. `getCurrentUser()` now returns null when there is no session, and
the middleware redirect has no exception.

**Why not keep it behind the environment check.** A guard with a bypass is a
guard nobody can reason about, and "it only opens in development" is a claim
that has to stay true across every deployment target forever. The reason it
existed — that most of the twelve roles had no password anyone could use — was
answered by real accounts instead.

**One account can sign in.** `ceoborjss@gmail.com`, superAdmin + author +
reviewer, created through the Supabase admin API. The other 39 `User` rows are
seeded profiles with no auth credentials: they appear in the user directory and
own manuscripts, and none of them can sign in.

**The audits needed a real session too.** Both sent
`borjss_dev_role=superAdmin`; without it every portal route answers 307 and an
audit would grade the login page 96 times while reporting zero findings.
`scripts/audit-session.mjs` signs in with `AUDIT_EMAIL` / `AUDIT_PASSWORD` from
`.env.local` and returns the cookie `@supabase/ssr` expects. **Without those
variables the audits print a warning saying the portal was not audited** rather
than reporting a clean sweep of pages they never saw — the failure mode that
mattered most to prevent.

That helper reads `.env` with `split(/
?
/)`: a file written on Windows
carries CRLF, and a stray `
` inside the password fails the sign-in with no
visible reason. It cost a debugging round here; do not "simplify" it back.

**Verified after the removal**, against a production build: `/dashboard`,
`/admin/users`, `/editorial/queue` and `/profile` all **307 → /login** with no
session, public pages still 200, and both audits **0 findings across 96 pages**
with a real session.

### Standing rules for whoever picks this up

- Run `npm run typecheck` and `next lint` on every change.
- Keep both audits at **0**: `node scripts/responsive-audit.mjs` and
  `node scripts/a11y-audit.mjs`, against a suffixed server on port 3100.
- Never run an unsuffixed dev server or build while the client's is running,
  and always `rm -rf .next-build-check` afterwards.
- Verifying admin and production screens needs an account that holds the roles.
  There is no mock user to widen any more — `current-user.ts` reads the
  Supabase session and nothing else — so sign in as `ceoborjss@gmail.com`
  (superAdmin + author + reviewer) or grant roles from `/admin/users`. Check
  the plain `admin` case too: it is the one `assignableRoles()` constrains.
- ~~**`docs/PORTAL-WALKTHROUGH.md` is stale on every dynamic route.**~~ —
  **rewritten 2026-09-14.** Every link is now a real seeded UUID, derived from
  `prisma/seed.ts`'s deterministic `uid()` mapping (`md5("<namespace>:<mock
  id>")` with the version and variant bits stamped) rather than guessed; the
  submission ids were cross-checked against the ones already in
  `scripts/responsive-audit.mjs` and match. Note that a review task's URL id is
  its **assignment** id (`uid("assignment", "rv2:rv2")`), not the submission's
  — `/reviews/[reviewId]` looks up `reviewAssignment`.

  The ids were the smaller half of the job. The doc also asserted a pile of
  things phases 3–5 had since falsified: that nothing saves or sends, that no
  file can be uploaded or downloaded, that the wizard carries a "drafts are not
  saved" notice, that the dashboard shows a "Portal preview" alert, and — in
  the setup instructions — that you edit `current-user.ts` to swap roles and
  restore it afterwards, which the demo-door deletion made impossible. All are
  corrected, and the doc now lists what genuinely does not work (email beyond
  one address, galley uploads, no Crossref prefix/ISSN). It also gained the two
  screens it never listed, `/admin/messages` and
  `/admin/reviewer-applications`. Its "check on every screen" list now asks
  explicitly for stale notices in *both* directions, since a screen still
  denying a feature that has landed is the failure mode this project hits more
  often than the reverse.
- **Never state on a page that a feature works when the code shows a stub.**
  Every screen currently says what it cannot do and gives the email route that
  works today. Delete those notices only when the thing they describe is real.

---

## Decisions already made — do not reopen

- One unified portal, not separate portals per role.
- `superAdmin` exists as a twelfth role, above `admin`.
- Pure white background; no dark mode. The dark-mode tokens were deliberately
  removed from `globals.css`.
- The founder card stays side-by-side (copy left, portrait right) at **every**
  width, including phones. A stacked mobile version was built and rejected.
- The credential line reads "PhD in Management Sciences", not a bare "PhD",
  and the title is "CEO", not "Founder".
