# Portal walkthrough — all 43 screens

A checklist for reviewing every portal page by hand, as a super administrator.

**Before you start:** `src/lib/auth/current-user.ts` has been set to
`["author", "reviewer", "superAdmin"]` for this walkthrough. Every screen is
reachable and the sidebar shows all 14 items. **Restore it to
`["author", "reviewer", "sectionEditor"]` when you are done** — the comment in
that file says why.

Fourteen of the 43 routes take an id. The links below use real fixture ids, so
each one lands on a page with content rather than a 404. Where a fixture was
chosen to show a particular state, it says so.

Start the dev server the usual way and open <http://localhost:3000>.

---

## Overview — 1 screen

| # | Screen | Link | What to look for |
|---|---|---|---|
| 1 | Dashboard | [/dashboard](http://localhost:3000/dashboard) | Real counts, "needs your attention", two charts, and the "Portal preview" alert |

---

## Author — 12 screens

Your own manuscripts. Six fixtures, each chosen for a different state.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 2 | My submissions | [/submissions](http://localhost:3000/submissions) | List, filter bar, cards on mobile / table on desktop |
| 3 | Submission detail | [/submissions/s1](http://localhost:3000/submissions/s1) | Awaiting revision, two decisions in history |
| 4 | — revisions | [/submissions/s1/revisions](http://localhost:3000/submissions/s1/revisions) | |
| 5 | — messages | [/submissions/s1/messages](http://localhost:3000/submissions/s1/messages) | |
| 6 | — decision | [/submissions/s1/decision](http://localhost:3000/submissions/s1/decision) | Author's view — "Reviewer 2", never a name |

**Worth also opening:** [s2](http://localhost:3000/submissions/s2) (mid-review,
overdue third reviewer) · [s3](http://localhost:3000/submissions/s3) (brand new,
no history) · [s4](http://localhost:3000/submissions/s4) (desk rejected) ·
[s5](http://localhost:3000/submissions/s5) (in production) ·
[s6](http://localhost:3000/submissions/s6) (withdrawn)

### The submission wizard — 7 screens

| # | Step | Link |
|---|---|---|
| 7 | 1. Start | [/submissions/new](http://localhost:3000/submissions/new) |
| 8 | (details → redirects to step 1) | [/submissions/new/d1/details](http://localhost:3000/submissions/new/d1/details) |
| 9 | 2. Upload | [/submissions/new/d1/upload](http://localhost:3000/submissions/new/d1/upload) |
| 10 | 3. Metadata | [/submissions/new/d1/metadata](http://localhost:3000/submissions/new/d1/metadata) |
| 11 | 4. Contributors | [/submissions/new/d1/contributors](http://localhost:3000/submissions/new/d1/contributors) |
| 12 | 5. Declarations | [/submissions/new/d1/declarations](http://localhost:3000/submissions/new/d1/declarations) |
| 13 | 6. Review & submit | [/submissions/new/d1/review](http://localhost:3000/submissions/new/d1/review) |

Any `draftId` works — `d1` is arbitrary. Every step carries the standing notice
that drafts are not saved.

---

## Reviewer — 3 screens

Four review fixtures, one per status.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 14 | My reviews | [/reviews](http://localhost:3000/reviews) | |
| 15 | Review task | [/reviews/rv2](http://localhost:3000/reviews/rv2) | Accepted, in progress |
| 16 | Review form | [/reviews/rv2/submit](http://localhost:3000/reviews/rv2/submit) | The six-criteria form |

**Worth also opening:** [rv1](http://localhost:3000/reviews/rv1) (invitation, not
yet answered) · [rv3](http://localhost:3000/reviews/rv3) (overdue) ·
[rv4](http://localhost:3000/reviews/rv4) (already returned — read-only)

`/reviews/rv1/submit` and `/reviews/rv4/submit` deliberately redirect back to
the task page: an invitation must be accepted first, and a returned report
cannot be edited.

---

## Editorial — 8 screens

Manuscripts from *other* authors. This is where reviewer names appear.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 17 | Submission queue | [/editorial/queue](http://localhost:3000/editorial/queue) | Sorted by waiting longest |
| 18 | Manuscript overview | [/editorial/q3](http://localhost:3000/editorial/q3) | Awaiting a decision |
| 19 | — reviewers | [/editorial/q2/reviewers](http://localhost:3000/editorial/q2/reviewers) | Overdue third reviewer, matched suggestions |
| 20 | — decision | [/editorial/q3/decision](http://localhost:3000/editorial/q3/decision) | **Two reviewers disagree** — minor revision vs reject |
| 21 | — production | [/editorial/s5/production](http://localhost:3000/editorial/s5/production) | The only manuscript actually in production |
| 22 | Reviewer database | [/editorial/reviewers-db](http://localhost:3000/editorial/reviewers-db) | Eight reviewers, blocked ones shown greyed |
| 23 | Issues | [/editorial/issues](http://localhost:3000/editorial/issues) | One being assembled, two published |
| 24 | Issue detail | [/editorial/issues/ei3](http://localhost:3000/editorial/issues/ei3) | In preparation, 1 of 5 placed |

**Worth also opening:** [q1](http://localhost:3000/editorial/q1) (just arrived) ·
[q4](http://localhost:3000/editorial/q4) (round 2 resubmission) ·
[ei1](http://localhost:3000/editorial/issues/ei1) (published issue)

---

## Production — 4 screens

Four jobs, each stalled differently.

| # | Screen | Link | Fixture state |
|---|---|---|---|
| 25 | Production queue | [/production](http://localhost:3000/production) | Stage, who it waits on, days stalled |
| 26 | Copyediting | [/production/p1/copyedit](http://localhost:3000/production/p1/copyedit) | **With the author** since 29 Aug |
| 27 | Typesetting | [/production/s5/galleys](http://localhost:3000/production/s5/galleys) | Three galleys, two versions |
| 28 | Proofreading | [/production/s5/proofread](http://localhost:3000/production/s5/proofread) | **2 corrections still open**, 1 declined with reason |

**Worth also opening:** [p3 copyedit](http://localhost:3000/production/p3/copyedit)
(nothing started, unassigned) ·
[p2 galleys](http://localhost:3000/production/p2/galleys) (stalled at typesetting)

---

## Account — 3 screens

| # | Screen | Link |
|---|---|---|
| 29 | Profile | [/profile](http://localhost:3000/profile) |
| 30 | ORCID | [/profile/orcid](http://localhost:3000/profile/orcid) |
| 31 | Notifications | [/profile/notifications](http://localhost:3000/profile/notifications) |

---

## Administration — 7 screens

| # | Screen | Link | What to look for |
|---|---|---|---|
| 32 | Users | [/admin/users](http://localhost:3000/admin/users) | 14 accounts; one invited, one suspended with a reason |
| 33 | Roles & permissions | [/admin/roles](http://localhost:3000/admin/roles) | The 12×16 matrix and the four withheld permissions |
| 34 | Statistics | [/admin/statistics](http://localhost:3000/admin/statistics) | Only what the data holds; "what is not measured" |
| 35 | DOI / Crossref | [/admin/doi](http://localhost:3000/admin/doi) | No prefix — every DOI is a placeholder |
| 36 | Announcements | [/admin/announcements](http://localhost:3000/admin/announcements) | All three post kinds; expired and scheduled marked |
| 37 | Audit log | [/admin/audit-log](http://localhost:3000/admin/audit-log) | Leads with "these entries are illustrative" |
| 38 | Integrations | [/admin/integrations](http://localhost:3000/admin/integrations) | Six services, none connected, no credential fields |

---

## Settings — 5 screens

| # | Screen | Link | What to look for |
|---|---|---|---|
| 39 | Journal | [/admin/settings/journal](http://localhost:3000/admin/settings/journal) | Six unset fields — ISSN, e-ISSN, DOI prefix block DOAJ |
| 40 | Sections | [/admin/settings/sections](http://localhost:3000/admin/settings/sections) | **A real defect:** "Gender Studies" is not a declared section |
| 41 | Review forms | [/admin/settings/review-forms](http://localhost:3000/admin/settings/review-forms) | Why it is not a form builder |
| 42 | Email templates | [/admin/settings/email-templates](http://localhost:3000/admin/settings/email-templates) | 15 messages promised, 6 with no manual alternative |
| 43 | Policy pages | [/admin/settings/policies](http://localhost:3000/admin/settings/policies) | 17 policies, months since review |

---

## What to check on every screen

1. **Does it render, and is the content real?** No blank panels, no lorem.
2. **Does it work on a phone?** Narrow the browser to ~375px. Tables should
   become cards or scroll inside their own container; the page itself must
   never scroll sideways.
3. **Is anything claimed that is not true?** Every screen that cannot do its
   job should say so and give the email route that works today. Report any
   screen that implies a working feature.
4. **Does the sidebar highlight the right item?** Exactly one, and the deepest
   match.

## Known and deliberate

These are not bugs — each was a decision, recorded in `docs/PROGRESS.md`:

- Nothing saves or sends. Every form validates and stops.
- No file can be uploaded, opened or downloaded.
- Reviewer names never appear on author-facing pages, and author names never
  appear on reviewer-facing ones.
- Empty states are kept rather than hidden — a section with no manuscripts, a
  reviewer with no history ("—", never 0 days), an account that never signed in
  ("Never", not a dash).

## Two things already found, still to fix

1. **Section drift** — manuscripts filed under "Gender Studies", which is not
   one of the ten declared subject areas. Visible on screen 40.
2. **Duplicate review date** — `/admin/settings/policies` hard-codes the date
   that also lives in each policy page.

---

## When you are done

Restore the mock user:

```ts
roles: ["author", "reviewer", "sectionEditor"],
```

in `src/lib/auth/current-user.ts`.
