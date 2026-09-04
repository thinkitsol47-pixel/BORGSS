"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  Button,
  Checkbox,
  Field,
  Input,
  Select,
} from "@/components/ui";
import { ROLE_LABELS, type Role } from "@/config/roles";
import { COUNTRIES } from "@/config/countries";
import type { AccountStatus, UserAccount } from "@/types";

/**
 * Create or edit an account.
 *
 * One form for both, because the fields are identical and two copies would
 * drift. What differs is the heading, the submit label, and whether the email
 * can be changed — an address is the account's identity, and changing it on an
 * existing account is a different operation from correcting a typo at creation
 * (it needs re-verification, and it breaks every link in past correspondence).
 *
 * UI ONLY. Nothing is saved: there is no database. The form validates in the
 * browser and stops, and says so above the buttons rather than after a click.
 */
export function UserForm({
  user,
  /** Roles this administrator may grant; the rest render disabled with a note. */
  grantable,
}: {
  user?: UserAccount;
  grantable: Role[];
}) {
  const isEdit = Boolean(user);

  const [roles, setRoles] = useState<Role[]>(user?.roles ?? ["author"]);
  const [status, setStatus] = useState<AccountStatus>(user?.status ?? "invited");
  const [error, setError] = useState<string | null>(null);

  const withheld = (Object.keys(ROLE_LABELS) as Role[]).filter(
    (r) => !grantable.includes(r),
  );

  function toggleRole(role: Role) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The one check the browser cannot do for us: an account with no role can
    // sign in and see nothing, which looks like a broken account rather than a
    // misconfigured one.
    if (roles.length === 0) {
      setError("An account needs at least one role.");
      return;
    }
    setError(null);
    // Nothing else happens. There is nowhere to save this.
    alert(
      "Nothing was saved — there is no database yet.\n\nThis form is the interface for account management; the backend that stores it has not been built.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert tone="danger" title="Cannot continue">
          {error}
        </Alert>
      )}

      {/* --------------------------------------------------------- person */}
      <section>
        <h2 className="font-serif text-lg font-semibold">The person</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name}
              placeholder="Dr. Ayesha Khan"
              required
            />
          </Field>

          <Field
            label="Email address"
            htmlFor="email"
            required
            hint={
              isEdit
                ? "Changing this would need re-verification — not editable here."
                : "The invitation is sent here, and it is how they sign in."
            }
          >
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email}
              placeholder="a.khan@example.edu"
              required
              // An address is the account's identity. Correcting a typo at
              // creation is one thing; changing it later is a different
              // operation and belongs behind its own confirmation.
              readOnly={isEdit}
              className={isEdit ? "bg-muted/40" : undefined}
            />
          </Field>

          <Field label="Institution" htmlFor="affiliation">
            <Input
              id="affiliation"
              name="affiliation"
              defaultValue={user?.affiliation}
              placeholder="Institute of Business Administration"
            />
          </Field>

          {/* Free text with a datalist, matching every other country field on
              the site: nobody is blocked by a name or territory the list gets
              wrong, but typing completes to the canonical spelling. */}
          <Field label="Country" htmlFor="country">
            <Input
              id="country"
              name="country"
              defaultValue={user?.country}
              list="country-options"
              placeholder="Pakistan"
            />
            <datalist id="country-options">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field
            label="ORCID iD"
            htmlFor="orcid"
            optional
            hint="Typing an iD is a claim, not proof — the real flow signs in at orcid.org."
            className="sm:col-span-2"
          >
            <Input
              id="orcid"
              name="orcid"
              defaultValue={user?.orcid}
              placeholder="0000-0002-1825-0097"
            />
          </Field>
        </div>
      </section>

      {/* ---------------------------------------------------------- roles */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Roles</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Roles are additive: an account holding three has the union of their
          permissions, never less. Most people need one or two — author and
          reviewer is the common pair.
        </p>

        {withheld.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {withheld.map((r) => ROLE_LABELS[r]).join(" and ")} cannot be
            granted from your account.{" "}
            <Link href="/admin/roles" className="font-medium text-primary hover:underline">
              Why
            </Link>
          </p>
        )}

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => {
            const allowed = grantable.includes(role);
            const checked = roles.includes(role);
            return (
              <li key={role}>
                <label
                  className={
                    allowed
                      ? "flex cursor-pointer items-center gap-2.5 rounded-lg border border-brand-border p-3 text-sm transition-colors hover:border-brand hover:bg-brand-tint/40 has-[:checked]:border-brand has-[:checked]:bg-brand-tint/60"
                      : "flex items-center gap-2.5 rounded-lg border border-dashed p-3 text-sm opacity-60"
                  }
                >
                  <Checkbox
                    name="roles"
                    value={role}
                    checked={checked}
                    disabled={!allowed}
                    onChange={() => toggleRole(role)}
                  />
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
      </section>

      {/* --------------------------------------------------------- status */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Status</h2>
        <div className="mt-3 max-w-sm">
          <Field label="Account status" htmlFor="status">
            <Select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
            >
              <option value="invited">Invited — has not set a password</option>
              <option value="active">Active — can sign in</option>
              <option value="suspended">Suspended — cannot sign in</option>
            </Select>
          </Field>
        </div>

        {/* A suspension without a stated reason is what an appeal has nothing
            to argue against, so the field appears the moment it is chosen. */}
        {status === "suspended" && (
          <div className="mt-4">
            <Field
              label="Reason for suspension"
              htmlFor="suspendedReason"
              required
              hint="Held against the account. A suspension nobody can explain later is not defensible."
            >
              <textarea
                id="suspendedReason"
                name="suspendedReason"
                rows={3}
                defaultValue={user?.suspendedReason}
                required
                className="w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </Field>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              Suspending does not delete. The account keeps its submissions and
              stays in the decision history of manuscripts it touched.
            </p>
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- actions */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit">
          {isEdit ? "Save changes" : "Create account"}
        </Button>
        <Button href="/admin/users" variant="outline">
          Cancel
        </Button>
        <p className="text-xs text-muted-foreground">
          Nothing is saved yet — there is no database.
        </p>
      </div>
    </form>
  );
}
