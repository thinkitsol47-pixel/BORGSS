# BORJSS — backend plan

**Written:** 2026-09-05 · **Stack revised:** 2026-09-08
**State:** phases 1 and 3 are done and phase 4 is well under way — see
`docs/PROGRESS.md` under "Backend progress" for what has actually landed. This
file stays the design document and is **not** rewritten as work completes; the
one exception is the stack table below, which records a real decision and would
be actively misleading if left describing a service the project no longer uses.

> Read this with `docs/PROGRESS.md` and `CLAUDE.md`. PROGRESS.md records what
> the frontend does and *why*, and logs what the backend has built; this file
> records what the backend must do to keep those promises.

---

## The stack, and why each piece

| Layer | Choice | Why this one |
|---|---|---|
| Runtime | Next.js Server Actions (Node) | The portal's forms are already Server Actions and work without JavaScript. A separate Express/Nest server would mean rewriting them for no gain. |
| Database | PostgreSQL | The data is relational — a manuscript joins to reviewers, reports, decisions, revisions, production stages, galleys and an issue. Every editorial screen renders one of those joins. |
| ORM | Prisma | Generates TypeScript types from the schema, so the database shape and `src/types/index.ts` cannot drift apart silently. Prisma Studio is the table browser. |
| Auth | Supabase Auth | Needed anyway; keeping users in the same Postgres as the data avoids splitting the user record across two systems. Free to 50,000 monthly active users, which a journal will not approach. |
| File storage | **Cloudinary** | Chosen over Supabase Storage for capacity: 25 GB free against Supabase's 1 GB, and manuscripts plus figures plus galleys add up. **Confidentiality is not lost, but it is now conditional on getting two things right** — see below. |
| Email | Resend (Brevo the fallback) | 15 messages are already promised; six have no manual alternative. Resend's 3,000/month free tier is roughly ten times what this journal will send; Brevo offers 9,000 if that is ever wrong. |
| Jobs | Vercel Cron to start | Reminders and DOI deposits are a handful of scheduled tasks. Redis/BullMQ is the answer to a volume problem the journal does not have yet. |

---

## Two schema decisions to make **before** any table is created

Both are cheap now and expensive later.

### 1. Sections must become a registry

A submission's `section` is a plain string today, which is how "Gender Studies"
came to sit on manuscripts when the declared name is "Gender & Development".
Two names for one subject area split its queue filter and split its statistics.

**Do:** a `Section` table (id, name, slug, active), referenced by id from each
submission. Then the drift is impossible rather than merely visible on
`/admin/settings/sections`.

### 2. Review forms must be versioned

`REVIEW_CRITERIA` is the axis every returned report is scored on. Adding or
removing a criterion mid-life leaves old and new reports incomparable, and an
editor at a decision would be comparing different instruments without being
told.

**Do:** a `ReviewForm` version each report points at. Old versions stay
readable; a review in progress finishes on the form it started on.

---

## The architecture

### Shape of the system

One Next.js app, one deployment. There is no separate API server, no second
repository, and no second deploy target.

```
Browser
   │
   ▼
Next.js on Vercel  ── frontend and backend in one deployment
   │
   ├── Server Components  →  reads   (src/lib/api/*.ts)
   ├── Server Actions     →  writes  (six actions.ts files)
   └── middleware.ts      →  route guards
   │
   ├────► Supabase Postgres   (through Prisma)
   ├────► Supabase Auth       (sessions)
   ├────► Cloudinary          (manuscripts, galleys, figures — signed URLs)
   └────► Resend              (the 15 promised messages)
```

### What is added, and what is only rewired

The pages do not change. Filtering, sorting and pagination already live in
`src/lib/api/*.ts` rather than in the screens, so each module keeps its exported
functions and swaps what is inside them.

```
prisma/
  schema.prisma          NEW — the tables
  seed.ts                NEW — loads today's fixtures into them

src/lib/
  db.ts                  NEW — the Prisma client
  storage.ts             NEW — Cloudinary (the only caller; flags baked in)
  email/                 NEW — Resend

  api/
    submissions.ts       EXISTS — body swapped, exports unchanged
    editorial.ts         EXISTS — "
    production.ts        EXISTS — "
    admin.ts             EXISTS — "
    reviews.ts           EXISTS — "
    mock-*.ts            DELETED once Phase 3 lands

  auth/
    current-user.ts      EXISTS — mock replaced by the real session
    demo-mode.ts         DELETED in Phase 2
```

