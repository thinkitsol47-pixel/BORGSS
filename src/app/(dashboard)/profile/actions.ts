"use server";

import {
  notificationsSchema,
  orcidLinkSchema,
  profileSchema,
} from "@/lib/validation/schemas";

/**
 * Profile Server Actions.
 * SCAFFOLD: each validates and returns; nothing is saved.
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

  // TODO(backend): persist, and re-verify the address if the email changed.
  return {
    status: "success",
    message:
      "Your details are valid. Nothing has been saved — the portal is not connected to a backend yet.",
    values: raw,
  };
}

export async function saveOrcid(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = orcidLinkSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  // TODO(backend): this should be replaced by the real ORCID OAuth flow, which
  // proves the iD belongs to this person. A typed iD is only a claim.
  return {
    status: "success",
    message: parsed.data.orcid
      ? "That is a valid ORCID iD. It has not been saved, and typing an iD does not prove it is yours — the real flow signs you in at orcid.org."
      : "Your ORCID iD would be removed. Nothing has been saved.",
    values: raw,
  };
}

export async function saveNotifications(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
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

  // TODO(backend): persist per-account preferences.
  return {
    status: "success",
    message:
      "Preferences are valid. Nothing has been saved — the portal is not connected to a backend yet.",
    values: raw,
  };
}
