import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type {
  AnnouncementCategory,
  Article,
  BoardMember,
  Issue,
  Post,
  PostKind,
} from "@/types";

/**
 * Server-side data access for public pages.
 *
 * **Every read here is a database query.** Articles were the last to move
 * (2026-09-16), and they went last because a published article had nowhere to
 * keep its authors: `Contributor` hangs off `Submission`, and only one of the
 * seven seeded articles has a submission behind it, so rewiring them earlier
 * would have rendered six of seven with no byline. Migration
 * `20260916120000_article_contributors` gave the published record its own
 * byline table, and `docs/PUBLIC-SITE-WIRING.md` records the order it was done
 * in and why.
 *
 * `src/lib/api/mock-*.ts` is now read only by `prisma/seed.ts`. Nothing in the
 * app imports a fixture — a new code path that did would reintroduce the
 * section-name drift those files still carry.
 */

/** Prisma's enums are camelCase; `src/types` uses the kebab-case wire values. */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

type PostRow = Prisma.PostGetPayload<Record<string, never>>;

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    kind: row.kind as PostKind,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    publishedAt: row.publishedAt.toISOString(),
    category: row.category
      ? (camelToKebab(row.category) as AnnouncementCategory)
      : undefined,
    expiresAt: row.expiresAt?.toISOString(),
    // The schema stores the event flat; the type nests it. Present only when
    // there is actually a start date — an event with no date is not an event,
    // and an empty `event` object would render an empty block.
    event: row.eventStartsAt
      ? {
          startsAt: row.eventStartsAt.toISOString(),
          endsAt: row.eventEndsAt?.toISOString(),
          location: row.eventLocation ?? "",
          online: row.eventOnline ?? undefined,
          registerUrl: row.eventRegisterUrl ?? undefined,
          deadline: row.eventDeadline?.toISOString(),
        }
      : undefined,
    // Both halves or neither — a label with no href is a dead button.
    action:
      row.actionLabel && row.actionHref
        ? { label: row.actionLabel, href: row.actionHref }
        : undefined,
  };
}

/* ------------------------------------------------------------------ *
 * Articles.
 * ------------------------------------------------------------------ */

/**
 * Everything an article page renders, in one query.
 *
 * `contributors` and `references` are ordered by `position` in the query
 * rather than after the fact: author order is a claim about contribution, and
 * a reference list renumbered by whatever the database returned would cite the
 * wrong sources.
 */
const articleInclude = {
  contributors: {
    orderBy: { position: "asc" },
    include: { affiliations: { include: { affiliation: true } } },
  },
  references: { orderBy: { position: "asc" } },
  galleys: true,
} satisfies Prisma.ArticleInclude;

type ArticleRow = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>;

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    doi: row.doi ?? undefined,
    type: camelToKebab(row.type) as Article["type"],
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    abstract: row.abstract,
    keywords: row.keywords,

    contributors: row.contributors.map((c) => ({
      id: c.id,
      givenName: c.givenName,
      familyName: c.familyName,
      orcid: c.orcid ?? undefined,
      email: c.email ?? undefined,
      isCorresponding: c.isCorresponding,
      affiliations: c.affiliations.map(({ affiliation }) => ({
        id: affiliation.id,
        name: affiliation.name,
        city: affiliation.city ?? undefined,
        country: affiliation.country ?? undefined,
        ror: affiliation.ror ?? undefined,
      })),
    })),
    references: row.references.map((r) => ({
      id: r.id,
      raw: r.raw,
      doi: r.doi ?? undefined,
    })),
    galleys: row.galleys.map((g) => ({
      id: g.id,
      label: g.label as "PDF" | "HTML" | "XML",
      url: g.url,
      mimeType: g.mimeType,
      // `BigInt` cannot cross into a Server Component — Next refuses to
      // serialize it, and the failure is a runtime error on the article page
      // rather than anything the typechecker would catch.
      sizeBytes: g.sizeBytes != null ? Number(g.sizeBytes) : undefined,
    })),

    volume: row.volume,
    // The column is `issueNumber`; the type calls it `issue`. Same fact, two
    // names — the seed already translates it the other way.
    issue: row.issueNumber,
    pages: row.pages ?? undefined,

    receivedAt: row.receivedAt?.toISOString(),
    revisedAt: row.revisedAt?.toISOString(),
    acceptedAt: row.acceptedAt?.toISOString(),
    publishedAt: row.publishedAt.toISOString(),

    license: row.license,
    funding: row.funding ?? undefined,
    conflictOfInterest: row.conflictOfInterest ?? undefined,
    ethicsStatement: row.ethicsStatement ?? undefined,
    dataAvailability: row.dataAvailability ?? undefined,

    // Three columns, one optional object. `citations` is genuinely nullable —
    // the journal does not collect it, and 0 would be a claim.
    metrics: {
      views: row.views,
      downloads: row.downloads,
      citations: row.citations ?? undefined,
    },
  };
}

