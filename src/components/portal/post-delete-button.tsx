"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import {
  deletePost,
  type DeleteState,
} from "@/app/(dashboard)/admin/announcements/actions";

const initial: DeleteState = { ok: false };

/**
 * Delete a post, with a confirmation in place.
 *
 * The confirmation is a second click rather than a browser `confirm()`: this
 * sits in a row of small chips beside Edit, and a misclick that removes a
 * published announcement is not recoverable from this screen.
 *
 * Styled to match the Edit link beside it rather than using `Button`, because
 * the two share one row and a button's default height would break that line.
 */
export function PostDeleteButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useFormState(deletePost, initial);

  if (state.ok) {
    return (
      <span className="text-xs text-muted-foreground">Deleted.</span>
    );
  }

  if (confirming) {
    return (
      <form action={formAction} className="inline-flex items-center gap-1.5">
        <input type="hidden" name="id" value={id} />
        <span className="text-xs text-muted-foreground">Delete?</span>
        <ConfirmButton />
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted/40"
        >
          No
        </button>
        {state.error && (
          <span className="text-xs text-danger">{state.error}</span>
        )}
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${title}`}
      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger"
    >
      <Trash2 className="size-3" aria-hidden />
      Delete
    </button>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-danger/40 px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Yes"}
    </button>
  );
}
