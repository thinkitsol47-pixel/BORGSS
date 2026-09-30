"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Check, Undo2 } from "lucide-react";
import {
  markMessageHandled,
  reopenMessage,
  type MessageActionState,
} from "@/app/(dashboard)/admin/messages/actions";

const initial: MessageActionState = { ok: false };

/**
 * The "mark handled" / "reopen" control on one contact message.
 *
 * A real Server Action — `handledAt` is set or cleared and the list
 * revalidates. There is no optimistic fake here: the row genuinely changes.
 */
export function MessageHandledToggle({
  id,
  handled,
}: {
  id: string;
  handled: boolean;
}) {
  const action = handled ? reopenMessage : markMessageHandled;
  const [state, formAction] = useFormState(action, initial);

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <ToggleButton handled={handled} />
      {state.error && (
        <span className="text-xs text-danger">{state.error}</span>
      )}
    </form>
  );
}

function ToggleButton({ handled }: { handled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand-darker disabled:opacity-50"
    >
      {handled ? (
        <>
          <Undo2 className="size-3.5" aria-hidden />
          {pending ? "Reopening…" : "Reopen"}
        </>
      ) : (
        <>
          <Check className="size-3.5" aria-hidden />
          {pending ? "Saving…" : "Mark handled"}
        </>
      )}
    </button>
  );
}