/**
 * Newest first.
 *
 * **Not filtered on `publishedAt <= now`, deliberately.** That filter was
 * written first and was wrong: the seeded Vol. 1 No. 2 carries a publication
 * date of 2026-12-31, and hiding its three articles left `/issues` listing an
 * issue whose table of contents was empty — a worse answer than showing the
 * article, because the issue itself is still announced.
 *
 * An `Article` row exists only once the editorial office has published it; a
 * dated-ahead row is a cover date, which is how journals number issues, not a
 * scheduled release. If embargoed articles ever need holding back, the honest
 * shape is a status on the row, and the issue has to be held back with them.
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const rows = await db.article.findMany({
    include: articleInclude,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await db.article.findUnique({
    where: { slug },
    include: articleInclude,
  });
  return row ? toArticle(row) : null;
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const rows = await db.article.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

/* ------------------------------------------------------------------ *
 * Issues — the published archive.
 * ------------------------------------------------------------------ */

/**
 * `articleIds` is derived, not stored.
 *
 * The type carries a string array; the schema expresses the same fact as
 * `Article.issueId`, which is the direction that lets an article belong to at
 * most one issue without a second place to keep it in step. So the ids are
 * read back off the relation.
 *
 * Nullable columns map to `undefined`, never to `""` — an issue with no theme
 * has no title, and an empty string would render an empty heading.
 */
const issueInclude = {
  articles: { select: { id: true }, orderBy: { publishedAt: "asc" } },
} satisfies Prisma.IssueInclude;

type IssueRow = Prisma.IssueGetPayload<{ include: typeof issueInclude }>;

function toIssue(row: IssueRow): Issue {
  return {
    id: row.id,
    slug: row.slug,
    volume: row.volume,
    number: row.number,
    year: row.year,
    title: row.title ?? undefined,
    coverUrl: row.coverUrl ?? undefined,
    publishedAt: row.publishedAt.toISOString(),
    articleIds: row.articles.map((a) => a.id),
  };
}

/** Newest first. */
export async function getIssues(): Promise<Issue[]> {
  const rows = await db.issue.findMany({
    include: issueInclude,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toIssue);
}

export async function getCurrentIssue(): Promise<Issue | null> {
  const row = await db.issue.findFirst({
    include: issueInclude,
    orderBy: { publishedAt: "desc" },
  });
  return row ? toIssue(row) : null;
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  const row = await db.issue.findUnique({
    where: { slug },
    include: issueInclude,
  });
  return row ? toIssue(row) : null;
}

/**
 * An issue's table of contents.
 *
 * Queried by `issueId` rather than filtered from `issue.articleIds`, so the
 * running order comes from the same `orderBy` every other article list uses
 * and the page cannot be handed articles in a different order than the archive
 * shows them.
 */
export async function getArticlesForIssue(issue: Issue): Promise<Article[]> {
  const rows = await db.article.findMany({
    where: { issueId: issue.id },
    include: articleInclude,
    orderBy: { publishedAt: "asc" },
  });
  return rows.map(toArticle);
}

/* ------------------------------------------------------------------ *
 * The editorial board.
 * ------------------------------------------------------------------ */

/**
 * Ordered by `sortOrder`, which the seed fills from the fixture's own order —
 * seniority within each category, which is what the office chose and not
 * anything the database could work out. Name is the tiebreak so two members
 * sharing a position still come back in a stable order rather than swapping
 * between reads.
 */
export async function getBoardMembers(): Promise<BoardMember[]> {
  const rows = await db.boardMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    institution: row.institution,
    country: row.country,
    orcid: row.orcid ?? undefined,
    scholarUrl: row.scholarUrl ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    category: camelToKebab(row.category) as BoardMember["category"],
  }));
}

/* ------------------------------------------------------------------ *
 * Dated posts — announcements, news, events
 * ------------------------------------------------------------------ */

/** Newest first. Events sort by when they happen, not when they were posted. */
export async function getPosts(kind: PostKind): Promise<Post[]> {
  const rows = await db.post.findMany({ where: { kind } });
  return rows.map(toPost).sort((a, b) => {
    // Sorted here rather than in the query: an event's order depends on
    // `eventStartsAt` when it has one and `publishedAt` when it does not,
    // which is a choice between two columns per row, not an ORDER BY.
    const at = a.event?.startsAt ?? a.publishedAt;
    const bt = b.event?.startsAt ?? b.publishedAt;
    return +new Date(bt) - +new Date(at);
  });
}

export async function getPostBySlug(
  kind: PostKind,
  slug: string,
): Promise<Post | null> {
  // `@@unique([kind, slug])` — a slug is only unique within its kind, so the
  // same slug can legitimately exist as both a news item and an event.
  const row = await db.post.findUnique({
    where: { kind_slug: { kind, slug } },
  });
  return row ? toPost(row) : null;
}

export async function getPostSlugs(kind: PostKind): Promise<string[]> {
  const rows = await db.post.findMany({
    where: { kind },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** The few most recent announcements, for the home page. */
export async function getLatestAnnouncements(limit = 3): Promise<Post[]> {
  const now = Date.now();
  return (await getPosts("announcement"))
    .filter((p) => !p.expiresAt || +new Date(p.expiresAt) >= now)
    .slice(0, limit);
}
