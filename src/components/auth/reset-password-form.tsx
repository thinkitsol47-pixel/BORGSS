"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import { CheckCircle2, KeyRound } from "lucide-react";
import { resetPassword, type AuthState } from "@/app/(auth)/actions";
import { Alert, Button } from "@/components/ui";
import { AuthResult } from "./auth-result";
import {
  AuthHeading,
  PasswordField,
  SubmitButton,
} from "./auth-parts";

const initialState: AuthState = { status: "idle" };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPassword, initialState);
  // Lifted so the confirm field can compare against it as the user types.
  const [password, setPassword] = useState("");

  if (state.status === "success") {
    return (
      <AuthResult
        icon={CheckCircle2}
        tone="success"
        title="Password validated"
        actions={
          <Button href="/login" className="w-full" size="lg">
            Go to sign in
          </Button>
        }
      >
        <p>{state.message}</p>
      </AuthResult>
    );
  }

  return (
    <>
      <AuthHeading title="Set a new password">
        Choose a password you do not use anywhere else. Signing in again
        afterwards will use the new one.
      </AuthHeading>

      {/* No standing notice: reaching this page means the emailed link was
          exchanged for a recovery session, so submitting really does change the
          password. */}
      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="token" value={token} />

        {state.status === "error" && state.message && (
          <Alert tone="danger" title="Could not set the password">
            {state.message}
          </Alert>
        )}

        {state.errors?.token && (
          <Alert tone="danger" title="Invalid link">
            {state.errors.token}
          </Alert>
        )}

        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          error={state.errors?.password}
          meter
          autoFocus
          onValueChange={setPassword}
        />

        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          error={state.errors?.confirmPassword}
          matchValue={password}
        />

        <SubmitButton pendingLabel="Saving…">
          <KeyRound className="size-4" aria-hidden />
          Set new password
        </SubmitButton>
      </form>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
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
