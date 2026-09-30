import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { getDraftSummary } from "@/lib/api/submissions";
import { WizardShell } from "@/components/portal/wizard-shell";
import { WizardMetadataForm } from "@/components/portal/wizard-metadata-form";

export const metadata: Metadata = { title: "Submission — Metadata" };

export default async function Page({
  params,
}: {
  params: { draftId: string };
}) {
  const user = await requireUser();

  /**
   * The draft is loaded so the form opens on what is already stored.
   *
   * It used to render the form with nothing but the id, so an author who set a
   * title on step 1 — and whose title *was* saved — arrived here to an empty
   * Title box and reasonably concluded the wizard had lost it. Step 1 writes
   * the title, and every step after this one writes its own fields, so the
   * only thing missing was reading them back.
   *
   * Null covers three cases the author cannot tell apart and does not need to:
   * no such draft, someone else's draft, and one already submitted. The form
   * simply opens empty, and the action refuses the write for the same reason.
   */
  const summary = await getDraftSummary(params.draftId, user.id);

  return (
    <WizardShell
      draftId={params.draftId}
      active="metadata"
      title="Metadata"
      lead="What indexing services, search engines and readers see before they open the article."
    >
      <WizardMetadataForm
        draftId={params.draftId}
        saved={
          summary
            ? {
                title: summary.title,
                abstract: summary.abstract,
                keywords: summary.keywords,
                funding: summary.funding,
                conflictOfInterest: summary.conflictOfInterest,
              }
            : null
        }
      />
    </WizardShell>
  );
}
