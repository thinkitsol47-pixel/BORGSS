import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth/require-role";
import { getEditorialIssueById, issueLabel } from "@/lib/api/editorial";
import { PortalPage } from "@/components/layout/portal-page";
import { IssueForm } from "@/components/portal/issue-form";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Edit issue" };

export default async function Page({
  params,
}: {
  params: { issueId: string };
}) {
  await requireGroup("editorial");

  const issue = await getEditorialIssueById(params.issueId);
  if (!issue) notFound();

  return (
    <PortalPage
      title={`Edit ${issueLabel(issue)}`}
      lead="Change the issue's identity, target date and state."
      breadcrumb={[
        { title: "Issues", href: "/editorial/issues" },
        { title: issueLabel(issue), href: `/editorial/issues/${issue.id}` },
      ]}
    >
      {issue.state === "published" && (
        <Alert tone="warning" title="This issue is already published">
          Its volume, number and year appear in the citation of every article it
          carries, and those citations are in other people&rsquo;s bibliographies
          now. Changing them here would not change them there.
        </Alert>
      )}

      <div className="mt-8">
        <IssueForm issue={issue} />
      </div>
    </PortalPage>
  );
}
