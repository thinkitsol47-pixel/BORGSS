# Portal walkthrough — all 52 portal routes

A checklist for reviewing every portal page by hand, as a super administrator.

**45 numbered screens below, covering all 52 routes under `(dashboard)`.** The
other seven are reached from the row they belong to rather than numbered
separately — the three CRUD forms (new/edit announcement, new/edit issue),
`/admin/users/new`, and the two superAdmin-only screens. Counted from the
source: `find "src/app/(dashboard)" -name page.tsx`. Re-run it rather than
trusting this number.

**Before you start:** sign in as a real account. `ceoborjss@gmail.com` holds
superAdmin + author + reviewer, which is what makes every screen below
reachable and the whole sidebar visible. There is no role-switching to undo
afterwards — the demo door (a cookie that named a role, and a one-click entry
that checked no password) was deleted once real accounts existed, and
`src/lib/auth/current-user.ts` now reads the Supabase session and nothing else.
An account that cannot sign in cannot see any of this.

**The ids below are real seeded UUIDs**, derived from `prisma/seed.ts`'s
deterministic `uid()` mapping. Every id-bearing route uses `@db.Uuid`, so the
old short mock ids (`/submissions/s1`, `/editorial/q3`) all 404. Where a
fixture was chosen to show a particular state, it says so.

> **After a reseed with different fixture data, re-derive these.** They are a
> pure function of the mock id: `md5("<namespace>:<mock id>")` with the version
> and variant bits stamped. `scripts/responsive-audit.mjs` carries the subset
> the audit exercises and is the other place to keep in step.

Start the dev server the usual way and open <http://localhost:3000>.

---

## Overview — 1 screen

