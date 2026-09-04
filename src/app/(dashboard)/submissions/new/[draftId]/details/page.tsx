import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Submission — Details" };

/**
 * Step 1 of the wizard.
 *
 * The real screen is at `/submissions/new`, because it is the step that would
 * create the draft and therefore has no `draftId` of its own yet. This route
 * exists so the wizard's step URLs are complete and a "back" from step 2
 * cannot 404; it forwards rather than duplicating the form.
 */
export default function Page() {
  redirect("/submissions/new");
}
