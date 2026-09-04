import type { Metadata } from "next";
import { requireGroup } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { IssueForm } from "@/components/portal/issue-form";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "New issue" };

export default async function Page() {
  await requireGroup("editorial");

  return (
    <PortalPage
      title="New issue"
      lead="Open an issue for accepted manuscripts to be placed into."
      breadcrumb={[{ title: "Issues", href: "/editorial/issues" }]}
    >
      <Alert tone="warning" title="This form does not save yet">
        There is no database, so no issue is created. The editorial office plans
        issues outside the system for now.
      </Alert>

      <div className="mt-8">
        <IssueForm />
      </div>
    </PortalPage>
  );
}