### The tables

Roughly twenty, from the 26 interfaces in `src/types/index.ts`.

**Identity**

```
User ──< UserRole
```

`User.id` is the Supabase `auth.users` id. Deciding that in Phase 1 rather than
Phase 2 avoids a migration once accounts exist.

**The manuscript's life — the centre of the schema**

```
Section ──< Submission ──< Contributor ──< Affiliation
                 │
                 ├──< SubmissionFile        (round 0 is the original)
                 ├──< SubmissionDecision    (history, never overwritten)
                 ├──< SubmissionMessage
                 └──< ReviewAssignment ──── ReviewerReport ──► ReviewForm
```

**Production**

```
Submission ──── ProductionJob ──< ProductionStageRecord
                      ├──< ProductionGalley   (versioned, never replaced)
                      └──< ProofCorrection
```

**Published record and the rest**

```
EditorialIssue ──< IssuePlanItem ──► Submission
Article ──── DoiRecord
Post          (announcements, news, events — one shape, one lifecycle)
AuditEntry    (append-only)
```

### Three structural rules the schema has to carry

**`ReviewerReport` is its own table, not a column on `Submission`.** The reason
is in the type's own comment: a report body sitting on `Submission` would be one
careless `.map()` away from reaching the author before the decision letter does.
Only `getReportsForSubmission()` reads it, and no author-facing page calls that.

**`Submission.sectionId` is a foreign key, not a string.** A free string is how
"Gender Studies" came to sit on manuscripts when the declared name is
"Gender & Development". A key makes it impossible rather than merely visible.

**Every `ReviewerReport` records its `ReviewForm` version.** Criteria are the
axis reports are scored on; change the list and old reports become incomparable
with new ones, while an editor reads them side by side believing otherwise.

### Authorisation, in two layers

Both are needed; neither substitutes for the other.

1. **Route guards** — `requireGroup("editorial")` and friends, already on every
   portal page.
2. **The action re-checks** — a Server Action is its own entry point and can be
   invoked without its page ever rendering. `recordDecision` already does this;
   it is the pattern to copy, not an exception.

### Files are confidential, and on Cloudinary that takes two deliberate steps

A manuscript under review is confidential — the journal's own reviewer ethics
policy states it. Supabase Storage would have given that by default with a
private bucket; Cloudinary was chosen for its 25 GB free tier instead, and the
cost of that choice is that **privacy is opt-in rather than the default**. Two
things have to be right, and neither is enforced by anything but the code:

1. **Upload with `type: "authenticated"`.** Cloudinary's default is a public
   URL that anyone holding the link can open, forever. A single upload written
   without this flag publishes an unpublished manuscript, and nothing will warn
   anyone that it happened.

   ```js
   cloudinary.uploader.upload(file, {
     resource_type: "raw",   // PDF/DOCX are "raw", not images
     type: "authenticated",  // ← without this the file is world-readable
     folder: "manuscripts",
   })
   ```

2. **Serve through short-lived signed URLs, generated per request.** The app
   checks that this reader is entitled to this file — the assigned reviewer,
   the handling editor, the author who submitted it — and only then mints a URL
   that expires in minutes.

   ```js
   cloudinary.utils.private_download_url(publicId, "pdf", {
     expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minutes
   })
   ```

**Never store a signed URL in the database or put one in an email.** It is a
bearer token: whoever holds it is inside, entitlement check already passed. It
is generated at the moment of the click and it dies.

The single most likely way this goes wrong is an upload path added later that
forgets the flag, so the upload helper in `storage.ts` should be the only place
that calls Cloudinary — with the flag baked in, not passed by callers.

Cloudinary is also, in fairness, a media product: images and video are what it
is built for, and DOCX/PDF ride along as `raw`. That works, and 25 GB is real,
but it is worth knowing this is not its home ground.

---

## Phases

Ordered by dependency. **Each one ends in something you can open in a browser
and see working** — that is the point of the split, not the page count.

### Phase 1 — Foundation

No features. The app just starts talking to a database.

- Create the Supabase project (free tier is enough for development)
- Add Prisma; write `prisma/schema.prisma`
- Translate the 26 interfaces in `src/types/index.ts` into tables
- Apply the two decisions above
- A seed script that loads the existing `mock-*.ts` data

