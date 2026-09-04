"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, CheckCircle2, X } from "lucide-react";
import {
  respondToInvitation,
  type ReviewActionState,
} from "@/app/(dashboard)/reviews/actions";
import { Alert, Button, Field, Textarea } from "@/components/ui";

const initialState: ReviewActionState = { status: "idle" };

/**
 * Accept or decline a review invitation.
 *
 * Declining opens a reason box rather than firing immediately: a decline that
 * names a better-placed colleague, or gives a date the reviewer would be free,
 * is worth far more to an editor than a bare no. The box is never required —
 * making it compulsory just produces empty ones, and slows down the honest
 * "no time" that editors most need to hear quickly.
 */
export function InvitationResponse({ dueAt }: { dueAt?: string }) {
  const [state, formAction] = useFormState(respondToInvitation, initialState);
  const [choice, setChoice] = useState<"accept" | "decline" | null>(null);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-5">
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-xl bg-success/10 text-success"
        >
          <CheckCircle2 className="size-5" />
        </span>
        <p className="mt-3 font-serif text-base font-semibold">
          {state.values?.response === "accept"
            ? "Invitation accepted"
            : "Invitation declined"}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
        <Button href="/reviews" variant="outline" size="sm" className="mt-4">
          Back to my reviews
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-tint/25 p-5">
      <h2 className="font-serif text-base font-semibold">
        Will you review this manuscript?
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        Please respond either way, and soon — an editor cannot approach anyone
        else until they hear from you. Accepting commits you to a report
        {dueAt ? " by the date above" : ""}, and to keeping the manuscript
        confidential.
      </p>

      {state.status === "error" && state.message && (
        <div className="mt-4">
          <Alert tone="danger">{state.message}</Alert>
        </div>
      )}

      <form action={formAction} className="mt-4">
        {/* The chosen answer travels as a hidden field, so the two buttons
            below are a choice rather than two separate submits. */}
        <input type="hidden" name="response" value={choice ?? ""} />

        {choice !== "decline" ? (
          <div className="flex flex-wrap gap-2.5">
            <AcceptButton onArm={() => setChoice("accept")} />
            <Button
              type="button"
              variant="outline"
              onClick={() => setChoice("decline")}
            >
              <X className="size-4" aria-hidden />
              Decline
            </Button>
          </div>
        ) : (
          <div>
            <Field
              label="Why are you declining?"
              htmlFor="reason"
              optional
              hint="A colleague better placed to review it, or a date you would be free, is genuinely useful. Leave blank if you would rather not say."
            >
              <Textarea name="reason" rows={3} autoFocus />
            </Field>

            <div className="mt-3 flex flex-wrap gap-2.5">
              <DeclineButton />
              <Button
                type="button"
                variant="outline"
                onClick={() => setChoice(null)}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function AcceptButton({ onArm }: { onArm: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" onClick={onArm} disabled={pending}>
      <Check className="size-4" aria-hidden />
      {pending ? "Saving…" : "Accept and review"}
    </Button>
  );
}

function DeclineButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Send decline"}
    </Button>
  );
}
