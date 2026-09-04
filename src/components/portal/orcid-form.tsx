"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { saveOrcid, type ProfileState } from "@/app/(dashboard)/profile/actions";
import { OrcidField } from "@/components/auth/auth-parts";
import { Alert, Button } from "@/components/ui";

const initialState: ProfileState = { status: "idle" };

/**
 * Links an ORCID iD to the account.
 *
 * Reuses `OrcidField` from the register form, so the check-digit validation
 * and the as-you-type formatting behave identically in both places.
 */
export function OrcidForm({ current }: { current?: string }) {
  const [state, formAction] = useFormState(saveOrcid, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5" noValidate>
      {state.status === "success" && (
        <Alert tone="info" title="Not saved">
          {state.message}
        </Alert>
      )}

      <OrcidField
        error={state.errors?.orcid}
        defaultValue={state.values?.orcid ?? current}
      />

      <p className="text-xs leading-relaxed text-muted-foreground">
        Leave the field empty and save to remove the iD from your account.
      </p>

      <div className="border-t pt-5">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Saving…
        </>
      ) : (
        <>
          <Save className="size-4" aria-hidden />
          Save ORCID iD
        </>
      )}
    </Button>
  );
}