| # | Screen | Link | What to look for |
|---|---|---|---|
| 1 | Dashboard | [/dashboard](http://localhost:3000/dashboard) | Real counts from the database, "needs your attention", two charts |

---

## Author — 12 screens

Your own manuscripts. Six fixtures, each chosen for a different state.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 2 | My submissions | [/submissions](http://localhost:3000/submissions) | List, filter bar, cards on mobile / table on desktop |
| 3 | Submission detail | [/submissions/ad05e967-0083-4737-9c27-2fd491dee6d9](http://localhost:3000/submissions/ad05e967-0083-4737-9c27-2fd491dee6d9) | `s1` — awaiting revision, two decisions in history |
| 4 | — revisions | [/submissions/ad05e967-.../revisions](http://localhost:3000/submissions/ad05e967-0083-4737-9c27-2fd491dee6d9/revisions) | Files download through `/files/<id>` |
| 5 | — messages | [/submissions/ad05e967-.../messages](http://localhost:3000/submissions/ad05e967-0083-4737-9c27-2fd491dee6d9/messages) | |
| 6 | — decision | [/submissions/ad05e967-.../decision](http://localhost:3000/submissions/ad05e967-0083-4737-9c27-2fd491dee6d9/decision) | Author's view — "Reviewer 2", never a name |

**Worth also opening** — the other five author fixtures:

| Mock id | State | Link |
|---|---|---|
| `s2` | Mid-review, overdue third reviewer | [/submissions/f26b7674-200b-41f7-ac84-ab96e7a537d1](http://localhost:3000/submissions/f26b7674-200b-41f7-ac84-ab96e7a537d1) |
| `s3` | Brand new, no history | [/submissions/644c480c-ee10-428b-a2e7-4e5837434051](http://localhost:3000/submissions/644c480c-ee10-428b-a2e7-4e5837434051) |
| `s4` | Desk rejected | [/submissions/c8697e7d-3c06-4dcf-86fc-d2817a2c13d4](http://localhost:3000/submissions/c8697e7d-3c06-4dcf-86fc-d2817a2c13d4) |
| `s5` | Accepted, in production | [/submissions/c1e487cf-fc6e-41b2-87c1-f2f2c0852a09](http://localhost:3000/submissions/c1e487cf-fc6e-41b2-87c1-f2f2c0852a09) |
| `s6` | Withdrawn | [/submissions/83069cca-b2fd-43c2-a10b-5b9f76eb8e66](http://localhost:3000/submissions/83069cca-b2fd-43c2-a10b-5b9f76eb8e66) |

### The submission wizard — 7 screens

**The wizard is live end to end.** Step 1 creates a real draft row and redirects
to step 2 with its id, so there is no fixed `draftId` to link here — start at
step 1 and follow it through. Each step saves; the "drafts are not saved"
notice that used to stand on every screen is gone because it is no longer true.

| # | Step | Link |
|---|---|---|
| 7 | 1. Start | [/submissions/new](http://localhost:3000/submissions/new) |
| 8 | 2. Upload | follow step 1 — `/submissions/new/<draftId>/upload` |
| 9 | 3. Metadata | `/submissions/new/<draftId>/metadata` |
| 10 | 4. Contributors | `/submissions/new/<draftId>/contributors` |
| 11 | 5. Declarations | `/submissions/new/<draftId>/declarations` |
| 12 | 6. Review & submit | `/submissions/new/<draftId>/review` |
| 13 | (details → redirects to step 1) | `/submissions/new/<draftId>/details` |

**Worth doing once in full:** upload a manuscript and a title page, fill the
remaining steps and submit. The reference comes from a Postgres sequence, the
files go to Cloudinary, and the manuscript appears in the editorial queue.
Then try submitting the same draft twice — the second is refused by the query.
An empty draft opened straight at step 6 is refused and names everything
missing.

A draft id belonging to another account, or one already submitted, renders
"This draft cannot be opened" rather than a 404 — the three cases are
deliberately indistinguishable.

---

## Reviewer — 3 screens

Four review fixtures, one per status. These are *different* manuscripts from
the author list above: the account holds both roles, and a journal never sends
someone their own paper.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 14 | My reviews | [/reviews](http://localhost:3000/reviews) | |
| 15 | Review task | [/reviews/7c4a0198-640e-461f-887e-b33f72e4d6b6](http://localhost:3000/reviews/7c4a0198-640e-461f-887e-b33f72e4d6b6) | `rv2` — accepted, in progress |
| 16 | Review form | [/reviews/7c4a0198-.../submit](http://localhost:3000/reviews/7c4a0198-640e-461f-887e-b33f72e4d6b6/submit) | The six-criteria form; files download |

**Worth also opening:**

| Mock id | State | Link |
|---|---|---|
| `rv1` | Invitation, not yet answered | [/reviews/36679139-15d1-4282-9ae2-15debd8cc45d](http://localhost:3000/reviews/36679139-15d1-4282-9ae2-15debd8cc45d) |
| `rv3` | Overdue | [/reviews/a87d34f2-20aa-4789-b89a-e87b1e1557b0](http://localhost:3000/reviews/a87d34f2-20aa-4789-b89a-e87b1e1557b0) |
| `rv4` | Already returned — read-only | [/reviews/62dc281d-6c27-483b-8a5a-dbc317263d7a](http://localhost:3000/reviews/62dc281d-6c27-483b-8a5a-dbc317263d7a) |

`rv1/submit` and `rv4/submit` deliberately redirect back to the task page: an
invitation must be accepted first, and a returned report cannot be edited.

**Check the file list on a task:** the title page and the cover letter are both
absent, not merely unopenable. Each names the authors, so a reviewer is never
shown that they exist.

---

## Editorial — 8 screens

Manuscripts from *other* authors. This is where reviewer names appear.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 17 | Submission queue | [/editorial/queue](http://localhost:3000/editorial/queue) | Sorted by waiting longest; search matches author names |
| 18 | Manuscript overview | [/editorial/f647b92f-b568-48d8-b9d7-65dcbecf366c](http://localhost:3000/editorial/f647b92f-b568-48d8-b9d7-65dcbecf366c) | `q3` — awaiting a decision; files download |
| 19 | — reviewers | [/editorial/f26b7674-.../reviewers](http://localhost:3000/editorial/f26b7674-200b-41f7-ac84-ab96e7a537d1/reviewers) | `s2` — overdue reviewer, matched suggestions |
| 20 | — decision | [/editorial/f647b92f-.../decision](http://localhost:3000/editorial/f647b92f-b568-48d8-b9d7-65dcbecf366c/decision) | **Two reviewers disagree** — minor revision vs reject. Saves |
| 21 | — production | [/editorial/0cac8670-.../production](http://localhost:3000/editorial/0cac8670-5330-4dc2-9194-2dc155f77714/production) | The handover view, five derived stages |
| 22 | Reviewer database | [/editorial/reviewers-db](http://localhost:3000/editorial/reviewers-db) | Eight reviewers, blocked ones greyed with the reason |
| 23 | Issues | [/editorial/issues](http://localhost:3000/editorial/issues) | One being assembled, two published |
| 24 | Issue detail | [/editorial/issues/e70b5ec4-08e5-4810-98ea-9b0964112e59](http://localhost:3000/editorial/issues/e70b5ec4-08e5-4810-98ea-9b0964112e59) | `ei3` — in preparation, 1 of 5 placed |

**Worth also opening:**

| Mock id | State | Link |
|---|---|---|
| `q1` | Just arrived, unassigned | [/editorial/185a81bc-52da-4050-87b8-d241cd65a595](http://localhost:3000/editorial/185a81bc-52da-4050-87b8-d241cd65a595) |
| `q2` | Round with an overdue third reviewer | [/editorial/87edde9f-8985-4a44-988f-5b4c4140e048](http://localhost:3000/editorial/87edde9f-8985-4a44-988f-5b4c4140e048) |
| `q4` | Round 2 resubmission | [/editorial/dca61219-fbfa-42ac-a8a8-64b42c0c2c80](http://localhost:3000/editorial/dca61219-fbfa-42ac-a8a8-64b42c0c2c80) |
| `ei1` | Published issue | [/editorial/issues/0287a355-a703-4112-bc90-0ba8c1abbebc](http://localhost:3000/editorial/issues/0287a355-a703-4112-bc90-0ba8c1abbebc) |

Also worth opening: [new issue](http://localhost:3000/editorial/issues/new) and
[edit issue](http://localhost:3000/editorial/issues/e70b5ec4-08e5-4810-98ea-9b0964112e59/edit).

---

## Production — 4 screens

Four jobs, each stalled differently.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 25 | Production queue | [/production](http://localhost:3000/production) | Stage, who it waits on, days stalled |
| 26 | Copyediting | [/production/0cac8670-.../copyedit](http://localhost:3000/production/0cac8670-5330-4dc2-9194-2dc155f77714/copyedit) | **With the author** |
| 27 | Typesetting | [/production/c1e487cf-.../galleys](http://localhost:3000/production/c1e487cf-fc6e-41b2-87c1-f2f2c0852a09/galleys) | Three galleys, two versions; JATS XML "Required — missing" |
| 28 | Proofreading | [/production/c1e487cf-.../proofread](http://localhost:3000/production/c1e487cf-fc6e-41b2-87c1-f2f2c0852a09/proofread) | **2 corrections still open**, 1 declined with reason |

**Worth also opening:**
[nothing started, unassigned](http://localhost:3000/production/2ae16c3a-390a-4e2f-8563-710c700756f5/copyedit) ·
[stalled at typesetting](http://localhost:3000/production/f82cbafd-4694-41f7-a86e-f31b2a502b78/galleys)

**Galley upload is the one file path not yet wired.** Each galley says so on its
own row. Everywhere else in the portal, files upload and download for real.

---

## Account — 3 screens

| # | Screen | Link | What to look for |
|---|---|---|---|
| 29 | Profile | [/profile](http://localhost:3000/profile) | Prefilled from the database; saves |
| 30 | ORCID | [/profile/orcid](http://localhost:3000/profile/orcid) | Check-digit validation; says an iD typed here is a claim, not proof |
| 31 | Notifications | [/profile/notifications](http://localhost:3000/profile/notifications) | Lists what is always sent |

---

## Administration — 9 screens

| # | Screen | Link | What to look for |
|---|---|---|---|
| 32 | Users | [/admin/users](http://localhost:3000/admin/users) | Accounts; one invited ("Never", not a dash), one suspended with a reason |
| 33 | User detail | [/admin/users/6cc55e24-a677-4cc8-b25e-d1646e0527d2](http://localhost:3000/admin/users/6cc55e24-a677-4cc8-b25e-d1646e0527d2) | `u1` — superAdmin + editorInChief, a multi-role account |
| 34 | — edit roles | [/admin/users/6cc55e24-.../edit](http://localhost:3000/admin/users/6cc55e24-a677-4cc8-b25e-d1646e0527d2/edit) | Roles and status **save**; the last superAdmin cannot lose the role |
| 35 | Roles & permissions | [/admin/roles](http://localhost:3000/admin/roles) | The 12×16 matrix and the four withheld permissions |
| 36 | Contact messages | [/admin/messages](http://localhost:3000/admin/messages) | The queue the office actually works |
| 37 | Reviewer applications | [/admin/reviewer-applications](http://localhost:3000/admin/reviewer-applications) | Accepting sets a status and writes an audit entry — no account is created |
| 38 | Statistics | [/admin/statistics](http://localhost:3000/admin/statistics) | Only what the data holds; "what is not measured" |
| 39 | DOI / Crossref | [/admin/doi](http://localhost:3000/admin/doi) | No prefix — every DOI is a placeholder that resolves nowhere |
| 40 | Announcements | [/admin/announcements](http://localhost:3000/admin/announcements) | All three post kinds; expired and scheduled marked. CRUD **saves** |

**superAdmin only** — an ordinary `admin` gets 307 → `/dashboard` on both:
[audit log](http://localhost:3000/admin/audit-log) ·
[integrations](http://localhost:3000/admin/integrations)

Also worth opening: [new announcement](http://localhost:3000/admin/announcements/new) ·
[edit one](http://localhost:3000/admin/announcements/announcement/call-for-papers-volume-2/edit)

---

## Settings — 5 screens

| # | Screen | Link | What to look for |
|---|---|---|---|
| 41 | Journal | [/admin/settings/journal](http://localhost:3000/admin/settings/journal) | Twelve editable fields; ISSN, e-ISSN and DOI prefix unset and blocking DOAJ. **Saves** |
| 42 | Sections | [/admin/settings/sections](http://localhost:3000/admin/settings/sections) | A real table with a foreign key; the ten declared subject areas |
| 43 | Review forms | [/admin/settings/review-forms](http://localhost:3000/admin/settings/review-forms) | Why it is not a form builder |
| 44 | Email templates | [/admin/settings/email-templates](http://localhost:3000/admin/settings/email-templates) | 15 messages promised, 6 written |
| 45 | Policy pages | [/admin/settings/policies](http://localhost:3000/admin/settings/policies) | 17 policies, months since the oldest review |

---

## What to check on every screen

1. **Does it render, and is the content real?** No blank panels, no lorem.
2. **Does it work on a phone?** Narrow the browser to ~375px. Tables should
   become cards or scroll inside their own container; the page itself must
   never scroll sideways.
3. **Is anything claimed that is not true?** This cuts both ways, and the
   second direction is the one that has gone wrong more often here: a screen
   that cannot do its job should say so, *and* a screen whose feature has since
   landed must stop saying it cannot. Report either.
4. **Does the sidebar highlight the right item?** Exactly one, and the deepest
   match.

## Known and deliberate

These are not bugs — each was a decision, recorded in `docs/PROGRESS.md`:

- Reviewer names never appear on author-facing pages, and author names never
  appear on reviewer-facing ones.
- Empty states are kept rather than hidden — a section with no manuscripts, a
  reviewer with no history ("—", never 0 days), an account that never signed in
  ("Never", not a dash).
- The audit log's rows are illustrative and the screen leads by saying so.
- Accounts cannot be created from `/admin/users/new`; the page states the route
  that works today and why.

## What genuinely does not work yet

**Nothing in the portal is unbuilt any more.** Every screen writes: the
submission wizard, revisions, editorial decisions and reviewer assignment,
reviewer reports, all three production stages, galleys and proof corrections,
announcements, roles and settings, and — since 2026-09-16 — issue planning.
What is missing is bought, not written:

- **Email reaches one address.** The journal owns no domain, so Resend delivers
  only to the account owner and refuses everything else with a 403. No screen
  may tell a recipient a message was sent to them — several say plainly that
  the file or letter goes out from the editorial office by hand.
- **No Crossref prefix, ISSN or e-ISSN**, which together block a DOAJ
  application. This is also why an issue cannot be **published** from
  `/editorial/issues` — planning it and placing manuscripts into it both save,
  but publishing mints a DOI for every article it carries.
- **Phase 7** — reminder emails and Crossref deposit — waits on the first of
  those.

---

## Still to fix

**Section drift in the source fixtures.** `mock-submissions.ts` files
manuscripts under "Gender Studies", which is not one of the ten declared
subject areas — the declared name is "Gender & Development". It is corrected
everywhere the app reads: `Section` is a real table and `prisma/seed.ts` fixes
the name on the way in, so screen 42 shows it correctly. It survives only in
the fixture files, where a new code path reading them directly would
reintroduce it.
