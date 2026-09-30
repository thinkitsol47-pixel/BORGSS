import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { getDraftSummary } from "@/lib/api/submissions";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardReviewForm } from "@/components/portal/wizard-review-form";

export const metadata: Metadata = { title: "Submission — Review & Submit" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  const user = await requireUser();

  // Null covers three cases the author cannot tell apart and does not need to:
  // no such draft, someone else's draft, and one already submitted. The form
  // renders the same "cannot be opened" state for all three.
  const summary = await getDraftSummary(params.draftId, user.id);

  return (
    <WizardShell
      draftId={params.draftId}
      active="review"
      title="Review and submit"
      lead="The last look before the editorial office sees it. Nothing is sent until you submit."
    >
      <WizardReviewForm draftId={params.draftId} summary={summary} />
    </WizardShell>
  );
}
