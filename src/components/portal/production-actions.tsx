"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Plus, Send, Upload, UserPlus, X } from "lucide-react";
import {
  addCorrection,
  applyCorrection,
  assignStage,
  completeStage,
  declineCorrection,
  markGalleyFinal,
  recordAuthorReply,
  reopenStage,
  sendStageToAuthor,
  uploadGalley,
  type ProductionState,
} from "@/app/(dashboard)/production/actions";
import { GALLEY_FILE_TYPES, MAX_FILE_BYTES } from "@/lib/validation/schemas";
import { Alert, Button, Field, Input, Select } from "@/components/ui";
import type { ProductionStage, StageState } from "@/types";

/**
 * The controls on a production stage screen.
 *
 * Which control appears is driven by the stage's state, because the operations
 * are not interchangeable: a stage nobody holds needs an assignee, one in
 * progress needs sending to the author, and one waiting on the author needs
 * their reply recorded — offering all four at once would let a production
 * editor mark something complete that never went out.
 *
 * These now write. Each posts to a Server Action that re-guards on
 * `requireGroup("production")`, because a form post is trivially forged and the
 * disabled states here are a courtesy to the reader, not a control.
 *
 * **No email is sent.** "Send to author" records that the stage went out and
 * when — which is what the queue ages the wait from — and says plainly that the
 * file still travels by hand: mail works, but no production email is built.
 */

const textareaClass =
  "w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

const initialState: ProductionState = { status: "idle" };

export type TeamMember = { id: string; name: string };

/** Shared feedback line. Success and failure read the same way everywhere. */
function Outcome({ state }: { state: ProductionState }) {
  if (state.status === "success" && state.message) {
    return (
      <p className="mt-3 text-sm font-medium text-success">{state.message}</p>
    );
  }
  if (state.status === "error") {
    return (
      <div className="mt-3">
        <Alert tone="danger" title="Nothing was changed">
          {state.message}
        </Alert>
      </div>
    );
  }
  return null;
}

/** A submit button that says what it is doing while it does it. */
function Submit({
  children,
  size = "sm",
  variant,
}: {
  children: React.ReactNode;
  size?: "sm";
  variant?: "outline" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} variant={variant} disabled={pending}>
      {pending ? "Saving…" : children}
    </Button>
  );
}

