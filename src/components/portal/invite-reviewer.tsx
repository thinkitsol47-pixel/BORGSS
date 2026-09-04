"use client";

import { useState } from "react";
import { Mail, Send, X } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";

/**
 * Inviting a reviewer, and chasing one who has not replied.
 *
 * The invitation opens a panel rather than firing on click. An invitation
 * carries a due date and a note in the editor's own words, and both matter:
 * a reviewer decides whether to accept partly on why they were asked, and a
 * date chosen per manuscript beats a system default that nobody read.
 *
 * UI ONLY. Nothing is sent — there is no mail provider.
 */

const textareaClass =
  "w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

/** Six weeks out, the journal's usual review window. */
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 42);
  return d.toISOString().slice(0, 10);
}

export function InviteReviewerButton({
  reviewerName,
  reference,
  disabled,
  disabledReason,
}: {
  reviewerName: string;
  reference: string;
  /** True when a conflict or an existing assignment blocks the invitation. */
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);

  if (disabled) {
    return (
      <span className="text-xs text-muted-foreground" title={disabledReason}>
        Cannot invite
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

      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          alert(
            `Nothing was sent — there is no mail provider yet.\n\nInvite ${reviewerName} by email, quoting ${reference}.`,
          );
        }}
      >
        <Field
          label="Report due"
          htmlFor={`due-${reviewerName}`}
          required
          hint="Six weeks is the journal's usual window. Shorten it and say why in the note."
        >
          <Input
            id={`due-${reviewerName}`}
            type="date"
            defaultValue={defaultDueDate()}
            required
          />
        </Field>

        <Field
          label="Note to the reviewer"
          htmlFor={`note-${reviewerName}`}
          optional
          hint="Why you asked them specifically. It measurably raises acceptance."
        >
          <textarea
            id={`note-${reviewerName}`}
            rows={3}
            className={textareaClass}
            placeholder="Your work on small-firm finance makes you well placed to assess the identification strategy in section 4."
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm">
            <Send className="size-3.5" aria-hidden />
            Send invitation
          </Button>
          <span className="text-xs text-muted-foreground">Not sent yet</span>
        </div>
      </form>
    </div>
  );
}

/**
 * Chase or withdraw an existing assignment.
 *
 * A reminder is offered only where it means something — an invitation nobody
 * answered, or a report past its date. Reminding someone who has already
 * reported is the bug that loses reviewers, so the button is simply absent
 * there rather than present and ignored.
 */
export function AssignmentActions({
  reviewerName,
  status,
}: {
  reviewerName: string;
  status: "invited" | "accepted" | "declined" | "completed" | "overdue";
}) {
  const canRemind = status === "invited" || status === "overdue";
  const canWithdraw = status === "invited" || status === "accepted";

  if (!canRemind && !canWithdraw) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {canRemind && (
        <button
          type="button"
          onClick={() =>
            alert(
              `Nothing was sent — there is no mail provider yet.\n\nRemind ${reviewerName} by email.`,
            )
          }
          className="rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
        >
          Send reminder
        </button>
      )}
      {canWithdraw && (
        <button
          type="button"
          onClick={() =>
            alert(
              "Nothing changed — there is no database yet.\n\nWithdrawing an assignment is not built.",
            )
          }
          className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger"
        >
          Withdraw
        </button>
      )}
    </div>
  );
}
