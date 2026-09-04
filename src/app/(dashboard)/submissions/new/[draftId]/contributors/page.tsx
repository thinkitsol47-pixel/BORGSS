import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardContributorsForm } from "@/components/portal/wizard-contributors-form";

export const metadata: Metadata = { title: "Submission — Authors" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  await requireUser();

  return (
    <WizardShell
      draftId={params.draftId}
      active="contributors"
      title="Authors"
      lead="Everyone credited, in the order they should appear, with one corresponding author."
    >
      <WizardContributorsForm draftId={params.draftId} />
    </WizardShell>
  );
}
