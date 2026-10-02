"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ArticleType, SubmissionFileKind } from "@prisma/client";
import {
  MAX_FILE_BYTES,
  revisionUploadSchema,
  submissionFilesSchema,
  submissionStartSchema,
  wizardContributorSchema,
  wizardDeclarationsSchema,
  wizardMetadataSchema,
  wizardSubmitSchema,
} from "@/lib/validation/schemas";
import { db, isUuid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { putFile, isStorageConfigured } from "@/lib/storage";
import { sendEmail } from "@/lib/email/send";
import { submissionReceiptEmail } from "@/lib/email/templates";

/**
 * Submission wizard Server Actions.
 *
 * **Step 1 creates the draft; every later step writes to it.** A draft is a
 * `Submission` at status `draft`, which every editorial read already excludes
 * — an author still filling in the wizard has not handed anything over.
 *
 * **Each step re-checks ownership.** A Server Action is its own entry point and
 * can be invoked without the page that renders its form ever loading, so
 * `ownedDraft()` runs on every write rather than trusting the `draftId` in the
 * URL. Passing someone else's draft id gets the same answer as passing a
 * nonexistent one.
 *
 * **Files go to Cloudinary through `lib/storage`, never directly.** See that
 * module for why an upload's returned URL is never kept.
 */

export type WizardState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

function fieldErrors(error: {
  issues: { path: (string | number)[]; message: string }[];
}) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/**
 * The form posts kebab values (`case-study`); Prisma's generated enum is
 * camelCase. Same shape as `DEGREE` in the reviewer-application action — the
 * other four values are identical in both, and are mapped anyway so that a new
 * article type is a compile error here rather than a runtime one.
 */
const ARTICLE_TYPE: Record<string, ArticleType> = {
  research: "research",
  review: "review",
  "case-study": "caseStudy",
  editorial: "editorial",
  conceptual: "conceptual",
  "book-review": "bookReview",
};

/**
 * The draft this user is allowed to edit, or null.
 *
 * Only a `draft` qualifies: once a manuscript is submitted the wizard must not
 * be able to rewrite it behind the editor's back, and a stale tab left open on
 * step 3 is exactly how that would happen.
 */
async function ownedDraft(draftId: string) {
  const user = await getCurrentUser();
  if (!user || !isUuid(draftId)) return null;

  const draft = await db.submission.findUnique({
    where: { id: draftId },
    select: { id: true, submittedById: true, status: true },
  });

  if (!draft || draft.submittedById !== user.id || draft.status !== "draft") {
    return null;
  }
  return draft;
}

/** The state a step returns when the draft is not the caller's to write to. */
const NO_DRAFT: WizardState = {
  status: "error",
  message:
    "This draft could not be opened. It may have been submitted already, or the link may belong to someone else.",
};

/**
 * "BORJSS-2026-0042", from a Postgres sequence.
 *
 * Never a row count: delete one submission and a count reissues a reference
 * another author has already quoted in an email. The sequence is created in
 * `20260909120000_submission_reference_sequence`.
 */
async function nextReference(): Promise<string> {
  const [row] = await db.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('submission_reference_seq')
  `;
  return `BORJSS-${new Date().getFullYear()}-${String(row.nextval).padStart(4, "0")}`;
}

export async function startSubmission(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = submissionStartSchema.safeParse(raw);

  // Echo everything back except the checkbox states, which the inputs manage
  // themselves — a failed submit must not empty a form this long.
  const values: Record<string, string> = {
    articleType: raw.articleType ?? "",
    section: raw.section ?? "",
    title: raw.title ?? "",
    underReviewElsewhere: raw.underReviewElsewhere ?? "",
  };

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Please sign in to start a submission.", values };
  }

  // The section is chosen by name on the form but is a foreign key in the
  // database. An unknown name is a field error, not a crash — the list is
  // rendered from the same table, so this only fires if a section was renamed
  // between the page loading and the form being submitted.
  const section = await db.section.findFirst({
    where: { name: parsed.data.section },
    select: { id: true },
  });

  if (!section) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: { section: "That subject area is no longer listed. Choose another." },
      values,
    };
  }

  let draftId: string;

  try {
    const draft = await db.submission.create({
      data: {
        reference: await nextReference(),
        title: parsed.data.title,
        // Filled in at step 3. Empty rather than null because the column is
        // required — a draft is a real row from the moment it exists, and
        // making half the schema nullable to accommodate drafts would weaken
        // every read that follows.
        abstract: "",
        keywords: [],
        type: ARTICLE_TYPE[parsed.data.articleType],
        sectionId: section.id,
        submittedById: user.id,
        status: "draft",
      },
      select: { id: true },
    });
    draftId = draft.id;
  } catch {
    return {
      status: "error",
      message: "The draft could not be created. Please try again.",
      values,
    };
  }

  // Outside the try: `redirect` works by throwing, so catching around it would
  // swallow the navigation and report a failure that did not happen.
  redirect(`/submissions/new/${draftId}/upload`);
}

/* ------------------------------------------------------------- revisions *
 * Phase 5. The author's response-to-reviewers round.                        */

/**
 * The submission this user may file a revision against, or null.
 *
 * **The mirror of `ownedDraft()`, and deliberately not the same helper.** That
 * one accepts only status `draft`, because the wizard must not rewrite a
 * manuscript an editor is reading. This one accepts only
 * `revisionRequested`, which is the exact opposite case: a submitted
 * manuscript the editor has handed back. Sharing one helper would have meant a
 * status list long enough to permit both, and that list is the whole guard.
 *
 * Returns `round` so the caller never has to ask the form what round it is.
 */
async function revisableSubmission(submissionId: string) {
  const user = await getCurrentUser();
  if (!user || !isUuid(submissionId)) return null;

  const submission = await db.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      reference: true,
      submittedById: true,
      status: true,
      round: true,
    },
  });

  if (
    !submission ||
    submission.submittedById !== user.id ||
    submission.status !== "revisionRequested"
  ) {
    return null;
  }
  return submission;
}

/**
 * Upload a revised manuscript and its response to reviewers.
 *
 * **The round is derived, never accepted from the form** — it is
 * `Submission.round`, read here. A client that could name its own round could
 * file against a round the editor has closed, or overwrite round 1 from a
 * stale tab left open for a fortnight.
 *
 * **The status is not advanced.** Uploading a revision does not put the
 * manuscript back under review: that is the editor's decision, taken on the
 * editorial screens, and an author who could move their own manuscript into
 * review would be skipping the desk check. The files land, the editor sees
 * them, and the queue's `waitingOn()` already reports a `revision-requested`
 * manuscript as waiting on the author until the editor acts.
 */
export async function uploadRevision(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  const parsed = revisionUploadSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields — nothing has been lost.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const submission = await revisableSubmission(parsed.data.submissionId);
  if (!submission) {
    return {
      status: "error",
      message:
        "This manuscript is not awaiting a revision, or it is not yours to revise. If the editor has asked for changes, open it from your submissions list.",
      values: raw,
    };
  }

  if (!isStorageConfigured()) {
    return {
      status: "error",
      message:
        "File storage is not configured, so nothing could be uploaded. Contact the editorial office.",
      values: raw,
    };
  }

  const manuscript = formData
    .getAll("manuscript")
    .find((v): v is File => v instanceof File && v.size > 0);

  if (!manuscript) {
    return {
      status: "error",
      message: "The revised manuscript did not reach the server.",
      errors: { manuscript: "Choose the revised manuscript file." },
      values: raw,
    };
  }

  // Re-checked server-side: the form warns first, but the action is reachable
  // without it.
  if (manuscript.size > MAX_FILE_BYTES) {
    return {
      status: "error",
      message: `${manuscript.name} is over ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`,
      errors: { manuscript: "Too large." },
      values: raw,
    };
  }

  // The round this upload belongs to. Round 0 is the original submission, so a
  // manuscript at round 1 is filing its first revision.
  const round = submission.round;

  const put = await putFile({
    content: Buffer.from(await manuscript.arrayBuffer()),
    folder: `submissions/${submission.id}`,
    // Round-scoped, so a second revision cannot overwrite the first. The
    // history is the point of this screen.
    name: `manuscript-r${round}`,
  });

  if (!put.ok) {
    return {
      status: "error",
      message: `${manuscript.name} could not be uploaded. Please try again.`,
      values: raw,
    };
  }

  // The response to reviewers is typed, not attached — the same choice the
  // cover letter makes on a new submission. It is stored as a message on the
  // manuscript so the editor reads it beside the reviewers' reports rather
  // than having to open a file.
  await db.$transaction(async (tx) => {
    // Re-running the upload replaces this round's manuscript rather than
    // accumulating two. Only this round and only this kind, so the original
    // submission's files are untouched.
    await tx.submissionFile.deleteMany({
      where: {
        submissionId: submission.id,
        kind: "manuscript",
        round,
      },
    });

    await tx.submissionFile.create({
      data: {
        submissionId: submission.id,
        kind: "manuscript",
        filename: manuscript.name,
        storagePath: put.publicId,
        sizeBytes: BigInt(put.bytes),
        round,
      },
    });

    await tx.submissionMessage.create({
      data: {
        submissionId: submission.id,
        fromId: submission.submittedById,
        fromRole: "author",
        subject: `Response to reviewers — revision ${round}`,
        // `body` is String[] — one entry per paragraph, which is how the
        // messages screen renders them. Blank lines are the author's own
        // paragraph breaks and are what the split preserves.
        body: parsed.data.responseToReviewers
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      },
    });
  });

  revalidatePath(`/submissions/${submission.id}`);
  revalidatePath(`/submissions/${submission.id}/revisions`);
  revalidatePath(`/submissions/${submission.id}/messages`);
  revalidatePath("/submissions");
  revalidatePath("/editorial/queue");

  return {
    status: "success",
    message:
      "Your revised manuscript and response are with the editorial office. No email is sent from the portal yet, so the editor is not notified automatically — they will see it in their queue.",
  };
}

/* ------------------------------------------------------- wizard steps 2–5 *
 * Each validates its own step and returns. With no database there is no draft
 * to write to, so none of these advances the wizard — the success state says
 * so rather than linking to a next step that would start empty.             */

export async function saveFiles(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  const parsed = submissionFilesSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please attach both required files.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const draft = await ownedDraft(raw.draftId ?? "");
  if (!draft) return { ...NO_DRAFT, values: raw };

  if (!isStorageConfigured()) {
    return {
      status: "error",
      message:
        "File storage is not configured, so nothing could be uploaded. Contact the editorial office.",
      values: raw,
    };
  }

  // The form field names, paired with the kind each becomes in the database and
  // whether the step can proceed without it.
  const wanted = [
    { field: "manuscript", kind: "manuscript" as const, required: true },
    { field: "titlePage", kind: "titlePage" as const, required: true },
    { field: "supplementary", kind: "supplementary" as const, required: false },
  ];

  const stored: { kind: string; filename: string; publicId: string; bytes: number }[] = [];
  const errors: Record<string, string> = {};

  for (const { field, kind, required } of wanted) {
    const entries = formData.getAll(field).filter((v): v is File => v instanceof File);
    const files = entries.filter((f) => f.size > 0);

    if (files.length === 0) {
      if (required) errors[`${field}Name`] = "This file did not reach the server. Choose it again.";
      continue;
    }

    for (const [index, file] of files.entries()) {
      // Re-checked here even though the form warns first: the client-side check
      // is a courtesy, and an action is reachable without it.
      if (file.size > MAX_FILE_BYTES) {
        errors[`${field}Name`] =
          `${file.name} is over ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`;
        continue;
      }

      const put = await putFile({
        content: Buffer.from(await file.arrayBuffer()),
        folder: `submissions/${draft.id}`,
        // Deterministic, so re-running a step replaces rather than accumulates,
        // and so nothing about the author's own filename ends up in the path.
        name: files.length > 1 ? `${kind}-${index + 1}` : kind,
      });

      if (!put.ok) {
        errors[`${field}Name`] = `${file.name} could not be uploaded. Please try again.`;
        continue;
      }

      stored.push({ kind, filename: file.name, publicId: put.publicId, bytes: put.bytes });
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Some files could not be uploaded.",
      errors,
      values: raw,
    };
  }

  // The cover letter is typed, not attached, so it is stored as a message on
  // the submission rather than as a file.
  await db.$transaction(async (tx) => {
    // Replacing a step's uploads: the previous rows are removed so a re-run
    // does not leave two manuscripts on one draft. Only for the kinds just
    // uploaded, so re-doing the manuscript does not delete the title page.
    await tx.submissionFile.deleteMany({
      where: {
        submissionId: draft.id,
        kind: { in: stored.map((s) => s.kind) as SubmissionFileKind[] },
      },
    });

    await tx.submissionFile.createMany({
      data: stored.map((s) => ({
        submissionId: draft.id,
        kind: s.kind as SubmissionFileKind,
        filename: s.filename,
        storagePath: s.publicId,
        sizeBytes: BigInt(s.bytes),
        round: 0,
      })),
    });
  });

  revalidatePath(`/submissions/new/${draft.id}/upload`);

  return {
    status: "success",
    message: `${stored.length} file${stored.length === 1 ? "" : "s"} uploaded and stored confidentially.`,
    values: raw,
  };
}

export async function saveMetadata(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = wizardMetadataSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields — nothing has been lost.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const draft = await ownedDraft(raw.draftId ?? "");
  if (!draft) return { ...NO_DRAFT, values: raw };

  await db.submission.update({
    where: { id: draft.id },
    data: {
      title: parsed.data.title,
      abstract: parsed.data.abstract,
      // Parsed the same way the form's chips show them, so what the author saw
      // is what is stored.
      keywords: parsed.data.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      funding: parsed.data.funding || null,
      conflictOfInterest: parsed.data.conflictOfInterest,
    },
  });

  revalidatePath(`/submissions/new/${draft.id}/metadata`);

  return {
    status: "success",
    message: "Your metadata has been saved to the draft.",
    values: raw,
  };
}

/**
 * Step 4 posts an indexed set of contributor rows, so this validates each row
 * and prefixes the field errors with the row number — `givenName-1`.
 */
export async function saveContributors(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;

  const count = Number(raw.contributorCount ?? "1");
  const errors: Record<string, string> = {};
  let corresponding = 0;

  for (let i = 0; i < count; i++) {
    const row = {
      givenName: raw[`givenName-${i}`] ?? "",
      familyName: raw[`familyName-${i}`] ?? "",
      email: raw[`email-${i}`] ?? "",
      affiliation: raw[`affiliation-${i}`] ?? "",
      orcid: raw[`orcid-${i}`] ?? "",
    };
    const parsed = wizardContributorSchema.safeParse(row);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = `${String(issue.path[0])}-${i}`;
        errors[key] ??= issue.message;
      }
    }
    if (raw.corresponding === String(i)) corresponding++;
  }

  // Exactly one corresponding author: they receive every decision and are
  // accountable for the submission, so "none" and "several" are both invalid.
  if (corresponding !== 1) {
    errors.corresponding = "Choose exactly one corresponding author.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors,
      values: raw,
    };
  }

  const draft = await ownedDraft(raw.draftId ?? "");
  if (!draft) return { ...NO_DRAFT, values: raw };

  // Replaced wholesale rather than diffed. Author order is a claim about
  // contribution, and reconciling an edited list against stored rows is where
  // an order silently changes; deleting and rewriting cannot reorder anything
  // the author did not reorder themselves.
  await db.$transaction(async (tx) => {
    await tx.contributor.deleteMany({ where: { submissionId: draft.id } });

    for (let i = 0; i < count; i++) {
      const contributor = await tx.contributor.create({
        data: {
          submissionId: draft.id,
          givenName: raw[`givenName-${i}`]?.trim() ?? "",
          familyName: raw[`familyName-${i}`]?.trim() ?? "",
          email: raw[`email-${i}`]?.trim() || null,
          orcid: raw[`orcid-${i}`]?.trim() || null,
          isCorresponding: raw.corresponding === String(i),
          // The list's order *is* the authorship order, so the index is stored
          // rather than derived from anything sortable.
          position: i,
        },
      });

      /**
       * The institution, as its own row.
       *
       * This was validated on the form and then silently dropped — the
       * contributor was written without it, so every author read back with
       * "No affiliation given" however carefully the field had been filled in.
       *
       * `Affiliation` is a table rather than a string on the contributor
       * precisely so that two authors at the same institution resolve to one
       * row; that shared row is what makes the reviewer conflict check
       * possible at all. So the name is upserted on its unique index — the
       * first author to name an institution creates it, everyone after joins
       * the existing one.
       */
      const affiliation = raw[`affiliation-${i}`]?.trim();
      if (affiliation) {
        const row = await tx.affiliation.upsert({
          where: { name: affiliation },
          create: { name: affiliation },
          update: {},
          select: { id: true },
        });

        await tx.contributorAffiliation.create({
          data: { contributorId: contributor.id, affiliationId: row.id },
        });
      }
    }
  });

  revalidatePath(`/submissions/new/${draft.id}/contributors`);

  return {
    status: "success",
    message: `${count} author${count === 1 ? "" : "s"} saved to the draft, in the order shown.`,
    values: raw,
  };
}

export async function saveDeclarations(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = wizardDeclarationsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Every declaration must be confirmed before you can continue.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const draft = await ownedDraft(raw.draftId ?? "");
  if (!draft) return { ...NO_DRAFT, values: raw };

  await db.submission.update({
    where: { id: draft.id },
    data: {
      aiDisclosure: parsed.data.aiDisclosure || null,
      dataAvailability: parsed.data.dataAvailability || null,
      // One timestamp for the five checkboxes. They are only ever accepted as
      // a set, and what a later dispute needs is *when* they were made.
      declaredAt: new Date(),
    },
  });

  revalidatePath(`/submissions/new/${draft.id}/declarations`);

  return {
    status: "success",
    message: "Your declarations have been recorded against the draft.",
    values: raw,
  };
}

/* ------------------------------------------------------------ wizard step 6 *
 * The final check-and-submit. This is the one step whose success state is not
 * "your answers are valid" but "your manuscript is with the editorial office",
 * so it must not claim that while no such thing happens.                      */

export async function submitSubmission(
  _prev: WizardState,
  formData: FormData,
): Promise<WizardState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = wizardSubmitSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please confirm both statements before submitting.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const owned = await ownedDraft(raw.draftId ?? "");
  if (!owned) return { ...NO_DRAFT, values: raw };

  // **Every step is re-checked here, from the database.** The per-step
  // validation is a courtesy to the author, not a guarantee: steps 2–5 are
  // reachable directly by URL, and a draft can be submitted having skipped any
  // of them. This is the only check that decides whether a manuscript exists.
  const draft = await db.submission.findUnique({
    where: { id: owned.id },
    select: {
      id: true,
      reference: true,
      abstract: true,
      keywords: true,
      conflictOfInterest: true,
      declaredAt: true,
      files: { select: { kind: true } },
      contributors: { select: { isCorresponding: true } },
    },
  });

  if (!draft) return { ...NO_DRAFT, values: raw };

  const missing: string[] = [];
  const kinds = new Set(draft.files.map((f) => f.kind));

  if (!kinds.has("manuscript")) missing.push("the anonymised manuscript");
  if (!kinds.has("titlePage")) missing.push("the title page");
  if (!draft.abstract.trim()) missing.push("the abstract");
  if (draft.keywords.length === 0) missing.push("keywords");
  // "None" is itself a declaration; blank is an unanswered question.
  if (!draft.conflictOfInterest?.trim()) missing.push("the competing-interests statement");
  if (draft.contributors.length === 0) missing.push("the author list");
  if (!draft.contributors.some((c) => c.isCorresponding)) {
    missing.push("a corresponding author");
  }
  if (!draft.declaredAt) missing.push("the declarations");

  if (missing.length > 0) {
    return {
      status: "error",
      message: `This submission is not complete yet. Still needed: ${missing.join(", ")}. Go back to the step concerned — nothing you have entered has been lost.`,
      values: raw,
    };
  }

  try {
    await db.submission.update({
      where: { id: draft.id, status: "draft" },
      data: {
        status: "submitted",
        submittedAt: new Date(),
      },
    });
  } catch {
    // The `status: "draft"` in the where clause makes this idempotent: a second
    // submit — a double-clicked button, a resubmitted form — finds no matching
    // row rather than re-submitting a manuscript that is already with an editor.
    return {
      status: "error",
      message: "This manuscript has already been submitted. Open it from your submissions list.",
      values: raw,
    };
  }

  // After the transaction, and never allowed to fail it: a manuscript that
  // reached the editor has been submitted whether or not the receipt was
  // delivered. The redirect target — the author's own detail page — is what
  // confirms the submission; the receipt is a courtesy on top.
  const user = await getCurrentUser();
  if (user) {
    await sendEmail(
      submissionReceiptEmail({
        to: user.email,
        name: user.name,
        reference: draft.reference,
      }),
    );
  }

  revalidatePath("/submissions");
  redirect(`/submissions/${draft.id}`);
}