**Done when:** Prisma Studio opens and shows the manuscripts.

**This is the phase that matters most.** Every later phase is built on the
schema; a mistake here is paid for repeatedly.

### Phase 2 — Auth

- Supabase Auth wired up
- `getCurrentUser()` returns the real session, not the mock
- Uncomment the redirect in `src/middleware.ts`
- Remove the five `ScaffoldNotice` blocks from the auth pages
- Close the demo door: delete `signInAsDemoAdmin`, `DemoAdminEntry`,
  `DemoAccounts`, `DEMO_ACCOUNTS`, `devRole()` and `demo-mode.ts`

**Done when:** signing in opens the portal, signing out locks it, and role
guards are enforced against a real account.

### Phase 3 — Reading

Replace each `mock-*.ts` with a real query, one function at a time.
Filtering, sorting and pagination already live in `src/lib/api/*.ts` rather
than in the pages, so the pages do not change.

- `submissions.ts`, `reviews.ts`, `editorial.ts`, `production.ts`, `admin.ts`

**Done when:** the portal shows what is in the database.

### Phase 4 — Writing

The six `actions.ts` files stop validating-and-returning and start saving:

| File | What it must persist |
|---|---|
| `(dashboard)/submissions/actions.ts` | Draft creation and the wizard's six steps |
| `(dashboard)/reviews/actions.ts` | Accept/decline, and the review report |
| `(dashboard)/editorial/actions.ts` | Decisions, reviewer assignment |
| `(dashboard)/profile/actions.ts` | Profile and notification settings |
| `(marketing)/contact/actions.ts` | Contact messages |
| `(marketing)/for-reviewers/…/actions.ts` | Reviewer applications |

Plus the admin CRUD screens (journal settings, sections, users, announcements).

Server Actions are their own entry point — each must re-check permission rather
than trusting the page that rendered its form. `recordDecision` already does
this; the pattern is there to copy.

**Done when:** submit a manuscript, reload, and it is still there.

### Phase 5 — File storage

- Cloudinary account and one `storage.ts` that is the **only** caller of it
- Manuscript upload, title page, supplementary, cover letter
- Galley versions (never replaced — every version is kept)
- **`type: "authenticated"` on every upload, signed URLs on every read** — see
  "Files are confidential" above. On Cloudinary this is opt-in, so it is the
  thing to get right first and to check has not regressed later.
- The upload handler must scan document properties for author names; that is
  where anonymisation usually fails

**Done when:** upload a file, download it back through a signed URL, and both
a signed-out request *and* a signed-in user with no claim on that manuscript
are refused. The last of those is the one worth actually testing — a guard that
only stops anonymous requests is not confidentiality.

### Phase 6 — Email

Resend. `/admin/settings/email-templates` already enumerates the **15 messages**
the portal has promised, grouped by area, each linking to where the promise was
made. **Six have no manual alternative** — a decision letter can be sent by hand
from the editorial office, a password reset cannot. Those six gate the launch.

One rule from that page worth repeating here: **reminders must stop when the
thing is done.** It is the failure that loses reviewers.

**Done when:** register an account and the verification email arrives.

### Phase 7 — Scheduled work

- Reviewer reminders
- Crossref DOI deposit — needs a real prefix, which the journal does not have
- Sitemap/search reindexing if needed

---

## Standing rules for the backend

These carry over from the frontend and are not negotiable:

- **Never state on a page that a feature works when the code shows a stub.**
  Every screen currently says what it cannot do. Delete a notice only when the
  thing it describes is real.
- **Double-blind is enforced by the types.** `ReviewTask` has no author field;
  author-facing pages render `ReviewAssignment.label` ("Reviewer 2") and never
  `reviewerName`. The database must not make it easy to undo that.
- **Server Actions re-guard.** A form's page having checked permission proves
  nothing about the action.
- **Run `npm run typecheck` and `next lint` on every change**, and keep both
  audits at 0.
- **Never run an unsuffixed dev server** while the client's is running. Use
  `BORJSS_DIST_SUFFIX=check npx next dev -p 3100`, then `rm -rf .next-build-check`.

---

## Still blocked on the outside world

Not code, and not fixable by building anything:

- **No Crossref prefix** — every DOI reads `10.xxxxx` and resolves nowhere
- **No ISSN, no e-ISSN**

Those three block a DOAJ application. `/admin/doi` and
`/admin/settings/journal` both say so on screen.
