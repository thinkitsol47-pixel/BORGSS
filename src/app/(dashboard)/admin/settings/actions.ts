"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import {
  EDITABLE_KEYS,
  getJournalSettings,
  saveJournalSettings,
  type SettingKey,
} from "@/lib/api/journal-settings";
import { sectionSlug } from "@/lib/api/sections";
import { journalSettingsSchema, sectionSchema } from "@/lib/validation/schemas";

/**
 * Server Actions for the admin settings screens.
 *
 * **Each re-checks permission.** A Server Action is its own entry point and can
 * be invoked without the page that renders its form ever loading, so
 * `requireGroup("adminOnly")` runs here rather than being trusted from the
 * page. `recordDecision` established this pattern; these follow it.
 *
 * **Both write an audit entry.** These are the settings that appear on the
 * public site and in every metadata record — an ISSN, a DOI prefix, the
 * journal's subject areas. "Who changed the ISSN, and when" is exactly the
 * question an audit log exists to answer.
 */

export type SettingsState = {
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

/* --------------------------------------------------------- journal settings */

export async function saveJournalIdentity(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireGroup("adminOnly");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = journalSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  // Compared before saving, so the audit entry records what actually changed
  // rather than the whole form every time someone opens and saves it.
  const before = await getJournalSettings();
  const changed = EDITABLE_KEYS.filter(
    (k) => (parsed.data[k] ?? "").trim() !== (before[k] ?? ""),
  );

  if (changed.length === 0) {
    return {
      status: "success",
      message: "Nothing changed — these values were already saved.",
      values: raw,
    };
  }

  await saveJournalSettings(parsed.data as Partial<Record<SettingKey, string>>, user.id);

  await db.auditEntry.create({
    data: {
      actorId: user.id,
      actorName: user.name,
      action: "settings.journal.update",
      targetType: "journal",
      // The keys, never the values: an audit row is read by people who are not
      // otherwise entitled to the contents of what changed.
      detail: { fields: changed },
    },
  });

  // Every public page reads these — the header, footer, metadata and JSON-LD.
  revalidatePath("/", "layout");

  return {
    status: "success",
    message: `Saved. ${changed.length} ${changed.length === 1 ? "field" : "fields"} updated across the site.`,
    values: raw,
  };
}

/* ----------------------------------------------------------------- sections */

export async function createSection(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireGroup("adminOnly");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = sectionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const name = parsed.data.name.trim();
  const slug = sectionSlug(name);

  // Checked before inserting so the message names the problem. The unique
  // index is still what guarantees it — two administrators saving the same new
  // name at once would both pass this check.
  const clash = await db.section.findFirst({
    where: { OR: [{ name }, { slug }] },
    select: { name: true },
  });

  if (clash) {
    return {
      status: "error",
      message: "That section already exists.",
      errors: { name: `"${clash.name}" is already a section.` },
      values: raw,
    };
  }

  try {
    const last = await db.section.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    await db.section.create({
      data: { name, slug, active: true, sortOrder: (last?.sortOrder ?? 0) + 1 },
    });
  } catch {
    return {
      status: "error",
      message: "The section could not be created. It may already exist.",
      values: raw,
    };
  }

  await db.auditEntry.create({
    data: {
      actorId: user.id,
      actorName: user.name,
      action: "settings.section.create",
      targetType: "section",
      detail: { name },
    },
  });

  revalidatePath("/admin/settings/sections");

  return { status: "success", message: `"${name}" added.` };
}

/**
 * Turns a section on or off for new submissions.
 *
 * **Never deletes.** A section with manuscripts in it cannot be removed without
 * breaking their history, and one with none may still be named on the public
 * aims & scope page. Deactivating stops it being offered to authors while
 * everything already filed under it keeps working — which is what the
 * `active` column was added for.
 */
export async function toggleSection(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireGroup("adminOnly");

  const id = String(formData.get("sectionId") ?? "");
  const section = await db.section.findUnique({
    where: { id },
    select: { id: true, name: true, active: true },
  });

  if (!section) {
    return { status: "error", message: "That section no longer exists." };
  }

  await db.section.update({
    where: { id: section.id },
    data: { active: !section.active },
  });

  await db.auditEntry.create({
    data: {
      actorId: user.id,
      actorName: user.name,
      action: section.active
        ? "settings.section.deactivate"
        : "settings.section.activate",
      targetType: "section",
      targetId: section.id,
      detail: { name: section.name },
    },
  });

  revalidatePath("/admin/settings/sections");

  return {
    status: "success",
    message: section.active
      ? `"${section.name}" is no longer offered to authors. Manuscripts already filed under it are unaffected.`
      : `"${section.name}" is available to authors again.`,
  };
}

/**
 * Renames a section.
 *
 * The slug moves with the name, which changes any URL built from it — worth
 * knowing, and the reason renaming is a deliberate action rather than an
 * inline edit. Manuscripts are unaffected: they hold a foreign key, not a
 * string, which is the whole point of the registry.
 */
export async function renameSection(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireGroup("adminOnly");

  const id = String(formData.get("sectionId") ?? "");
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = sectionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const section = await db.section.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!section) {
    return { status: "error", message: "That section no longer exists." };
  }

  const name = parsed.data.name.trim();
  if (name === section.name) {
    return { status: "success", message: "That is already its name." };
  }

  const clash = await db.section.findFirst({
    where: { OR: [{ name }, { slug: sectionSlug(name) }], NOT: { id: section.id } },
    select: { name: true },
  });

  if (clash) {
    return {
      status: "error",
      message: "Another section already has that name.",
      errors: { name: `"${clash.name}" is already a section.` },
      values: raw,
    };
  }

  await db.section.update({
    where: { id: section.id },
    data: { name, slug: sectionSlug(name) },
  });

  await db.auditEntry.create({
    data: {
      actorId: user.id,
      actorName: user.name,
      action: "settings.section.rename",
      targetType: "section",
      targetId: section.id,
      detail: { from: section.name, to: name },
    },
  });

  revalidatePath("/admin/settings/sections");
  revalidatePath("/editorial/queue");

  return {
    status: "success",
    message: `Renamed to "${name}". Every manuscript filed under it follows the change.`,
  };
}
