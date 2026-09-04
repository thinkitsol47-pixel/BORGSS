import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { getAllSubmissions } from "@/lib/api/editorial";
import { ARTICLE_TYPES } from "@/lib/validation/schemas";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sections" };

/**
 * Journal sections and article types.
 *
 * There is no section registry. A submission's `section` is a plain string,
 * and the queue's filter list is derived from whatever strings the data
 * happens to contain — so this screen compares the **declared** scope (the
 * public aims & scope page) against the **used** sections (what is actually on
 * manuscripts), and names the difference.
 *
 * That comparison is the whole value of the page. It found a real drift on its
 * first run: manuscripts filed under "Gender Studies", which is not one of the
 * ten declared subject areas — the declared name is "Gender & Development".
 * Two names for one section split its queue filter in half and would split its
 * statistics too.
 */

/**
 * The ten subject areas the journal publicly declares.
 *
 * Mirrored from `/about/aims-scope`, which is the page authors read before
 * choosing where to submit. It is a hand-copied list because the scope page
 * holds them as prose with descriptions; that duplication is itself worth
 * seeing, and is noted below.
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

  const submissions = await getAllSubmissions();

  // Count per section from the manuscripts themselves — the only source there
  // actually is.
  const counts = new Map<string, number>();
  for (const s of submissions) {
    counts.set(s.section, (counts.get(s.section) ?? 0) + 1);
  }

  const used = [...counts.keys()].sort();
  const undeclared = used.filter((s) => !DECLARED_SECTIONS.includes(s));
  const unused = DECLARED_SECTIONS.filter((s) => !counts.has(s));

  return (
    <SettingsPage
      active="sections"
      title="Sections"
      lead="The subject sections manuscripts are filed under, and the article types the journal accepts."
    >
      {/* A section name that exists on manuscripts but not in the declared
          scope is a real defect, not a cosmetic one, so it leads. */}
      {undeclared.length > 0 && (
        <Alert
          tone="warning"
          title={`${undeclared.length} section ${undeclared.length === 1 ? "name is" : "names are"} not in the declared scope`}
        >
          <p>
            <span className="font-medium">{undeclared.join(", ")}</span>{" "}
            {undeclared.length === 1 ? "appears" : "appear"} on submitted
            manuscripts but {undeclared.length === 1 ? "is" : "are"} not among
            the ten subject areas on the{" "}
            <Link href="/about/aims-scope" className="font-medium underline">
              aims &amp; scope page
            </Link>
            .
          </p>
          <p className="mt-2">
            Because a section is a plain string rather than a registry entry,
            nothing prevents this. Two names for one subject area split its
            queue filter in half, split its statistics, and leave an author
            filing under a heading the journal never advertised. Reconciling the
            names is the fix; a registry with a fixed list is the prevention.
          </p>
        </Alert>
      )}

      {/* ------------------------------------------------------- sections */}
      <section aria-labelledby="sections-heading" className="mt-8">
        <h2 id="sections-heading" className="font-serif text-lg font-semibold">
          Subject sections
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The ten declared areas, with how many manuscripts sit in each. A
          section with no manuscripts is still listed — an empty area is
          information, and a list whose rows appear and disappear cannot be
          compared between two readings.
        </p>

        <ul className="mt-3 divide-y rounded-xl border">
          {DECLARED_SECTIONS.map((name) => {
            const count = counts.get(name) ?? 0;
            return (
              <li
                key={name}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3"
              >
                <span className="min-w-0 text-sm font-medium">{name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {count === 0 ? (
                    "No manuscripts"
                  ) : (
                    <Link
                      href={`/editorial/queue?section=${encodeURIComponent(name)}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {count} {count === 1 ? "manuscript" : "manuscripts"}
                    </Link>
                  )}
                </span>
              </li>
            );
          })}

          {/* Undeclared names are listed in place, marked — not filtered out.
              Hiding them is how the drift survives. */}
          {undeclared.map((name) => (
            <li
              key={name}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-warning/5 p-3"
            >
              <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                <AlertTriangle
                  className="size-3.5 shrink-0 text-warning"
                  aria-hidden
                />
                {name}
                <span className="text-xs font-normal text-warning">
                  not declared
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                <Link
                  href={`/editorial/queue?section=${encodeURIComponent(name)}`}
                  className="font-medium text-primary hover:underline"
                >
                  {counts.get(name)}{" "}
                  {counts.get(name) === 1 ? "manuscript" : "manuscripts"}
                </Link>
              </span>
            </li>
          ))}
        </ul>

        {unused.length > 0 && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {unused.length} of the ten declared areas have received no
            manuscripts yet. That is normal for a journal with{" "}
            {submissions.length} in the workflow and is not a reason to remove
            them — the scope is a statement of what the journal will consider,
            not a record of what it has received.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------- types */}
      <section aria-labelledby="types-heading" className="mt-10">
        <h2 id="types-heading" className="font-serif text-lg font-semibold">
          Article types
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Unlike sections, these <em>are</em> a fixed list. `ARTICLE_TYPES` in
          the validation schemas is what the submission wizard offers and what
          it validates against, so an author cannot invent one.
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
            Because this list is typed, adding a type without giving it a label
            is a compile error rather than a blank radio button.
          </span>
        </p>
      </section>

      <SourceNote file="src/lib/validation/schemas.ts · src/app/(marketing)/about/aims-scope/page.tsx">
        <p>
          Article types are <code className="font-mono text-[0.9em]">ARTICLE_TYPES</code>{" "}
          in the schemas. Subject sections have{" "}
          <span className="font-medium">no single source</span>: the public list
          is prose on the aims &amp; scope page, the list this screen compares
          against is copied from it, and what manuscripts actually carry is a
          free string.
        </p>
        <p className="mt-2">
          When the backend lands, sections should become a real registry — a
          table with a name, a slug and an active flag, referenced by id from
          each submission. That is what makes the warning above impossible
          rather than merely visible.
        </p>
      </SourceNote>
    </SettingsPage>
  );
}
