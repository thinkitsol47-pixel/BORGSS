import type { Metadata } from "next";
import { requireGroup } from "@/lib/auth/require-role";
import { assignableRoles } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { UserForm } from "@/components/portal/user-form";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "New account" };

export default async function Page() {
  const actor = await requireGroup("adminOnly");

  return (
    <PortalPage
      title="New account"
      lead="Create an account and send its owner an invitation to set a password."
      breadcrumb={[{ title: "Users", href: "/admin/users" }]}
    >
      <Alert tone="warning" title="This form does not save yet">
        There is no database and no mail provider, so nothing is created and no
        invitation can be sent. The editorial office adds accounts by hand in
        the meantime. The form is here so the interface is settled before the
        backend is written against it.
      </Alert>

      <div className="mt-8">
        <UserForm grantable={assignableRoles(actor.roles)} />
      </div>
    </PortalPage>
  );
}
