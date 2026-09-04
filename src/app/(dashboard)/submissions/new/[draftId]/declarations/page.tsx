import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardDeclarationsForm } from "@/components/portal/wizard-declarations-form";

export const metadata: Metadata = { title: "Submission — Declarations" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  await requireUser();

  return (
    <WizardShell
      draftId={params.draftId}
      active="declarations"
      title="Declarations"
      lead="Statements you make on behalf of every author. Each one maps to a published policy."
    >
      <WizardDeclarationsForm draftId={params.draftId} />
    </WizardShell>
  );
}
