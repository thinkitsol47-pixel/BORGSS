"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Mail } from "lucide-react";
import {
  sendRevisionReminder,
  type AssignmentState,
} from "@/app/(dashboard)/editorial/actions";
import { Button } from "@/components/ui";

const initial: AssignmentState = { ok: false };

/**
 * "Remind the author" for a manuscript waiting on a revision. The action
 * refuses a second reminder within 24 hours and says so here.
 */
export function RevisionReminderButton({
  submissionId,
}: {
  submissionId: string;
}) {
  const [state, formAction] = useFormState(sendRevisionReminder, initial);

  if (state.ok) {
    return (
      <p className="text-sm font-medium text-success">
        Reminder emailed to the corresponding author.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <RemindButton />
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}

function RemindButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      <Mail className="size-4" aria-hidden />
      {pending ? "Sending…" : "Remind the author"}
    </Button>
  );
}
