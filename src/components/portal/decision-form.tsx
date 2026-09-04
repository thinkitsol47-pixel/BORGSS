"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Gavel, Info } from "lucide-react";
import {
  recordDecision,
  type DecisionState,
} from "@/app/(dashboard)/editorial/actions";
import { DECISION_TYPES } from "@/lib/validation/schemas";
import { Alert, Button, CheckOption, Field, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DecisionType } from "@/types";

const initialState: DecisionState = { status: "idle" };

const LETTER_MIN = 120;

export function DecisionForm({
  reference,
  /** Only the decisions this manuscript can actually receive. */
  available,
  /** True when the current round has an assignment with no report. */
  hasMissingReports,
}: {
  reference: string;
  available: DecisionType[];
  hasMissingReports: boolean;
}) {
  const [state, formAction] = useFormState(recordDecision, initialState);
  const [letter, setLetter] = useState(state.values?.letter ?? "");

  if (state.status === "success") {
    return <DecisionOutcome state={state} reference={reference} />;
  }

  const v = state.values ?? {};
  const options = DECISION_TYPES.filter((d) =>
    available.includes(d.value as DecisionType),
  );

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not record the decision">
          {state.message}
        </Alert>
      )}

      {/* The warning sits above the choice, not below it. An editor who reads
          it after picking a decision has already made up their mind. */}
      {hasMissingReports && (
        <Alert tone="warning" title="A report is still outstanding">
          One or more reviewers in this round have not returned a report. That
          is sometimes the right moment to decide anyway — an unresponsive
          reviewer should not hold a manuscript indefinitely — but it should be
          a choice rather than an oversight.
        </Alert>
      )}

      {/* ------------------------------------------------------ decision */}
      <fieldset>
        <legend className="font-serif text-lg font-semibold">
          Your decision
        </legend>
        <p className="mt-1 text-sm text-muted-foreground">
          The reviewers recommend; you decide. A recommendation you disagree
          with is worth explaining in the letter.
        </p>

        <div className="mt-4 space-y-2.5">
          {options.map((d) => (
            <label
              key={d.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                "hover:border-brand-border hover:bg-brand-tint/40",
                "has-[:checked]:border-brand has-[:checked]:bg-brand-tint/60",
                "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2",
              )}
            >
              <input
                type="radio"
                name="decision"
                value={d.value}
                defaultChecked={v.decision === d.value}
                className="mt-1 size-4 shrink-0 accent-[hsl(var(--brand))]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{d.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {d.hint}
                </span>
              </span>
            </label>
          ))}
        </div>

        {state.errors?.decision && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-danger">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {state.errors.decision}
          </p>
        )}
      </fieldset>

      {/* -------------------------------------------------------- letter */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Letter to the author</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          This is usually the only thing the author receives from the journal,
          and a decision they cannot understand is the one they appeal. Say
          what the decision is, what drove it, and — on a revision — what
          specifically has to change.
        </p>

        <div className="mt-4">
          <Field
            label="Decision letter"
            htmlFor="letter"
            required
            error={state.errors?.letter}
            counter={`${letter.trim().length} / ${LETTER_MIN} min`}
          >
            <Textarea
              id="letter"
              name="letter"
              rows={12}
              defaultValue={v.letter}
              onChange={(e) => setLetter(e.target.value)}
              aria-invalid={state.errors?.letter ? true : undefined}
            />
          </Field>
        </div>

        <div className="mt-4">
          <CheckOption
            id="includeReports"
            name="includeReports"
            defaultChecked
            label="Send the reviewers' comments to the author with this letter"
            description="Their comments to the author only. Comments marked confidential to the editor are never sent, whether this is ticked or not."
          />
        </div>
      </section>

      {/* ------------------------------------------------------ internal */}
      <section>
        <h2 className="font-serif text-lg font-semibold">
          Internal note <span className="font-sans text-sm font-normal text-muted-foreground">(optional)</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For the editorial record. Not sent to the author or to the reviewers.
        </p>
        <div className="mt-3">
          <Field label="Note" htmlFor="internalNote" error={state.errors?.internalNote}>
            <Textarea
              id="internalNote"
              name="internalNote"
              rows={3}
              defaultValue={v.internalNote}
            />
          </Field>
        </div>
      </section>

      {/* -------------------------------------------------- confirmation */}
      <section>
        <CheckOption
          id="confirmRead"
          name="confirmRead"
          label="I have read the reports available for this round"
          description="The reports are on this page, above the form."
          aria-invalid={state.errors?.confirmRead ? true : undefined}
        />
        {state.errors?.confirmRead && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-danger">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {state.errors.confirmRead}
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Submit />
        <p className="text-xs text-muted-foreground">
          Nothing is recorded or sent yet.
        </p>
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Gavel className="size-4" aria-hidden />
      {pending ? "Checking…" : "Record decision"}
    </Button>
  );
}

/**
 * The result screen.
 *
 * Deliberately not a green tick. An editor who records a decision and sees a
 * success state will believe the author has been written to — and on this
 * screen, unlike the review form, someone else's manuscript is waiting on the
 * outcome. So it leads with what did *not* happen.
 */
function DecisionOutcome({
  state,
  reference,
}: {
  state: DecisionState;
  reference: string;
}) {
  const label =
    DECISION_TYPES.find((d) => d.value === state.decision)?.label ??
    state.decision;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-6">
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-xl bg-warning/10 text-warning"
      >
        <Info className="size-5" />
      </span>
      <h2 className="mt-3 font-serif text-lg font-semibold">
        Checked, but not recorded
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The decision — <span className="font-medium text-foreground">{label}</span>{" "}
        — is valid and the letter meets the minimum length. Nothing was written
        to the manuscript&rsquo;s history, the author has not been told, and the
        reviewers have not been notified.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Until the backend lands, the decision has to go out from the editorial
        office by email, quoting{" "}
        <span className="font-medium text-foreground">{reference}</span>. Your
        letter is repeated below so you can copy it out — leaving this page
        loses it, because nothing here is stored.
      </p>

      {/* The letter is given back rather than discarded. This screen exists at
          the end of an hour's writing, and "it is not saved anywhere" is only
          fair advice if the text is still on screen to be taken. */}
      {state.values?.letter && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your letter
          </h3>
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-3 font-sans text-sm leading-relaxed">
            {state.values.letter}
          </pre>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button href="/editorial/queue" variant="outline">
          Back to the queue
        </Button>
      </div>
    </div>
  );
}
