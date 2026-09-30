import "server-only";
import { db } from "@/lib/db";

/**
 * The journal's subject sections.
 *
 * **`Section` is a real table with a foreign key**, so a manuscript cannot be
 * filed under a name that does not exist. That is the whole reason this
 * registry exists: before it, a submission's section was a plain string, and
 * the fixtures drifted — manuscripts filed under "Gender Studies" when the
 * declared area was "Gender & Development". Two names for one section split
 * its queue filter in half and would split its statistics too.
 *
 * **Sections are deactivated, never deleted.** A section with manuscripts in
 * it cannot be removed without breaking their history, and one with none may
 * still be named on the public aims & scope page. `active: false` stops it
 * being offered to new authors while everything already filed under it keeps
 * working.
 */

export type SectionRecord = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  /** How many manuscripts are filed here. Deletion is refused above zero. */
  submissionCount: number;
};

/** Every section, in display order, with its manuscript count. */
export async function listSections(): Promise<SectionRecord[]> {
  const rows = await db.section.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { submissions: true } } },
  });

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    active: s.active,
    sortOrder: s.sortOrder,
    submissionCount: s._count.submissions,
  }));
}

/** The sections an author may choose from, in order. */
export async function listActiveSections(): Promise<SectionRecord[]> {
  return (await listSections()).filter((s) => s.active);
}

/**
 * A URL-safe slug for a section name.
 *
 * Kept here rather than in a util because the rule is specific: an ampersand
 * becomes "and" rather than disappearing, so "Gender & Development" reads as
 * `gender-and-development` and not `gender-development`, which would be
 * ambiguous with a two-word name.
 */
export function sectionSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
