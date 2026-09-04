import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardMetadataForm } from "@/components/portal/wizard-metadata-form";

export const metadata: Metadata = { title: "Submission — Metadata" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  await requireUser();

  return (
    <WizardShell
      draftId={params.draftId}
      active="metadata"
      title="Metadata"
      lead="What indexing services, search engines and readers see before they open the article."
    >
      <WizardMetadataForm draftId={params.draftId} />
    </WizardShell>
  );
}
