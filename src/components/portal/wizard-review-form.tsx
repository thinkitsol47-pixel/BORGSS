"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import {
  submitSubmission,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import { Alert, Button, CheckOption, Field, Textarea } from "@/components/ui";
import { WizardNav } from "./wizard-nav";
import { WIZARD_STEPS } from "./wizard-steps";
import { cn } from "@/lib/utils";

const initialState: WizardState = { status: "idle" };

/**
 * Step 6 — check and submit.
 *
 * The summary is the point of this screen: an author who has filled five
 * screens across several sittings needs to see the whole submission in one
 * place before it leaves their hands.
 *
 * With no database there is nothing to summarise, and inventing plausible
 * placeholder values would be the worst possible thing to show on a
 * confirmation screen — the author would be confirming someone else's data.
 * So each step's row states plainly that it has nothing to show and links back
 * to the step, and the submit button is disabled while that is true.
 */

/** The five steps whose answers this screen would summarise. */
const SUMMARY_STEPS = WIZARD_STEPS.filter((s) => s.id !== "review");

export function WizardReviewForm({ draftId }: { draftId: string }) {
  const [state, formAction] = useFormState(submitSubmission, initialState);

  if (state.status === "success") {
    return <SubmitOutcome message={state.message} draftId={draftId} />;
  }

  const v = state.values ?? {};

  return (
    <div className="space-y-8">
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-serif text-lg font-semibold">
          Your submission
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Check every section before submitting. Once submitted, changes go
          through the editorial office rather than through this form.
        </p>

        <ul className="mt-4 divide-y rounded-xl border">
          {SUMMARY_STEPS.map((step, i) => {
            const href =
              step.id === "details"
                ? "/submissions/new"
                : `/submissions/new/${draftId}/${step.id}`;

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
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.hint}. Nothing to show — answers are not carried
                    between steps yet.
                  </p>
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

      <Alert tone="warning" title="This summary is empty on purpose">
        The portal cannot save a draft yet, so there is nothing to gather from
        the steps behind this one. Rather than show invented values for you to
        confirm, each row says so and links back to its step. When the database
        is connected, this screen will list every answer exactly as the
        editorial office will receive it.
      </Alert>

      <form action={formAction} className="space-y-7" noValidate>
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

/**
 * The success state.
 *
 * Every other step ends with "this step is valid". This one cannot borrow that
 * wording: an author who reaches the end of a submission wizard and sees a
 * green tick will believe their manuscript is with the journal. So this states
 * what did not happen first, then gives the route that does work today.
 */
function SubmitOutcome({
  message,
  draftId,
}: {
  message?: string;
  draftId: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-6">
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-xl bg-warning/10 text-warning"
        >
          <CheckCircle2 className="size-5" />
        </span>
        <h2 className="mt-3 font-serif text-lg font-semibold">
          Checked, but not submitted
        </h2>
        {message && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your manuscript has <strong className="font-semibold text-foreground">not</strong>{" "}
          reached the editorial office, and no manuscript ID has been issued.
          Nothing you entered has been kept.
        </p>
      </div>

      <div className="rounded-xl border border-brand-border bg-brand-tint p-6">
        <h2 className="font-serif text-lg font-semibold">
          How to submit today
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-darker">
          Online submission is not open yet. Until it is, the editorial office
          accepts manuscripts by email, and the submission page lists exactly
          which files to attach.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/for-authors/how-to-submit">How to submit by email</Button>
          <Button href="/submissions" variant="outline">
            My submissions
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <Link
          href={`/submissions/new/${draftId}/declarations`}
          className="font-medium text-primary hover:text-brand-dark hover:underline"
        >
          Back to declarations
        </Link>
      </p>
    </div>
  );
}
