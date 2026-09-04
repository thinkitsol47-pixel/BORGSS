"use client";

import { useFormState } from "react-dom";
import { RotateCw } from "lucide-react";
import { resendVerification, type AuthState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui";
import { SubmitButton } from "./auth-parts";

const initialState: AuthState = { status: "idle" };

/** "Send it again" button for the verify-email page. */
export function ResendVerification({ email }: { email: string }) {
  const [state, formAction] = useFormState(resendVerification, initialState);

  return (
    <div>
      {state.message && (
        <div className="mb-4 text-left">
          <Alert
            tone={state.status === "success" ? "info" : "danger"}
            title={state.status === "success" ? "Nothing sent yet" : "Could not resend"}
          >
            {state.message}
          </Alert>
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="email" value={email} />
        <SubmitButton pendingLabel="Sending…">
          <RotateCw className="size-4" aria-hidden />
          Send the link again
        </SubmitButton>
      </form>
    </div>
  );
}
