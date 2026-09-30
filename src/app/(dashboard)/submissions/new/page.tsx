import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { NewSubmissionForm } from "@/components/portal/new-submission-form";
import { listActiveSections } from "@/lib/api/sections";

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
 * The action creates the draft and redirects to step 2 with its id. The
 * section list comes from the `Section` registry rather than a constant, so an
 * author is never offered a subject area the submission cannot be filed under.
 */
export default async function Page() {
  await requireUser();

  const sections = await listActiveSections();

  return (
    <PortalPage
      title="New submission"
      lead="Start by telling us what you are submitting. You can come back and change any of this before the final step."
    >
      <NewSubmissionForm sections={sections.map((s) => s.name)} />
    </PortalPage>
  );
}
