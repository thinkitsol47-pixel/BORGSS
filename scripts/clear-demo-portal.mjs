/**
 * Remove the seeded *portal* demo data before launch.
 *
 * `clear-public-content.mjs` emptied the public record and deliberately left
 * the portal's demo workflow in place, so the client could see it run. At
 * launch that flips: real editors would be shown invented manuscripts, and
 * acting on one emails an `@example.edu` address that bounces — and bounces
 * are what cost a sending domain its reputation at Resend.
 *
 * What goes:
 *   - every Submission, and through ON DELETE CASCADE its contributors, files,
 *     decisions, messages, review assignments, reports, production job,
 *     stages, galleys, proof corrections and issue placements
 *   - every EditorialIssue (the seeded three, two of them marked "published")
 *   - every User row that has no login in auth.users — the seeded profiles;
 *     their roles and reviewer profiles cascade
 *   - affiliations nothing references any more
 *   - the stored files of the deleted submissions, from Cloudinary
 *
 * What stays: accounts that can sign in, Section, ReviewForm, JournalSetting,
 * ContactMessage (real inbound mail) and the audit log (append-only — its
 * entries describe things real accounts did).
 *
 * The reference sequence is reset, so the first real manuscript is
 * BORJSS-<year>-0001.
 *
 *   node --env-file=.env.local scripts/clear-demo-portal.mjs          # count only
 *   node --env-file=.env.local scripts/clear-demo-portal.mjs --apply  # delete
 *
 * Take a backup first (GitHub → Actions → Database backup → Run workflow).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const apply = process.argv.includes("--apply");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const loginIds = (
  await db.$queryRaw`SELECT id::text FROM auth.users`
).map((r) => r.id);
const keptUsers = await db.user.findMany({
  where: { id: { in: loginIds } },
  select: { email: true },
});

// Only real uploads live in Cloudinary; the seed wrote `mock/...` paths.
const storedFiles = [
  ...(await db.submissionFile.findMany({ select: { storagePath: true } })),
  ...(await db.productionGalley.findMany({ select: { storagePath: true } })),
]
  .map((f) => f.storagePath)
  .filter((p) => p.startsWith("submissions/"));

const counts = {
  Submissions: await db.submission.count(),
  "Editorial issues": await db.editorialIssue.count(),
  "Users (no login)": await db.user.count({ where: { id: { notIn: loginIds } } }),
  "Stored files": storedFiles.length,
};

console.log(apply ? "Deleting:" : "Would delete (dry run):");
for (const [label, n] of Object.entries(counts)) {
  console.log(`  ${label.padEnd(18)} ${n}`);
}
console.log(`\nKept (accounts with a login): ${keptUsers.map((u) => u.email).join(", ")}`);

if (!apply) {
  console.log("\nNothing was changed. Re-run with --apply to delete.");
  await db.$disconnect();
  process.exit(0);
}

await db.$transaction(async (tx) => {
  await tx.submission.deleteMany();
  await tx.editorialIssue.deleteMany();
  await tx.user.deleteMany({ where: { id: { notIn: loginIds } } });

  const orphans = await tx.affiliation.findMany({
    where: { articleContributors: { none: {} }, contributors: { none: {} } },
    select: { id: true },
  });
  await tx.affiliation.deleteMany({
    where: { id: { in: orphans.map((o) => o.id) } },
  });
  console.log(`  Affiliations removed as orphans: ${orphans.length}`);

  await tx.$executeRaw`SELECT setval('submission_reference_seq', 1, false)`;
});

// After the commit, so a Cloudinary failure can never undo the database.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
let removed = 0;
for (const publicId of storedFiles) {
  try {
    const r = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      type: "authenticated",
    });
    if (r.result === "ok" || r.result === "not found") removed++;
    else console.log(`  Cloudinary kept ${publicId}: ${r.result}`);
  } catch (e) {
    console.log(`  Cloudinary failed on ${publicId}: ${e.message}`);
  }
}
console.log(`  Stored files removed: ${removed}/${storedFiles.length}`);

console.log("\nDone. The portal now holds only real accounts and nothing invented.");
await db.$disconnect();
