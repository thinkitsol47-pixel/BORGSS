"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { LogIn, Mail } from "lucide-react";
import { signIn, type AuthState } from "@/app/(auth)/actions";
import { Alert, CheckOption, Field, Input } from "@/components/ui";
import { AuthHeading, PasswordField, SubmitButton } from "./auth-parts";

const initialState: AuthState = { status: "idle" };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(signIn, initialState);
  const v = state.values ?? {};

  /**
   * Navigate once the session cookie has actually arrived.
   *
   * The action returns `redirectTo` instead of calling `redirect()`, because a
   * redirect thrown inside the action aborts it before Supabase's
   * `Set-Cookie` is flushed — the browser then reaches the portal with no
   * session and the middleware sends it straight back here, blanking the
   * form. By the time this effect runs the response (and its cookie) has been
   * received, so the navigation lands signed in.
   *
   * A full page load, not `router.replace()` + `router.refresh()`. The pair
   * raced: the refresh re-rendered /login, whose server guard now saw a
   * session and redirected, and the form vanished while the portal was still
   * loading — a blank panel that looked like a failed sign-in. A hard
   * navigation has one outcome, starts with no stale router cache, and
   * `replace` keeps the completed form out of the Back history.
   */
  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      window.location.replace(state.redirectTo);
    }
  }, [state.status, state.redirectTo]);

  return (
    <>
      <AuthHeading title="Sign in">
        Access your submissions, reviews and editorial work.
      </AuthHeading>

      <form action={formAction} className="space-y-5" noValidate>
        {next && <input type="hidden" name="next" value={next} />}

        {state.status === "error" && state.message && (
          <Alert tone="danger" title="Could not sign in">
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

        <div>
          <PasswordField
            label="Password"
            name="password"
            error={state.errors?.password}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-brand-dark"
            >
              Forgotten your password?
            </Link>
          </div>
        </div>

        <CheckOption
          id="remember"
          name="remember"
          label="Keep me signed in"
          description="Only on a device you trust — not a shared or public computer."
        />

        <SubmitButton pendingLabel="Signing in…">
          <LogIn className="size-4" aria-hidden />
          Sign in
        </SubmitButton>
      </form>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-brand-dark"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
