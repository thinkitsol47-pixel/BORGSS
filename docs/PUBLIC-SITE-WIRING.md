# Wiring the public site to the database

**Written 2026-09-16, after issue planning landed.**

Nine public pages still read `src/lib/api/mock-data.ts`. This file says exactly
what to change, in what order, and what to check after each step.

Every count below was taken from the source; the commands are at the bottom.

---

## Where things stand

| Area | Pages | On the database | On fixtures | No data layer |
|---|---|---|---|---|
| **Portal** (`(dashboard)`) | 52 | **52** | 0 | — |
| **Public site** (`(marketing)`) | 44 | **17** | **0** | 27 |

**Done, 2026-09-16.** Every page with a data layer reads Postgres. The 27 are
policy and guidance pages — prose in the page file, nothing to wire. Was 8 / 9
before stage 1, 12 / 5 after it.

The 27 are policy and guidance pages — prose in the page file, nothing to wire.

**All nine, done:**

| Route | Reads | Stage |
|---|---|---|
| `/issues` | Issue + Article | 1, completed by 3 |
| `/issues/current` | Issue + Article | 1, completed by 3 |
| `/issues/[issueId]` | Issue + Article | 1, completed by 3 |
| `/about/editorial-board` | BoardMember | 1 |
| `/` | Article + Issue | 3 |
| `/articles` | Article | 3 |
| `/articles/[slug]` | Article | 3 |
| `/search` | Article | 3 |
| `/about` | Article + Issue | 3 |

All nine go through **one file**: `src/lib/api/articles.ts`. No page imports a
fixture directly, so each data type is a single-file change.

---

## Why now

Posts moved to the database the moment `/admin/announcements` could write them —
a screen that writes to one place while the public site reads another is worse
than no screen. Articles, issues and board members had no such screen, so that
argument did not apply.

**Issue planning changed it.** An editor can now create an issue and place
manuscripts into it, writing `EditorialIssue` and `IssuePlanItem` — but
`/issues` reads `mockIssues`, so that work can never reach the public site. The
two copies can now diverge, and the first editor to use the feature will produce
a state the public site cannot show.

---

## The blocker, and where it bites

`Contributor` hangs off **`Submission`**, not `Article`. There is no
`Article → authors` relation in the schema at all, and `prisma/seed.ts` writes
`ArticleGalley` and `Reference` for each article and stops.

`Submission.articleId` exists, but of the seven fixture articles **one** has a
submission behind it. Rewiring articles today would render six of seven with no
author names — and an article page without a byline cannot form a citation.

**So: issues and board members need no migration. Articles do.** That is the
whole reason the work is staged the way it is.

### Why a new table, not a read through `Submission`

An author list is **frozen at publication**. The submission behind it can still
be corrected — a spelling, an affiliation, a withdrawn co-author — and none of
that should silently rewrite a citation already in someone's bibliography.
Reading through `Submission` would make every published byline mutable by an
unrelated edit.

---

# Stage 1 — Issues and board members ✅ done 2026-09-16

**No migration.** Four pages stopped reading fixtures: `/issues`,
`/issues/current`, `/issues/[issueId]` and `/about/editorial-board`.

**Two things this turned up that the plan had not anticipated:**

1. **The seed never wrote `sortOrder`.** Every board row sat at the column
   default of `0`, so ordering by it would have handed the board back in
   whatever order Postgres liked — the Editor-in-Chief anywhere in the list.
   `prisma/seed.ts` now fills it from the fixture's own index, which is the
   order the office chose (seniority within each category, not alphabetical).
   Verified on the rendered page: Quddus, Khan, Siddiqui, in that order.

