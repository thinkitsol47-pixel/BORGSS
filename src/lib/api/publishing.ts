import "server-only";
import { randomUUID } from "node:crypto";
import type { GalleyFormat, Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";

/**
 * Publishing an issue — the step that turns accepted manuscripts into the
 * public record (built 2026-10-06).
 *
 * **Without DOIs, by the owner's decision.** The journal has no Crossref
 * prefix, and waiting for one meant nothing could ever appear on the public
 * site. So an article is published with `doi` null and the site says nothing
 * about a DOI it does not have; every public screen already renders a DOI only
 * when there is one. When a prefix arrives, DOIs are minted for the existing
 * articles and deposited — publishing does not have to be redone.
 *
 * **What is frozen at publication.** The byline is copied from `Contributor`
 * into `ArticleContributor`, because a published citation must not move when a
 * submission's record is later corrected (see the schema). The running order
 * is copied into `Article.issuePosition`.
 *
 * **The galley is not copied.** The file the production team marked final
 * stays `authenticated` in Cloudinary; `ArticleGalley.storagePath` points at
 * it and `/files/article:<id>` streams it to anyone once it is published. No
 * second, permanently public copy exists to fall out of step or leak early.
 */

const PLACEABLE = new Set(["accepted", "inProduction"]);

/** Formats a reader can be offered, with the label and type the site uses. */
const PUBLISHED_FORMATS: Partial<
  Record<GalleyFormat, { label: "PDF" | "HTML" | "XML"; mimeType: string }>
> = {
  pdf: { label: "PDF", mimeType: "application/pdf" },
  html: { label: "HTML", mimeType: "text/html" },
  xml: { label: "XML", mimeType: "application/xml" },
};

const readinessInclude = {
  items: {
    orderBy: { position: "asc" },
    include: {
      submission: {
        include: {
          contributors: {
            orderBy: { position: "asc" },
            include: { affiliations: true },
          },
          productionJob: {
            include: {
              stages: true,
              galleys: { where: { isFinal: true } },
              // Open = neither applied nor declined with a reason.
              corrections: {
                where: { applied: false, declinedReason: null },
                select: { id: true },
              },
            },
          },
          decisions: {
            where: { type: "accept" },
            orderBy: { decidedAt: "desc" },
            take: 1,
          },
          files: {
            where: { round: { gt: 0 } },
            orderBy: { uploadedAt: "desc" },
            take: 1,
            select: { uploadedAt: true },
          },
        },
      },
    },
  },
} satisfies Prisma.EditorialIssueInclude;

type IssueRow = Prisma.EditorialIssueGetPayload<{
  include: typeof readinessInclude;
}>;
type ItemRow = IssueRow["items"][number];

export type PublishReadiness = {
  /** Problems with the issue as a whole. */
  issueProblems: string[];
  /** One entry per placed manuscript, in running order. */
  items: { submissionId: string; reference: string; title: string; problems: string[] }[];
  ready: boolean;
};

/** Why one placed manuscript cannot be published yet, if it cannot. */
function itemProblems(item: ItemRow): string[] {
  const s = item.submission;
  const problems: string[] = [];

  if (!PLACEABLE.has(s.status)) {
    problems.push("It is no longer an accepted manuscript.");
  }
  if (s.contributors.length === 0) {
    problems.push("It has no authors recorded, so it cannot carry a byline.");
  }

  const job = s.productionJob;
  if (!job) {
    problems.push("It has not entered production.");
    return problems;
  }
  if (!job.galleys.some((g) => g.format === "pdf")) {
    problems.push("No PDF galley is marked final in production.");
  }
  const proofread = job.stages.find((st) => st.stage === "proofread");
  if (proofread?.state !== "done") {
    problems.push("Proofreading is not marked complete.");
  }
  // The proofread screen promises this: an open correction is a change nobody
  // has decided about, and publishing would decide it by default.
  if (job.corrections.length > 0) {
    const n = job.corrections.length;
    problems.push(
      `${n} proof correction${n === 1 ? " is" : "s are"} still open — apply or decline ${n === 1 ? "it" : "each"}.`,
    );
  }
  return problems;
}

function readinessOf(issue: IssueRow): PublishReadiness {
  const issueProblems: string[] = [];
  if (issue.state === "published") issueProblems.push("This issue is already published.");
  if (issue.items.length === 0) {
    issueProblems.push("Nothing is placed in this issue.");
  }

  const items = issue.items.map((item) => ({
    submissionId: item.submissionId,
    reference: item.submission.reference,
    title: item.submission.title,
    problems: itemProblems(item),
  }));

  return {
    issueProblems,
    items,
    ready: issueProblems.length === 0 && items.every((i) => i.problems.length === 0),
  };
}

export async function getPublishReadiness(
  issueId: string,
): Promise<PublishReadiness | null> {
  if (!isUuid(issueId)) return null;
  const issue = await db.editorialIssue.findUnique({
    where: { id: issueId },
    include: readinessInclude,
  });
  return issue ? readinessOf(issue) : null;
}

/**
 * A URL slug from a title: lower case, ASCII, hyphenated, cut at a word
 * boundary near 80 characters. Collisions are resolved by the caller.
 */
function slugify(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length <= 80) return base || "article";
  const cut = base.slice(0, 80);
  return cut.slice(0, cut.lastIndexOf("-") > 40 ? cut.lastIndexOf("-") : 80);
}

