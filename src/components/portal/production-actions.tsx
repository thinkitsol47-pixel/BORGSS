"use client";

import { useState } from "react";
import { Check, Plus, Send, Upload, UserPlus, X } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/ui";
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
 * UI ONLY. Nothing is saved; there is no database and no file storage.
 */

const textareaClass =
  "w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

function notSaved(what: string) {
  alert(`Nothing changed — there is no database yet.\n\n${what}`);
}

/** The production team, from the account directory. */
const TEAM = ["Hina Aslam", "Faisal Nadeem", "Nida Sheikh"];

export function StageActions({
  stage,
  state,
  reference,
}: {
  stage: ProductionStage;
  state: StageState;
  reference: string;
}) {
  const [assigning, setAssigning] = useState(false);

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
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                notSaved("Assigning a stage is not built.");
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Assign to" htmlFor="assignee" required>
                  <Select id="assignee" required defaultValue="">
                    <option value="" disabled>
                      Choose someone
                    </option>
                    {TEAM.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Due" htmlFor="dueAt" optional>
                  <Input id="dueAt" type="date" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">
                  Start stage
                </Button>
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
            <Button
              size="sm"
              onClick={() =>
                notSaved(
                  `There is no mail provider, so nothing can be sent. Email the ${label} to the author, quoting ${reference}.`,
                )
              }
            >
              <Send className="size-3.5" aria-hidden />
              Send to author
            </Button>
            {/* Not every stage goes to the author — a galley regenerated after
                a correction may simply be finished. */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => notSaved("Completing a stage is not built.")}
            >
              <Check className="size-3.5" aria-hidden />
              Mark complete
            </Button>
          </div>
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
            <Button
              size="sm"
              onClick={() => notSaved("Recording an approval is not built.")}
            >
              <Check className="size-3.5" aria-hidden />
              Author approved
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                notSaved("Returning a stage to production is not built.")
              }
            >
              Changes requested
            </Button>
          </div>
        </>
      )}

      {/* -------------------------------------------------------- done */}
      {state === "done" && (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            This stage is finished. Reopening is for a mistake found later —
            it does not undo the record that it was completed.
          </p>
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => notSaved("Reopening a stage is not built.")}
            >
              Reopen stage
            </Button>
          </div>
        </>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Nothing here is saved yet.
      </p>
    </div>
  );
}

/**
 * Uploading a galley.
 *
 * The version is not asked for: it is one higher than the last, always. Letting
 * someone type it is how two files end up claiming to be version 2.
 */
export function UploadGalleyButton({ nextVersion }: { nextVersion: number }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Upload className="size-3.5" aria-hidden />
        Upload galley
      </Button>
    );
  }

  return (
    <form
      className="w-full rounded-xl border border-brand-border bg-brand-tint/20 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        notSaved("There is no file storage, so nothing can be uploaded.");
      }}
    >
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
          <Select id="format" defaultValue="pdf">
            <option value="pdf">PDF — the version of record</option>
            <option value="xml">JATS XML — for indexing and preservation</option>
            <option value="html">HTML — full text on the article page</option>
          </Select>
        </Field>
        <Field
          label="File"
          htmlFor="file"
          required
          hint="Nothing is uploaded — there is no storage yet."
        >
          <Input id="file" type="file" />
        </Field>
      </div>

      {/* The version is derived, never typed. Two files claiming version 2 is
          the failure this prevents. */}
      <p className="mt-2 text-xs text-muted-foreground">
        This will be version {nextVersion}. Versions are assigned in order and
        cannot be chosen — the previous ones stay, marked superseded.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          Upload
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Marks a galley as the version that will be published. */
export function MarkFinalButton({ filename }: { filename: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        notSaved(`Marking ${filename} as final is not built.`)
      }
      className="rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
    >
      Mark final
    </button>
  );
}

/**
 * Adding a proof correction, and resolving one.
 *
 * A rejection requires its reason in the same step — the form will not submit
 * without it. A correction that simply disappears is what an author chases the
 * editorial office about, and asking for the reason afterwards means it never
 * gets written.
 */
export function AddCorrectionButton() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" aria-hidden />
        Add a correction
      </Button>
    );
  }

  return (
    <form
      className="rounded-xl border border-brand-border bg-brand-tint/20 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        notSaved("Adding a correction is not built.");
      }}
    >
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
          >
            <Input id="location" placeholder="p. 4, ¶2" required />
          </Field>
          <Field label="Raised by" htmlFor="raisedBy" required>
            <Select id="raisedBy" defaultValue="author">
              <option value="author">Author</option>
              <option value="proofreader">Proofreader</option>
              <option value="copyeditor">Copyeditor</option>
            </Select>
          </Field>
        </div>
        <Field label="What needs changing" htmlFor="description" required>
          <textarea
            id="description"
            rows={3}
            required
            className={textareaClass}
            placeholder="Caption refers to “panel (c)” but the figure has only two panels."
          />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          Add correction
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Apply or decline one open correction. */
export function CorrectionActions({ location }: { location: string }) {
  const [declining, setDeclining] = useState(false);

  if (declining) {
    return (
      <form
        className="mt-3 rounded-lg border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          notSaved("Declining a correction is not built.");
        }}
      >
        <Field
          label="Why it is not being applied"
          htmlFor={`why-${location}`}
          required
          hint="Required. A refusal with no stated reason is the one the author appeals."
        >
          <textarea
            id={`why-${location}`}
            rows={3}
            required
            className={textareaClass}
          />
        </Field>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="submit" size="sm" variant="danger">
            Decline correction
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDeclining(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
      <button
        type="button"
        onClick={() => notSaved("Applying a correction is not built.")}
        className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
      >
        <Check className="size-3" aria-hidden />
        Mark applied
      </button>
      <button
        type="button"
        onClick={() => setDeclining(true)}
        className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger"
      >
        Decline with a reason
      </button>
    </div>
  );
}
