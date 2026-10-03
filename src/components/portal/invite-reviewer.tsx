"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Mail, Send, X } from "lucide-react";
import {
  inviteReviewer,
  sendReviewReminder,
  withdrawAssignment,
  type AssignmentState,
} from "@/app/(dashboard)/editorial/actions";
import { Button, Field, Input } from "@/components/ui";

const initial: AssignmentState = { ok: false };

/**
 * Inviting a reviewer, and withdrawing an invitation that has not been
 * answered or has been accepted but not reported.
 *
 * The invitation opens a panel rather than firing on click — it carries a due
 * date and a note in the editor's own words, and a reviewer decides partly on
 * why they were asked. Recording it emails the invitation (title, abstract,
 * due date, note — never the authors), and the success line says whether the
 * email actually went.
 */

/** Six weeks out, the journal's usual review window. */
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 42);
  return d.toISOString().slice(0, 10);
}

export function InviteReviewerButton({
  submissionId,
  reviewerId,
  reviewerName,
  reference,
  /** True when a conflict or an existing assignment blocks the invitation. */
  disabled,
  disabledReason,
}: {
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  reference: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(inviteReviewer, initial);

  if (disabled) {
    return (
      <span className="text-xs text-muted-foreground" title={disabledReason}>
        Cannot invite
      </span>
    );
  }

  if (state.ok) {
    return state.emailed ? (
      <span className="text-xs font-medium text-success">
        Invitation recorded and emailed to {reviewerName}.
      </span>
    ) : (
      <span className="text-xs font-medium text-danger">
        Invitation recorded, but the email could not be sent — write to{" "}
        {reviewerName} by hand, quoting {reference}.
      </span>
    );
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Mail className="size-3.5" aria-hidden />
        Invite
      </Button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-lg border border-brand-border bg-brand-tint/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium">Invite {reviewerName}</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the invitation panel"
          className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <form action={formAction} className="mt-3 space-y-3">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="reviewerId" value={reviewerId} />

        <Field
          label="Report due"
          htmlFor={`due-${reviewerId}`}
          required
          hint="Six weeks is the journal's usual window. Shorten it and say why in the note."
        >
          <Input
            id={`due-${reviewerId}`}
            name="dueAt"
            type="date"
            defaultValue={defaultDueDate()}
            required
          />
        </Field>

        <Field
          label="Note to the reviewer"
          htmlFor={`note-${reviewerId}`}
          optional
          hint="Why you asked them specifically. It measurably raises acceptance."
        >
          <textarea
            id={`note-${reviewerId}`}
            name="note"
            rows={3}
            className="w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="Your work on small-firm finance makes you well placed to assess the identification strategy in section 4."
          />
        </Field>

        {state.error && (
          <p className="text-xs font-medium text-danger">{state.error}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton>
            <Send className="size-3.5" aria-hidden />
            Record invitation
          </SubmitButton>
          <span className="text-xs text-muted-foreground">
            The reviewer is emailed an invitation
          </span>
        </div>
      </form>
    </div>
  );
}

/**
 * Remind or withdraw an existing assignment. A reminder is offered while
 * something is outstanding — an unanswered invitation, or a report not yet
 * returned — and the action refuses a second one within 24 hours.
 */
export function AssignmentActions({
  assignmentId,
  reviewerName,
  status,
}: {
  assignmentId: string;
  reviewerName: string;
  status:
    | "invited"
    | "accepted"
    | "declined"
    | "completed"
    | "overdue"
    | "withdrawn";
}) {
  const [state, formAction] = useFormState(withdrawAssignment, initial);
  const [remind, remindAction] = useFormState(sendReviewReminder, initial);
  const canWithdraw = status === "invited" || status === "accepted";
  const canRemind =
    status === "invited" || status === "accepted" || status === "overdue";

  if (state.ok) {
    return (
      <span className="mt-2 block text-xs font-medium text-muted-foreground">
        Invitation to {reviewerName} withdrawn.
      </span>
    );
  }

  if (!canRemind && !canWithdraw) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {canRemind &&
        (remind.ok ? (
          <span className="text-xs font-medium text-success">
            Reminder emailed to {reviewerName}.
          </span>
        ) : (
          <form action={remindAction}>
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <RemindButton />
            {remind.error && (
              <span className="ml-2 text-xs text-danger">{remind.error}</span>
            )}
          </form>
        ))}
      {canWithdraw && (
        <form action={formAction}>
          <input type="hidden" name="assignmentId" value={assignmentId} />
          <WithdrawButton />
          {state.error && (
            <span className="ml-2 text-xs text-danger">{state.error}</span>
          )}
        </form>
      )}
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : children}
    </Button>
  );
}

function RemindButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-brand-tint disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send reminder"}
    </button>
  );
}

function WithdrawButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
    >
      {pending ? "Withdrawing…" : "Withdraw"}
    </button>
  );
}