export type PublishedArticle = {
  slug: string;
  title: string;
  reference: string;
  author: { name: string; email: string } | null;
};

export type PublishResult =
  | {
      ok: true;
      issueSlug: string;
      label: string;
      articles: PublishedArticle[];
    }
  | { ok: false; error: string };

/**
 * Publish an issue and every manuscript placed in it, in one transaction.
 *
 * Readiness is re-checked inside the transaction, not trusted from the page:
 * a galley can be un-finalised or a stage reopened between the editor loading
 * the screen and pressing the button. All or nothing — an issue published with
 * half its contents is a table of contents that changes after it was cited.
 */
export async function publishIssueRecord(issueId: string): Promise<PublishResult> {
  if (!isUuid(issueId)) return { ok: false, error: "That issue could not be found." };

  return db.$transaction(
    async (tx) => {
      const issue = await tx.editorialIssue.findUnique({
        where: { id: issueId },
        include: readinessInclude,
      });
      if (!issue) return { ok: false, error: "That issue could not be found." };

      const readiness = readinessOf(issue);
      if (!readiness.ready) {
        return {
          ok: false,
          error:
            readiness.issueProblems[0] ??
            "One or more manuscripts are not ready. The list on this page says which, and why.",
        };
      }

      const now = new Date();
      const issueSlug = `v${issue.volume}i${issue.number}`;
      const label = `Vol. ${issue.volume}, No. ${issue.number} (${issue.year})`;

      if (await tx.issue.findFirst({
        where: { OR: [{ slug: issueSlug }, { volume: issue.volume, number: issue.number }] },
        select: { id: true },
      })) {
        return {
          ok: false,
          error: `${label} already exists on the public site. Every published issue has its own volume and number.`,
        };
      }

      const published = await tx.issue.create({
        data: {
          slug: issueSlug,
          volume: issue.volume,
          number: issue.number,
          year: issue.year,
          title: issue.title,
          publishedAt: now,
        },
        select: { id: true },
      });

      const articles: PublishedArticle[] = [];
      const taken = new Set(
        (await tx.article.findMany({ select: { slug: true } })).map((a) => a.slug),
      );

      for (const item of issue.items) {
        const s = item.submission;

        let slug = slugify(s.title);
        for (let n = 2; taken.has(slug); n++) slug = `${slugify(s.title)}-${n}`;
        taken.add(slug);

        const article = await tx.article.create({
          data: {
            slug,
            doi: null,
            type: s.type,
            title: s.title,
            abstract: s.abstract,
            keywords: s.keywords,
            issueId: published.id,
            volume: issue.volume,
            issueNumber: issue.number,
            issuePosition: item.position,
            receivedAt: s.submittedAt,
            revisedAt: s.files[0]?.uploadedAt ?? null,
            acceptedAt: s.decisions[0]?.decidedAt ?? null,
            publishedAt: now,
            funding: s.funding,
            conflictOfInterest: s.conflictOfInterest,
            dataAvailability: s.dataAvailability,
          },
          select: { id: true },
        });

        for (const c of s.contributors) {
          await tx.articleContributor.create({
            data: {
              articleId: article.id,
              givenName: c.givenName,
              familyName: c.familyName,
              orcid: c.orcid,
              email: c.isCorresponding ? c.email : null,
              isCorresponding: c.isCorresponding,
              position: c.position,
              affiliations: {
                create: c.affiliations.map((a) => ({ affiliationId: a.affiliationId })),
              },
            },
          });
        }

        for (const g of s.productionJob?.galleys ?? []) {
          const format = PUBLISHED_FORMATS[g.format];
          if (!format) continue;
          const id = randomUUID();
          await tx.articleGalley.create({
            data: {
              id,
              articleId: article.id,
              label: format.label,
              mimeType: format.mimeType,
              url: `/files/article:${id}`,
              sizeBytes: g.sizeBytes,
              storagePath: g.storagePath,
            },
          });
        }

        await tx.submission.update({
          where: { id: s.id },
          data: { status: "published", articleId: article.id },
        });

        const corresponding =
          s.contributors.find((c) => c.isCorresponding) ?? s.contributors[0];
        articles.push({
          slug,
          title: s.title,
          reference: s.reference,
          author: corresponding?.email
            ? {
                name: `${corresponding.givenName} ${corresponding.familyName}`.trim(),
                email: corresponding.email,
              }
            : null,
        });
      }

      await tx.editorialIssue.update({
        where: { id: issue.id },
        data: { state: "published", publishedAt: now, slug: issueSlug },
      });

      return { ok: true, issueSlug, label, articles };
    },
    // An issue of a dozen articles is a few hundred statements; the default
    // five seconds is not much headroom against a pooled connection.
    { timeout: 30_000, maxWait: 10_000 },
  );
}
