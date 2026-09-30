import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { SectionsEditor } from "@/components/portal/sections-editor";
import { listSections } from "@/lib/api/sections";
import { ARTICLE_TYPES } from "@/lib/validation/schemas";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Sections" };

/**
 * Journal sections and article types.
 *
 * **Sections are a registry now**, which is what earlier revisions of this
 * screen said they should become. `Section` is a table and a submission holds
 * a foreign key to it, so a manuscript cannot be filed under a name that does
 * not exist, and renaming one moves every manuscript with it.
 *
 * That closed the drift this page was built to expose: manuscripts filed under
 * "Gender Studies" when the declared area was "Gender & Development". Two names
 * for one subject area split its queue filter in half and split its statistics.
 * The comparison below is kept anyway, because a registry stops names diverging
 * from *each other* but not from the public aims & scope page — the one list
 * that is still prose, and the one authors actually read.
 */

/**
 * The ten subject areas the journal publicly declares.
 *
 * Still hand-copied from `/about/aims-scope`, which holds them as prose with a
 * description each. The duplication is worth seeing rather than hiding: it is
 * why a section can be added here and still be invisible to authors.
 */
const DECLARED_SECTIONS = [
  "Economics & Development",
  "Sociology & Anthropology",
  "Political Science & Governance",
  "Education",
  "Public Administration",
  "Psychology & Behavioural Science",
  "Media & Communication",
  "Gender & Development",
  "Urban & Regional Studies",
  "Environment & Society",
];

export default async function Page() {
  await requireGroup("adminOnly");

  const sections = await listSections();

  const undeclared = sections.filter(
    (s) => s.active && !DECLARED_SECTIONS.includes(s.name),
  );
  const missing = DECLARED_SECTIONS.filter(
    (name) => !sections.some((s) => s.name === name),
  );
  const empty = sections.filter((s) => s.active && s.submissionCount === 0);

  return (
    <SettingsPage
      active="sections"
      title="Sections"
      lead="The subject sections manuscripts are filed under, and the article types the journal accepts."
    >
      {/* A section offered to authors but absent from the public scope page is
          the drift that survives a registry, so it still leads. */}
      {undeclared.length > 0 && (
        <Alert
          tone="warning"
          title={`${undeclared.length} section ${undeclared.length === 1 ? "is" : "are"} not in the declared scope`}
        >
          <p>
            <span className="font-medium">
              {undeclared.map((s) => s.name).join(", ")}
            </span>{" "}
            {undeclared.length === 1 ? "is offered" : "are offered"} to authors
            but {undeclared.length === 1 ? "is" : "are"} not among the ten
            subject areas on the{" "}
            <Link href="/about/aims-scope" className="font-medium underline">
              aims &amp; scope page
            </Link>
            .
          </p>
          <p className="mt-2">
            The registry keeps section names consistent with each other, but the
            public scope list is prose on that page — so adding a section here
            does not advertise it. Either add it there, or stop offering it.
          </p>
        </Alert>
      )}

      {missing.length > 0 && (
        <Alert
          tone="warning"
          title={`${missing.length} declared ${missing.length === 1 ? "area is" : "areas are"} not in the registry`}
          className="mt-4"
        >
          <p>
            <span className="font-medium">{missing.join(", ")}</span>{" "}
            {missing.length === 1 ? "is advertised" : "are advertised"} on the
            aims &amp; scope page but{" "}
            {missing.length === 1 ? "has" : "have"} no section here, so no author
            can choose {missing.length === 1 ? "it" : "them"}. Add{" "}
            {missing.length === 1 ? "it" : "them"} below, or remove{" "}
            {missing.length === 1 ? "it" : "them"} from that page.
          </p>
        </Alert>
      )}

      {/* ------------------------------------------------------- sections */}
      <section aria-labelledby="sections-heading" className="mt-8">
        <h2 id="sections-heading" className="font-serif text-lg font-semibold">
          Subject sections
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          What the submission wizard offers an author, and what the editorial
          queue filters by. A section with no manuscripts is still listed — an
          empty area is information, and a list whose rows appear and disappear
          cannot be compared between two readings.
        </p>

        <div className="mt-4">
          <SectionsEditor
            sections={sections.map((s) => ({
              id: s.id,
              name: s.name,
              active: s.active,
              submissionCount: s.submissionCount,
              declared: DECLARED_SECTIONS.includes(s.name),
            }))}
          />
        </div>

        {empty.length > 0 && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {empty.length} of the sections on offer have received no manuscripts
            yet. That is normal, and not a reason to remove them — the scope is a
            statement of what the journal will consider, not a record of what it
            has received.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------- types */}
      <section aria-labelledby="types-heading" className="mt-10">
        <h2 id="types-heading" className="font-serif text-lg font-semibold">
          Article types
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Unlike sections, these are a fixed list in the code.{" "}
          <code className="font-mono text-[0.9em]">ARTICLE_TYPES</code> is what
          the submission wizard offers and what it validates against, and the
          database has a matching enum — so an author cannot invent one, and
          neither can an administrator.
        </p>

        <ul className="mt-3 divide-y rounded-xl border">
          {ARTICLE_TYPES.map((t) => (
            <li key={t.value} className="p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-medium">{t.label}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {t.value}
                </span>
              </div>
              {t.hint && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t.hint}
                </p>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <span>
            An article type is a workflow decision, not a setting: adding one
            means deciding how it is reviewed and what its template looks like.
            Because the list is typed, adding a type without giving it a label
            is a compile error rather than a blank radio button.
          </span>
        </p>
      </section>

      <SourceNote file="Section table · src/lib/validation/schemas.ts">
        <p>
          Sections are rows in the{" "}
          <code className="font-mono text-[0.9em]">Section</code> table, and each
          submission holds a foreign key to one. Renaming a section therefore
          moves every manuscript filed under it, and no manuscript can carry a
          name that is not in the list.
        </p>
        <p className="mt-2">
          Article types stay in{" "}
          <code className="font-mono text-[0.9em]">ARTICLE_TYPES</code> and in a
          database enum. The one list still without a single source is the
          public aims &amp; scope page, which holds its ten areas as prose — the
          two warnings above exist to catch that page and this registry
          disagreeing.
        </p>
      </SourceNote>
    </SettingsPage>
  );
}
