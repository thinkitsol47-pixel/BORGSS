"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { AlertCircle, Pencil } from "lucide-react";
import {
  submitSubmission,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import type { DraftSummary } from "@/lib/api/submissions";
import { ARTICLE_TYPES } from "@/lib/validation/schemas";
import { Alert, CheckOption, Field, Textarea } from "@/components/ui";
import { WizardNav } from "./wizard-nav";
import { WIZARD_STEPS } from "./wizard-steps";
import { cn } from "@/lib/utils";

/** Built from the same list the type radios are built from, so a type cannot
 *  be chosen under one label and read back under another. */
const ARTICLE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  ARTICLE_TYPES.map((t) => [t.value, t.label]),
);

/** The seven `SubmissionFileKind` values, kebab-cased as the data layer
 *  returns them. */
const FILE_KIND_LABEL: Record<string, string> = {
  manuscript: "Manuscript",
  "title-page": "Title page",
  "cover-letter": "Cover letter",
  figure: "Figure",
  table: "Table",
  supplementary: "Supplementary",
  "response-to-reviewers": "Response to reviewers",
};

const initialState: WizardState = { status: "idle" };

/**
 * Step 6 — check and submit.
 *
 * The summary is the point of this screen: an author who has filled five
 * screens across several sittings needs to see the whole submission in one
 * place before it leaves their hands.
 *
 * There is no success branch here on purpose. `submitSubmission` moves the
 * draft in one transaction and then `redirect`s to `/submissions/[id]`, so a
 * successful submit never returns to this component — the author's own detail
 * page, with the manuscript and its reference on it, is what confirms the
 * submission. Only an error comes back to this form.
 */

/** The five steps whose answers this screen would summarise. */
const SUMMARY_STEPS = WIZARD_STEPS.filter((s) => s.id !== "review");

export function WizardReviewForm({
  draftId,
  summary,
}: {
  draftId: string;
  summary: DraftSummary | null;
}) {
  const [state, formAction] = useFormState(submitSubmission, initialState);

  const v = state.values ?? {};

  if (!summary) {
    return (
      <Alert tone="danger" title="This draft cannot be opened">
        It may have been submitted already, or it may belong to another account.
        Open your{" "}
        <Link href="/submissions" className="font-medium underline">
          submissions list
        </Link>{" "}
        to find it.
      </Alert>
    );
  }

  /* What each step contributed, read back from the draft. `null` means the
     step has not been completed — rendered as a prompt to go and do it, never
     as a blank row, because a blank row reads as "nothing was asked". */
  const stepValues: Record<string, string | null> = {
    details: [ARTICLE_TYPE_LABEL[summary.type] ?? summary.type, summary.sectionName]
      .filter(Boolean)
      .join(" · "),
    upload:
      summary.files.length > 0
        ? summary.files.map((f) => `${FILE_KIND_LABEL[f.kind] ?? f.kind}: ${f.filename}`).join(" · ")
        : null,
    metadata: summary.abstract.trim()
      ? `${summary.title}${summary.keywords.length ? ` — ${summary.keywords.join(", ")}` : ""}`
      : null,
    contributors:
      summary.contributors.length > 0
        ? summary.contributors
            .map((c) => (c.isCorresponding ? `${c.name} (corresponding)` : c.name))
            .join(", ")
        : null,
    declarations: summary.declaredAt ? "Confirmed" : null,
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-serif text-lg font-semibold">
          Your submission
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Reference{" "}
          <strong className="font-semibold text-foreground">
            {summary.reference}
          </strong>
          . Check every section before submitting. Once submitted, changes go
          through the editorial office rather than through this form.
        </p>

        <ul className="mt-4 divide-y rounded-xl border">
          {SUMMARY_STEPS.map((step, i) => {
            const href =
              step.id === "details"
                ? "/submissions/new"
                : `/submissions/new/${draftId}/${step.id}`;
            const value = stepValues[step.id];

            return (
              <li
                key={step.id}
                className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground">{i + 1}.</span>{" "}
                    {step.label}
                  </p>
                  {value ? (
                    <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">
                      {value}
                    </p>
                  ) : (
                    <p className="mt-1 flex items-start gap-1.5 text-sm leading-relaxed font-medium text-warning">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      Not completed yet — {step.hint.toLowerCase()}.
                    </p>
                  )}
                </div>
                <Link
                  href={href}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark hover:underline"
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Open step
                  <span className="sr-only"> {i + 1}: {step.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <form action={formAction} className="space-y-7" noValidate>
        {/* The draft being submitted. The action re-checks ownership and
            re-validates every step from the database rather than trusting
            either this value or the per-step checks that came before. */}
        <input type="hidden" name="draftId" value={draftId} />
        {state.status === "error" && state.message && (
          <Alert tone="danger" title="Could not submit">
            {state.message}
          </Alert>
        )}

        <Field
          label="Note to the editor"
          htmlFor="editorNote"
          error={state.errors?.editorNote}
          hint="Optional. Anything the editorial office should know that does not belong in the manuscript or the cover letter — a related submission, or a reviewer you have good reason to consider unsuitable."
        >
          <Textarea name="editorNote" rows={3} defaultValue={v.editorNote} />
        </Field>

        <fieldset>
          <legend className="font-serif text-lg font-semibold">
            Before you submit
          </legend>

          <div className="mt-4 space-y-3">
            <div>
              <CheckOption
                id="confirmAccurate"
                name="confirmAccurate"
                label="I have checked the summary above and it is accurate"
                description="Including the author list and its order, which is a claim about who did the work."
                defaultChecked={v.confirmAccurate === "on"}
                className={cn(state.errors?.confirmAccurate && "border-danger")}
              />
              <FieldError message={state.errors?.confirmAccurate} />
            </div>

            <div>
              <CheckOption
                id="confirmUnderstands"
                name="confirmUnderstands"
                label="I understand this sends the manuscript to the editorial office"
                description="It is checked for scope and completeness first. If it passes that, it goes to double-blind peer review."
                defaultChecked={v.confirmUnderstands === "on"}
                className={cn(
                  state.errors?.confirmUnderstands && "border-danger",
                )}
              />
              <FieldError message={state.errors?.confirmUnderstands} />
              <p className="mt-1.5 px-1">
                <Link
                  href="/policies/peer-review"
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-medium text-primary hover:text-brand-dark hover:underline"
                >
                  Peer review policy
                </Link>
              </p>
            </div>
          </div>
        </fieldset>

        <WizardNav
          backHref={`/submissions/new/${draftId}/declarations`}
          submitLabel="Submit manuscript"
        />
      </form>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 px-1 text-xs font-medium text-danger">
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

