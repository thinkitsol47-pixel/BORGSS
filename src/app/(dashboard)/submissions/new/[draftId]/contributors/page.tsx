import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { getDraftContributors } from "@/lib/api/submissions";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardContributorsForm } from "@/components/portal/wizard-contributors-form";

export const metadata: Metadata = { title: "Submission — Authors" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  const user = await requireUser();

  // The stored author list, in order, so revisiting this step shows the names
  // already entered rather than one blank row. `getDraftContributors` is its
  // own loader because a form needs the given and family names apart, plus the
  // email and ORCID that the review screen's summary has no use for.
  const saved = await getDraftContributors(params.draftId, user.id);

  return (
    <WizardShell
      draftId={params.draftId}
      active="contributors"
      title="Authors"
      lead="Everyone credited, in the order they should appear, with one corresponding author."
    >
      <WizardContributorsForm draftId={params.draftId} saved={saved} />
    </WizardShell>
  );
}
