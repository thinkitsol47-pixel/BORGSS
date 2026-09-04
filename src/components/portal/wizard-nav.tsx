"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

/** Back / continue row at the foot of every wizard step. */
export function WizardNav({
  backHref,
  submitLabel,
}: {
  backHref: string;
  submitLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap items-center gap-3 border-t pt-6">
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? (
          <>
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Checking…
          </>
        ) : (
          <>
            {submitLabel}
            <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </Button>
      <Button href={backHref} variant="outline">
        Back
      </Button>
    </div>
  );
}
