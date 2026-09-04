import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { getUserById } from "@/lib/api/admin";
import { ROLE_LABELS, type Role } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { UserDangerZone } from "@/components/portal/user-danger-zone";
import { Alert, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AccountStatus } from "@/types";

export const metadata: Metadata = { title: "Account" };

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

export default async function Page({
  params,
}: {
  params: { userId: string };
}) {
  const actor = await requireGroup("adminOnly");

  const user = await getUserById(params.userId);
  if (!user) notFound();

  const tone = STATUS_TONE[user.status];
  const isSelf = user.id === actor.id;

  return (
    <PortalPage
      title={user.name}
      lead={user.email}
      breadcrumb={[{ title: "Users", href: "/admin/users" }]}
      actions={
        <Link
          href={`/admin/users/${user.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-dark bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark"
        >
          <Pencil className="size-4" aria-hidden />
          Edit account
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            tone.className,
          )}
        >
          {tone.label}
        </span>
        {isSelf && (
          <span className="text-xs text-muted-foreground">
            This is your own account
          </span>
        )}
      </div>

      {user.suspendedReason && (
        <div className="mt-6">
          <Alert tone="warning" title="Why this account is suspended">
            {user.suspendedReason}
          </Alert>
        </div>
      )}

      {/* ---------------------------------------------------------- roles */}
      <section aria-labelledby="roles-heading" className="mt-8">
        <h2 id="roles-heading" className="font-serif text-lg font-semibold">
          Roles
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {user.roles.map((r: Role) => {
            const elevated = r === "superAdmin" || r === "admin";
            return (
              <li key={r}>
                <Badge variant={elevated ? "warning" : "outline"}>
                  {ROLE_LABELS[r]}
                </Badge>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link
            href="/admin/roles"
            className="font-medium text-primary hover:underline"
          >
            What each role can do
          </Link>
        </p>
      </section>

      {/* --------------------------------------------------------- details */}
      <section aria-labelledby="details-heading" className="mt-8">
        <h2 id="details-heading" className="font-serif text-lg font-semibold">
          Details
        </h2>
        <dl className="mt-3 divide-y rounded-xl border">
          <Row label="Email" value={user.email} />
          <Row label="Institution" value={user.affiliation} empty="Not stated" />
          <Row label="Country" value={user.country} empty="Not stated" />
          <Row label="ORCID iD" value={user.orcid} empty="Not linked" />
          <Row label="Account created" value={formatDate(user.createdAt)} />
          <Row
            label="Last active"
            // Never a dash: an account that has never signed in is a fact, not
            // missing data.
            value={user.lastActiveAt ? formatDate(user.lastActiveAt) : undefined}
            empty="Never signed in"
          />
        </dl>
      </section>

      <div className="mt-10">
        <UserDangerZone
          name={user.name}
          status={user.status}
          isSelf={isSelf}
        />
      </div>
    </PortalPage>
  );
}

function Row({
  label,
  value,
  empty,
}: {
  label: string;
  value?: string;
  empty?: string;
}) {
  const isEmpty = !value || value.trim() === "";
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 p-4">
      <dt className="text-sm font-medium">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-all text-sm sm:text-right",
          isEmpty ? "italic text-muted-foreground" : "font-medium",
        )}
      >
        {isEmpty ? (empty ?? "Not set") : value}
      </dd>
    </div>
  );
}
