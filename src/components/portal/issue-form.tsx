"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  saveIssue,
  type IssueFormState,
} from "@/app/(dashboard)/editorial/issues/actions";
import { Alert, Button, Field, Input, Select } from "@/components/ui";
import type { EditorialIssue } from "@/types";

/**
 * Create or edit an issue.
 *
 * Volume, number and year identify an issue and appear in every citation of
 * every article in it, so they are the fields that most need getting right
 * before anything is placed. The target date is explicitly a plan: an issue
 * publishes when its contents are ready, and the form says so rather than
 * letting the date read as a commitment made to authors.
 *
 * **There is no "published" state to choose.** Publishing mints a DOI for
 * every article the issue carries, and the journal has no Crossref prefix, so
 * the identifiers would resolve nowhere. Offering the option disabled was
 * considered and rejected — a greyed-out choice is still a promise. The screen
 * says why it is absent instead.
 *
 * On success the action redirects to the issue, so there is no success state
 * here; only the error path renders, with every field echoed back.
 */

const initialState: IssueFormState = { status: "idle" };

export function IssueForm({ issue }: { issue?: EditorialIssue }) {
  const isEdit = Boolean(issue);
  const [state, formAction] = useFormState(saveIssue, initialState);
  const v = state.values ?? {};
  const errors = state.errors ?? {};

  /** A date column arrives as an ISO timestamp; the input wants YYYY-MM-DD. */
  const day = (iso?: string) => iso?.slice(0, 10);

  /* The issue's own state is never edited to `published` here, but an issue
     seeded as published still has to render something in the select. */
  const currentState =
    v.state ?? (issue?.state === "published" ? "in-production" : issue?.state) ?? "planned";

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {isEdit && <input type="hidden" name="issueId" value={issue!.id} />}

      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not save">
          {state.message}
        </Alert>
      )}

      <section>
        <h2 className="font-serif text-lg font-semibold">Identity</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Volume, number and year appear in the citation of every article this
          issue carries. They are worth settling before anything is placed in
          it, because a citation that has been published cannot be corrected
          quietly.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Volume"
            htmlFor="volume"
            required
            error={errors.volume}
          >
            <Input
              id="volume"
              name="volume"
              type="number"
              min={1}
              defaultValue={v.volume ?? issue?.volume ?? 2}
              required
            />
          </Field>
          <Field
            label="Number"
            htmlFor="number"
            required
            error={errors.number}
          >
            <Input
              id="number"
              name="number"
              type="number"
              min={1}
              defaultValue={v.number ?? issue?.number ?? 1}
              required
            />
          </Field>
          <Field label="Year" htmlFor="year" required error={errors.year}>
            <Input
              id="year"
              name="year"
              type="number"
              min={2020}
              defaultValue={v.year ?? issue?.year ?? new Date().getFullYear()}
              required
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="Issue title"
            htmlFor="title"
            optional
            hint="A theme, if the issue has one. Most do not, and that is fine."
            error={errors.title}
          >
            <Input
              id="title"
              name="title"
              defaultValue={v.title ?? issue?.title}
              placeholder="Credit, Care and Communication"
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold">Planning</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Target publication date"
            htmlFor="targetDate"
            required
            hint="A plan, not a promise. An issue publishes when its contents are ready."
            error={errors.targetDate}
          >
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              defaultValue={v.targetDate ?? day(issue?.targetDate)}
              required
            />
          </Field>

          <Field
            label="Articles planned"
            htmlFor="plannedArticles"
            optional
            hint="A target for your own planning, never a cap on what can go in."
            error={errors.plannedArticles}
          >
            <Input
              id="plannedArticles"
              name="plannedArticles"
              type="number"
              min={1}
              defaultValue={v.plannedArticles ?? issue?.plannedArticles}
              placeholder="5"
            />
          </Field>

          <Field
            label="State"
            htmlFor="state"
            required
            hint="Whether the issue is still open for manuscripts, or its contents are settled."
            error={errors.state}
          >
            <Select id="state" name="state" defaultValue={currentState}>
              <option value="planned">Planned — open for manuscripts</option>
              <option value="in-production">
                In production — contents fixed
              </option>
            </Select>
          </Field>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Publishing an issue is not offered here. It mints a DOI for every
          article the issue carries, and the journal has no Crossref prefix yet,
          so those identifiers would resolve nowhere.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <SubmitButton isEdit={isEdit} />
        <Button
          href={isEdit ? `/editorial/issues/${issue!.id}` : "/editorial/issues"}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create issue"}
    </Button>
  );
}
