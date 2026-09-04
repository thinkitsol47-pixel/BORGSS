"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  saveMetadata,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import {
  ABSTRACT_MAX,
  ABSTRACT_MIN,
  KEYWORDS_MAX,
  KEYWORDS_MIN,
  splitKeywords,
} from "@/lib/validation/schemas";
import { Alert, Field, Input, Textarea } from "@/components/ui";
import { WizardNav } from "./wizard-nav";
import { StepSuccess } from "./wizard-files-form";

const initialState: WizardState = { status: "idle" };

const TITLE_MAX = 300;

export function WizardMetadataForm({ draftId }: { draftId: string }) {
  const [state, formAction] = useFormState(saveMetadata, initialState);
  const [title, setTitle] = useState(state.values?.title ?? "");
  const [abstract, setAbstract] = useState(state.values?.abstract ?? "");
  const [keywords, setKeywords] = useState(state.values?.keywords ?? "");

  if (state.status === "success") {
    return (
      <StepSuccess
        message={state.message}
        nextHref={`/submissions/new/${draftId}/contributors`}
      />
    );
  }

  const parsedKeywords = splitKeywords(keywords);

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not continue">
          {state.message}
        </Alert>
      )}

      <Field
        label="Title"
        htmlFor="title"
        required
        error={state.errors?.title}
        counter={`${title.length} / ${TITLE_MAX}`}
        hint="This is what appears in search results and citations. A title naming what was studied, where, and how reads better than a general one."
      >
        <Textarea
          name="title"
          rows={2}
          maxLength={TITLE_MAX}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <Field
        label="Abstract"
        htmlFor="abstract"
        required
        error={state.errors?.abstract}
        counter={
          abstract.trim().length < ABSTRACT_MIN
            ? `${abstract.trim().length} / ${ABSTRACT_MIN} minimum`
            : `${abstract.trim().length} / ${ABSTRACT_MAX}`
        }
        hint="Unstructured, one paragraph. State the question, what you did, what you found, and what it means — most readers will read only this."
      >
        <Textarea
          name="abstract"
          rows={10}
          maxLength={ABSTRACT_MAX}
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        />
      </Field>

      <div>
        <Field
          label="Keywords"
          htmlFor="keywords"
          required
          error={state.errors?.keywords}
          counter={`${parsedKeywords.length} / ${KEYWORDS_MAX}`}
          hint={`Between ${KEYWORDS_MIN} and ${KEYWORDS_MAX}, separated by commas. These decide who finds the article — use the terms a researcher would actually search for, not words already in your title.`}
        >
          <Input
            name="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="microfinance, household resilience, rural development"
          />
        </Field>

        {/* Shows how the commas were interpreted, so nobody discovers at
            submission that their four keywords were read as one. */}
        {parsedKeywords.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {parsedKeywords.map((k, i) => (
              <li
                key={`${k}-${i}`}
                className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-darker"
              >
                {k}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Field
        label="Funding"
        htmlFor="funding"
        optional
        error={state.errors?.funding}
        hint="Name each funder and grant number. Write nothing here if the research was unfunded — you will declare that at the next step."
      >
        <Textarea
          name="funding"
          rows={3}
          defaultValue={state.values?.funding}
          placeholder="This work was supported by [funder] under grant [number]."
        />
      </Field>

      <Field
        label="Competing interests"
        htmlFor="conflictOfInterest"
        required
        error={state.errors?.conflictOfInterest}
        hint="Financial or non-financial. The test is whether a reasonable reader might think it could have influenced the work. If there are none, write 'None' — the field cannot be left blank, because a blank is ambiguous."
      >
        <Textarea
          name="conflictOfInterest"
          rows={3}
          defaultValue={state.values?.conflictOfInterest}
          placeholder="None."
        />
      </Field>

      <WizardNav
        backHref={`/submissions/new/${draftId}/upload`}
        submitLabel="Continue to authors"
      />
    </form>
  );
}
