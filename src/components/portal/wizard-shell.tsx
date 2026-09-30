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
 * There is no standing notice any more: each step writes to the draft row as
 * the author goes, so work carries forward and the manuscript only leaves
 * their hands at step 6.
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

        {/* No standing notice: each step saves to the draft as you go, and
            the manuscript is only submitted at step 6. */}
        <div className="mt-8">{children}</div>
      </div>
    </PortalPage>
  );
}
