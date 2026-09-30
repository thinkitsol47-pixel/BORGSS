"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Check, Undo2, X } from "lucide-react";
import {
  acceptApplication,
  declineApplication,
  reopenApplication,
  type ApplicationActionState,
} from "@/app/(dashboard)/admin/reviewer-applications/actions";

const initial: ApplicationActionState = { ok: false };

/**
 * Accept / decline controls on one reviewer application.
 *
 * Accept records `status = accepted` and nothing more — the profile and
 * account are a separate step the accounts system has to do. The page carries
 * that caveat; this component only moves the status.
 */
export function ApplicationDecision({
  id,
  status,
}: {
  id: string;
  status: "pending" | "accepted" | "declined";
}) {
  if (status === "pending") {
    return (
      <div className="flex flex-wrap items-start gap-2">
        <OneAction id={id} action={acceptApplication} tone="accept">
          <Check className="size-3.5" aria-hidden /> Accept
        </OneAction>
        <OneAction id={id} action={declineApplication} tone="decline">
          <X className="size-3.5" aria-hidden /> Decline
        </OneAction>
      </div>
    );
  }

  return (
    <OneAction id={id} action={reopenApplication} tone="reopen">
      <Undo2 className="size-3.5" aria-hidden /> Move back to pending
    </OneAction>
  );
}

function OneAction({
  id,
  action,
  tone,
  children,
}: {
  id: string;
  action: (
    prev: ApplicationActionState,
    formData: FormData,
  ) => Promise<ApplicationActionState>;
  tone: "accept" | "decline" | "reopen";
  children: React.ReactNode;
}) {
  const [state, formAction] = useFormState(action, initial);
  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <SubmitButton tone={tone}>{children}</SubmitButton>
      {state.error && (
        <span className="text-xs text-danger">{state.error}</span>
      )}
    </form>
  );
}

function SubmitButton({
  tone,
  children,
}: {
  tone: "accept" | "decline" | "reopen";
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  const toneClass =
    tone === "accept"
      ? "border-success/40 text-success hover:bg-success/5"
      : tone === "decline"
        ? "border-danger/40 text-danger hover:bg-danger/5"
        : "text-muted-foreground hover:border-brand hover:text-brand-darker";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${toneClass}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
