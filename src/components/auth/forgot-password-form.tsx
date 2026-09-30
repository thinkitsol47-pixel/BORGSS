"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { ArrowLeft, Mail, MailCheck, SendHorizonal } from "lucide-react";
import { requestPasswordReset, type AuthState } from "@/app/(auth)/actions";
import { Alert, Field, Input } from "@/components/ui";
import { AuthResult } from "./auth-result";
import { AuthHeading, ScaffoldNotice, SubmitButton } from "./auth-parts";

const initialState: AuthState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  if (state.status === "success") {
    return (
      <AuthResult
        icon={MailCheck}
        title="Check your inbox"
        actions={
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        }
      >
        <p>{state.message}</p>
      </AuthResult>
    );
  }

  const v = state.values ?? {};

  return (
    <>
      <AuthHeading title="Reset your password">
        Enter the address you registered with and we will send a link to set a
        new password.
      </AuthHeading>

      <ScaffoldNotice title="A reset link may not arrive">
        Password reset itself works, but email delivery is still being set up,
        so a link may be delayed or may not reach you at all. If nothing comes
        within a few minutes, contact the editorial office.
      </ScaffoldNotice>

      <form action={formAction} className="space-y-5" noValidate>
        {state.status === "error" && state.message && (
          <Alert tone="danger" title="Could not send the link">
            {state.message}
          </Alert>
        )}

        <Field
          label="Email address"
          htmlFor="email"
          required
          error={state.errors?.email}
        >
          <Input
            name="email"
            type="email"
            defaultValue={v.email}
            autoComplete="email"
            placeholder="you@university.edu"
            icon={<Mail />}
            autoFocus
          />
        </Field>

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

        <SubmitButton pendingLabel="Sending…">
          <SendHorizonal className="size-4" aria-hidden />
          Send reset link
        </SubmitButton>
      </form>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-brand-dark"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
