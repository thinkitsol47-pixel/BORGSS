"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { register, type AuthState } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/config/countries";
import { Alert, Button, CheckOption, Field, Input } from "@/components/ui";
import { AuthResult } from "./auth-result";
import {
  AuthHeading,
  OrcidField,
  PasswordField,
  SubmitButton,
} from "./auth-parts";

const initialState: AuthState = { status: "idle" };

/**
 * Groups the form into two labelled blocks. Eight fields in one unbroken run
 * reads as a wall; split, it reads as two short tasks.
 */
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand-darker">
        {title}
        <span aria-hidden className="h-px flex-1 bg-brand-border" />
      </p>
      {children}
    </section>
  );
}

/** Values must match REGISTER_ROLES in the validation schema. */
const ROLES = [
  {
    value: "author",
    label: "To submit my own manuscripts",
    description: "You will start on the submissions view.",
  },
  {
    value: "reviewer",
    label: "To review for the journal",
    // "Does not guarantee one" read as *probably, eventually* — which is not
    // what happens. Choosing this records the interest and nothing else: the
    // editor's shortlist is the reviewer pool, an account is not in it by
    // registering, and nothing yet puts one there from this form. Saying so
    // is the difference between a queue and a dead end.
    description:
      "Records your interest. Invitations come only after the editorial office adds you to the reviewer pool.",
  },
  {
    value: "both",
    label: "Both",
    description: "Submit your own work and review for others from one account.",
  },
];

export function RegisterForm() {
  const [state, formAction] = useFormState(register, initialState);
  // Lifted so the confirm field can compare against it as the user types.
  const [password, setPassword] = useState("");

  if (state.status === "success") {
    return (
      <AuthResult
        icon={CheckCircle2}
        tone="success"
        title="Details validated"
        actions={
          <>
            {state.values?.email && (
              <Button
                href={`/verify-email?email=${encodeURIComponent(state.values.email)}`}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              In the meantime, write to the{" "}
              <Link
                href="/contact"
                className="font-medium text-primary hover:text-brand-dark"
              >
                editorial office
              </Link>{" "}
              if you need to reach us.
            </p>
          </>
        }
      >
        <p>{state.message}</p>
      </AuthResult>
    );
  }

  const v = state.values ?? {};

  return (
    <>
      <AuthHeading title="Create an account">
        One account covers submitting, reviewing and editorial work — your role
        decides what you see.
      </AuthHeading>

      <form action={formAction} className="space-y-7" noValidate>
        {state.status === "error" && state.message && (
          <Alert tone="danger" title="Could not create the account">
            {state.message}
          </Alert>
        )}

        <FormSection title="About you">
          <Field
            label="Full name"
            htmlFor="name"
            required
            error={state.errors?.name}
            hint="As it should appear on a published article."
          >
            <Input
              name="name"
              defaultValue={v.name}
              autoComplete="name"
              placeholder="Ayesha Khan"
              icon={<User />}
              autoFocus
            />
          </Field>

          <Field
            label="Email address"
            htmlFor="email"
            required
            error={state.errors?.email}
            hint="Use your institutional address where you have one."
          >
            <Input
              name="email"
              type="email"
              defaultValue={v.email}
              autoComplete="email"
              placeholder="you@university.edu"
              icon={<Mail />}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Institution"
              htmlFor="institution"
              required
              error={state.errors?.institution}
            >
              <Input
                name="institution"
                defaultValue={v.institution}
                autoComplete="organization"
                placeholder="University or organisation"
                icon={<Building2 />}
              />
            </Field>

            <Field
              label="Country"
              htmlFor="country"
              required
              error={state.errors?.country}
            >
              {/* Free text with suggestions rather than a select: nobody is
                  blocked by a territory this list gets wrong, but typing
                  completes to one canonical spelling. */}
              <Input
                name="country"
                defaultValue={v.country}
                autoComplete="country-name"
                list="country-list"
                placeholder="Start typing…"
                icon={<Globe />}
              />
            </Field>
            <datalist id="country-list">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <OrcidField error={state.errors?.orcid} defaultValue={v.orcid} />

          {/* Three options, each needing a line of explanation — radio cards
              show all three at once where a select hides two of them. */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground">
              How do you expect to use the journal?
              <span className="ml-0.5 text-danger" aria-hidden>
                *
              </span>
            </legend>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This only sets your starting view. It can be changed later, and it
              does not limit what you can do.
            </p>
            <div className="mt-3 space-y-2">
              {ROLES.map((r) => (
                <CheckOption
                  key={r.value}
                  type="radio"
                  id={`intendedRole-${r.value}`}
                  name="intendedRole"
                  value={r.value}
                  defaultChecked={v.intendedRole === r.value}
                  label={r.label}
                  description={r.description}
                />
              ))}
            </div>
            {state.errors?.intendedRole && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-danger">
                <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
                {state.errors.intendedRole}
              </p>
            )}
          </fieldset>
        </FormSection>

        <FormSection title="Choose a password">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            error={state.errors?.password}
            meter
            onValueChange={setPassword}
          />

          {/* Given the first password, the second can say "match" or "not
              match" as it is typed, instead of only after a failed submit. */}
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            error={state.errors?.confirmPassword}
            matchValue={password}
          />
        </FormSection>

        <div>
          <CheckOption
            id="agreeTerms"
            name="agreeTerms"
            aria-describedby={
              state.errors?.agreeTerms ? "agreeTerms-error" : undefined
            }
            aria-invalid={state.errors?.agreeTerms ? true : undefined}
            label="I accept the journal's policies"
            className={cn(state.errors?.agreeTerms && "border-danger")}
          />
          <p className="mt-1.5 px-1 text-xs leading-relaxed text-muted-foreground">
            Specifically the{" "}
            {/* New tab deliberately: navigating away mid-form would discard
                everything typed so far. */}
            <Link
              href="/policies/privacy"
              target="_blank"
              rel="noopener"
              className="font-medium text-primary hover:text-brand-dark"
            >
              privacy policy
            </Link>{" "}
            and the{" "}
            <Link
              href="/policies/publication-ethics"
              target="_blank"
              rel="noopener"
              className="font-medium text-primary hover:text-brand-dark"
            >
              publication ethics policy
            </Link>
            . Both open in a new tab.
          </p>
          {state.errors?.agreeTerms && (
            <p
              id="agreeTerms-error"
              className="mt-1.5 flex items-start gap-1.5 px-1 text-xs font-medium text-danger"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              {state.errors.agreeTerms}
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

        <SubmitButton pendingLabel="Creating account…">
          <UserPlus className="size-4" aria-hidden />
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-brand-dark"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
