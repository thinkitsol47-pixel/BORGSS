import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getReviewerPoolEntry,
  getUserById,
  isLastSuperAdmin,
} from "@/lib/api/admin";
import { listActiveSections } from "@/lib/api/sections";
import { assignableRoles, isSuperAdmin } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { UserRolesForm } from "@/components/portal/user-roles-form";
import { UserStatusForm } from "@/components/portal/user-status-form";
import { ReviewerPoolForm } from "@/components/portal/reviewer-pool-form";
import { givenNameOf } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit account" };

export default async function Page({
  params,
}: {
  params: { userId: string };
}) {
  const actor = await requireGroup("adminOnly");

  const user = await getUserById(params.userId);
  if (!user) notFound();

  const [lastSuperAdmin, poolEntry, sections] = await Promise.all([
    isLastSuperAdmin(user.id),
    getReviewerPoolEntry(user.id),
    listActiveSections(),
  ]);

  // An ordinary administrator may not change an administrator's status, for
  // the same reason they may not revoke the role: suspension removes access
  // just as completely.
  const isProtected =
    !isSuperAdmin(actor.roles) &&
    user.roles.some((r) => r === "superAdmin" || r === "admin");

  return (
    <PortalPage
      title={`Edit ${user.name}`}
      lead={`The roles this account holds, and whether it can sign in. Name, institution, country and ORCID iD are ${givenNameOf(user.name)}'s own to change on their profile; the email address is the login itself and cannot be changed here at all.`}
      breadcrumb={[
        { title: "Users", href: "/admin/users" },
        { title: user.name, href: `/admin/users/${user.id}` },
      ]}
    >
      {/* In the lead now. The point stands — someone else's details are theirs
          to change, not an administrator's — but it is read before the form
          rather than in a box above it. */}
      <section aria-labelledby="roles-heading" className="mt-2">
        <h2 id="roles-heading" className="font-serif text-lg font-semibold">
          Roles
        </h2>
        <div className="mt-4">
          <UserRolesForm
            userId={user.id}
            current={user.roles}
            grantable={assignableRoles(actor.roles)}
            isLastSuperAdmin={lastSuperAdmin}
          />
        </div>
      </section>

      {/* The pool sits between roles and status deliberately: it is the step
          that follows granting `reviewer`, and until this screen existed
          nothing performed it. An account could hold the role for months and
          never appear on a single editor's shortlist. */}
      <section aria-labelledby="pool-heading" className="mt-12 border-t pt-8">
        <h2 id="pool-heading" className="font-serif text-lg font-semibold">
          Reviewer pool
        </h2>
        <div className="mt-4">
          <ReviewerPoolForm
            userId={user.id}
            name={user.name}
            inPool={poolEntry !== null}
            expertise={poolEntry?.expertise ?? []}
            sections={poolEntry?.sections ?? []}
            note={poolEntry?.note}
            allSections={sections.map((s) => s.name)}
            hasReviewerRole={user.roles.includes("reviewer")}
          />
        </div>
      </section>

      <section aria-labelledby="status-heading" className="mt-12 border-t pt-8">
        <h2 id="status-heading" className="font-serif text-lg font-semibold">
          Status
        </h2>
        <div className="mt-4">
          <UserStatusForm
            userId={user.id}
            name={user.name}
            current={user.status}
            currentReason={user.suspendedReason}
            isMe={user.id === actor.id}
            isProtected={isProtected}
          />
        </div>
      </section>

      <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
        Every change made here is written to the{" "}
        <Link href="/admin/audit-log" className="font-medium underline">
          audit log
        </Link>{" "}
        with your name against it — a role granted without a record of who
        granted it is exactly what that log exists to prevent.
      </p>
    </PortalPage>
  );
}
