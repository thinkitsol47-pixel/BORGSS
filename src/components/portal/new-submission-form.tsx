"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { startSubmission, type WizardState } from "@/app/(dashboard)/submissions/actions";
import {
  ARTICLE_TYPES,
} from "@/lib/validation/schemas";
import {
  Alert,
  Button,
  CheckOption,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { WizardSteps } from "./wizard-steps";
import { cn } from "@/lib/utils";

const initialState: WizardState = { status: "idle" };

const TITLE_MAX = 300;

/**
 * Wizard step 1.
 *
 * **The section list comes from the database, not from a constant.** It used to
 * render `REVIEWER_SUBJECTS`, a list maintained for the reviewer directory —
 * so an author could pick a subject that had no `Section` row, and the action
 * would reject a choice the form had offered. The page passes the registry.
 */
export function NewSubmissionForm({ sections }: { sections: string[] }) {
  const [state, formAction] = useFormState(startSubmission, initialState);
  const [title, setTitle] = useState(state.values?.title ?? "");

  if (state.status === "success") {
    return (
      <div className="max-w-3xl">
        <div className="rounded-xl border border-success/30 bg-success/5 p-6">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-xl bg-success/10 text-success"
          >
            <CheckCircle2 className="size-5" />
          </span>
          <h2 className="mt-3 font-serif text-lg font-semibold">
            Details validated
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {state.message}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            When the database is connected, this step creates a draft and takes
            you straight to file upload. Everything you typed is shown below so
            you can see what would have been saved.
          </p>

          <dl className="mt-5 space-y-3 border-t border-success/20 pt-5 text-sm">
            <Summary label="Article type" value={typeLabel(state.values?.articleType)} />
            <Summary label="Section" value={state.values?.section} />
            <Summary label="Working title" value={state.values?.title} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/submissions" variant="outline">
              Back to my submissions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const v = state.values ?? {};

  return (
    <div className="max-w-3xl">
      {/* draftId is unknown until the backend creates one; "new" keeps the
          rail honest about which step this is without inventing an id. */}
      <WizardSteps draftId="new" active="details" />

      <form action={formAction} className="mt-8 space-y-7" noValidate>
        {state.status === "error" && state.message && (
          <Alert tone="danger" title="Could not continue">
            {state.message}
          </Alert>
        )}

        {/* ------------------------------------------------ article type */}
        <fieldset>
          <legend className="font-serif text-lg font-semibold">
            What are you submitting?
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">
            The type determines which review criteria apply.
          </p>

          <div className="mt-4 space-y-2">
            {ARTICLE_TYPES.map((t) => (
              <CheckOption
                key={t.value}
                type="radio"
                id={`articleType-${t.value}`}
                name="articleType"
                value={t.value}
                defaultChecked={v.articleType === t.value}
                label={t.label}
                description={t.hint}
              />
            ))}
          </div>
          <FieldError id="articleType" message={state.errors?.articleType} />
        </fieldset>

        {/* ---------------------------------------------------- section */}
        <fieldset>
          <legend className="font-serif text-lg font-semibold">
            Where does it belong?
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Manuscripts are assigned to a section editor by subject area. Choose
            the closest fit — the editorial office will move it if needed.
          </p>

          <div className="mt-4">
            <Field
              label="Section"
              htmlFor="section"
              required
              error={state.errors?.section}
            >
              <Select name="section" defaultValue={v.section ?? ""} required>
                <option value="" disabled>
                  Choose a section
                </option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </fieldset>

        {/* ------------------------------------------------------ title */}
        <fieldset>
          <legend className="font-serif text-lg font-semibold">
            Working title
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">
            It does not have to be final. You can change it at the metadata
            step, along with the abstract and keywords.
          </p>

          <div className="mt-4">
            <Field
              label="Title"
              htmlFor="title"
              required
              error={state.errors?.title}
              counter={`${title.length} / ${TITLE_MAX}`}
              hint="A specific title describing what was studied and where reads better than a general one."
            >
              <Textarea
                name="title"
                rows={2}
                maxLength={TITLE_MAX}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Microfinance Access and Household Resilience in Rural Sindh: A Panel Study"
              />
            </Field>
          </div>
        </fieldset>

        {/* ----------------------------------------------- eligibility */}
        <fieldset>
          <legend className="font-serif text-lg font-semibold">
            Before you continue
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Two checks that save time later. Both are asked again, in full, at
            the declarations step.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium">
                Is this manuscript under consideration at another journal?
                <span className="ml-0.5 text-danger" aria-hidden>
                  *
                </span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Simultaneous submission is not permitted. A manuscript declined
                elsewhere, or withdrawn before a decision, is fine.
              </p>
              <div className="mt-2.5 space-y-2">
                <CheckOption
                  type="radio"
                  id="underReviewElsewhere-no"
                  name="underReviewElsewhere"
                  value="no"
                  defaultChecked={v.underReviewElsewhere === "no"}
                  label="No — it is not under review anywhere else"
                />
                <CheckOption
                  type="radio"
                  id="underReviewElsewhere-yes"
                  name="underReviewElsewhere"
                  value="yes"
                  defaultChecked={v.underReviewElsewhere === "yes"}
                  label="Yes — it is currently with another journal"
                  description="You will not be able to continue while that is the case."
                />
              </div>
              <FieldError
                id="underReviewElsewhere"
                message={state.errors?.underReviewElsewhere}
              />
            </div>

            <div>
              <CheckOption
                id="confirmAnonymised"
                name="confirmAnonymised"
                label="My manuscript file is anonymised"
                description="No author names, affiliations or acknowledgements anywhere in the file, including its document properties. Author details go on a separate title page."
                className={cn(state.errors?.confirmAnonymised && "border-danger")}
              />
              <FieldError
                id="confirmAnonymised"
                message={state.errors?.confirmAnonymised}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 border-t pt-6">
          <ContinueButton />
          <Button href="/submissions" variant="outline">
            Cancel
          </Button>
          <p className="w-full text-xs text-muted-foreground sm:w-auto">
            Nothing is charged at submission.{" "}
            <Link
              href="/apc"
              target="_blank"
              rel="noopener"
              className="font-medium text-primary hover:text-brand-dark hover:underline"
            >
              Publication charges
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

function ContinueButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Checking…
        </>
      ) : (
        <>
          Continue to files
          <ArrowRight className="size-4" aria-hidden />
        </>
      )}
    </Button>
  );
}

/** Error line for groups that `Field` does not wrap (radio sets, checkboxes). */
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

function Summary({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function typeLabel(value?: string) {
  return ARTICLE_TYPES.find((t) => t.value === value)?.label ?? value;
}
