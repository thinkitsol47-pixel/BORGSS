"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Send } from "lucide-react";
import {
  submitReviewerApplication,
  type ReviewerState,
} from "@/app/(marketing)/for-reviewers/become-a-reviewer/actions";
import {
  REVIEWER_METHODS,
  REVIEWER_SUBJECTS,
} from "@/lib/validation/schemas";
import {
  Alert,
  Button,
  Checkbox,
  Field,
  Fieldset,
  Input,
  Select,
  Textarea,
} from "@/components/ui";

const DEGREES = [
  { value: "phd", label: "PhD / doctorate" },
  { value: "doctoral-candidate", label: "Doctoral candidate" },
  { value: "masters", label: "Master's degree" },
  { value: "other", label: "Other" },
];

const CAPACITY = [
  { value: "1-2", label: "1–2 manuscripts a year" },
  { value: "3-4", label: "3–4 manuscripts a year" },
  { value: "5-6", label: "5–6 manuscripts a year" },
  { value: "more", label: "More than 6 a year" },
];

const initialState: ReviewerState = { status: "idle" };

export function ReviewerForm() {
  const [state, formAction] = useFormState(
    submitReviewerApplication,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <p className="mt-4 font-serif text-xl font-bold">Application received</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
      </div>
    );
  }

  const v = (state.values ?? {}) as Record<string, string | string[]>;
  const str = (k: string) => (typeof v[k] === "string" ? (v[k] as string) : "");
  const arr = (k: string) => (Array.isArray(v[k]) ? (v[k] as string[]) : []);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Application not submitted">
          {state.message}
        </Alert>
      )}

      {/* ------------------------------------------------------- about you */}
      <Fieldset
        legend="About you"
        description="We use these details to match you with manuscripts and to write acknowledgement letters."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" required error={state.errors?.name}>
            <Input name="name" defaultValue={str("name")} autoComplete="name" />
          </Field>

          <Field
            label="Email address"
            htmlFor="email"
            required
            error={state.errors?.email}
            hint="Invitations are sent here."
          >
            <Input
              name="email"
              type="email"
              defaultValue={str("email")}
              autoComplete="email"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Institution"
            htmlFor="institution"
            required
            error={state.errors?.institution}
          >
            <Input
              name="institution"
              defaultValue={str("institution")}
              autoComplete="organization"
              placeholder="University or organisation"
            />
          </Field>

          <Field
            label="Position"
            htmlFor="position"
            required
            error={state.errors?.position}
          >
            <Input
              name="position"
              defaultValue={str("position")}
              placeholder="e.g. Assistant Professor"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Country" htmlFor="country" required error={state.errors?.country}>
            <Input
              name="country"
              defaultValue={str("country")}
              autoComplete="country-name"
            />
          </Field>

          <Field
            label="Highest qualification"
            htmlFor="degree"
            required
            error={state.errors?.degree}
          >
            <Select name="degree" defaultValue={str("degree")} required>
              <option value="" disabled>
                Select one
              </option>
              {DEGREES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="ORCID iD"
            htmlFor="orcid"
            optional
            error={state.errors?.orcid}
            hint="Lets us credit your reviews on your ORCID record."
          >
            <Input
              name="orcid"
              defaultValue={str("orcid")}
              placeholder="0000-0002-1825-0097"
            />
          </Field>

          <Field
            label="Profile URL"
            htmlFor="scholarUrl"
            optional
            error={state.errors?.scholarUrl}
            hint="Google Scholar, institutional page or similar."
          >
            <Input
              name="scholarUrl"
              type="url"
              defaultValue={str("scholarUrl")}
              placeholder="https://"
            />
          </Field>
        </div>
      </Fieldset>

      {/* ------------------------------------------------------- expertise */}
      <Fieldset
        legend="Your expertise"
        description="Choose the areas you are genuinely qualified to assess — accuracy here means fewer invitations you have to decline."
      >
        <fieldset>
          <legend className="text-sm font-medium">
            Subject areas
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Choose up to five
            </span>
          </legend>

          {state.errors?.subjects && (
            <p className="mt-1.5 text-xs font-medium text-danger">
              {state.errors.subjects}
            </p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {REVIEWER_SUBJECTS.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-brand-border p-2.5 text-sm transition-colors hover:border-brand hover:bg-brand-tint/40"
              >
                <Checkbox
                  name="subjects"
                  value={s}
                  defaultChecked={arr("subjects").includes(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium">
            Methodological expertise
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Optional
            </span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {REVIEWER_METHODS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-brand-border p-2.5 text-sm transition-colors hover:border-brand hover:bg-brand-tint/40"
              >
                <Checkbox
                  name="methods"
                  value={m}
                  defaultChecked={arr("methods").includes(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label="Specific topics"
          htmlFor="keywords"
          required
          error={state.errors?.keywords}
          hint="Comma-separated. The more specific, the better the match — e.g. microfinance, informal labour markets, curriculum reform."
          className="mt-5"
        >
          <Input
            name="keywords"
            defaultValue={str("keywords")}
            placeholder="microfinance, rural credit, SME finance"
          />
        </Field>

        <Field
          label="Reviewing experience"
          htmlFor="experience"
          optional
          error={state.errors?.experience}
          hint="Journals you have reviewed for, or relevant editorial roles. Newcomers are welcome — say so and we will pair you accordingly."
        >
          <Textarea name="experience" rows={4} defaultValue={str("experience")} />
        </Field>

        <Field
          label="How many manuscripts could you review?"
          htmlFor="capacity"
          required
          error={state.errors?.capacity}
        >
          <Select name="capacity" defaultValue={str("capacity")} required>
            <option value="" disabled>
              Select one
            </option>
            {CAPACITY.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
      </Fieldset>

      {/* ---------------------------------------------------------- ethics */}
      <div>
        <label
          htmlFor="agreeEthics"
          className="flex cursor-pointer gap-3 rounded-lg border border-brand-border p-4 transition-colors hover:border-brand hover:bg-brand-tint/40"
        >
          <Checkbox id="agreeEthics" name="agreeEthics" className="mt-0.5" />
          <span className="min-w-0 text-sm">
            <span className="font-medium">
              I have read and agree to the reviewer ethics policy
              <span className="ml-0.5 text-danger" aria-hidden>
                *
              </span>
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              This covers confidentiality, competing interests, and the
              prohibition on entering manuscripts into generative AI tools.
            </span>
          </span>
        </label>
        {state.errors?.agreeEthics && (
          <p className="mt-1.5 text-xs font-medium text-danger">
            {state.errors.agreeEthics}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t pt-6">
        <SubmitButton />
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-danger">*</span> are required.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
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
          Submit application
        </>
      )}
    </Button>
  );
}
