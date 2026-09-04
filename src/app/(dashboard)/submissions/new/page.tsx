import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { NewSubmissionForm } from "@/components/portal/new-submission-form";

export const metadata: Metadata = { title: "New Submission" };

/**
 * Step 1 of the submission wizard: what is being submitted and where it goes.
 *
 * This page used to be a set of links to the public author guidelines, which
 * was the wrong thing entirely — someone who has clicked "New submission"
 * inside the portal wants a form, not reading. The guidance that is genuinely
 * useful at this point is kept, but as short hints beside the fields rather
 * than as pages to go and read.
 *
 * SCAFFOLD: the action validates and returns; no draft is created yet, because
 * there is no database. The remaining four steps are stubs under `[draftId]`.
 */
export default async function Page() {
  await requireUser();

  return (
    <PortalPage
      title="New submission"
      lead="Start by telling us what you are submitting. You can come back and change any of this before the final step."
    >
      <NewSubmissionForm />
    </PortalPage>
  );
}
