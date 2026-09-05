# BORJSS — build progress

**Last updated:** 2026-09-04
**Status: the frontend is complete.** All 92 routes are built, no stubs
remain, and **step 22 (final polish) is done**. `/kitchen-sink` has been
deleted, which is why the count is 92 rather than 93.

Standing checks, all green: `npm run typecheck`, `next lint`, a production
build (98 static pages), **0 findings** from both the responsive audit and the
new accessibility audit across 87 pages, and both schema suites (19 + 37).

What remains is **the backend**. Nothing on this platform stores, sends or
authenticates anything — see "What the backend has to do" at the end of this
file.

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

**One duplication is called out rather than hidden:** the review date lives in
each policy page as `updated=` *and* again on this screen. Moving it onto the
`POLICIES` array as a `reviewedAt` field would remove it and allow genuinely
per-policy dates — worth doing the next time a policy is actually revised.

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

## Where to pick up — the backend

**The frontend is finished.** Every route is built, every check is green, and
there is no more frontend work queued. What follows needs a database, an auth
provider, a mail provider and file storage.

### The two known defects in the data

Both are visible in the app and neither is a UI bug:

1. **Section name drift.** Manuscripts are filed under "Gender Studies", which
   is not one of the ten subject areas on `/about/aims-scope` — the declared
   name is "Gender & Development". `/admin/settings/sections` shows it. Fixing
   the fixtures is a five-minute change; preventing it needs sections to become
   a registry rather than a free string on each submission.
2. **`/admin/settings/policies` duplicates the review date**, which also lives
   in each policy page as `updated=`. Move it onto the `POLICIES` array as a
   `reviewedAt` field.

### What the backend has to do

Every `TODO(backend)` in the codebase is one of these. In rough dependency
order:

- **Auth.** `src/middleware.ts` exists with its redirect commented out;
  `getCurrentUser()` returns a fixed mock. Both are the switch. The five
  `ScaffoldNotice` blocks come out of the auth pages at the same time.
- **A database.** Every `src/lib/api/mock-*.ts` file is a fixture set with a
  matching read function beside it — `submissions.ts`, `editorial.ts`,
  `production.ts`, `admin.ts`, `reviews.ts`. Filtering, sorting and pagination
  already live in those modules rather than in the pages, so the swap is
  per-function.
- **A mail provider.** `/admin/settings/email-templates` enumerates all 15
  messages the portal has promised, six of which have no manual alternative.
- **File storage.** Manuscript upload, galleys, and every download link that is
  currently absent rather than broken.
- **Crossref membership.** No prefix means no DOI resolves; `/admin/doi` and
  `/admin/settings/journal` both say so.
- **An ISSN and e-ISSN.** With the prefix, these are the three fields that block
  a DOAJ application.

### The demo door — remove it when auth lands

The portal can be walked with no credentials at all. `/login` carries an
**"Enter as super administrator"** button that sets `borjss_dev_role` and
redirects to `/dashboard`; the six demo addresses below it still work with any
password. Super administrator because it is the only role that reaches every
screen — `audit.view` and `platform.manage` are withheld even from `admin`, so
a demo signed in as anything less hits a redirect mid-walkthrough.

A demo *password* was considered and rejected: it has to be handed to whoever
is being shown the portal, so it is not a secret, and all it adds is a step to
mistype. **The guard is `isDemoMode()`, not a credential.**

`isDemoMode()` is now open in three cases: local runs, Vercel preview
deployments, and **`BORJSS_DEMO=1`**. That third one exists because preview
URLs change on every push, so demoing from one means sending a fresh link each
time; setting the variable on the Vercel project opens the demo on the stable
production domain instead. Unsetting it closes every demo route again with no
code change and no deploy — that property is what makes the switch safe to
leave in the codebase.

**When auth lands, delete:** `signInAsDemoAdmin` in `(auth)/actions.ts`, its
`DemoAdminEntry` and `DemoAccounts` panels in `login-form.tsx`, `DEMO_ACCOUNTS`
and the `devRole()` path in `current-user.ts`, and `demo-mode.ts` itself.

### Standing rules for whoever picks this up

- Run `npm run typecheck` and `next lint` on every change.
- Keep both audits at **0**: `node scripts/responsive-audit.mjs` and
  `node scripts/a11y-audit.mjs`, against a suffixed server on port 3100.
- Never run an unsuffixed dev server or build while the client's is running,
  and always `rm -rf .next-build-check` afterwards.
- Verifying admin and production screens needs a wider mock user: set
  `current-user.ts` to include `superAdmin`, run the checks, then restore it to
  `["author", "reviewer", "sectionEditor"]`. Check the plain `admin` case too —
  it is the one `assignableRoles()` constrains. `docs/PORTAL-WALKTHROUGH.md` is
  the click-through list.
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