2. **An issue's table of contents went empty, silently.** `issue.articleIds`
   began returning real `Article` row ids while `mockArticles` stayed keyed
   `a1`, `a2` — the two id spaces stopped meeting, and every issue rendered an
   empty TOC with no error anywhere. `getArticlesForIssue` now maps the fixture
   ids forward through the same deterministic function the seed used
   (`seededArticleId`), so the match happens in database-id space. **That
   function is the seam, and it is deleted in stage 3.**

   `/issues` had been building that id map itself, so it broke the same way and
   now calls `getArticlesForIssue` instead — the knowledge of how an issue's ids
   line up with an article belongs in one file. Its "Articles" headline figure
   is now counted from what the page actually lists, rather than from a separate
   `getPublishedArticles()` call that could disagree with the issues below it.

**Verified:** board renders 18 members in the right order; `/issues` reports
1 volume, 2 issues, 7 articles, with real titles; `/issues/current` and
`/issues/v1i2` both list their articles. `npm run typecheck` and `next lint`
clean.

---

## Stage 1 as planned, for reference

### 1.1 — `getBoardMembers()`

One file: `src/lib/api/articles.ts`.

```
db.boardMember.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] })
```

Two things to get right:

- **`category` is a Prisma enum in camelCase**, the type is kebab-case
  (`editorInChief` → `editor-in-chief`). `camelToKebab()` already exists at the
  top of this file — reuse it, do not write a second one.
- **`sortOrder` has no fixture equivalent.** Order by it first so the board
  renders in the order the office chose, not whatever Postgres returns. Name as
  the tiebreak, so the order is stable between reads.

**Check:** `/about/editorial-board` — every member, in a sensible order, each in
the right category section.

### 1.2 — `getIssues()`, `getCurrentIssue()`, `getIssueBySlug()`

```
db.issue.findMany({ include: { articles: { select: { id: true } } },
                    orderBy: { publishedAt: "desc" } })
```

- **`articleIds` is derived, not stored.** The type carries a string array; the
  schema expresses it as `Article.issueId`. Map the included relation to ids.
  `/issues` uses `articleIds` directly (`page.tsx:21`), so getting this wrong
  shows as an issue with an empty table of contents rather than an error.
- `getCurrentIssue()` stays as it is — it already reads `getIssues()[0]`, and
  with `orderBy publishedAt desc` that is still the newest published issue.
- `title` and `coverUrl` are nullable columns and optional fields: map `null` to
  `undefined`, never to `""`.

**Check:** `/issues` (volumes grouped, newest first), `/issues/current`,
`/issues/[issueId]` for a seeded slug.

### 1.3 — Verify

```bash
npm run typecheck
BORJSS_DIST_SUFFIX=lint npx next lint && rm -rf .next-build-lint
```

Then open the four pages against a suffixed server on 3100.

**Stage 1 ends with** `/issues`, `/issues/current`, `/issues/[issueId]` and
`/about/editorial-board` reading Postgres. `getArticlesForIssue` still returns
fixtures — that is Stage 3, and until then those pages list issues from the
database and articles from fixtures. That is the one point in this plan where
the two sources are visibly mixed, which is why Stage 3 should follow soon
rather than being left.

---

# Stage 2 — Article authors ✅ done 2026-09-16

Migration `20260916120000_article_contributors`. `ArticleContributor` and
`ArticleContributorAffiliation`, both with RLS enabled in the same file.

**Verified against the live database:**

- **34 tables, 34 with RLS on, none UNRESTRICTED.** Queried `pg_tables` directly
  rather than trusting the migration ran — the whole point of that line is that
  its absence is invisible until Supabase flags it.
- **All seven articles have a byline.** Nine `ArticleContributor` rows across
  seven articles; not one article came out empty, which was the failure this
  stage existed to prevent.
- **The affiliation registry is shared, not duplicated.** Four institutions are
  reached from both a submission contributor and a published byline and are a
  single row each — Institute of Business Administration carries 7 submission
  links and 2 article links. Zero duplicate names. That property is what makes
  affiliation-based conflict checking possible at all, and copying the rows
  would have broken it silently.

**Two things the plan had not accounted for:**

1. **The seed's delete order.** Both join tables hold a restricting foreign key
   into `Affiliation`, so `affiliation.deleteMany()` fails while either still
   points at a row. The two new deletes go immediately before it.
