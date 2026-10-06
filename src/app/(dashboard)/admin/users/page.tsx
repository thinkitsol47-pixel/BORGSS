import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, UserX } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { listUsers, type UserSort } from "@/lib/api/admin";
import {
  assignableRoles,
  isSuperAdmin,
  ROLE_LABELS,
  ROLES,
  type Role,
} from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { UserFilters } from "@/components/portal/user-filters";
import { UserRowActions } from "@/components/portal/user-row-actions";
import {
  Alert,
  Badge,
  EmptyState,
  Pagination,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AccountStatus, UserAccount } from "@/types";

export const metadata: Metadata = { title: "Users" };

const SORTS: UserSort[] = ["name", "recent", "created", "roles"];
const STATUSES: AccountStatus[] = ["active", "invited", "suspended"];

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
    page?: string;
  };
}) {
  const actor = await requireGroup("adminOnly");

  const q = searchParams?.q?.trim() || undefined;
  const role = ROLES.includes(searchParams?.role as Role)
    ? (searchParams?.role as Role)
    : undefined;
  const status = STATUSES.includes(searchParams?.status as AccountStatus)
    ? (searchParams?.status as AccountStatus)
    : undefined;
  const sort = SORTS.includes(searchParams?.sort as UserSort)
    ? (searchParams?.sort as UserSort)
    : "name";
  const page = Number(searchParams?.page) || 1;

  const { items, total, page: current, totalPages, stats } = await listUsers({
    q,
    role,
    status,
    sort,
    page,
  });

  // What *this* administrator may grant. The screen states the limit rather
  // than quietly shortening a dropdown, because an admin who cannot find
  // `admin` in a list will assume the page is broken.
  const grantable = assignableRoles(actor.roles);
  const withheld = ROLES.filter((r) => !grantable.includes(r));

  // An ordinary administrator may not suspend an administrator, for the same
  // reason they may not revoke the role: suspension removes access just as
  // completely, and would be the escalation by another route.
  const actorIsSuper = isSuperAdmin(actor.roles);
  const isProtected = (u: UserAccount) =>
    !actorIsSuper && u.roles.some((r) => r === "superAdmin" || r === "admin");

  const filtered = Boolean(q || role || status);

  return (
    <PortalPage
      title="Users"
      lead="Every account on the platform, and the roles each one holds."
      actions={
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-dark bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark"
        >
          <UserPlus className="size-4" aria-hidden />
          New account
        </Link>
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Accounts" value={stats.total} href="/admin/users" />
        <Stat
          label="Active"
          value={stats.active}
          href="/admin/users?status=active"
        />
        <Stat
          label="Invited"
          value={stats.invited}
          href="/admin/users?status=invited"
        />
        <Stat
          label="Suspended"
          value={stats.suspended}
          href="/admin/users?status=suspended"
          tone={stats.suspended > 0 ? "warning" : "plain"}
        />
      </dl>

      {/* The point of the phase, stated on screen. `assignableRoles()` stops
          an ordinary admin granting `admin` or `superAdmin`; if the rule only
          lived in a filtered dropdown, nobody would know it existed. */}
      {withheld.length > 0 && (
        <div className="mt-6">
          <Alert tone="info" title="Some roles are not yours to grant">
            You can assign{" "}
            <span className="font-medium">{grantable.length}</span> of the{" "}
            {ROLES.length} roles. Withheld from your account:{" "}
            <span className="font-medium">
              {withheld.map((r) => ROLE_LABELS[r]).join(", ")}
            </span>
            . Only a super administrator grants the administrator roles — it is
            what stops an administrator promoting themselves or removing the
            accounts that outrank them.{" "}
            <Link href="/admin/roles" className="font-medium underline">
              See the full role matrix
            </Link>
            .
          </Alert>
        </div>
      )}

      <div className="mt-6">
        <UserFilters q={q} role={role} status={status} sort={sort} />
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={UserX}
            title={
              filtered ? "No accounts match those filters" : "No accounts yet"
            }
            description={
              filtered
                ? "Try a different role or status, or clear the filters."
                : "Nobody has an account on this platform."
            }
            action={
              filtered ? { label: "Clear filters", href: "/admin/users" } : undefined
            }
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            {total} {total === 1 ? "account" : "accounts"}
            {filtered && " matching"}
          </p>

          {/* Cards below md, table from md up. */}
          <ul className="mt-3 space-y-3 md:hidden">
            {items.map((user) => (
              <li key={user.id}>
                <UserCard
                  user={user}
                  isMe={user.id === actor.id}
                  isProtected={isProtected(user)}
                />
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden md:block">
            <Table caption="Accounts: name, roles, status, last active, joined and the actions available">
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Roles</TH>
                  <TH>Status</TH>
                  <TH>Last active</TH>
                  <TH>Joined</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((user) => (
                  <TR key={user.id}>
                    <TD>
                      <p className="font-medium">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {user.name}
                        </Link>
                        {user.id === actor.id && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 break-all text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      {user.affiliation && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {user.affiliation}
                        </p>
                      )}
                    </TD>
                    <TD>
                      <RoleChips roles={user.roles} />
                    </TD>
                    <TD>
                      <StatusChip status={user.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">
                      {/* An account that has never signed in says so. A dash
                          would read as missing data rather than as a fact. */}
                      {user.lastActiveAt ? formatDate(user.lastActiveAt) : "Never"}
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TD>
                    <TD>
                      <UserRowActions
                        userId={user.id}
                        name={user.name}
                        status={user.status}
                        isMe={user.id === actor.id}
                        isProtected={isProtected(user)}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                page={current}
                totalPages={totalPages}
                buildHref={(p) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (role) params.set("role", role);
                  if (status) params.set("status", status);
                  if (sort !== "name") params.set("sort", sort);
                  if (p > 1) params.set("page", String(p));
                  const qs = params.toString();
                  return qs ? `/admin/users?${qs}` : "/admin/users";
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Suspended accounts are explained rather than left as a red chip. */}
      {stats.suspended > 0 && (
        <section aria-labelledby="suspended-heading" className="mt-10">
          <h2 id="suspended-heading" className="font-serif text-lg font-semibold">
            Why suspended accounts are kept
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A suspended account cannot sign in, but it is not deleted. It still
            owns submissions, appears in the decision history of manuscripts it
            was involved in, and may be named in the published record. Deleting
            it would break that record. Every suspension carries a stated
            reason, held against the account.
          </p>
        </section>
      )}

      {/* No standing notice here any more. It said roles and status save —
          which is now simply what the screen does, and saying so on every visit
          is the habit that teaches people to skip these boxes. Creating and
          inviting an account lives on /admin/users/new (since 2026-10-03). */}
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const STATUS_TONE: Record<AccountStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "border-success/30 bg-success/10 text-success",
  },
  invited: {
    label: "Invited",
    className: "border-brand-border bg-brand-tint text-brand-darker",
  },
  suspended: {
    label: "Suspended",
    className: "border-warning/40 bg-warning/10 text-warning",
  },
};

function StatusChip({ status }: { status: AccountStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone.className,
      )}
    >
      {tone.label}
    </span>
  );
}

/**
 * The roles an account holds.
 *
 * The two platform roles are marked, because "Administrator" and "Section
 * Editor" reading identically in a list is exactly how an over-privileged
 * account goes unnoticed.
 */
function RoleChips({ roles }: { roles: Role[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {roles.map((r) => {
        const elevated = r === "superAdmin" || r === "admin";
        return (
          <li key={r}>
            <Badge variant={elevated ? "warning" : "outline"} size="sm">
              {ROLE_LABELS[r]}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

function UserCard({
  user,
  isMe,
  isProtected,
}: {
  user: UserAccount;
  isMe: boolean;
  isProtected: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        user.status === "suspended" && "border-dashed bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            <Link
              href={`/admin/users/${user.id}`}
              className="hover:text-primary hover:underline"
            >
              {user.name}
            </Link>
            {isMe && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (you)
              </span>
            )}
          </p>
          <p className="mt-0.5 break-all text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <StatusChip status={user.status} />
      </div>

      <div className="mt-3">
        <RoleChips roles={user.roles} />
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
        {user.affiliation && (
          <div className="flex gap-1.5">
            <dt className="sr-only">Affiliation</dt>
            <dd className="font-medium text-foreground">{user.affiliation}</dd>
          </div>
        )}
        <div className="flex gap-1.5">
          <dt>Last active</dt>
          <dd className="font-medium text-foreground">
            {user.lastActiveAt ? formatDate(user.lastActiveAt) : "Never"}
          </dd>
        </div>
      </dl>

      {user.suspendedReason && (
        <p className="mt-3 border-t pt-3 text-xs leading-relaxed text-warning">
          {user.suspendedReason}
        </p>
      )}

      {/* The same actions the table row carries. A phone must not be the
          read-only view of the portal. */}
      <div className="mt-3 border-t pt-3">
        <UserRowActions
          userId={user.id}
          name={user.name}
          status={user.status}
          isMe={isMe}
          isProtected={isProtected}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  tone = "plain",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "plain" | "warning";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/40"
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-serif text-2xl font-semibold tabular-nums",
          tone === "warning" && value > 0 && "text-warning",
        )}
      >
        {value}
      </dd>
    </Link>
  );
}
