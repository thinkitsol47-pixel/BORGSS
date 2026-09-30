# BORJSS — backend structure

**Written:** 2026-09-05
**State:** design only. No table exists yet.

The plan and its phases are in `docs/BACKEND-PLAN.md`. **This file is the
schema** — what the tables are, how they join, and why each shape was chosen.
Written before any code, because a mistake here is paid for in every later
phase.

Derived from the 26 interfaces in `src/types/index.ts`, which the whole
frontend already reads. Where this file departs from those types, it says so
and gives the reason.

---

## 1. The five groups

Twenty-two tables. They divide cleanly by who reads them:

| Group | Tables | Read by |
|---|---|---|
| **Identity** | User, UserRole, ReviewerProfile | Everything |
| **Registry** | Section, ReviewForm | Submission and review screens |
| **Workflow** | Submission, Contributor, Affiliation, SubmissionFile, SubmissionDecision, SubmissionMessage, ReviewAssignment, ReviewerReport | The portal |
| **Production** | ProductionJob, ProductionStageRecord, ProductionGalley, ProofCorrection | Production screens |
| **Published** | Article, ArticleGalley, Reference, Issue, IssuePlanItem, DoiRecord | The public site |
| **Site** | Post, BoardMember, AuditEntry | Public site and admin |

---

## 2. Identity

```
User ──< UserRole
  │
  └──── ReviewerProfile   (0 or 1)
```

### User

`id` **is the Supabase `auth.users` id**, not a separate key. Deciding this now
rather than in Phase 2 avoids a migration once accounts exist.

```
id              uuid       PK, = auth.users.id
name            text
email           text       unique
affiliation     text?
country         text?
orcid           text?
status          enum       active | invited | suspended
suspendedReason text?      required when status = suspended
createdAt       timestamptz
lastActiveAt    timestamptz?
```

`lastActiveAt` is nullable on purpose. `/admin/users` prints **"Never"** for an
invited account, not a dash — a dash reads as missing data rather than as a
fact.

**Accounts are suspended, never deleted.** A suspended account still owns
submissions and appears in the decision history of manuscripts it touched, so
deleting one breaks the record.

### UserRole

A row per role, not an array column. Roles are additive: an account holding
three has the union of their permissions.

```
userId   uuid   FK → User
role     enum   the 12 roles in src/config/roles.ts
```

The enum mirrors `src/config/roles.ts`, which stays the source of truth for the
permission matrix — `/admin/roles` renders that matrix from `PERMISSIONS`, so
it cannot drift from what the app enforces.

### ReviewerProfile

**Separate from User, deliberately.** A reviewer profile is a *pool entry* —
expertise, availability, turnaround — existing so an editor can choose someone.
An account is the login. Merging them would put review turnaround on the screen
where roles are granted.

```
id                    uuid   PK
userId                uuid   FK → User, unique
expertise             text[]
sections              text[]
availability          enum   available | unavailable | overloaded
unavailableUntil      date?
note                  text?  editor-only
```

**The six counters are NOT stored.** `activeReviews`, `completed`, `declined`,
`unanswered`, `averageTurnaroundDays` and `lastReviewedAt` are all derived from
`ReviewAssignment` rows. Storing them means two sources for one fact and a
counter that drifts the first time an update fails halfway.

`averageTurnaroundDays` must stay **null**, never 0, for a reviewer who has
completed nothing — the directory shows "—", because an absence of history is
not a fast record, and `sortReviewers` sinks those rows rather than letting a
null sort to the top of "fastest turnaround".

---

## 3. Registry — the two new tables

Neither exists in `src/types/index.ts`. Both are the schema decisions named in
the plan, and both exist to make a known defect impossible rather than merely
visible.

### Section

Today `Submission.section` is a plain string. That is how **"Gender Studies"**
came to sit on manuscripts when the declared name is **"Gender & Development"**.
Two names for one subject area split its queue filter in half and split its
statistics.

```
id        uuid    PK
name      text    unique — "Gender & Development"
slug      text    unique
active    boolean inactive sections stop being offered, keep their history
sortOrder int
```

`Submission.sectionId` is a foreign key. A name that is not in this table
cannot be filed against.

