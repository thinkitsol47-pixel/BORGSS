import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Progress rail for the five-step submission wizard.
 *
 * Shows where the author is and what is still to come, because a form split
 * across five screens with no map is where people abandon a submission.
 * Completed steps link back; steps ahead are not links, since a draft has to
 * be filled in order for the later steps to have anything to validate.
 */
export const WIZARD_STEPS = [
  { id: "details", label: "Details", hint: "Type and section" },
  { id: "upload", label: "Files", hint: "Manuscript and title page" },
  { id: "metadata", label: "Metadata", hint: "Title, abstract, keywords" },
  { id: "contributors", label: "Authors", hint: "Co-authors and ORCID" },
  { id: "declarations", label: "Declarations", hint: "Ethics and consent" },
  { id: "review", label: "Review", hint: "Check and submit" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function WizardSteps({
  draftId,
  active,
}: {
  draftId: string;
  active: WizardStepId;
}) {
  const activeIndex = WIZARD_STEPS.findIndex((s) => s.id === active);

  return (
    <nav aria-label="Submission steps">
      <ol className="flex gap-1 overflow-x-auto pb-1">
        {WIZARD_STEPS.map((step, i) => {
          const done = i < activeIndex;
          const current = i === activeIndex;

          // Step 1's screen is `/submissions/new` — it is the step that would
          // create the draft, so it has no draftId of its own.
          const href =
            step.id === "details"
              ? "/submissions/new"
              : `/submissions/new/${draftId}/${step.id}`;

          const className = cn(
            "block border-t-2 pt-2.5",
            current
              ? "border-brand"
              : done
                ? "border-brand/50 transition-colors hover:border-brand"
                : "border-border",
          );

          const body = (
            <>
              <p className="flex items-center gap-1.5 text-xs font-medium">
                  {done ? (
                    <Check className="size-3.5 shrink-0 text-brand" aria-hidden />
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                        current
                          ? "bg-brand text-brand-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                  )}
                  <span
                    className={cn(
                      "truncate",
                      current
                        ? "text-brand-darker"
                        : done
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </p>
              <p className="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:block">
                {step.hint}
              </p>
            </>
          );

          return (
            <li key={step.id} className="min-w-0 flex-1 shrink-0">
              {/* Completed steps are reachable; steps ahead are not, because
                  they would open with nothing filled in behind them. */}
              {done ? (
                <Link href={href} className={className}>
                  {body}
                </Link>
              ) : (
                <div
                  aria-current={current ? "step" : undefined}
                  className={className}
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">
        Step {activeIndex + 1} of {WIZARD_STEPS.length}
      </p>
    </nav>
  );
}
