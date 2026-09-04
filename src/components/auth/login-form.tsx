"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { LogIn, Mail } from "lucide-react";
import { signIn, type AuthState } from "@/app/(auth)/actions";
import { Alert, CheckOption, Field, Input } from "@/components/ui";
import {
  AuthHeading,
  PasswordField,
  ScaffoldNotice,
  SubmitButton,
} from "./auth-parts";

const initialState: AuthState = { status: "idle" };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(signIn, initialState);
  const v = state.values ?? {};

  return (
    <>
      <AuthHeading title="Sign in">
        Access your submissions, reviews and editorial work.
      </AuthHeading>

      <ScaffoldNotice>
        The account system is still being built, so sign-in authenticates
        nobody. The demo accounts below open the portal in development; a real
        address and password will not work until the backend lands.
      </ScaffoldNotice>

      {/* Development only — the same guard the action uses, so this panel and
          the accounts it lists disappear together in a production build. */}
      {process.env.NODE_ENV !== "production" && <DemoAccounts />}

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

/**
 * The demo sign-ins, listed rather than hidden in a README.
 *
 * Six roles chosen to cover what the portal actually differentiates: the two
 * administrator tiers (a super admin sees the audit log and integrations, an
 * ordinary admin does not — that difference is the point of the roles screen),
 * a journal manager, the default editor, a production role, and a plain
 * reviewer. Any password is accepted; only the address is read.
 */
function DemoAccounts() {
  const accounts: { email: string; label: string; note: string }[] = [
    {
      email: "m.quddus@borjss.example",
      label: "Super administrator",
      note: "Everything, including the audit log and integrations",
    },
    {
      email: "f.mirza@borjss.example",
      label: "Administrator",
      note: "Everything except the four platform permissions",
    },
    {
      email: "a.rafiq@borjss.example",
      label: "Journal manager",
      note: "Issues, production, users, settings, DOI",
    },
    {
      email: "a.khan@example.edu",
      label: "Section editor",
      note: "The queue, reviewers and decisions",
    },
    {
      email: "h.aslam@borjss.example",
      label: "Copyeditor",
      note: "Production only",
    },
    {
      email: "p.raghavan@example.edu",
      label: "Reviewer",
      note: "Review invitations and reports",
    },
  ];

  return (
    <details className="mb-6 rounded-lg border border-brand-border bg-brand-tint/30 p-3.5">
      <summary className="cursor-pointer text-xs font-semibold text-brand-darker">
        Demo accounts (development only)
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Enter one of these addresses with any password. Every account is a real
        row in the user directory.
      </p>
      <ul className="mt-2.5 space-y-2">
        {accounts.map((a) => (
          <li key={a.email}>
            <p className="break-all font-mono text-xs font-medium">{a.email}</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {a.label} — {a.note}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
