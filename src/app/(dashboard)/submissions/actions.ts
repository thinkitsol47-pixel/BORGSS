"use server";

import {
  submissionFilesSchema,
  submissionStartSchema,
  wizardContributorSchema,
  wizardDeclarationsSchema,
  wizardMetadataSchema,
  wizardSubmitSchema,
} from "@/lib/validation/schemas";

/**
 * Submission wizard Server Actions.
 *
 * SCAFFOLD: validates and returns. No draft row is created, because there is
 * no database — so there is no `draftId` to redirect to, and the form says so
 * rather than sending the author to a step that cannot load.
 *
 * When the backend lands: create the draft, then
 * `redirect(`/submissions/new/${draft.id}/upload`)`. The five step routes are
 * already stubbed under `[draftId]`.
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

  // TODO(backend): create the draft and redirect to step 2.
  //   const draft = await db.submission.create({ ...parsed.data, status: "draft" });
  //   redirect(`/submissions/new/${draft.id}/upload`);
  return {
    status: "success",
    message:
      "These details are valid. Saving drafts needs the database, which is not connected yet, so nothing has been stored.",
    values,
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
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = submissionFilesSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please attach both required files.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  // TODO(backend): stream the uploads to object storage, virus-scan, extract
  // the word count, and check the manuscript for author names in its document
  // properties before accepting it as anonymised.
  return {
    status: "success",
    message:
      "Both required files are present. Nothing has been uploaded — there is no file store yet.",
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

  return {
    status: "success",
    message:
      "Your metadata is valid. Nothing has been saved — the portal is not connected to a backend yet.",
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

  return {
    status: "success",
    message:
      "Every author's details are valid. Nothing has been saved — the portal is not connected to a backend yet.",
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

  return {
    status: "success",
    message:
      "Your declarations are complete and valid. Nothing has been saved — the portal is not connected to a backend yet.",
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

  // TODO(backend): this is the step that actually creates something. It must
  //   1. re-validate every step server-side — the wizard's per-step checks are
  //      a courtesy to the author, not a guarantee, and steps 2–5 are reachable
  //      directly by URL;
  //   2. move the draft from `draft` to `submitted` in one transaction, so a
  //      failure halfway cannot leave a half-submitted manuscript;
  //   3. assign the manuscript ID from a sequence, not from a count;
  //   4. email the corresponding author a receipt carrying that ID, and notify
  //      the editorial office;
  //   5. redirect to `/submissions/[id]` — the author's own detail page, which
  //      already exists from phase 13.
  // Until then no ID is invented: a manuscript number the office cannot look up
  // is worse than none, because the author would quote it in correspondence.
  return {
    status: "success",
    message:
      "Everything the wizard can check is in order. Nothing has been submitted — the portal has no database yet, so there is no manuscript to send and no ID to issue.",
    values: raw,
  };
}
