import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import {
  REVIEW_CRITERIA,
  REVIEW_RECOMMENDATIONS,
  REVIEW_SCALE,
} from "@/lib/validation/schemas";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Review Forms" };

/**
 * The form reviewers fill in, shown as it is defined.
 *
 * One form, not a form builder. Phase 14's notes anticipated this screen
 * editing `REVIEW_CRITERIA`, and on writing it the honest answer turned out to
 * be narrower: the criteria are not just a list of questions, they are the
 * axis every returned report is scored on. Changing them mid-life makes old
 * reports and new ones incomparable, and the editor reading two reports at a
 * decision would be comparing different instruments without being told.
 *
 * So this screen documents the form and states what a real editor would have
 * to handle — versioning — rather than offering a drag-and-drop builder that
 * would quietly break the decision screen.
 */
export default async function Page() {
  await requireGroup("adminOnly");

  return (
    <SettingsPage
      active="review-forms"
      title="Review forms"
      lead="The questions reviewers answer, the scale they answer on, and the recommendations they can give."
    >
      {/* ------------------------------------------------------- criteria */}
      <section aria-labelledby="criteria-heading">
        <h2 id="criteria-heading" className="font-serif text-lg font-semibold">
          Scored criteria
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Six, each scored 1–5. The reviewer&rsquo;s form and the editor&rsquo;s
          read-only view of a returned report are both rendered from this one
          list, so a criterion cannot be scored under one name and read back
          under another.
        </p>

        <ol className="mt-3 divide-y rounded-xl border">
          {REVIEW_CRITERIA.map((c, i) => (
            <li key={c.id} className="flex gap-3 p-3">
              <span
                className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-tint text-xs font-semibold text-brand-darker"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {c.id}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {c.hint}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------- scale */}
      <section aria-labelledby="scale-heading" className="mt-10">
        <h2 id="scale-heading" className="font-serif text-lg font-semibold">
          The scale
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Five points, each with a word attached. On the reviewer&rsquo;s form
          the number <em>is</em> the label on the button, so a choice is never
          conveyed by highlight colour alone.
        </p>

        <ul className="mt-3 grid grid-cols-1 gap-2 xs:grid-cols-5">
          {REVIEW_SCALE.map((s) => (
            <li
              key={s.value}
              className="rounded-xl border p-3 text-center"
            >
              <p className="font-serif text-2xl font-semibold tabular-nums">
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------ recommendations */}
      <section aria-labelledby="recs-heading" className="mt-10">
        <h2 id="recs-heading" className="font-serif text-lg font-semibold">
          Recommendations
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          What a reviewer may recommend. Deliberately four, against the
          editor&rsquo;s five decisions — a reviewer never recommends a desk
          rejection, because by the time they have read the manuscript it is no
          longer a desk decision.
        </p>

        <ul className="mt-3 divide-y rounded-xl border">
          {REVIEW_RECOMMENDATIONS.map((r) => (
            <li key={r.value} className="p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-medium">{r.label}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {r.value}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {r.hint}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A recommendation is advisory. The editor decides, and the{" "}
          <Link
            href="/editorial/queue"
            className="font-medium text-primary hover:underline"
          >
            decision screen
          </Link>{" "}
          names it explicitly when two reviewers disagree.
        </p>
      </section>

      {/* --------------------------------------------- the rest of the form */}
      <section aria-labelledby="rest-heading" className="mt-10">
        <h2 id="rest-heading" className="font-serif text-lg font-semibold">
          The rest of the form
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Not configurable, and each for a stated reason.
        </p>
        <dl className="mt-3 divide-y rounded-xl border">
          {FIXED_PARTS.map((p) => (
            <div key={p.title} className="p-4">
              <dt className="text-sm font-medium">{p.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {p.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Alert tone="warning" title="Why this is not a form builder" className="mt-10">
        <p>
          The criteria are not merely questions; they are the axis every
          returned report is scored on. Adding or removing one mid-life leaves
          old reports and new ones incomparable, and an editor reading two
          reports at a decision would be comparing different instruments without
          being told.
        </p>
        <p className="mt-2">
          A real editor therefore needs versioning before it needs a drag
          handle: a report stores which version of the form produced it, old
          versions stay readable, and a review already in progress finishes on
          the form it started on. Until that exists, editing this list is a code
          change and a deploy — which is slow, and safe.
        </p>
      </Alert>

      <SourceNote file="src/lib/validation/schemas.ts">
        <code className="font-mono text-[0.9em]">REVIEW_CRITERIA</code>,{" "}
        <code className="font-mono text-[0.9em]">REVIEW_SCALE</code> and{" "}
        <code className="font-mono text-[0.9em]">REVIEW_RECOMMENDATIONS</code>{" "}
        define the form; <code className="font-mono text-[0.9em]">reviewFormSchema</code>{" "}
        in the same file validates it. The reviewer&rsquo;s form, the
        editor&rsquo;s report view and this page all render from those three
        lists, so they cannot drift apart.
      </SourceNote>
    </SettingsPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const FIXED_PARTS = [
  {
    title: "Comments to the author — minimum 200 characters",
    detail:
      "A two-line report helps neither the author nor the editor, and the reviewer ethics policy asks for specific, actionable comments. The floor is enforced by the schema, not by a hint.",
  },
  {
    title: "Comments to the editor — optional, never sent to the author",
    detail:
      "Kept confidential under every setting. The decision screen labels them explicitly, because a confidential note pasted into a decision letter by mistake is the failure that label exists to prevent.",
  },
  {
    title: "Ethics or integrity concern — optional, always present",
    detail:
      "Cannot be removed from the form. A reviewer who spots plagiarism or a data problem needs somewhere to say so at the moment they see it, whatever else the journal is asking them.",
  },
  {
    title: "Two required declarations",
    detail:
      "No competing interest, and no generative AI. The AI declaration exists because an unpublished manuscript is confidential and pasting it into a chatbot discloses it to a third party — the reviewer ethics policy already prohibits this, so the form asks.",
  },
];
