import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardFilesForm } from "@/components/portal/wizard-files-form";

export const metadata: Metadata = { title: "Submission — Files" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  await requireUser();

  return (
    <WizardShell
      draftId={params.draftId}
      active="upload"
      title="Files"
      lead="The manuscript itself, and the title page that keeps your name off it."
    >
      <WizardFilesForm draftId={params.draftId} />
    </WizardShell>
  );
}
