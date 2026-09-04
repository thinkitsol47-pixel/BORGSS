import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth/require-role";
import { getUserById } from "@/lib/api/admin";
import { assignableRoles } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { UserForm } from "@/components/portal/user-form";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Edit account" };

export default async function Page({
  params,
}: {
  params: { userId: string };
}) {
  const actor = await requireGroup("adminOnly");

  const user = await getUserById(params.userId);
  if (!user) notFound();

  return (
    <PortalPage
      title={`Edit ${user.name}`}
      lead="Change the details and roles held by this account."
      breadcrumb={[
        { title: "Users", href: "/admin/users" },
        { title: user.name, href: `/admin/users/${user.id}` },
      ]}
    >
      <Alert tone="warning" title="This form does not save yet">
        There is no database, so no change made here is stored. When the backend
        lands, every change on this screen will also write an entry to the audit
        log — a role granted without a record of who granted it is exactly what
        that log exists to prevent.
      </Alert>

      <div className="mt-8">
        <UserForm user={user} grantable={assignableRoles(actor.roles)} />
      </div>
    </PortalPage>
  );
}
