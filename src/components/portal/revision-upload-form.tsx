"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, FileUp, Paperclip } from "lucide-react";
import {
  uploadRevision,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import {
  MANUSCRIPT_FILE_TYPES,
  MAX_FILE_BYTES,
} from "@/lib/validation/schemas";
import { Alert, Button, Field, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

const initialState: WizardState = { status: "idle" };

/**
 * Uploading a revised manuscript and the response to reviewers.
 *
 * **The round is not asked for and not shown as an input.** It is
 * `Submission.round`, read on the server — a client that could name its own
 * round could file against one the editor has already closed.
 *
 * The response to reviewers is typed rather than attached, the same choice the
 * cover letter makes on a new submission: the editor reads it beside the
 * reports instead of opening a file, and it is stored as a message on the
 * manuscript.
 */
export function RevisionUploadForm({
  submissionId,
  reference,
  round,
}: {
  submissionId: string;
  reference: string;
  round: number;
}) {
  const [state, formAction] = useFormState(uploadRevision, initialState);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [tooBig, setTooBig] = useState(false);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-6">
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-xl bg-success/10 text-success"
        >
          <CheckCircle2 className="size-5" />
        </span>
        <h2 className="mt-3 font-serif text-lg font-semibold">
          Revision {round} received
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={`/submissions/${submissionId}`}>
            Back to this manuscript
          </Button>
          <Button href={`/submissions/${submissionId}/messages`} variant="outline">
            See your response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-7" noValidate>
      <input type="hidden" name="submissionId" value={submissionId} />

      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not upload the revision">
          {state.message}
        </Alert>
      )}

      <div>
        <label htmlFor="manuscript" className="block text-sm font-medium">
          Revised manuscript
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        </label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Still anonymised — no author names, affiliations or acknowledgements,
          including in the file&rsquo;s document properties. This replaces the
          manuscript for revision {round}; earlier rounds are kept.
        </p>

        <div
          className={cn(
            "mt-2.5 rounded-xl border border-dashed p-5 text-center transition-colors",
            state.status === "error" && state.errors?.manuscript
              ? "border-danger"
              : "border-brand-border hover:border-brand",
          )}
        >
          <span
            aria-hidden
            className="mx-auto grid size-10 place-items-center rounded-lg bg-brand-tint text-brand-dark"
          >
            <FileUp className="size-5" />
          </span>

          <input
            id="manuscript"
            name="manuscript"
            type="file"
            accept={MANUSCRIPT_FILE_TYPES}
            className="mt-3 block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-foreground hover:file:bg-brand-dark"
            onChange={(e) => {
              const chosen = e.currentTarget.files?.[0];
              setFile(chosen ? { name: chosen.name, size: chosen.size } : null);
              setTooBig(Boolean(chosen && chosen.size > MAX_FILE_BYTES));
            }}
          />

          <p className="mt-2 text-[11px] text-muted-foreground">
            {MANUSCRIPT_FILE_TYPES.replace(/\./g, "").toUpperCase().split(",").join(", ")}{" "}
            · up to {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB
          </p>
        </div>

        {file && (
          <p className="mt-2.5 flex items-center gap-2 rounded-lg border p-2.5 text-xs">
            <Paperclip
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate font-medium">
              {file.name}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {Math.round(file.size / 1024)} KB
            </span>
          </p>
        )}

        {tooBig && (
          <p className="mt-2 text-xs font-medium text-danger">
            That file is over {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.
          </p>
        )}

        {state.status === "error" && state.errors?.manuscript && (
          <p className="mt-2 text-xs font-medium text-danger">
            {state.errors.manuscript}
          </p>
        )}
      </div>

      <Field
        label="Response to reviewers"
        htmlFor="responseToReviewers"
        required
        error={state.status === "error" ? state.errors?.responseToReviewers : undefined}
        hint="Point by point: what each reviewer asked, what you changed, and where. Where you disagree, say so and why — a reasoned disagreement is a normal part of revision, and an editor would rather read it than find the change missing."
      >
        <Textarea
          id="responseToReviewers"
          name="responseToReviewers"
          rows={12}
          defaultValue={state.values?.responseToReviewers}
        />
      </Field>

      {/* Said before the button, not after: an author who reads this having
          already submitted has been told too late. */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        Uploading does not put the manuscript back under review — that is the
        editor&rsquo;s decision. The editorial office is emailed when your
        revision arrives, and the editor picks it up from there under{" "}
        <span className="font-medium">{reference}</span>.
      </p>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading…" : "Upload revision"}
    </Button>
  );
}
