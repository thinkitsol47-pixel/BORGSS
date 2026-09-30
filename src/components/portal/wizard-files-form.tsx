"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { CheckCircle2, FileUp, Paperclip } from "lucide-react";
import {
  saveFiles,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import {
  MANUSCRIPT_FILE_TYPES,
  MAX_FILE_BYTES,
  SUPPLEMENTARY_FILE_TYPES,
} from "@/lib/validation/schemas";
import { Alert, Button, Field, Textarea } from "@/components/ui";
import { WizardNav } from "./wizard-nav";
import { cn } from "@/lib/utils";

const initialState: WizardState = { status: "idle" };

export function WizardFilesForm({ draftId }: { draftId: string }) {
  const [state, formAction] = useFormState(saveFiles, initialState);

  if (state.status === "success") {
    return (
      <StepSuccess message={state.message} nextHref={`/submissions/new/${draftId}/metadata`} />
    );
  }

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {/* Which draft these files belong to. The action re-checks that this
          user owns it rather than trusting the value. */}
      <input type="hidden" name="draftId" value={draftId} />

      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not continue">
          {state.message}
        </Alert>
      )}

      <FilePicker
        name="manuscript"
        label="Anonymised manuscript"
        required
        accept={MANUSCRIPT_FILE_TYPES}
        error={state.errors?.manuscriptName}
        hint="No author names, affiliations, acknowledgements or funding statements anywhere in the file — including its document properties, which reviewers can see."
      />

      <FilePicker
        name="titlePage"
        label="Title page"
        required
        accept={MANUSCRIPT_FILE_TYPES}
        error={state.errors?.titlePageName}
        hint="A separate file with every author's name, affiliation and ORCID, and the corresponding author's contact details. Reviewers never receive this."
      />

      <FilePicker
        name="supplementary"
        label="Figures, tables and supplementary files"
        accept={SUPPLEMENTARY_FILE_TYPES}
        multiple
        hint="Optional. Figures at publication resolution; data files where you are able to share them."
      />

      <Field
        label="Cover letter"
        htmlFor="coverLetter"
        optional
        error={state.errors?.coverLetter}
        hint="Why this journal, and anything the editor should know — a related paper under review elsewhere, or a reviewer you would prefer be avoided and why."
      >
        <Textarea
          name="coverLetter"
          rows={6}
          defaultValue={state.values?.coverLetter}
        />
      </Field>

      <WizardNav
        backHref="/submissions/new"
        submitLabel="Continue to metadata"
      />
    </form>
  );
}

/**
 * A file input that shows what was chosen.
 *
 * The bytes are posted for real — a Server Action receives `FormData`, so the
 * file inputs need no endpoint of their own. The hidden mirror of the filename
 * is kept because the Zod schema validates *that a file was chosen* before the
 * action reads any bytes, which keeps the "you forgot the title page" error
 * cheap and identical to every other field error on the form.
 */
function FilePicker({
  name,
  label,
  hint,
  error,
  accept,
  required,
  multiple,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  accept: string;
  required?: boolean;
  multiple?: boolean;
}) {
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [tooBig, setTooBig] = useState<string[]>([]);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
        {!required && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            Optional
          </span>
        )}
      </label>
      {hint && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}

      <div
        className={cn(
          "mt-2.5 rounded-xl border border-dashed p-5 text-center transition-colors",
          error ? "border-danger" : "border-brand-border hover:border-brand",
        )}
      >
        <span
          aria-hidden
          className="mx-auto grid size-10 place-items-center rounded-lg bg-brand-tint text-brand-dark"
        >
          <FileUp className="size-5" />
        </span>

        <input
          id={name}
          // `name` is what puts the bytes in the FormData — without it the
          // browser shows the chosen filename and posts nothing, and the action
          // reports "this file did not reach the server" for a file the author
          // can plainly see. The hidden mirror below carries only the *name*,
          // so it cannot stand in for this.
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          className="mt-3 block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-foreground hover:file:bg-brand-dark"
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? []);
            setFiles(chosen.map((f) => ({ name: f.name, size: f.size })));
            setTooBig(
              chosen.filter((f) => f.size > MAX_FILE_BYTES).map((f) => f.name),
            );
          }}
        />

        <p className="mt-2 text-[11px] text-muted-foreground">
          {accept.replace(/\./g, "").toUpperCase().split(",").join(", ")} ·
          up to {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB each
        </p>
      </div>

      {/* Mirrors the first chosen filename so the action can see it. */}
      <input type="hidden" name={`${name}Name`} value={files[0]?.name ?? ""} />

      {files.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center gap-2 rounded-lg border p-2.5 text-xs"
            >
              <Paperclip
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {f.name}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {Math.round(f.size / 1024)} KB
              </span>
            </li>
          ))}
        </ul>
      )}

      {tooBig.length > 0 && (
        <p className="mt-2 text-xs font-medium text-danger">
          Too large (over {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB):{" "}
          {tooBig.join(", ")}
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  );
}

/** Shared success panel for wizard steps. */
export function StepSuccess({
  message,
  nextHref,
}: {
  message?: string;
  nextHref: string;
}) {
  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-6">
      <span
        aria-hidden
        className="grid size-11 place-items-center rounded-xl bg-success/10 text-success"
      >
        <CheckCircle2 className="size-5" />
      </span>
      <h2 className="mt-3 font-serif text-lg font-semibold">
        This step is valid
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      {/* This used to read "the next step starts empty — nothing carries
          across without a draft to hold it", written when the wizard held no
          state. It contradicted the line directly above it, which now says how
          many files were stored, and it is the exact kind of stale notice that
          makes a reader doubt the rest of the screen. */}
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Everything you have entered is saved against this submission. You can
        leave and come back to it from{" "}
        <span className="font-medium">My submissions</span> — nothing is sent to
        the editorial office until the final step.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button href={nextHref}>See the next step</Button>
        <Button href="/submissions" variant="outline">
          Back to my submissions
        </Button>
      </div>
    </div>
  );
}
