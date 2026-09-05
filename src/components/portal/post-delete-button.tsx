"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

/**
 * Delete a post from the list, with a confirmation in place.
 *
 * UI ONLY. Nothing is deleted — there is no database. The row stays and says
 * so, rather than disappearing and letting the reader believe it is gone until
 * they reload.
 *
 * Styled to match the Edit link beside it rather than using `Button`, because
 * the two sit in one row of small chips and a button's default height would
 * break that line.
 */
export function PostDeleteButton({ title }: { title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <span className="text-xs text-muted-foreground">
        Nothing was deleted — no database yet.
      </span>
    );
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Delete?</span>
        <button
          type="button"
          onClick={() => setDone(true)}
          className="rounded-lg border border-danger/40 px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/5"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted/40"
        >
          No
        </button>
      </span>
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
