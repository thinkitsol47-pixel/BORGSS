"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Mail, UserPlus } from "lucide-react";
import {
  createInvitedUser,
  type NewUserState,
} from "@/app/(dashboard)/admin/users/actions";
import { Alert, Button, Checkbox, Field, Input } from "@/components/ui";
import { ROLE_LABELS, ROLES, type Role } from "@/config/roles";

const initialState: NewUserState = { status: "idle" };

/**
 * Create an account and invite its holder.
 *
 * Roles the administrator may not grant render disabled and labelled, as on
 * the edit screen; the action refuses them regardless.
 */
export function NewUserForm({ grantable }: { grantable: Role[] }) {
  const [state, formAction] = useFormState(createInvitedUser, initialState);
  const v = state.values ?? {};

  if (state.status === "success" && state.userId) {
    return (
      <div className="space-y-4">
        <Alert
          tone={state.emailed ? "success" : "warning"}
          title={state.emailed ? "Account created and invited" : "Account created — invitation not sent"}
        >
          {state.message}
        </Alert>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The account shows as <strong>Invited</strong> until they set a
          password, and as <strong>Active</strong> from then on. To add them to
          the reviewer pool, open the account and use its Reviewer pool section.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href={`/admin/users/${state.userId}/edit`}>Open the account</Button>
          <Button href="/admin/users/new" variant="outline">
            Invite someone else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-5" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Nothing was created">
          {state.message}
        </Alert>
      )}

      <Field label="Full name" htmlFor="name" required error={state.errors?.name}>
        <Input id="name" name="name" defaultValue={v.name} autoComplete="off" />
      </Field>

      <Field
        label="Email address"
        htmlFor="email"
        required
        error={state.errors?.email}
        hint="Their sign-in, and where the invitation goes."
      >
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={v.email}
          autoComplete="off"
          icon={<Mail />}
        />
      </Field>

      <Field label="Institution" htmlFor="affiliation" optional>
        <Input id="affiliation" name="affiliation" defaultValue={v.affiliation} />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">
          Roles <span className="text-danger">*</span>
        </legend>
        {state.errors?.roles && (
          <p className="mt-1 text-xs text-danger">{state.errors.roles}</p>
        )}
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {ROLES.map((role) => {
            const allowed = grantable.includes(role);
            return (
              <li key={role}>
                <label
                  className={
                    allowed
                      ? "flex cursor-pointer items-start gap-2.5 rounded-lg border border-brand-border p-3 text-sm transition-colors hover:border-brand hover:bg-brand-tint/40 has-[:checked]:border-brand has-[:checked]:bg-brand-tint/60"
                      : "flex items-start gap-2.5 rounded-lg border border-dashed p-3 text-sm opacity-60"
                  }
                >
                  <Checkbox name="roles" value={role} disabled={!allowed} />
                  <span className="min-w-0">
                    <span className="block font-medium">{ROLE_LABELS[role]}</span>
                    {!allowed && (
                      <span className="block text-xs text-muted-foreground">
                        Not yours to grant
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t pt-5">
        <CreateButton />
        <p className="text-xs text-muted-foreground">
          Written to the{" "}
          <Link href="/admin/audit-log" className="underline">
            audit log
          </Link>{" "}
          with your name against it.
        </p>
      </div>
    </form>
  );
}

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <UserPlus className="size-4" aria-hidden />
      {pending ? "Creating…" : "Create and send invitation"}
    </Button>
  );
}
