"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import {
  moveIssueItem,
  placeInIssue,
  removeFromIssue,
  type PlacementState,
} from "@/app/(dashboard)/editorial/issues/actions";

/**
 * The controls on an issue's table of contents.
 *
 * Split into two components rather than one, because they sit in two different
 * lists — placed manuscripts and available ones — and passing a mode flag
 * would be harder to read than two named things.
 *
 * Running order is Up/Down buttons, not drag-and-drop. Order in an issue is a
 * deliberate editorial decision made a handful of times per issue, and a drag
 * handle is unusable by keyboard and awkward on a phone for no gain at this
 * scale. The pattern matches the submission wizard's author ordering, where
 * the same reasoning applied.
 *
 * **Each button is its own form.** They change state rather than navigate, so
 * they are buttons and not links; and a single form around the whole row would
 * make "move up" and "remove" the same submission with different intents,
 * which is exactly the ambiguity that produces the wrong one being fired.
 *
 * A failure is reported next to the control that failed rather than at the top
 * of the page: by the time an editor has scrolled to position 9 of a table of
 * contents, a banner above the fold is a message they will not see.
 */

const initialState: PlacementState = { ok: true };

const buttonBase =
  "grid size-7 place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40";

/** One hidden pair every control posts. */
function Ids({
  issueId,
  submissionId,
}: {
  issueId: string;
  submissionId: string;
}) {
  return (
    <>
      <input type="hidden" name="issueId" value={issueId} />
      <input type="hidden" name="submissionId" value={submissionId} />
    </>
  );
}

export function IssueContentsControls({
  issueId,
  submissionId,
  title,
  position,
  isFirst,
  isLast,
}: {
  issueId: string;
  submissionId: string;
  title: string;
  position: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [moveState, moveAction] = useFormState(moveIssueItem, initialState);
  const [removeState, removeAction] = useFormState(
    removeFromIssue,
    initialState,
  );

  const error =
    (!moveState.ok && moveState.error) ||
    (!removeState.ok && removeState.error) ||
    null;

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <form action={moveAction}>
          <Ids issueId={issueId} submissionId={submissionId} />
          <input type="hidden" name="direction" value="up" />
          <MoveButton
            disabled={isFirst}
            label={`Move "${title}" up, out of position ${position}`}
          >
            <ChevronUp className="size-4" aria-hidden />
          </MoveButton>
        </form>

        <form action={moveAction}>
          <Ids issueId={issueId} submissionId={submissionId} />
          <input type="hidden" name="direction" value="down" />
          <MoveButton
            disabled={isLast}
            label={`Move "${title}" down, out of position ${position}`}
          >
            <ChevronDown className="size-4" aria-hidden />
          </MoveButton>
        </form>

        <form action={removeAction}>
          <Ids issueId={issueId} submissionId={submissionId} />
          <RemoveButton label={`Remove "${title}" from this issue`} />
        </form>
      </div>

      {error && (
        <p role="status" className="max-w-xs text-right text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function MoveButton({
  disabled,
  label,
  children,
}: {
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-label={label}
      className={`${buttonBase} border-brand-border text-muted-foreground hover:border-brand hover:bg-brand-tint/50 hover:text-brand-darker`}
    >
      {children}
    </button>
  );
}

function RemoveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      className={`${buttonBase} border-border text-muted-foreground hover:border-danger hover:bg-danger/10 hover:text-danger`}
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}

/** Adds an accepted manuscript to the issue being viewed. */
export function PlaceInIssueButton({
  issueId,
  submissionId,
  title,
}: {
  issueId: string;
  submissionId: string;
  title: string;
}) {
  const [state, formAction] = useFormState(placeInIssue, initialState);

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <form action={formAction}>
        <Ids issueId={issueId} submissionId={submissionId} />
        <PlaceButton title={title} />
      </form>
      {!state.ok && (
        <p role="status" className="max-w-xs text-right text-xs text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
}

function PlaceButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="size-3" aria-hidden />
      {pending ? "Placing…" : "Place"}
      <span className="sr-only"> &ldquo;{title}&rdquo; in this issue</span>
    </button>
  );
}