**Seed it with the ten declared areas** from `/about/aims-scope`, and map
"Gender Studies" onto "Gender & Development" while seeding.

### ReviewForm

Criteria are not just questions — they are the axis every returned report is
scored on. Adding or removing one mid-life leaves old and new reports
incomparable, while an editor at a decision reads them side by side believing
otherwise.

```
id          uuid    PK
version     int     unique
criteria    jsonb   the ReviewCriterion list this version scored on
active      boolean exactly one active at a time
createdAt   timestamptz
```

Every `ReviewerReport` records which version produced it. Old versions stay
readable, and a review in progress finishes on the form it started on.

---

## 4. Workflow — the centre

```
Section ──< Submission >── User (submittedBy)
                │
                ├──< Contributor ──< ContributorAffiliation >── Affiliation
                ├──< SubmissionFile
                ├──< SubmissionDecision
                ├──< SubmissionMessage
                └──< ReviewAssignment ──── ReviewerReport ──► ReviewForm
```

### Submission

```
id             uuid    PK
reference      text    unique — "BORJSS-2026-0042", quoted in all email
title          text
abstract       text
keywords       text[]
type           enum    ArticleType
sectionId      uuid    FK → Section
submittedById  uuid    FK → User
status         enum    the 13 SubmissionStatus members
round          int     1 until a revision is asked for
submittedAt    timestamptz
updatedAt      timestamptz
revisionDueAt  timestamptz?
articleId      uuid?   FK → Article, set once published
```

**`reference` comes from a Postgres sequence, never from a row count.** A count
repeats an id after a deletion, and the reference is quoted in correspondence.

`status` keeps all 13 members, including `desk-rejected` as distinct from
`rejected` — a desk rejection never reaches a reviewer, and the author needs to
see which happened.

**Drafts are excluded from every editorial read**, at the data layer
(`editorVisible()` does this today). An author still filling in the wizard has
not handed anything over. Drafts are also excluded from statistics: counting
them inflates the total and the acceptance rate's denominator.

### Contributor and Affiliation

Affiliation is its own table rather than a repeated string, because two authors
at the same institution should resolve to one row — that is what makes an
affiliation-based conflict check possible at all.

```
Contributor
  id             uuid  PK
  submissionId   uuid  FK → Submission
  givenName      text
  familyName     text
  orcid          text?
  email          text?
  isCorresponding boolean
  position       int    author order is a claim about contribution — explicit,
                        never sorted by the database

Affiliation
  id       uuid  PK
  name     text
  city     text?
  country  text?
  ror      text?   ROR id, the registry identifier

ContributorAffiliation   (join — one author can hold several)
  contributorId  uuid
  affiliationId  uuid
```

**Exactly one corresponding author** per submission. Enforce it in the action;
a partial unique index on `(submissionId) where isCorresponding` makes the
database agree.

### SubmissionFile

```
id           uuid   PK
submissionId uuid   FK → Submission
kind         enum   SubmissionFileKind
filename     text
storagePath  text   the Supabase Storage object key
sizeBytes    bigint
round        int    0 is the original; revisions increment
uploadedAt   timestamptz
```

`storagePath` is new — the fixtures have no file behind them. Files live in a
**private bucket**; a manuscript under review is confidential.

### SubmissionDecision

History, never overwritten. A resubmission's round-1 decision must stay
readable — the question an editor is really answering on a resubmission is
whether the author did what round 1 asked.

```
id          uuid   PK
submissionId uuid  FK → Submission
type        enum   DecisionType
round       int
decidedById uuid   FK → User
letter      text[] paragraphs
decidedAt   timestamptz
```

`decidedById` is a **key, not a display name**. The fixture stores
`decidedBy: string`; an id survives someone changing their name, and the audit
log needs the same discipline.

### ReviewAssignment

Records that a reviewer was asked and whether they answered. **It carries no
report body** — see `ReviewerReport` below.

```
id           uuid   PK
submissionId uuid   FK → Submission
reviewerId   uuid   FK → User
label        text   "Reviewer 2" — what the author is shown
round        int
status       enum   invited | accepted | declined | completed | overdue
invitedAt    timestamptz
respondedAt  timestamptz?
dueAt        timestamptz?
completedAt  timestamptz?
declineReason text?
invitationNote text?
```

