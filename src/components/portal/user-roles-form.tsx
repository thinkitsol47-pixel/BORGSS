"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Save, ShieldAlert } from "lucide-react";
import {
  saveUserRoles,
  type UserAdminState,
} from "@/app/(dashboard)/admin/users/actions";
import { Alert, Button, Checkbox } from "@/components/ui";
import { ROLE_LABELS, ROLES, type Role } from "@/config/roles";

const initialState: UserAdminState = { status: "idle" };

/**
 * Grant and revoke the roles an account holds.
 *
 * Its own form, separate from status, because they are separate decisions with
 * separate rules: an ordinary administrator may change ten roles on an ordinary
 * account, and may change nothing at all on an administrator's. One combined
 * form would have to refuse the whole submission over either half.
 *
 * **The withheld roles render, disabled and labelled.** A dropdown that quietly
 * omits `admin` teaches an administrator that the page is broken; a checkbox
 * marked "Not yours to grant" teaches them the rule. The server refuses them
 * regardless — a disabled checkbox is a courtesy to the reader, never the
 * guard, since a form post is trivially forged.
 */
export function UserRolesForm({
  userId,
  current,
  grantable,
  /** True when this is the only account holding `superAdmin`. */
  isLastSuperAdmin,
}: {
  userId: string;
  current: Role[];
  grantable: Role[];
  isLastSuperAdmin: boolean;
}) {
  const [state, formAction] = useFormState(saveUserRoles, initialState);
  const [roles, setRoles] = useState<Role[]>(current);

  const withheld = ROLES.filter((r) => !grantable.includes(r));
  const changed =
    roles.length !== current.length || roles.some((r) => !current.includes(r));

  function toggle(role: Role) {
    setRoles((now) =>
      now.includes(role) ? now.filter((r) => r !== role) : [...now, role],
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="userId" value={userId} />

      {state.status === "success" && (
        <Alert tone="success" title="Roles updated">
          {state.message}
        </Alert>
      )}
      {state.status === "error" && (
        <Alert tone="danger" title="Nothing was changed">
          {state.message ?? state.errors?.roles ?? "Please check the form."}
        </Alert>
      )}

      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Roles are additive: an account holding three has the union of their
        permissions, never less. Most people need one or two — author and
        reviewer is the common pair.
      </p>

      {withheld.length > 0 && (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {withheld.map((r) => ROLE_LABELS[r]).join(" and ")} cannot be
            granted or revoked from your account — that is what stops an
            administrator promoting themselves.{" "}
            <Link
              href="/admin/roles"
              className="font-medium text-primary hover:underline"
            >
              See the full matrix
            </Link>
          </span>
        </p>
      )}

      {/* The lockout warning, stated before the box is unticked rather than
          after the save is refused. */}
      {isLastSuperAdmin && (
        <Alert tone="warning" title="This is the last super administrator">
          Removing that role would leave nobody able to grant it back, so the
          platform could not be recovered. Appoint another super administrator
          first; until then this change is refused.
        </Alert>
      )}

      <fieldset>
        <legend className="sr-only">Roles held by this account</legend>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ROLES.map((role) => {
            const allowed = grantable.includes(role);
            const checked = roles.includes(role);
            return (
              <li key={role}>
                <label
                  className={
                    allowed
                      ? "flex cursor-pointer items-start gap-2.5 rounded-lg border border-brand-border p-3 text-sm transition-colors hover:border-brand hover:bg-brand-tint/40 has-[:checked]:border-brand has-[:checked]:bg-brand-tint/60"
                      : "flex items-start gap-2.5 rounded-lg border border-dashed p-3 text-sm opacity-60"
                  }
                >
                  <Checkbox
                    name="roles"
                    value={role}
                    checked={checked}
                    disabled={!allowed}
                    onChange={() => toggle(role)}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {ROLE_LABELS[role]}
                    </span>
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

      {roles.length === 0 && (
        <p className="text-sm text-warning">
          An account needs at least one role. With none it can sign in and see
          nothing, which reads as a broken account rather than a configured one.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t pt-5">
        <SaveButton disabled={roles.length === 0 || !changed} />
        {changed && roles.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Every change is written to the{" "}
            <Link href="/admin/audit-log" className="underline">
              audit log
            </Link>{" "}
            with your name against it.
          </p>
        )}
      </div>
    </form>
  );
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Saving…
        </>
      ) : (
        <>
          <Save className="size-4" aria-hidden />
          Save roles
        </>
      )}
    </Button>
  );
}
