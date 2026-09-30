"use server";

import { ReviewerApplicationDegree } from "@prisma/client";
import { db } from "@/lib/db";
import { reviewerApplicationSchema } from "@/lib/validation/schemas";
import { siteConfig } from "@/config/site.config";
import { sendEmail } from "@/lib/email/send";
import {
  reviewerApplicationNotifyOfficeEmail,
  reviewerApplicationReceiptEmail,
} from "@/lib/email/templates";

/**
 * The form posts the degree as a kebab value (`doctoral-candidate`); Prisma's
 * generated enum is camelCase. The other three values are identical in both.
 */
const DEGREE: Record<string, ReviewerApplicationDegree> = {
  phd: ReviewerApplicationDegree.phd,
  "doctoral-candidate": ReviewerApplicationDegree.doctoralCandidate,
  masters: ReviewerApplicationDegree.masters,
  other: ReviewerApplicationDegree.other,
};

export type ReviewerState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};

/**
 * Handles a reviewer application.
 *
 * Phase 4: the application is persisted to `ReviewerApplication` with status
 * `pending`, for an editor to review by hand. It is not a `ReviewerProfile`
 * and not a `User` — it becomes a profile only if accepted. No email is sent
 * yet, and the page still says so.
 */
export async function submitReviewerApplication(
  _prev: ReviewerState,
  formData: FormData,
): Promise<ReviewerState> {
  // Checkbox groups repeat their key, so they must be read with getAll().
  const raw = {
    ...(Object.fromEntries(formData) as Record<string, string>),
    subjects: formData.getAll("subjects").map(String),
    methods: formData.getAll("methods").map(String),
  };

  const parsed = reviewerApplicationSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors,
      values: { ...raw, website: "" },
    };
  }

  // A filled honeypot is a bot: report success, discard the application.
  if (parsed.data.website) {
    return { status: "success" };
  }

  try {
    const {
      name,
      email,
      institution,
      position,
      country,
      degree,
      orcid,
      scholarUrl,
      subjects,
      methods,
      keywords,
      experience,
      capacity,
    } = parsed.data;

    await db.reviewerApplication.create({
      data: {
        name,
        email,
        institution,
        position,
        country,
        degree: DEGREE[degree],
        orcid: orcid || null,
        scholarUrl: scholarUrl || null,
        subjects,
        methods,
        keywords,
        experience: experience || null,
        capacity,
      },
    });

    // Same order of priority as the contact form: the row is the record, the
    // mail is a courtesy, and neither send is allowed to fail the action.
    // `/admin/reviewer-applications` is the queue that gets worked.
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";

    await Promise.all([
      sendEmail(
        reviewerApplicationNotifyOfficeEmail({
          to: siteConfig.contact.editorialOffice,
          applicantName: name,
          applicantEmail: email,
          affiliation: institution,
          expertise: subjects.join(", "),
          queueUrl: `${base}/admin/reviewer-applications`,
        }),
      ),
      sendEmail(reviewerApplicationReceiptEmail({ to: email, name })),
    ]);

    return {
      status: "success",
      message:
        "Thank you — your details are with the editorial office. We will be in touch when a manuscript matches your expertise, and you are free to decline any invitation.",
    };
  } catch {
    return {
      status: "error",
      message:
        "We could not submit your application. Please try again, or email the editorial office directly.",
      values: { ...raw, website: "" },
    };
  }
}