export function StageActions({
  stage,
  state,
  reference,
  submissionId,
  team,
}: {
  stage: ProductionStage;
  state: StageState;
  reference: string;
  submissionId: string;
  team: TeamMember[];
}) {
  const [assigning, setAssigning] = useState(false);

  const [assignState, assignAction] = useFormState(assignStage, initialState);
  const [sendState, sendAction] = useFormState(sendStageToAuthor, initialState);
  const [completeState, completeAction] = useFormState(
    completeStage,
    initialState,
  );
  const [replyState, replyAction] = useFormState(
    recordAuthorReply,
    initialState,
  );
  const [reopenState, reopenAction] = useFormState(reopenStage, initialState);

  const label =
    stage === "copyedit"
      ? "copyedited manuscript"
      : stage === "galleys"
        ? "galley"
        : "proof";

  return (
    <div className="mt-4 rounded-xl border border-brand-border bg-brand-tint/20 p-4">
      <h3 className="text-sm font-medium">What happens next</h3>

      {/* ------------------------------------------------- not started */}
      {state === "not-started" && (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Nobody holds this stage. Assigning it is what starts the clock the
            queue measures.
          </p>
          {!assigning ? (
            <div className="mt-3">
              <Button size="sm" onClick={() => setAssigning(true)}>
                <UserPlus className="size-3.5" aria-hidden />
                Assign and start
              </Button>
            </div>
          ) : (
            <form action={assignAction} className="mt-3 space-y-3">
              <input type="hidden" name="submissionId" value={submissionId} />
              <input type="hidden" name="stage" value={stage} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Assign to"
                  htmlFor="assignedToId"
                  required
                  error={assignState.status === "error" ? assignState.errors?.assignedToId : undefined}
                >
                  <Select id="assignedToId" name="assignedToId" required defaultValue="">
                    <option value="" disabled>
                      Choose someone
                    </option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Due" htmlFor="dueAt" optional>
                  <Input id="dueAt" name="dueAt" type="date" />
                </Field>
              </div>
              {/* An empty team is stated rather than left as a select with one
                  disabled option, which reads as a broken control. */}
              {team.length === 0 && (
                <p className="text-xs font-medium text-warning">
                  No active account holds a production role, so this stage
                  cannot be assigned yet. Grant one from the users screen.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Submit>Start stage</Submit>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAssigning(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
          <Outcome state={assignState} />
        </>
      )}

      {/* ------------------------------------------------- in progress */}
      {state === "in-progress" && (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            When the {label} is ready, it goes to the author for approval.
            Nothing moves after that until they reply.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={sendAction}>
              <input type="hidden" name="submissionId" value={submissionId} />
              <input type="hidden" name="stage" value={stage} />
              <Submit>
                <Send className="size-3.5" aria-hidden />
                Send to author
              </Submit>
            </form>
            {/* Not every stage goes to the author — a galley regenerated after
                a correction may simply be finished. */}
            <form action={completeAction}>
              <input type="hidden" name="submissionId" value={submissionId} />
              <input type="hidden" name="stage" value={stage} />
              <Submit variant="outline">
                <Check className="size-3.5" aria-hidden />
                Mark complete
              </Submit>
            </form>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Sending records the handover and starts the clock. The {label}{" "}
            itself goes by email from the editorial office, quoting{" "}
            <span className="font-medium">{reference}</span> — no mail is sent
            from here.
          </p>
          <Outcome state={sendState} />
          <Outcome state={completeState} />
        </>
      )}

      {/* ------------------------------------------------- with author */}
      {state === "with-author" && (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            The author has it. Record their reply when it arrives — approval
            finishes the stage, and changes send it back to whoever holds it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={replyAction}>
              <input type="hidden" name="submissionId" value={submissionId} />
              <input type="hidden" name="stage" value={stage} />
              <input type="hidden" name="reply" value="approved" />
              <Submit>
                <Check className="size-3.5" aria-hidden />
                Author approved
              </Submit>
            </form>
            <form action={replyAction}>
              <input type="hidden" name="submissionId" value={submissionId} />
              <input type="hidden" name="stage" value={stage} />
              <input type="hidden" name="reply" value="changes" />
              <Submit variant="outline">Changes requested</Submit>
            </form>
          </div>
          <Outcome state={replyState} />
        </>
      )}

      {/* -------------------------------------------------------- done */}
      {state === "done" && (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            This stage is finished. Reopening is for a mistake found later —
            it does not undo the record that it was completed.
          </p>
          <form action={reopenAction} className="mt-3">
            <input type="hidden" name="submissionId" value={submissionId} />
            <input type="hidden" name="stage" value={stage} />
            <Submit variant="outline">Reopen stage</Submit>
          </form>
          <Outcome state={reopenState} />
        </>
      )}
    </div>
  );
}

/**
 * Uploading a galley.
 *
 * The version is not asked for: it is one higher than the last, always, and it
 * is derived on the server under the unique constraint that backs it up.
 * Letting someone type it is how two files end up claiming to be version 2.
 */
export function UploadGalleyButton({
  nextVersion,
  submissionId,
}: {
  nextVersion: number;
  submissionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [tooBig, setTooBig] = useState<string | null>(null);
  const [state, formAction] = useFormState(uploadGalley, initialState);

  // Closing on success would hide the confirmation; the panel stays and says
  // what happened, and the version in its heading is stale by exactly one.
  if (!open) {
    return (
      <div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Upload className="size-3.5" aria-hidden />
          Upload galley
        </Button>
        <Outcome state={state} />
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full rounded-xl border border-brand-border bg-brand-tint/20 p-4"
    >
      <input type="hidden" name="submissionId" value={submissionId} />

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">
          Upload galley — version {nextVersion}
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the upload panel"
          className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Format" htmlFor="format" required>
          <Select id="format" name="format" defaultValue="pdf">
            <option value="pdf">PDF — the version of record</option>
            <option value="xml">JATS XML — for indexing and preservation</option>
            <option value="html">HTML — full text on the article page</option>
          </Select>
        </Field>
        <Field
          label="File"
          htmlFor="file"
          required
          error={state.status === "error" ? state.errors?.file : undefined}
          hint={`Up to ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB. Stored confidentially, like the manuscript.`}
        >
          <Input
            id="file"
            name="file"
            type="file"
            accept={GALLEY_FILE_TYPES}
            required
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              setTooBig(f && f.size > MAX_FILE_BYTES ? f.name : null);
            }}
          />
        </Field>
      </div>

      {tooBig && (
        <p className="mt-2 text-xs font-medium text-danger">
          {tooBig} is over {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.
        </p>
      )}

      {/* The version is derived, never typed. Two files claiming version 2 is
          the failure this prevents. */}
      <p className="mt-2 text-xs text-muted-foreground">
        This will be version {nextVersion}. Versions are assigned in order and
        cannot be chosen — the previous ones stay, marked superseded.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Submit>Upload</Submit>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>

      <Outcome state={state} />
    </form>
  );
}

/** Marks a galley as the version that will be published. */
export function MarkFinalButton({
  galleyId,
  submissionId,
}: {
  galleyId: string;
  submissionId: string;
}) {
  const [state, formAction] = useFormState(markGalleyFinal, initialState);
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="galleyId" value={galleyId} />
      <input type="hidden" name="submissionId" value={submissionId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50 disabled:opacity-60"
      >
        Mark final
      </button>
      {state.status === "error" && (
        <span className="ml-2 text-xs font-medium text-danger">
          {state.message}
        </span>
      )}
    </form>
  );
}

/**
 * Adding a proof correction, and resolving one.
 *
 * These write as of `20260914120000_proof_correction_fields`, which gave
 * `location` and `raisedBy` real columns. They used to share one string with
 * the description — fine while the screen was read-only, impossible once a
 * form has to re-encode the delimiter.
 */
export function AddCorrectionButton({
  submissionId,
}: {
  submissionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addCorrection, initialState);

  if (!open) {
    return (
      <div>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" aria-hidden />
          Add a correction
        </Button>
        <Outcome state={state} />
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-xl border border-brand-border bg-brand-tint/20 p-4"
    >
      <input type="hidden" name="submissionId" value={submissionId} />

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">Add a proof correction</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the correction panel"
          className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Where"
            htmlFor="location"
            required
            hint="As the proofreader described it."
            error={state.status === "error" ? state.errors?.location : undefined}
          >
            <Input id="location" name="location" placeholder="p. 4, ¶2" required />
          </Field>
          <Field
            label="Raised by"
            htmlFor="raisedBy"
            required
            error={state.status === "error" ? state.errors?.raisedBy : undefined}
          >
            <Select id="raisedBy" name="raisedBy" defaultValue="author">
              <option value="author">Author</option>
              <option value="proofreader">Proofreader</option>
              <option value="copyeditor">Copyeditor</option>
            </Select>
          </Field>
        </div>
        <Field
          label="What needs changing"
          htmlFor="description"
          required
          error={state.status === "error" ? state.errors?.description : undefined}
        >
          <textarea
            id="description"
            name="description"
            rows={3}
            required
            className={textareaClass}
            placeholder="Caption refers to “panel (c)” but the figure has only two panels."
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Submit>Add correction</Submit>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>

      <Outcome state={state} />
    </form>
  );
}

/** Apply or decline one open correction. */
export function CorrectionActions({
  correctionId,
  submissionId,
}: {
  correctionId: string;
  submissionId: string;
}) {
  const [declining, setDeclining] = useState(false);
  const [applyState, applyAction] = useFormState(
    applyCorrection,
    initialState,
  );
  const [declineState, declineAction] = useFormState(
    declineCorrection,
    initialState,
  );

  if (declining) {
    return (
      <form action={declineAction} className="mt-3 rounded-lg border p-3">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="correctionId" value={correctionId} />
        <Field
          label="Why it is not being applied"
          htmlFor={`why-${correctionId}`}
          required
          hint="Required. A refusal with no stated reason is the one the author appeals."
          error={declineState.status === "error" ? declineState.errors?.reason : undefined}
        >
          <textarea
            id={`why-${correctionId}`}
            name="reason"
            rows={3}
            required
            className={textareaClass}
          />
        </Field>
        <div className="mt-3 flex flex-wrap gap-2">
          <Submit variant="danger">Decline correction</Submit>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDeclining(false)}
          >
            Cancel
          </Button>
        </div>
        <Outcome state={declineState} />
      </form>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
      <form action={applyAction} className="inline">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="correctionId" value={correctionId} />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
        >
          <Check className="size-3" aria-hidden />
          Mark applied
        </button>
      </form>
      <button
        type="button"
        onClick={() => setDeclining(true)}
        className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger"
      >
        Decline with a reason
      </button>
      <Outcome state={applyState} />
    </div>
  );
}
