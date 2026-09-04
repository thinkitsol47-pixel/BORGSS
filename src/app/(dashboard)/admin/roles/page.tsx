import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ShieldAlert } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { roleHolderCounts } from "@/lib/api/admin";
import {
  assignableRoles,
  PERMISSIONS,
  ROLE_LABELS,
  ROLES,
  type Permission,
  type Role,
} from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { Alert, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Roles & Permissions" };

/**
 * The role matrix, read-only.
 *
 * This screen is documentation of a rule that is enforced elsewhere, and it
 * says so. The matrix is rendered from `PERMISSIONS` in `src/config/roles.ts`
 * rather than being retyped, so it cannot drift: adding a permission to a role
 * changes this page, and a permission with no description here is a visible
 * gap rather than a silent one.
 *
 * The four super-admin permissions are the reason the page exists. They are
 * withheld from `admin` deliberately, and an administrator who cannot see
 * *that* — only that some buttons are missing — will file it as a bug.
 */

/** What each permission actually lets someone do. */
const PERMISSION_DETAIL: Record<Permission, { label: string; detail: string }> = {
  "submission.create": {
    label: "Create submissions",
    detail: "Start and submit a manuscript through the wizard.",
  },
  "submission.viewOwn": {
    label: "View own submissions",
    detail: "See the manuscripts this account submitted, and their status.",
  },
  "submission.viewAll": {
    label: "View all submissions",
    detail:
      "See every manuscript in the workflow, including the author names that reviewers never see.",
  },
  "review.perform": {
    label: "Perform reviews",
    detail: "Accept invitations and return review reports.",
  },
  "review.assign": {
    label: "Assign reviewers",
    detail: "Invite reviewers to a manuscript and see the reviewer database.",
  },
  "decision.make": {
    label: "Record decisions",
    detail:
      "Accept, request revision, or reject a manuscript, and write the letter that goes to the author.",
  },
  "issue.manage": {
    label: "Manage issues",
    detail: "Assemble issues, place accepted manuscripts, and publish.",
  },
  "production.work": {
    label: "Production work",
    detail: "Copyedit, typeset and proofread accepted manuscripts.",
  },
  "users.manage": {
    label: "Manage users",
    detail:
      "Create, invite and suspend accounts, and grant roles — subject to the limit below.",
  },
  "settings.manage": {
    label: "Manage settings",
    detail:
      "Journal settings, sections, review forms, email templates and announcements.",
  },
  "doi.manage": {
    label: "Manage DOIs",
    detail: "Deposit and retry Crossref registrations.",
  },
  "stats.viewAll": {
    label: "View statistics",
    detail: "Journal-wide figures rather than this account's own.",
  },
  "roles.manageAdmins": {
    label: "Grant administrator roles",
    detail:
      "Grant or revoke Administrator and Super Administrator. Withheld from Administrator so that no administrator can promote themselves or remove an account that outranks them.",
  },
  "audit.view": {
    label: "Read the audit log",
    detail:
      "Read the record of who changed what. Withheld from Administrator because an administrator must not be able to inspect — or eventually curate — the log of their own actions.",
  },
  "workflow.override": {
    label: "Override the workflow",
    detail:
      "Force a submission out of a stuck state: reopen a closed round, unlock a decision. Withheld because it bypasses the process the whole platform exists to enforce.",
  },
  "platform.manage": {
    label: "Manage the platform",
    detail:
      "Integration credentials, feature flags, data export and erasure. Withheld because it is the keys to everything, including other people's data.",
  },
};

/** The four deliberately withheld from `admin`. */
const SUPER_ADMIN_ONLY: Permission[] = [
  "roles.manageAdmins",
  "audit.view",
  "workflow.override",
  "platform.manage",
];

/** Ordered so the platform permissions sit together at the end. */
const ORDERED_PERMISSIONS: Permission[] = [
  "submission.create",
  "submission.viewOwn",
  "submission.viewAll",
  "review.perform",
  "review.assign",
  "decision.make",
  "issue.manage",
  "production.work",
  "users.manage",
  "settings.manage",
  "doi.manage",
  "stats.viewAll",
  ...SUPER_ADMIN_ONLY,
];

export default async function Page() {
  const actor = await requireGroup("adminOnly");

  const counts = roleHolderCounts();
  const grantable = assignableRoles(actor.roles);
  const withheld = ROLES.filter((r) => !grantable.includes(r));

  return (
    <PortalPage
      title="Roles & permissions"
      lead="The twelve roles, what each one can do, and which of them you may grant."
    >
      {/* What this administrator may grant, before the matrix. It is the one
          thing on the page that differs by who is reading it. */}
      <Alert
        tone={withheld.length > 0 ? "info" : "warning"}
        title={
          withheld.length > 0
            ? `You may grant ${grantable.length} of the ${ROLES.length} roles`
            : "You may grant every role"
        }
      >
        {withheld.length > 0 ? (
          <>
            Withheld from your account:{" "}
            <span className="font-medium">
              {withheld.map((r) => ROLE_LABELS[r]).join(", ")}
            </span>
            . This is enforced by <code className="font-mono text-[0.9em]">assignableRoles()</code>{" "}
            in the role config, not by hiding a control — the same rule applies
            whether the request comes from this screen or anywhere else.
          </>
        ) : (
          <>
            As a super administrator you can grant any role, including
            Administrator and Super Administrator. That is the only account type
            that can, and it is worth keeping the number of them small.
          </>
        )}
      </Alert>

      {/* ------------------------------------------------------ the matrix */}
      <section aria-labelledby="matrix-heading" className="mt-10">
        <h2 id="matrix-heading" className="font-serif text-lg font-semibold">
          The matrix
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Rendered from the role config rather than retyped, so it cannot fall
          out of step with what the application actually enforces. Roles are
          additive: an account holding three roles has the union of their
          permissions, never less.
        </p>

        {/* A 12×16 grid cannot be made responsive by wrapping. It scrolls
            horizontally inside its own container, which is what the audit
            script requires and what a matrix genuinely needs. */}
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">
              Which permissions each of the twelve roles holds
            </caption>
            <thead>
              <tr className="border-b bg-brand-tint/40">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-brand-tint/40 px-3 py-2.5 text-left text-xs font-semibold"
                >
                  Permission
                </th>
                {ROLES.map((r) => (
                  <th
                    key={r}
                    scope="col"
                    className="px-2 py-2.5 text-center text-[11px] font-semibold"
                  >
                    {/* Vertical text would be unreadable; short labels wrap. */}
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDERED_PERMISSIONS.map((p) => {
                const isSuperOnly = SUPER_ADMIN_ONLY.includes(p);
                return (
                  <tr
                    key={p}
                    className={cn(
                      "border-b last:border-0",
                      isSuperOnly && "bg-warning/5",
                    )}
                  >
                    <th
                      scope="row"
                      className={cn(
                        "sticky left-0 z-10 bg-background px-3 py-2.5 text-left text-xs font-medium",
                        isSuperOnly && "bg-warning/5",
                      )}
                    >
                      {PERMISSION_DETAIL[p].label}
                      {isSuperOnly && (
                        <ShieldAlert
                          className="ml-1.5 inline size-3.5 text-warning"
                          aria-label="Super administrator only"
                        />
                      )}
                    </th>
                    {ROLES.map((r) => {
                      const held = PERMISSIONS[r].includes(p);
                      return (
                        <td key={r} className="px-2 py-2.5 text-center">
                          {/* Both states are icons with text alternatives —
                              a blank cell reads as "not filled in". */}
                          {held ? (
                            <>
                              <Check
                                className="mx-auto size-4 text-success"
                                aria-hidden
                              />
                              <span className="sr-only">Yes</span>
                            </>
                          ) : (
                            <>
                              <Minus
                                className="mx-auto size-3.5 text-muted-foreground/40"
                                aria-hidden
                              />
                              <span className="sr-only">No</span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* -------------------------------------------- the four, in full */}
      <section aria-labelledby="withheld-heading" className="mt-10">
        <h2 id="withheld-heading" className="font-serif text-lg font-semibold">
          The four permissions withheld from Administrator
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A Super Administrator is not simply an administrator with more
          switches. These four are the ones an administrator must not hold, each
          for its own reason — and each reason is worth reading before the
          separation is dismissed as bureaucracy.
        </p>
        <dl className="mt-4 divide-y rounded-xl border">
          {SUPER_ADMIN_ONLY.map((p) => (
            <div key={p} className="p-4">
              <dt className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldAlert className="size-4 shrink-0 text-warning" aria-hidden />
                {PERMISSION_DETAIL[p].label}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {PERMISSION_DETAIL[p].detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------------------------------------------- role summary */}
      <section aria-labelledby="roles-heading" className="mt-10">
        <h2 id="roles-heading" className="font-serif text-lg font-semibold">
          The twelve roles
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How many accounts hold each, and whether you may grant it.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <li key={r} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ROLE_LABELS[r]}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {PERMISSIONS[r].length}{" "}
                    {PERMISSIONS[r].length === 1 ? "permission" : "permissions"}
                    {" · "}
                    {/* Zero holders is a real answer, not a blank. */}
                    {counts[r] ?? 0}{" "}
                    {(counts[r] ?? 0) === 1 ? "account" : "accounts"}
                  </p>
                </div>
                {grantable.includes(r) ? (
                  <Badge variant="outline" size="sm">
                    You may grant
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Not yours to grant
                  </Badge>
                )}
              </div>
              {(counts[r] ?? 0) > 0 && (
                <p className="mt-3 border-t pt-3 text-xs">
                  <Link
                    href={`/admin/users?role=${r}`}
                    className="font-medium text-primary hover:underline"
                  >
                    See who holds it
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Alert tone="warning" title="The matrix is not editable" className="mt-10">
        Roles and permissions are defined in{" "}
        <code className="font-mono text-[0.9em]">src/config/roles.ts</code> and
        changed by editing that file and deploying — not from this screen.
        That is deliberate for now: a permission matrix editable through a web
        form is a way to lock everyone out of a journal, and it needs an audit
        trail and a recovery path before it is worth having.
      </Alert>
    </PortalPage>
  );
}
