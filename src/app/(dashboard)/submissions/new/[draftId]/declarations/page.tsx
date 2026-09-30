import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { getDraftSummary } from "@/lib/api/submissions";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardDeclarationsForm } from "@/components/portal/wizard-declarations-form";

export const metadata: Metadata = { title: "Submission — Declarations" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  const user = await requireUser();

  // Loaded so the step reopens on what is stored. Without this the form
  // rendered empty even for a draft that had already been through it — the
  // same defect the metadata step had.
  const summary = await getDraftSummary(params.draftId, user.id);

  return (
    <WizardShell
      draftId={params.draftId}
      active="declarations"
      title="Declarations"
      lead="Statements you make on behalf of every author. Each one maps to a published policy."
    >
      <WizardDeclarationsForm
        draftId={params.draftId}
        saved={
          summary
            ? {
                aiDisclosure: summary.aiDisclosure,
                dataAvailability: summary.dataAvailability,
                // A draft that has been through this step once already has its
                // timestamp; the five boxes are re-ticked rather than assumed,
                // because a declaration is a claim made now, not a stored flag.
                declared: summary.declaredAt !== null,
              }
            : null
        }
      />
    </WizardShell>
  );
}
