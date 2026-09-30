"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import {
  notificationsSchema,
  orcidLinkSchema,
  profileSchema,
} from "@/lib/validation/schemas";

/**
 * Profile Server Actions.
 *
 * Phase 4: these write. Each acts only on the signed-in account's own row —
 * there is no id in any of these forms, and there must not be: a profile
 * action that took a user id would be an account-takeover waiting for someone
 * to try it. `requireUser()` is both the guard and the target.
 */

export type ProfileState = {
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

export async function saveProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const d = parsed.data;

  // The email address is the login and the address every decision letter goes
  // to. Changing it has to be confirmed from the new address before it takes
  // effect, and there is no mail provider to send that confirmation with — so
  // the change is refused rather than applied silently. Refusing is the safe
  // failure here: applying it could lock someone out of their own account.
  const emailChanged = d.email.toLowerCase() !== user.email.toLowerCase();

  await db.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      // The form calls it "institution"; the column is `affiliation`, which is
      // what the rest of the schema and the reviewer directory use.
      affiliation: d.institution,
      department: d.department || null,
      position: d.position || null,
      country: d.country,
      bio: d.bio || null,
    },
  });

  await recordAudit({
    action: "profile.updated",
    targetType: "user",
    targetId: user.id,
  });

  revalidatePath("/profile");

  return {
    status: "success",
    message: emailChanged
      ? "Your details are saved — except the email address. Changing it has to be confirmed from the new address first, and the portal cannot send that confirmation yet. Ask the editorial office to change it for you."
      : "Your details are saved.",
    values: raw,
  };
}

export async function saveOrcid(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = orcidLinkSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const orcid = parsed.data.orcid || null;

  await db.user.update({ where: { id: user.id }, data: { orcid } });

  await recordAudit({
    action: orcid ? "profile.orcidLinked" : "profile.orcidRemoved",
    targetType: "user",
    targetId: user.id,
  });

  revalidatePath("/profile");
  revalidatePath("/profile/orcid");

  return {
    status: "success",
    // Still honest about what this is. The iD is stored, but storing a typed
    // string is not verification — the real flow signs the person in at
    // orcid.org and gets the iD back from ORCID itself.
    message: orcid
      ? "Your ORCID iD is saved. It is recorded as your claim, not as proof: verifying it means signing in at orcid.org, which is not wired up yet."
      : "Your ORCID iD has been removed.",
    values: raw,
  };
}

export async function saveNotifications(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = notificationsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Could not save those preferences.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  // An unchecked checkbox posts nothing at all, so absence means off. Reading
  // each one explicitly is what makes "the user turned this off" and "the
  // browser never sent it" the same thing, which is what the form intends.
  const d = parsed.data;
  await db.user.update({
    where: { id: user.id },
    data: {
      notifySubmissionStatus: d.submissionStatus === "on",
      notifyEditorialMessages: d.editorialMessages === "on",
      notifyNewInvitations: d.newInvitations === "on",
      notifyReviewReminders: d.reviewReminders === "on",
      notifyIssuePublished: d.issuePublished === "on",
      notifyJournalNews: d.journalNews === "on",
    },
  });

  await recordAudit({
    action: "profile.notificationsUpdated",
    targetType: "user",
    targetId: user.id,
  });

  revalidatePath("/profile/notifications");

  return {
    status: "success",
    // No email is sent at all yet, so these settings decide nothing today.
    // Saying that is better than letting someone believe they have just
    // silenced mail they were never going to receive.
    message:
      "Your preferences are saved. No email is sent from the portal yet, so nothing changes until the mail provider is connected — and the messages listed as always sent will arrive regardless.",
    values: raw,
  };
}
