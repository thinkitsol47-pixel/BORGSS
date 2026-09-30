"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { ArrowBigUp, Check, Eye, EyeOff, X } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import {
  PASSWORD_MIN,
  isValidOrcid,
  passwordStrength,
} from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

/** Title and supporting line at the top of each auth card. */
export function AuthHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <h1 className="font-serif text-3xl font-bold tracking-tight">{title}</h1>
      {children && (
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
    </div>
  );
}

/**
 * A standing notice on an auth screen.
 *
 * **The heading is a prop, and that is the fix for a real bug.** It used to be
 * hard-coded to "Not live yet", written when nothing authenticated anyone. Once
 * sign-in became real the wording inside changed but the heading did not, so the
 * login page announced "Not live yet" above a form that works — exactly the
 * failure CLAUDE.md forbids, and the one a reader trusts least once they notice
 * it.
 *
 * Each remaining use now says what is actually true of that screen. Where
 * nothing is outstanding, the notice is gone rather than reworded.
 */
export function ScaffoldNotice({
  title = "Not live yet",
  tone = "warning",
  children,
}: {
  title?: string;
  /** `info` for something that works with a caveat; `warning` for something that does not. */
  tone?: "warning" | "info";
  children: React.ReactNode;
}) {
  const warning = tone === "warning";

  return (
    <div
      className={
        warning
          ? "mb-6 rounded-lg border border-warning/30 bg-warning/5 p-3.5"
          : "mb-6 rounded-lg border border-brand-border bg-brand-tint/40 p-3.5"
      }
    >
      <p
        className={
          warning
            ? "text-xs font-semibold text-warning"
            : "text-xs font-semibold text-brand-darker"
        }
      >
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

/** Submit button that shows a spinner while the action runs. */
export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * Password input with a show/hide toggle, and optionally a strength meter.
 *
 * The toggle matters on a phone, where a mistyped password is otherwise
 * invisible. The meter scores with `passwordStrength` so it can never
 * disagree with what the schema will accept.
 */
export function PasswordField({
  label,
  name,
  error,
  hint,
  autoComplete = "current-password",
  meter = false,
  required = true,
  defaultValue,
  autoFocus,
  /** Name of the field this must equal; drives the live match indicator. */
  matchValue,
  onValueChange,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  meter?: boolean;
  required?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
  matchValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [shown, setShown] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue ?? "");
  const [capsLock, setCapsLock] = React.useState(false);

  const strength = meter ? passwordStrength(value) : null;

  // Only report a mismatch once the confirmation field has something in it —
  // "does not match" against an empty box is noise, not help.
  const match =
    matchValue === undefined || value === "" ? null : value === matchValue;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onValueChange?.(e.target.value);
  }

  /**
   * Caps Lock is the most common cause of a password that "should" work.
   * `getModifierState` is unavailable on some soft keyboards, hence the guard.
   */
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (typeof e.getModifierState === "function") {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  }

  return (
    <div>
      <Field
        label={label}
        htmlFor={name}
        required={required}
        error={error}
        hint={hint}
      >
        <div className="relative">
          <Input
            // `Field` renders `<label for={name}>`, so the input needs the
            // matching id or the label points at nothing and the control is
            // unlabelled to a screen reader.
            id={name}
            name={name}
            type={shown ? "text" : "password"}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={cn("pr-11", match === false && "border-warning")}
            // Controlled so a failed submit does not silently empty the field.
            value={value}
            onChange={handleChange}
            onKeyUp={handleKey}
            onBlur={() => setCapsLock(false)}
          />
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-brand-tint hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {shown ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </Field>

      {capsLock && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-warning">
          <ArrowBigUp className="size-3.5 shrink-0" aria-hidden />
          Caps Lock is on.
        </p>
      )}

      {/* Live match state, so a mismatch is caught before submitting rather
          than after. Only rendered once both fields have content. */}
      {match !== null && !error && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs font-medium",
            match ? "text-success" : "text-warning",
          )}
          aria-live="polite"
        >
          {match ? (
            <>
              <Check className="size-3.5 shrink-0" aria-hidden />
              Passwords match.
            </>
          ) : (
            <>
              <X className="size-3.5 shrink-0" aria-hidden />
              The two passwords do not match yet.
            </>
          )}
        </p>
      )}

      {strength && (
        <div className="mt-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    step <= strength.score
                      ? strength.score <= 1
                        ? "bg-danger"
                        : strength.score === 2
                          ? "bg-warning"
                          : "bg-success"
                      : "bg-border",
                  )}
                />
              ))}
            </div>
            {value && (
              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  strength.score <= 1
                    ? "text-danger"
                    : strength.score === 2
                      ? "text-warning"
                      : "text-success",
                )}
              >
                {strength.label}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground" aria-live="polite">
            {value
              ? `At least ${PASSWORD_MIN} characters.`
              : `Use at least ${PASSWORD_MIN} characters. A short phrase is stronger than a short password.`}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * ORCID iD input.
 *
 * An ORCID is 16 digits written in groups of four, and people copy it from
 * their profile in every possible shape: with the URL prefix, with spaces, or
 * as a bare run of digits. Rejecting those against the schema regex teaches
 * nothing, so the field normalises as you type — strips the prefix, keeps
 * digits (and a trailing X), and inserts the dashes itself.
 */
export function OrcidField({
  error,
  defaultValue,
  name = "orcid",
}: {
  error?: string;
  defaultValue?: string;
  name?: string;
}) {
  const [value, setValue] = React.useState(() => formatOrcid(defaultValue ?? ""));

  const complete = value.length === 19;
  const valid = complete && isValidOrcid(value);

  return (
    <div>
      <Field
        label="ORCID iD"
        htmlFor={name}
        optional
        error={error}
        hint="Keeps your work attributed to you even if your name or email changes."
      >
        <Input
          name={name}
          value={value}
          onChange={(e) => setValue(formatOrcid(e.target.value))}
          placeholder="0000-0002-1825-0097"
          inputMode="numeric"
          // 19 = 16 digits + 3 dashes.
          maxLength={19}
          prefix="orcid.org/"
          aria-invalid={complete && !valid ? true : undefined}
        />
      </Field>

      {complete && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs font-medium",
            valid ? "text-success" : "text-warning",
          )}
          aria-live="polite"
        >
          {valid ? (
            <>
              <Check className="size-3.5 shrink-0" aria-hidden />
              Valid ORCID iD.
            </>
          ) : (
            <>
              <X className="size-3.5 shrink-0" aria-hidden />
              That is 16 digits, but the check digit does not match. Copy it
              again from your ORCID profile.
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** Digits (plus a trailing X) regrouped as 0000-0000-0000-0000. */
function formatOrcid(raw: string) {
  const clean = raw
    .replace(/^\s*(?:https?:\/\/)?(?:www\.)?orcid\.org\//i, "")
    .replace(/[^\dXx]/g, "")
    .toUpperCase()
    .slice(0, 16);
  // Only the 16th character may be X; an X typed earlier is a typo.
  const digits = clean.replace(/X(?!$)/g, "");
  return digits.match(/.{1,4}/g)?.join("-") ?? "";
}

/* `isValidOrcid` now lives in schemas.ts and is imported above, so the meter
   here and the rule that rejects on submit can never disagree. */
