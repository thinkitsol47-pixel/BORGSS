import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { POLICIES } from "@/components/layout/policy-page";
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

/** How long a policy may go unreviewed before it is worth revisiting. */
const REVIEW_INTERVAL_MONTHS = 24;

/** Whole months between a review date and now. */
function monthsSince(date: string, now: Date): number {
  return Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
  );
}

export default async function Page() {
  await requireGroup("adminOnly");

  const now = new Date();

  // The dates come from the POLICIES array, which each policy page also reads.
  // This screen used to hard-code one constant beside them, so a policy revised
  // in its own file left this page reporting the old date.
  //
  // The headline figure is the *oldest* policy, not an average and not the
  // newest: the question an editorial board is asking is "what have we let go
  // stale", and averaging one forgotten policy against sixteen fresh ones hides
  // exactly the row worth finding.
  const oldest = [...POLICIES].sort((a, b) =>
    a.reviewedAt.localeCompare(b.reviewedAt),
  )[0];
  const oldestMonths = monthsSince(oldest.reviewedAt, now);
  const dueInMonths = REVIEW_INTERVAL_MONTHS - oldestMonths;

  // Whether every policy still carries the same date, which is true today: all
  // seventeen were written in one pass during step 10. The copy below branches
  // on this rather than asserting it, so it stops claiming "all seventeen" of
  // its own accord once one is revised.
  const allSameDate = POLICIES.every(
    (p) => p.reviewedAt === POLICIES[0].reviewedAt,
  );
  const overdue = POLICIES.filter(
    (p) => monthsSince(p.reviewedAt, now) >= REVIEW_INTERVAL_MONTHS,
  );

  return (
    <SettingsPage
      active="policies"
      title="Policy pages"
      lead="The seventeen editorial policies, when each was last reviewed, and where they are written."
    >
      {/* The "these pages are code" box is gone: the SourceNote at the foot of
          this page makes the same point and names the files, which is the part
          someone acting on it needs. */}

      {/* --------------------------------------------------- review status */}
      <section aria-labelledby="review-heading" className="mt-8">
        <h2 id="review-heading" className="font-serif text-lg font-semibold">
          Review status
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {allSameDate ? (
            <>
              All {POLICIES.length} were written in one pass and still carry the
              same review date. A policy nobody has read in years is the real
              risk here — far more than the absence of an editor for one.
            </>
          ) : (
            <>
              The figure below is the policy that has gone longest without a
              look, not an average — one forgotten policy among sixteen fresh
              ones is exactly what an average would hide.
            </>
          )}
        </p>

        <div className="mt-3 rounded-xl border p-5">
          <p className="font-serif text-3xl font-semibold tabular-nums">
            {oldestMonths}
            <span className="ml-2 font-sans text-base font-normal text-muted-foreground">
              {oldestMonths === 1 ? "month" : "months"} since review
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {allSameDate ? (
              <>Last reviewed {formatDate(oldest.reviewedAt)}. </>
            ) : (
              <>
                Oldest is{" "}
                <span className="font-medium text-foreground">
                  {oldest.title}
                </span>
                , reviewed {formatDate(oldest.reviewedAt)}.{" "}
              </>
            )}
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
                {overdue.length === POLICIES.length
                  ? `All ${POLICIES.length} are past the ${REVIEW_INTERVAL_MONTHS}-month review interval.`
                  : `${overdue.length} of ${POLICIES.length} ${overdue.length === 1 ? "is" : "are"} past the ${REVIEW_INTERVAL_MONTHS}-month review interval.`}
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
                Reviewed {formatDate(p.reviewedAt)}
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
          The review date lives in exactly one place: a{" "}
          <code className="font-mono text-[0.9em]">reviewedAt</code> field on
          the <code className="font-mono text-[0.9em]">POLICIES</code> array.
          Each policy page reads its own date from there and so does this
          screen, so the date a reader sees and the date reported here cannot
          drift. It used to be duplicated — each page carried its own{" "}
          <code className="font-mono text-[0.9em]">updated=</code> string and
          this screen hard-coded one constant beside them — which meant a policy
          revised in its own file left this page quietly reporting the old date.
        </p>
        <p className="mt-2">
          The policies themselves stay in code. They are long-form prose with
          headings, tables and cross-links between them, styled by{" "}
          <code className="font-mono text-[0.9em]">.prose</code> and checked by
          the same accessibility audit as every other page. A database-backed
          editor would replace all of that with pasted HTML, and a journal&rsquo;s
          ethics policy is the last document that should be editable without
          review.
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
    title: "Update reviewedAt in the POLICIES array",
    detail:
      "One line in src/components/layout/policy-page.tsx — the policy page and this screen both read it, so there is nowhere else to change. It is what a reader sees and what an indexing assessor checks; an unchanged date on a changed policy is worse than no date.",
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
