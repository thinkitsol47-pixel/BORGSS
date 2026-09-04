import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { POLICIES } from "@/components/layout/policy-page";
import { Alert } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Policy Pages" };

/**
 * The seventeen editorial policies.
 *
 * Not an editor, and it says so plainly. Each policy is a React component with
 * its prose inline — that is what makes the pages typechecked, searchable and
 * reviewable in a diff — so a settings screen cannot edit them without turning
 * them into database rows and losing all three properties.
 *
 * What this screen can honestly do is what an editorial board actually needs
 * between rewrites: the list, when each was last reviewed, and which are
 * overdue for a look. A policy nobody has read in three years is the risk, not
 * a policy that needs a rich-text editor.
 */

/**
 * All seventeen carry `updated="2026-01-15"` — they were written in one pass
 * during step 10. Held here rather than parsed out of the page components,
 * which a server component cannot do without reading its own source.
 *
 * This duplication is real and is called out on the page: if a policy's date
 * is changed in its own file and not here, this screen goes stale. The fix is
 * a `reviewedAt` field on the `POLICIES` array itself, which is a small change
 * worth making the next time a policy is genuinely revised.
 */
const REVIEWED = "2026-01-15";

/** How long a policy may go unreviewed before it is worth revisiting. */
const REVIEW_INTERVAL_MONTHS = 24;

export default async function Page() {
  await requireGroup("adminOnly");

  const now = new Date();
  const reviewed = new Date(REVIEWED);
  const monthsSince = Math.floor(
    (now.getTime() - reviewed.getTime()) / (1000 * 60 * 60 * 24 * 30.44),
  );
  const dueInMonths = REVIEW_INTERVAL_MONTHS - monthsSince;

  return (
    <SettingsPage
      active="policies"
      title="Policy pages"
      lead="The seventeen editorial policies, when each was last reviewed, and where they are written."
    >
      <Alert tone="info" title="These pages are code, not content">
        <p>
          Each policy is a React component with its prose written inline. That
          is deliberate: it means the pages are typechecked, their internal
          links are verified at build time, and a change to a policy arrives as
          a reviewable diff rather than as an untracked edit to a database row.
        </p>
        <p className="mt-2">
          The cost is that they cannot be edited from here. For an editorial
          policy that is the right trade — a policy is a commitment the journal
          makes to authors, and it should be harder to change than a
          notice.
        </p>
      </Alert>

      {/* --------------------------------------------------- review status */}
      <section aria-labelledby="review-heading" className="mt-8">
        <h2 id="review-heading" className="font-serif text-lg font-semibold">
          Review status
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          All seventeen were written in one pass and carry the same review date.
          A policy nobody has read in years is the real risk here — far more
          than the absence of an editor for one.
        </p>

        <div className="mt-3 rounded-xl border p-5">
          <p className="font-serif text-3xl font-semibold tabular-nums">
            {monthsSince}
            <span className="ml-2 font-sans text-base font-normal text-muted-foreground">
              {monthsSince === 1 ? "month" : "months"} since review
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Last reviewed {formatDate(REVIEWED)}.{" "}
            {dueInMonths > 0 ? (
              <>
                Next review due in about{" "}
                <span className="font-medium text-foreground">
                  {dueInMonths} {dueInMonths === 1 ? "month" : "months"}
                </span>
                , on a {REVIEW_INTERVAL_MONTHS}-month cycle.
              </>
            ) : (
              <span className="font-medium text-warning">
                Past the {REVIEW_INTERVAL_MONTHS}-month review interval.
              </span>
            )}
          </p>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          COPE expects a journal&rsquo;s policies to be current and to reflect
          what it actually does. The interval above is this project&rsquo;s own
          convention rather than a COPE requirement — but a stated interval that
          is kept beats an unstated one that is not.
        </p>
      </section>

      {/* ----------------------------------------------------- the policies */}
      <section aria-labelledby="policies-heading" className="mt-10">
        <h2 id="policies-heading" className="font-serif text-lg font-semibold">
          The seventeen policies
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each opens on the public site — which is the only version there is.
        </p>

        <ul className="mt-3 divide-y rounded-xl border">
          {POLICIES.map((p) => (
            <li
              key={p.slug}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/policies/${p.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary hover:underline"
                >
                  {p.title}
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                </Link>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  src/app/(marketing)/policies/{p.slug}/page.tsx
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                Reviewed {formatDate(REVIEWED)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------- how to change one */}
      <section aria-labelledby="how-heading" className="mt-10">
        <h2 id="how-heading" className="font-serif text-lg font-semibold">
          Changing a policy
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Written down because the steps are easy to half-do, and a policy that
          contradicts another policy is worse than either alone.
        </p>
        <ol className="mt-3 divide-y rounded-xl border">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3 p-4">
              <span
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-tint text-xs font-semibold text-brand-darker"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <SourceNote file="src/components/layout/policy-page.tsx · src/app/(marketing)/policies/*/page.tsx">
        <p>
          The shared shell holds the <code className="font-mono text-[0.9em]">POLICIES</code>{" "}
          array this page renders, the breadcrumb, the &ldquo;on this
          page&rdquo; rail, the related-policies panel and the COPE/DOAJ note
          appended to every policy. Each policy file contains only its own
          prose.
        </p>
        <p className="mt-2">
          The review date is the one thing duplicated: it lives in each page as{" "}
          <code className="font-mono text-[0.9em]">updated=</code> and again in
          this screen. Moving it onto the{" "}
          <code className="font-mono text-[0.9em]">POLICIES</code> array as a{" "}
          <code className="font-mono text-[0.9em]">reviewedAt</code> field would
          remove the duplication and let this page show genuinely per-policy
          dates — worth doing the next time a policy is actually revised.
        </p>
      </SourceNote>
    </SettingsPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const STEPS = [
  {
    title: "Check what else says it",
    detail:
      "Licensing, copyright, open access and the APC page all state the same facts about CC BY and author-retained copyright. Changing one and not the others leaves the journal publicly contradicting itself.",
  },
  {
    title: "Edit the prose in the policy's own file",
    detail:
      "Only the prose. The breadcrumb, the section rail, the related panel and the COPE/DOAJ note come from the shared shell and should not be duplicated into the page.",
  },
  {
    title: "Update the `updated` date on that page",
    detail:
      "It is what a reader sees, and what an indexing assessor checks. An unchanged date on a changed policy is worse than no date.",
  },
  {
    title: "Check the claims against the code",
    detail:
      "This has gone wrong before: the indexing page once said OAI-PMH was active while the route returned not-implemented. If a policy describes something the platform does, confirm the platform does it.",
  },
  {
    title: "Run the typecheck and the responsive audit",
    detail:
      "The policies are components; a broken internal link or an unclosed tag is a build error rather than a silent 404, and the audit confirms the page still reads on a phone.",
  },
];
