import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortalPage } from "@/components/layout/portal-page";
import { WizardSteps, type WizardStepId } from "./wizard-steps";
import { Alert } from "@/components/ui";

/**
 * Wrapper for wizard steps 2–6.
 *
 * Step 1 lives at `/submissions/new` and does not use this, because it has no
 * draft id yet — it is the screen that would create one.
 *
 * Every step carries the same standing notice. The wizard cannot save a draft
 * without a database, so a step validates its own fields and stops; nothing
 * carries forward to the next screen. Saying that on each step is better than
 * letting someone fill in five screens and discover it at the end.
 */
export function WizardShell({
  draftId,
  active,
  title,
  lead,
  children,
}: {
  draftId: string;
  active: WizardStepId;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <PortalPage title={title} lead={lead}>
      <div className="max-w-3xl">
        <Link
          href="/submissions/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Start of the submission
        </Link>

        <div className="mt-5">
          <WizardSteps draftId={draftId} active={active} />
        </div>

        <div className="mt-6">
          <Alert tone="warning" title="Drafts are not saved yet">
            The portal has no database, so nothing you enter here is stored and
            nothing carries to the next step. Each screen shows what the real
            step will ask for and checks that your answers are valid.
          </Alert>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </PortalPage>
  );
}