`label` is stored, not computed, so "Reviewer 2" in a decision letter still
means the same person a year later.

**`overdue` is a derived state, not a stored one.** It is `accepted` plus a
`dueAt` in the past. Storing it means a nightly job that can fail and leave the
queue lying.

### ReviewerReport — its own table, and that is the point

The type's own comment says why: a report body on `Submission` would be one
careless `.map()` away from reaching the author before the decision letter
does.

```
id            uuid   PK
assignmentId  uuid   FK → ReviewAssignment, unique
submissionId  uuid   FK → Submission
reviewFormId  uuid   FK → ReviewForm
scores            jsonb   Record<ReviewCriterion, 1..5 | null>
recommendation    enum    ReviewRecommendation
commentsToAuthor  text[]  shown to the author with the decision letter
commentsToEditor  text[]  editor only, never reaches the author
concernsRaised    text?
submittedAt       timestamptz
```

**Only editorial reads may load this table.** `getReportsForSubmission()` is
the one function that does, and no author-facing page calls it. That was
verified once by fetching `/submissions/s5`, `/submissions/s5/decision`,
`/reviews` and `/dashboard` and grepping for all six reviewer names; the same
check should run against real data.

`commentsToAuthor` has a 200-character floor at the form. The database should
not silently accept less through another path.

### What a reviewer is allowed to read

`ReviewTask` in `src/types` is not a table — it is a **projection**. It carries
the reference, title, abstract and file list, and has nowhere to put a
contributor, an author name or a title page. A reviewer query must select those
columns and no others; the type stops a screen leaking an identity, and the
query has to stop the database doing it.

---

## 5. Production

```
Submission ──── ProductionJob ──< ProductionStageRecord
                      ├──< ProductionGalley
                      └──< ProofCorrection
```

`SubmissionStatus` keeps one member for all of this — `in-production` — which
is the right answer for the author and the editor. The person doing the work
reads `ProductionJob.stages` instead. Splitting the enum would have changed
every author-facing screen to serve three, and leaked production's internal
stages to authors who have no use for them.

```
ProductionJob
  id            uuid  PK
  submissionId  uuid  FK → Submission, unique
  issueId       uuid? FK → EditorialIssue
  enteredAt     timestamptz

ProductionStageRecord
  id        uuid  PK
  jobId     uuid  FK → ProductionJob
  stage     enum  copyedit | galleys | proofread
  state     enum  StageState — includes with-author
  assignedToId uuid? FK → User
  startedAt    timestamptz?
  sentToAuthorAt timestamptz?
  completedAt  timestamptz?

ProductionGalley
  id        uuid  PK
  jobId     uuid  FK → ProductionJob
  format    enum  pdf | xml | html | epub
  version   int   never replaced — a correction makes a new version
  isFinal   boolean
  storagePath text
  createdAt timestamptz

ProofCorrection
  id          uuid  PK
  jobId       uuid  FK → ProductionJob
  description text
  applied     boolean
  declinedReason text?   a declined correction keeps its row and its reason
  reportedAt  timestamptz
```

**Galleys are versioned, never overwritten.** "Which one did the author
approve?" is unanswerable from a single replaced file.

**`with-author` is a state, not a flag.** A stage sitting with the author is
production doing nothing while the clock runs, and it is the commonest reason
an issue slips. A boolean on `in-progress` would not be filterable.

**`ProductionGalley` is not `ArticleGalley`.** One is the file while it is
still being made, where version and `isFinal` are what matter; the other is
what a published article offers a reader. The published row is created from the
final production galley.

---

## 6. Published record

```
Issue ──< Article ──< ArticleGalley
             ├──< Reference
             ├──< Contributor        (reused — same table)
             └──── DoiRecord

EditorialIssue ──< IssuePlanItem ──► Submission
```

`Article` and `Submission` stay separate, as they are in the types: an Article
is what a Submission becomes, and almost every field differs. A submission has
a status, decision history and reviewer assignments; it has no volume, issue,
DOI or galleys until accepted.