2. **`sortOrder` was still zero for every board member** — stage 1 wrote the
   seeding code but the seed had not been re-run since. Running it here filled
   the column: the board now comes back 0, 1, 2, 3 (Quddus, Khan, Siddiqui,
   Rehman) rather than in whatever order Postgres chose.

`npm run typecheck` and `next lint` clean.

---

## Stage 2 as planned, for reference

### 2.1 — The migration

Two tables, mirroring `Contributor` / `ContributorAffiliation` but hanging off
`Article`:

```prisma
model ArticleContributor {
  id              String  @id @default(uuid()) @db.Uuid
  articleId       String  @db.Uuid
  givenName       String
  familyName      String
  orcid           String?
  email           String?
  isCorresponding Boolean @default(false)
  /// Author order is a claim about contribution; the database never sorts it.
  position        Int

  article      Article                          @relation(fields: [articleId], references: [id], onDelete: Cascade)
  affiliations ArticleContributorAffiliation[]

  @@index([articleId])
}

model ArticleContributorAffiliation {
  articleContributorId String @db.Uuid
  affiliationId        String @db.Uuid

  articleContributor ArticleContributor @relation(fields: [articleContributorId], references: [id], onDelete: Cascade)
  affiliation        Affiliation        @relation(fields: [affiliationId], references: [id])

  @@id([articleContributorId, affiliationId])
}
```

`Article` gains `contributors ArticleContributor[]`; `Affiliation` gains the
back-relation.

### 2.2 — RLS, in the same migration

```sql
ALTER TABLE "ArticleContributor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArticleContributorAffiliation" ENABLE ROW LEVEL SECURITY;
```

**This is not optional and it is easy to forget.** A new table defaults to RLS
*off*, and the loop in `20260908120000_enable_rls` only covered what existed
when it ran. Without these lines Supabase's anon key reads both tables through
the auto-generated REST API and the dashboard flags them UNRESTRICTED. The count
goes from 32 protected tables to **34** — update that number wherever it is
written down.

### 2.3 — Seed

In `seedArticle()` in `prisma/seed.ts`, after the galleys and references loops,
write `a.contributors` — which the fixture already has for all seven articles.

- **Reuse the existing `Affiliation` rows.** `affiliationId(name)` at
  `seed.ts:81` is the deterministic id helper; the affiliation rows are already
  created for submission contributors. Creating a second row for the same
  institution would break the one property that makes affiliation-based conflict
  checks possible.
- `position` is the fixture array index + 1.

### 2.4 — Verify

`npm run typecheck`, then confirm both tables are populated and that the
Supabase dashboard does not flag either as UNRESTRICTED.

---

# Stage 3 — Articles ✅ done 2026-09-16

The remaining five pages, and the temporary `seededArticleId` seam is gone.
**`src/lib/api/articles.ts` no longer imports a fixture, and neither does
anything else under `src/` — `mock-*.ts` is now read only by `prisma/seed.ts`.**

**The one mistake worth recording: a `publishedAt <= now` filter that had to be
taken back out.**

It was written on the reasonable-sounding grounds that an article dated ahead of
today is scheduled rather than public. It is not. The seeded **Vol. 1 No. 2
carries a cover date of 2026-12-31**, which is how journals number issues — and
the filter hid its three articles while `/issues` went on listing the issue
itself. The result was an issue with an empty table of contents, and an article
count that fell from 7 to 4 with nothing to explain it.

The lesson is that a row's existence, not its date, is what makes an article
public: an `Article` row exists only once the office has published it. If
embargoed articles ever need holding back, the honest shape is a status column,
and the issue has to be held back with them.

`getArticlesForIssue` carried the same filter and lost it for the same reason.

**Verified on the rendered pages:** all seven articles reachable (six on
`/articles` page 1, the seventh on page 2 — pagination, not a missing row);
every article detail page shows its byline, references, affiliations and PDF
galley; `/issues` reports 1 volume, 2 issues, 7 articles; `/about` reports 2 and
7; `/search?q=financial` finds and highlights its match; `/` and
`/issues/current` show titles and authors.

