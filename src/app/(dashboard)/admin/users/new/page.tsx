import type { Metadata } from "next";
import { requireGroup } from "@/lib/auth/require-role";
import { assignableRoles } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { NewUserForm } from "@/components/portal/new-user-form";

export const metadata: Metadata = { title: "New account" };

/**
 * Create an account for someone and email them an invitation (2026-10-03).
 *
 * For people the office brings in — a section editor, a board member, a
 * reviewer recruited by hand. Anyone can still register themselves at
 * /register; this is for roles registration does not grant.
 */
export default async function Page() {
  const actor = await requireGroup("adminOnly");

  return (
    <PortalPage
      title="New account"
      lead="Create an account and email its holder an invitation. They set their own password — nobody else ever knows it — and the account reads Invited until they do."
      breadcrumb={[{ title: "Users", href: "/admin/users" }]}
    >
      <div className="mt-2">
        <NewUserForm grantable={assignableRoles(actor.roles)} />
      </div>
    </PortalPage>
  );
}