`Issue` (published, what the public archive reads) and `EditorialIssue` (being
assembled — a state, a target date that moves, a running order) also stay
separate. Making half of `Issue` optional would have blurred the two.

**An `IssuePlanItem` pointing at a manuscript that cannot be found renders as a
gap in the table of contents rather than being dropped.** A silently shortened
TOC is the harder bug.

### DoiRecord — a log, not a flag

```
id            uuid  PK
articleId     uuid  FK → Article
doi           text  unique
state         enum  registered | pending | failed | not-deposited
attempts      int
lastAttemptAt timestamptz?
registeredAt  timestamptz?
failureReason text?   Crossref's message, shown verbatim
```

A deposit is an event with an outcome, not a boolean: a failed deposit is
retried, and both attempts matter when someone asks why a DOI does not resolve.

**Every row starts `not-deposited`.** The journal has no Crossref prefix, so
there could not have been a deposit. `hasCrossrefPrefix()` derives the banner
from the data rather than hard-coding it, so the warning disappears by itself
when real DOIs land.

---

## 7. Site

```
Post         announcements, news and events — one shape, one lifecycle
BoardMember  the editorial board
AuditEntry   append-only
```

`Post` keeps `expiresAt`: a call for papers past its deadline vanishes from the
public list, and whoever wrote it needs to see that it has.

### AuditEntry

`/admin/audit-log` currently leads with the admission that its rows are
fabricated. The real table must have the five properties that page names:

1. **Append-only.** No update, no delete — enforced by permission, not by
   convention.
2. **Actor stored as id *and* name**, so a renamed account does not rewrite
   history.
3. **Reads recorded, not only writes.** Who opened a manuscript matters in a
   misconduct investigation.
4. **A stated retention period.**
5. **An administrator must not be able to inspect, and eventually curate, the
   log of their own actions** — which is why `audit.view` is withheld from
   `admin` and held only by `superAdmin`.

---

## 8. Rules that outlive any one table

**Derive, do not store.** These are computed, never columns — each has a screen
that depends on being right, and a stored copy is a copy that drifts:

| Derived | From | Why it matters |
|---|---|---|
| `waitingOn()` | status + assignments | A manuscript `under-review` with every report in is waiting on the *editor*. A status column alone never shows this. |
| `reviewProgress()` | current-round assignments | A reviewer who reported in round 1 has not reported for round 2. |
| `overdue` | accepted + dueAt past | A stored flag needs a job that can fail. |
| Reviewer counters | assignment rows | Two sources for one fact is one too many. |
| Acceptance rate | decided manuscripts only | Including those still under review reports a rate that falls whenever a submission arrives. Null when nothing is decided — 0% would say the journal rejects everything. |
| Turnaround | median, with range and n | One slow outlier drags a mean somewhere no manuscript ever was. |

**Timestamps are `timestamptz`, always.** A journal has authors and reviewers
in every time zone, and a due date that means a different moment depending on
who reads it is a bug that surfaces as an unfair deadline.

**Nullable means "not known", never "zero".** `averageTurnaroundDays` null, not
0. `lastActiveAt` null renders "Never". An acceptance rate over an empty
denominator is null, not 0%.

**Cascade rules:**

| Parent removed | Children |
|---|---|
| Submission | files, decisions, messages, assignments, reports — cascade |
| User | **nothing cascades.** Suspend instead; the record must survive |
| Section | blocked while any submission references it |
| Article | DoiRecord and galleys cascade; the DOI itself is permanent and should never be reissued |

---

## 9. What to build first

Phase 1 in `docs/BACKEND-PLAN.md`, in this order:

1. `Section` and `ReviewForm` — everything else references them
2. `User`, `UserRole`, `ReviewerProfile`
3. `Submission` and its six children
4. `ReviewerReport` (after `ReviewForm` exists)
5. Production
6. Published record
7. Site

Then the seed script: load today's `mock-*.ts` fixtures, mapping
**"Gender Studies" → "Gender & Development"** on the way in. Fixing the drift
during the seed is the cheapest moment it will ever be fixed.

**Done when:** Prisma Studio opens and the manuscripts are there.
