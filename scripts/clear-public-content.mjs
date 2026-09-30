/**
 * Remove the seeded *public* record from the database.
 *
 * The journal has published nothing yet. Until 2026-09-18 the public site
 * nevertheless showed twelve named board members at real institutions, seven
 * articles with DOIs, two issues and ten announcements — every one of them
 * invented by `prisma/seed.ts`. DOAJ and the ISSN centre verify exactly these
 * pages, and they verify them by writing to the people named.
 *
 * What this deletes is only what the public sees. The portal's demo data —
 * submissions, reviews, production jobs, the 39 profile rows — is behind a
 * login, is useful for showing the client how the workflow runs, and stays.
 * `Section` stays too: those ten subject areas are the journal's own.
 *
 * Order matters. `ArticleContributor` and its affiliation join both hold a
 * restricting foreign key into `Affiliation`, so they go first; `Submission`
 * points at `Article`, so that link is broken before the articles go.
 *
 *   node scripts/clear-public-content.mjs          # count, change nothing
 *   node scripts/clear-public-content.mjs --apply  # delete
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const apply = process.argv.includes("--apply");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const counts = {
  "Board members": await db.boardMember.count(),
  Articles: await db.article.count(),
  Issues: await db.issue.count(),
  Posts: await db.post.count(),
  Affiliations: await db.affiliation.count(),
};

console.log(apply ? "Deleting:" : "Would delete (dry run):");
for (const [label, n] of Object.entries(counts)) {
  console.log(`  ${label.padEnd(16)} ${n}`);
}

if (!apply) {
  console.log("\nNothing was changed. Re-run with --apply to delete.");
  await db.$disconnect();
  process.exit(0);
}

await db.$transaction(async (tx) => {
  // A published article is the one thing a submission can point at. Clear the
  // link before the target, or the delete is refused.
  await tx.submission.updateMany({
    where: { articleId: { not: null } },
    data: { articleId: null },
  });

  await tx.articleContributorAffiliation.deleteMany();
  await tx.articleContributor.deleteMany();
  await tx.issuePlanItem.deleteMany();

  // The production queue's target dates point at issues that are going.
  await tx.productionJob.updateMany({
    where: { issueId: { not: null } },
    data: { issueId: null },
  });

  await tx.article.deleteMany();
  await tx.issue.deleteMany();
  await tx.post.deleteMany();
  await tx.boardMember.deleteMany();

  // Affiliations are shared with submission contributors, which stay. Only
  // the ones nothing else references are removed.
  const orphans = await tx.affiliation.findMany({
    where: {
      articleContributors: { none: {} },
      contributors: { none: {} },
    },
    select: { id: true },
  });
  await tx.affiliation.deleteMany({
    where: { id: { in: orphans.map((o) => o.id) } },
  });

  console.log(`  Affiliations removed as orphans: ${orphans.length}`);
});

console.log("\nDone. The public site now shows what the journal has: nothing yet.");
await db.$disconnect();
