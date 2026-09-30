import "server-only";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site.config";

/**
 * The journal's editable identity.
 *
 * **Only a handful of `site.config.ts` is editable, on purpose.** That file
 * holds around forty values, and most are decisions rather than settings —
 * changing the journal's name or its licence changes the journal, not its
 * configuration, and belongs in a commit someone reviewed. What is editable
 * here is the set of facts the journal *acquires* over time and that an
 * administrator should not need a deploy to record: an ISSN when it is issued,
 * a Crossref prefix when membership starts, the office address once there is
 * one.
 *
 * **The config file is the default; a row is an override.** No row means the
 * file's value stands, so a fresh database renders exactly as it does today,
 * and clearing a field deletes the row rather than storing an empty string —
 * reverting to the file rather than to blank.
 */

/** The keys an administrator may set. Anything else is a decision, not a setting. */
export const EDITABLE_KEYS = [
  "issn",
  "eIssn",
  "doiPrefix",
  "editorialOffice",
  "submissions",
  "support",
  "charges",
  "address",
  "phone",
  "x",
  "linkedin",
  "facebook",
] as const;

export type SettingKey = (typeof EDITABLE_KEYS)[number];

/** What the config file says, before any override. */
function fileDefaults(): Record<SettingKey, string> {
  const c = siteConfig;
  return {
    issn: c.issn,
    eIssn: c.eIssn,
    doiPrefix: c.doiPrefix,
    editorialOffice: c.contact.editorialOffice,
    submissions: c.contact.submissions,
    support: c.contact.support,
    charges: c.contact.charges,
    address: c.contact.address,
    phone: c.contact.phone,
    x: c.socials.x,
    linkedin: c.socials.linkedin,
    facebook: c.socials.facebook,
  };
}

/**
 * The effective settings — the config file with any stored overrides applied.
 *
 * This is what every screen should read. Reading `siteConfig` directly for one
 * of these twelve keys would show the file's value and miss what an
 * administrator has since set.
 */
export async function getJournalSettings(): Promise<Record<SettingKey, string>> {
  const values = fileDefaults();

  // A missing table or an unreachable database must not take the public site
  // down over a settings lookup: the file's values are a complete, correct
  // answer on their own.
  try {
    const rows = await db.journalSetting.findMany({
      where: { key: { in: [...EDITABLE_KEYS] } },
    });
    for (const row of rows) {
      values[row.key as SettingKey] = row.value;
    }
  } catch {
    return values;
  }

  return values;
}

/**
 * Stores the twelve editable values.
 *
 * **An empty value deletes its row rather than storing "".** The distinction
 * matters: no row means "whatever the config file says", which is how a
 * setting is reverted. Storing an empty string would instead assert that the
 * journal has no ISSN, overriding a file value someone may have set.
 */
export async function saveJournalSettings(
  values: Partial<Record<SettingKey, string>>,
  updatedBy?: string,
): Promise<void> {
  const defaults = fileDefaults();

  await db.$transaction(async (tx) => {
    for (const key of EDITABLE_KEYS) {
      const next = values[key]?.trim() ?? "";

      // Same as the file: no override needed. Also covers clearing a field
      // back to whatever the file says.
      if (next === "" || next === defaults[key]) {
        await tx.journalSetting.deleteMany({ where: { key } });
        continue;
      }

      await tx.journalSetting.upsert({
        where: { key },
        create: { key, value: next, updatedBy: updatedBy ?? null },
        update: { value: next, updatedBy: updatedBy ?? null },
      });
    }
  });
}

/**
 * Whether the journal has a real Crossref prefix.
 *
 * Every DOI in the seeded data begins `10.xxxxx`, a placeholder no registry
 * issues. Derived from the value rather than hard-coded, so the warnings on
 * `/admin/doi` and `/admin/settings/journal` disappear by themselves the day a
 * real prefix is entered.
 */
export async function hasRealDoiPrefix(): Promise<boolean> {
  const { doiPrefix } = await getJournalSettings();
  return Boolean(doiPrefix) && !doiPrefix.includes("x");
}
