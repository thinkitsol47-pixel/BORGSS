"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { AlertCircle } from "lucide-react";
import {
  saveDeclarations,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import { Alert, CheckOption, Field, Textarea } from "@/components/ui";
import { WizardNav } from "./wizard-nav";
import { StepSuccess } from "./wizard-files-form";
import { cn } from "@/lib/utils";

const initialState: WizardState = { status: "idle" };

/**
 * Five separate declarations rather than one "I agree to everything".
 *
 * Each maps to a published policy, and each is a distinct claim the
 * corresponding author makes on behalf of all authors. A single tick over five
 * unrelated statements is not a meaningful declaration, and if one is later
 * disputed there would be no record of which was actually confirmed.
 */
const DECLARATIONS: {
  name: string;
  label: string;
  description: string;
  policy?: { label: string; href: string };
}[] = [
  {
    name: "originalWork",
    label: "This is original work, and all sources are attributed",
    description:
      "Everything taken from another source — including your own earlier work — is quoted or paraphrased with a citation.",
    policy: { label: "Plagiarism policy", href: "/policies/plagiarism" },
  },
  {
    name: "notUnderReviewElsewhere",
    label: "It is not under consideration at another journal",
    description:
      "And has not been published elsewhere, in any language. A preprint on a recognised server is fine and should be disclosed.",
    policy: {
      label: "Publication ethics",
      href: "/policies/publication-ethics",
    },
  },
  {
    name: "ethicalCompliance",
    label: "The research met its ethical obligations",
    description:
      "Approval was obtained where required, participants gave informed consent, and identifying details are protected. If no committee was available, say so in the manuscript.",
    policy: { label: "Research ethics", href: "/policies/research-ethics" },
  },
  {
    name: "allAuthorsApprove",
    label: "Every listed author has seen and approved this submission",
    description:
      "And each meets the authorship criteria. Nobody who qualifies has been left off, and nobody has been added who does not.",
    policy: { label: "Authorship policy", href: "/policies/authorship" },
  },
  {
    name: "agreeCopyright",
    label: "I accept the licence and copyright terms",
    description:
      "Authors keep copyright. If accepted, the article is published under CC BY 4.0, which lets anyone reuse it with attribution.",
    policy: { label: "Licensing", href: "/policies/licensing" },
  },
];

export function WizardDeclarationsForm({ draftId }: { draftId: string }) {
  const [state, formAction] = useFormState(saveDeclarations, initialState);

  if (state.status === "success") {
    return (
      <StepSuccess
        message={state.message}
        nextHref={`/submissions/new/${draftId}/review`}
      />
    );
  }

  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not continue">
          {state.message}
        </Alert>
      )}

      <fieldset>
        <legend className="font-serif text-lg font-semibold">
          Declarations
        </legend>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          You are making these on behalf of every author. Each links to the
          policy it comes from.
        </p>

        <div className="mt-4 space-y-3">
          {DECLARATIONS.map((d) => (
            <div key={d.name}>
              <CheckOption
                id={d.name}
                name={d.name}
                label={d.label}
                description={d.description}
                defaultChecked={v[d.name] === "on"}
                className={cn(state.errors?.[d.name] && "border-danger")}
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 px-1">
                {d.policy && (
                  <Link
                    href={d.policy.href}
                    target="_blank"
                    rel="noopener"
                    className="text-xs font-medium text-primary hover:text-brand-dark hover:underline"
                  >
                    {d.policy.label}
                  </Link>
                )}
                {state.errors?.[d.name] && (
                  <p className="flex items-start gap-1.5 text-xs font-medium text-danger">
                    <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
                    {state.errors[d.name]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="border-t pt-7">
        <h2 className="font-serif text-lg font-semibold">Statements</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Both are printed with the article if it is published.
        </p>

        <div className="mt-4 space-y-6">
          <Field
            label="Use of generative AI"
            htmlFor="aiDisclosure"
            required
            error={state.errors?.aiDisclosure}
            hint="Disclosure, not permission — declared use is allowed. Language editing and formatting need no disclosure; generating text, code or analysis does. AI cannot be an author. Write 'None' if you used none."
          >
            <Textarea
              name="aiDisclosure"
              rows={3}
              defaultValue={v.aiDisclosure}
              placeholder="None."
            />
          </Field>
          <p className="-mt-4 px-1">
            <Link
              href="/policies/ai-policy"
              target="_blank"
              rel="noopener"
              className="text-xs font-medium text-primary hover:text-brand-dark hover:underline"
            >
              AI-assisted writing policy
            </Link>
          </p>

          <Field
            label="Data availability"
            htmlFor="dataAvailability"
            required
            error={state.errors?.dataAvailability}
            hint="Where the data behind the findings can be found, or why it cannot be shared. Open data is encouraged but not required — a statement is."
          >
            <Textarea
              name="dataAvailability"
              rows={3}
              defaultValue={v.dataAvailability}
              placeholder="The data supporting this study are available from the corresponding author on reasonable request."
            />
          </Field>
          <p className="-mt-4 px-1">
            <Link
              href="/policies/data-availability"
              target="_blank"
              rel="noopener"
              className="text-xs font-medium text-primary hover:text-brand-dark hover:underline"
            >
              Data availability policy
            </Link>
          </p>
        </div>
      </div>

      <WizardNav
        backHref={`/submissions/new/${draftId}/contributors`}
        submitLabel="Continue to review"
      />
    </form>
  );
}
