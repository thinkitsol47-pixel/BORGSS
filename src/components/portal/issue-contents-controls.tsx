"use client";

import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

/**
 * The controls on an issue's table of contents.
 *
 * Split into two tiny components rather than one, because they sit in two
 * different lists — placed manuscripts and available ones — and passing a mode
 * flag would be harder to read than two named things.
 *
 * Running order is Up/Down buttons, not drag-and-drop. Order in an issue is a
 * deliberate editorial decision made a handful of times per issue, and a drag
 * handle is unusable by keyboard and awkward on a phone for no gain at this
 * scale. The pattern matches the submission wizard's author ordering, where
 * the same reasoning applied.
 *
 * UI ONLY. Nothing happens; there is no database.
 */

function notSaved() {
  alert(
    "Nothing changed — there is no database yet.\n\nIssue contents are fixtures; placing and reordering are not built.",
  );
}

export function IssueContentsControls({
  title,
  position,
  isFirst,
  isLast,
}: {
  title: string;
  position: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={notSaved}
        disabled={isFirst}
        aria-label={`Move "${title}" up, out of position ${position}`}
        className="grid size-7 place-items-center rounded-lg border border-brand-border text-muted-foreground transition-colors hover:border-brand hover:bg-brand-tint/50 hover:text-brand-darker disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={notSaved}
        disabled={isLast}
        aria-label={`Move "${title}" down, out of position ${position}`}
        className="grid size-7 place-items-center rounded-lg border border-brand-border text-muted-foreground transition-colors hover:border-brand hover:bg-brand-tint/50 hover:text-brand-darker disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={notSaved}
        aria-label={`Remove "${title}" from this issue`}
        className="grid size-7 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-danger hover:bg-danger/10 hover:text-danger"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/** Adds an accepted manuscript to the issue being viewed. */
export function PlaceInIssueButton({ title }: { title: string }) {
  return (
    <button
      type="button"
      onClick={notSaved}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
    >
      <Plus className="size-3" aria-hidden />
      Place
      <span className="sr-only"> &ldquo;{title}&rdquo; in this issue</span>
    </button>
  );
}
