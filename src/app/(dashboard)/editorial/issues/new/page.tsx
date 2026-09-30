import type { Metadata } from "next";
import { requireGroup } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { IssueForm } from "@/components/portal/issue-form";

export const metadata: Metadata = { title: "New issue" };

export default async function Page() {
  await requireGroup("editorial");

  return (
    <PortalPage
      title="New issue"
      lead="Open an issue for accepted manuscripts to be placed into."
      breadcrumb={[{ title: "Issues", href: "/editorial/issues" }]}
    >
      <div className="mt-2">
        <IssueForm />
      </div>
    </PortalPage>
  );
}
