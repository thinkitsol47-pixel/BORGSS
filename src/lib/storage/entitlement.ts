import "server-only";
import { db, isUuid } from "@/lib/db";
import { inRoleGroup } from "@/config/roles";
import type { CurrentUser } from "@/lib/auth/current-user";

/**
 * Who may read which file.
 *
 * **This is the whole of the confidentiality guarantee.** `signedUrlFor` signs
 * whatever it is given; nothing downstream of this module asks again. So a
 * mistake here is not a bug in one screen — it is every screen.
 *
 * Kept out of the route handler on purpose: the rule wants to be readable on
 * its own, and testable without a request.
 */

export type FileAccess =
  | { allowed: true; publicId: string; filename: string }
  | { allowed: false; reason: "not-found" | "forbidden" };

/**
 * A published article's galley — open to everyone, signed in or not.
 *
 * The one public branch here, and it takes no user: an open-access article is
 * meant to be read by anyone. What makes it safe is that an `ArticleGalley`
 * row exists only once `publishIssueRecord` has published the article, and
 * only the final galley is ever linked. An unpublished galley has no row here
 * and stays behind `galleyAccessFor`.
 */
export async function articleGalleyAccess(galleyId: string): Promise<FileAccess> {
  if (!isUuid(galleyId)) return { allowed: false, reason: "not-found" };
  const galley = await db.articleGalley.findUnique({
    where: { id: galleyId },
    select: { storagePath: true, label: true, article: { select: { slug: true } } },
  });
  if (!galley?.storagePath) return { allowed: false, reason: "not-found" };

  return {
    allowed: true,
    publicId: galley.storagePath,
    filename: `${galley.article.slug}.${galley.label.toLowerCase()}`,
  };
}

/**
 * Who may read a production galley.
 *
 * **Deliberately narrower than `fileAccessFor`, and deliberately its own
 * function.** A galley is not a `SubmissionFile` — it lives in
 * `ProductionGalley`, a different table with no author column to compare
 * against — so extending the rule above by analogy would have meant guessing
 * which of its branches still applied. They mostly do not:
 *
 * - **No author branch.** A galley in production is unapproved typeset output;
 *   the author receives it by email when production chooses to send it, which
 *   is what `sentToAuthorAt` records. A portal download would hand them every
 *   intermediate version, including ones nobody meant them to see.
 * - **No reviewer branch at all.** Review is finished by the time a manuscript
 *   is typeset, and a reviewer holds no standing claim on the accepted text.
 *
 * So: production and editorial staff, nobody else. If the author is ever given
 * portal access to their own galley, it should be the `isFinal` one only, and
 * that is a deliberate change to this function rather than a new caller.
 */
export async function galleyAccessFor(
  user: CurrentUser,
  galleyId: string,
): Promise<FileAccess> {
  const galley = await db.productionGalley.findUnique({
    where: { id: galleyId },
    select: { storagePath: true, format: true, version: true },
  });

  // Same answer for missing and forbidden, for the same reason as above.
  if (!galley) return { allowed: false, reason: "not-found" };

  if (
    !inRoleGroup(user.roles, "production") &&
    !inRoleGroup(user.roles, "editorial")
  ) {
    return { allowed: false, reason: "forbidden" };
  }

  // The filename is rebuilt rather than stored: `ProductionGalley` has no
  // filename column, and the storage key is the only name the file ever had.
  // Falling back to a composed name keeps the download from arriving untitled.
  const name = galley.storagePath.split("/").pop() || `galley-v${galley.version}`;

  return {
    allowed: true,
    publicId: galley.storagePath,
    filename: name.includes(".") ? name : `${name}.${galley.format}`,
  };
}

/**
 * The reviewer's exception, and the reason this function is not a role check.
 *
 * A reviewer assigned to a manuscript may read the manuscript. They may **not**
 * read the title page or the cover letter, because both name the authors and
 * the review is double-blind. This is the same rule `ReviewTask` enforces by
 * having no author field — stated twice, deliberately, because a file download
 * is a second door into the same information.
 */
const HIDDEN_FROM_REVIEWERS = new Set(["titlePage", "coverLetter"]);

export async function fileAccessFor(
  user: CurrentUser,
  fileId: string,
): Promise<FileAccess> {
  const file = await db.submissionFile.findUnique({
    where: { id: fileId },
    select: {
      filename: true,
      storagePath: true,
      kind: true,
      submissionId: true,
      submission: { select: { submittedById: true } },
    },
  });

  // A missing file and a file someone may not have are answered the same way by
  // the route, so that probing ids tells an outsider nothing.
  if (!file) return { allowed: false, reason: "not-found" };

  const granted = { allowed: true as const, publicId: file.storagePath, filename: file.filename };

  // Editorial and production staff see everything on a manuscript that has
  // reached them. This is the role group the editorial screens already use.
  if (inRoleGroup(user.roles, "editorial") || inRoleGroup(user.roles, "production")) {
    return granted;
  }

  // The author of the manuscript sees their own files.
  if (file.submission.submittedById === user.id) return granted;

  // A reviewer sees the manuscript and its supplementary material, but only
  // while they hold a live assignment on it — an invitation they declined, or a
  // round they are no longer part of, is not a standing key to the file.
  if (user.roles.includes("reviewer") && !HIDDEN_FROM_REVIEWERS.has(file.kind)) {
    const assignment = await db.reviewAssignment.findFirst({
      where: {
        submissionId: file.submissionId,
        reviewerId: user.id,
        status: { in: ["accepted", "completed"] },
      },
      select: { id: true },
    });

    if (assignment) return granted;
  }

  return { allowed: false, reason: "forbidden" };
}