**Two false alarms during testing, both in the test script rather than the
app:** an author name split across two lines of HTML failed a single-line
regex, and a case-sensitive pattern missed a lowercase search result. Worth
noting because both looked exactly like real failures.

`npm run typecheck` and `next lint` clean.

---

## Stage 3 as planned, for reference

### 3.1 — `getPublishedArticles()`, `getArticleBySlug()`, `getAllArticleSlugs()`, `getArticlesForIssue()`

```
include: {
  contributors: { include: { affiliations: { include: { affiliation: true } } },
                  orderBy: { position: "asc" } },
  references:   { orderBy: { position: "asc" } },
  galleys:      true,
}
where: { publishedAt: { lte: new Date() } }   // for getPublishedArticles
```

### 3.2 — Four mapping problems, all silent if missed

- **`Article.issueNumber` ↔ the type's `issue`.** Different names for the same
  thing. The seed already translates one way (`issueNumber: a.issue`).
- **`ArticleGalley.sizeBytes` is `BigInt`.** Convert it before it crosses into a
  Server Component — Next cannot serialize a `BigInt`, and this fails at runtime
  on the article page, not at compile time. `Number(row.sizeBytes)` where it is
  not null.
- **`metrics` is three columns and one optional object.** `views`, `downloads`,
  `citations` → `{ views, downloads, citations }`. `citations` is nullable.
- **`type` is a Prisma enum in camelCase** (`caseStudy`, `bookReview`).
  `camelToKebab()` again.

### 3.3 — Verify

Open all five. `/search` deserves particular attention: it scores over abstracts
and keywords, so an empty `keywords` array changes results without erroring.
Search for a term you know is in a seeded abstract and confirm the highlighting
still marks it.

Then, on a **freshly started** suffixed server:

```bash
node scripts/responsive-audit.mjs http://localhost:3100
node scripts/a11y-audit.mjs http://localhost:3100
```

Both must report **0 findings across 96 of 96 pages** — check the page count,
not only the finding count. The dev server crashes part-way through under
connection pressure, and a run that fetched 70 pages can still print a clean
finding count.

---

# Stage 4 — Close it out

1. `articles.ts` no longer imports `mock-data`. **Delete the "Half rewired"
   header comment** and replace it with what is true.
2. `mock-data.ts` stays — `prisma/seed.ts` reads it. That is now its only job,
   the same relationship `mock-submissions.ts` already has.
3. Grep for notices in **both directions**: a screen claiming a gap that has
   closed is the failure this project hits more often than the reverse.
4. Update `docs/PROGRESS.md` and the table at the top of this file.

---

## What this does not fix

- **A planned issue still cannot be published.** Publishing mints a DOI for
  every article it carries and there is no Crossref prefix. Stage 1 makes the
  public archive read the same `Issue` table the seed writes; it does not create
  the path from `EditorialIssue` to a public `Issue`. That is blocked on a
  purchase.
- **No admin screen for articles or board members.** After this work the public
  site reads all three from Postgres, but only the seed writes them. That is a
  later piece of work, and unlike this one it blocks nothing.

---

## Re-run the counts rather than trusting this page

```bash
find "src/app/(dashboard)" -name page.tsx | wc -l      # 52
find "src/app/(marketing)" -name page.tsx | wc -l      # 44
grep -rl "mockArticles\|mockIssues\|mockBoard" "src/app/(dashboard)"   # nothing

grep -rl "getPublishedArticles\|getArticleBySlug\|getAllArticleSlugs\|getIssues\|\
getCurrentIssue\|getIssueBySlug\|getArticlesForIssue\|getBoardMembers" \
  "src/app/(marketing)" --include=page.tsx | wc -l     # 9

grep -l "from \"./mock-" src/lib/api/*.ts | grep -v mock-   # articles.ts alone
```
