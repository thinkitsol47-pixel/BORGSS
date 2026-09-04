import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardReviewForm } from "@/components/portal/wizard-review-form";

export const metadata: Metadata = { title: "Submission — Review & Submit" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  await requireUser();

  return (
    <WizardShell
      draftId={params.draftId}
      active="review"
      title="Review and submit"
      lead="The last look before the editorial office sees it. Nothing is sent until you submit."
    >
      <WizardReviewForm draftId={params.draftId} />
    </WizardShell>
  );
}
