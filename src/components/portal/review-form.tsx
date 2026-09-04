"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import {
  submitReview,
  type ReviewActionState,
} from "@/app/(dashboard)/reviews/actions";
import {
  REVIEW_CRITERIA,
  REVIEW_RECOMMENDATIONS,
  REVIEW_SCALE,
} from "@/lib/validation/schemas";
import {
  Alert,
  Button,
  CheckOption,
  Field,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const initialState: ReviewActionState = { status: "idle" };

const AUTHOR_MIN = 200;

export function ReviewForm({ reference }: { reference: string }) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [toAuthor, setToAuthor] = useState(state.values?.commentsToAuthor ?? "");

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6">
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-xl bg-success/10 text-success"
        >
          <CheckCircle2 className="size-5" />
        </span>
        <h2 className="mt-3 font-serif text-lg font-semibold">
          Review complete
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Once the backend is connected, submitting marks the assignment
          complete, notifies the handling editor, and your comments to the
          author are held until a decision is issued.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="/reviews" variant="outline">
            Back to my reviews
          </Button>
        </div>
      </div>
    );
  }

  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not submit the review">
          {state.message}
        </Alert>
      )}

      {/* ------------------------------------------------------- scoring */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Assessment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Score each criterion from 1 (poor) to 5 (excellent). These help the
          editor weigh reports against each other; your written comments matter
          more.
        </p>

        <div className="mt-4 divide-y rounded-xl border">
          {REVIEW_CRITERIA.map((c) => (
            <fieldset key={c.id} className="p-4">
              <legend className="sr-only">{c.label}</legend>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {c.label}
                    <span className="ml-0.5 text-danger" aria-hidden>
                      *
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {c.hint}
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label={c.label}
                  className="flex shrink-0 gap-1.5"
                >
                  {REVIEW_SCALE.map((s) => (
                    <label
                      key={s.value}
                      htmlFor={`${c.id}-${s.value}`}
                      title={s.hint}
                      className="cursor-pointer"
                    >
                      <input
                        type="radio"
                        id={`${c.id}-${s.value}`}
                        name={c.id}
                        value={s.value}
                        defaultChecked={v[c.id] === s.value}
                        className="peer sr-only"
                      />
                      {/* The number is the label, so the choice is never
                          conveyed by the highlight colour alone. */}
                      <span
                        className={cn(
                          "grid size-9 place-items-center rounded-lg border text-sm font-medium transition-colors",
                          "hover:border-brand hover:bg-brand-tint/50",
                          "peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-foreground",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-focus-visible:ring-offset-2",
                        )}
                      >
                        {s.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <FieldError id={c.id} message={state.errors?.[c.id]} />
            </fieldset>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------- recommendation */}
      <fieldset>
        <legend className="font-serif text-lg font-semibold">
          Overall recommendation
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        </legend>
        <p className="mt-1 text-sm text-muted-foreground">
          Advisory. The handling editor weighs all reports and decides.
        </p>

        <div className="mt-4 space-y-2">
          {REVIEW_RECOMMENDATIONS.map((r) => (
            <CheckOption
              key={r.value}
              type="radio"
              id={`recommendation-${r.value}`}
              name="recommendation"
              value={r.value}
              defaultChecked={v.recommendation === r.value}
              label={r.label}
              description={r.hint}
            />
          ))}
        </div>
        <FieldError
          id="recommendation"
          message={state.errors?.recommendation}
        />
      </fieldset>

      {/* -------------------------------------------- comments to author */}
      <section>
        <h2 className="font-serif text-lg font-semibold">
          Comments to the author
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Sent to the author with the decision, unedited. Be specific and
          constructive: point to sections and pages, say what would fix each
          problem, and separate what is required from what you merely suggest.
          Write about the manuscript, not the person.
        </p>

        <div className="mt-4">
          <Field
            label="Your report"
            htmlFor="commentsToAuthor"
            required
            error={state.errors?.commentsToAuthor}
            counter={
              toAuthor.trim().length < AUTHOR_MIN
                ? `${toAuthor.trim().length} / ${AUTHOR_MIN} minimum`
                : `${toAuthor.trim().length} characters`
            }
          >
            <Textarea
              name="commentsToAuthor"
              rows={14}
              value={toAuthor}
              onChange={(e) => setToAuthor(e.target.value)}
              placeholder="Begin with what the paper sets out to do and what it achieves, then take your substantive points in order of importance, then minor corrections."
            />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            Do not sign your report — the journal is double-blind and your
            identity is not disclosed to the author.
          </p>
        </div>
      </section>

      {/* -------------------------------------------- comments to editor */}
      <section>
        <h2 className="font-serif text-lg font-semibold">
          Confidential comments to the editor
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Never shown to the author. Use this for anything you would not put in
          the open report — how firmly you hold your recommendation, or a
          concern you are not certain of.
        </p>

        <div className="mt-4">
          <Field
            label="Comments to the editor"
            htmlFor="commentsToEditor"
            optional
            error={state.errors?.commentsToEditor}
          >
            <Textarea
              name="commentsToEditor"
              rows={5}
              defaultValue={v.commentsToEditor}
            />
          </Field>
        </div>
      </section>

      {/* -------------------------------------------------------- ethics */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Declarations</h2>

        <div className="mt-4 space-y-4">
          <div>
            <Field
              label="Do you wish to raise an ethics or integrity concern?"
              htmlFor="concernsRaised"
              optional
              error={state.errors?.concernsRaised}
              hint="Suspected plagiarism, duplicate publication, image manipulation or fabricated data. Editors follow COPE flowcharts and will not act on your name."
            >
              <Textarea
                name="concernsRaised"
                rows={3}
                defaultValue={v.concernsRaised}
                placeholder="Leave blank if none."
              />
            </Field>
          </div>

          <div>
            <CheckOption
              id="confirmNoConflict"
              name="confirmNoConflict"
              label="I have no competing interest in this manuscript"
              description="No recent collaboration, shared institution, financial interest, or personal relationship that a reasonable reader would think could affect your judgement."
              className={cn(state.errors?.confirmNoConflict && "border-danger")}
            />
            <FieldError
              id="confirmNoConflict"
              message={state.errors?.confirmNoConflict}
            />
          </div>

          <div>
            <CheckOption
              id="confirmNoAi"
              name="confirmNoAi"
              label="I have not uploaded this manuscript to a generative AI tool"
              description="An unpublished manuscript is confidential. Pasting it into a chatbot discloses it to a third party — this is prohibited by the reviewer ethics policy."
              className={cn(state.errors?.confirmNoAi && "border-danger")}
            />
            <FieldError id="confirmNoAi" message={state.errors?.confirmNoAi} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <SubmitReviewButton />
        <Button href="/reviews" variant="outline">
          Cancel
        </Button>
        <p className="w-full text-xs leading-relaxed text-muted-foreground sm:w-auto sm:flex-1">
          Once submitted, a report cannot be edited — contact the editorial
          office if you need to correct something.{" "}
          <Link
            href="/policies/reviewer-ethics"
            target="_blank"
            rel="noopener"
            className="font-medium text-primary hover:text-brand-dark hover:underline"
          >
            Reviewer ethics policy
          </Link>
        </p>
      </div>
    </form>
  );
}

function SubmitReviewButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Submitting…
        </>
      ) : (
        <>
          <Send className="size-4" aria-hidden />
          Submit review
        </>
      )}
    </Button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={`${id}-error`}
      className="mt-2 flex items-start gap-1.5 text-xs font-medium text-danger"
    >
      <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
