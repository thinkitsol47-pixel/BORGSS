"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  saveContributors,
  type WizardState,
} from "@/app/(dashboard)/submissions/actions";
import { Alert, Button, Field, Input, Radio } from "@/components/ui";
import { WizardNav } from "./wizard-nav";
import { StepSuccess } from "./wizard-files-form";
import { cn } from "@/lib/utils";

const initialState: WizardState = { status: "idle" };

const MAX_AUTHORS = 15;

/**
 * The author list.
 *
 * Rows are indexed (`givenName-0`, `givenName-1`, …) rather than posted as an
 * array, because a plain form post has no array encoding and this has to keep
 * working the way the rest of the portal does. The action re-indexes the
 * errors so each row shows its own.
 *
 * Order matters and is not alphabetical: author order is a claim about
 * contribution, so the list has explicit move controls rather than sorting
 * itself.
 */
/** One stored author row, as the loader returns it. */
export type SavedContributor = {
  givenName: string;
  familyName: string;
  email: string;
  affiliation: string;
  orcid: string;
  isCorresponding: boolean;
};

export function WizardContributorsForm({
  draftId,
  saved,
}: {
  draftId: string;
  saved?: SavedContributor[];
}) {
  const [state, formAction] = useFormState(saveContributors, initialState);

  /**
   * One row per stored author, or a single blank row for a new draft.
   *
   * The row ids are indices into `saved`, which is what lets each field below
   * find its own stored value — the form posts `givenName-0`, `givenName-1`
   * and so on, so the id *is* the position. Reordering swaps ids, and the
   * action rewrites the list wholesale on save, so a moved row keeps its
   * values.
   */
  const initialRows = saved && saved.length > 0 ? saved.map((_, i) => i) : [0];
  const [rows, setRows] = useState<number[]>(initialRows);
  const [corresponding, setCorresponding] = useState(() => {
    const i = saved?.findIndex((c) => c.isCorresponding) ?? -1;
    return i >= 0 ? i : 0;
  });

  if (state.status === "success") {
    return (
      <StepSuccess
        message={state.message}
        nextHref={`/submissions/new/${draftId}/declarations`}
      />
    );
  }

  function addRow() {
    setRows((r) => [...r, r.length ? Math.max(...r) + 1 : 0]);
  }

  function removeRow(id: number) {
    setRows((r) => r.filter((x) => x !== id));
    // The corresponding author cannot be a row that no longer exists.
    if (corresponding === id) setCorresponding(rows.filter((x) => x !== id)[0] ?? 0);
  }

  function move(id: number, by: -1 | 1) {
    setRows((r) => {
      const i = r.indexOf(id);
      const j = i + by;
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* The draft these answers belong to. The action re-checks that this
          user owns it rather than trusting the value. */}
      <input type="hidden" name="draftId" value={draftId} />

      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not continue">
          {state.message}
        </Alert>
      )}

      <div className="rounded-xl border border-brand-border bg-brand-tint/25 p-4">
        <p className="text-sm font-medium">Who counts as an author</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Everyone listed must have contributed substantially to the work,
          approved the version being submitted, and be willing to be
          accountable for it. Funding a study, supervising a department, or
          providing data alone does not qualify — acknowledge those
          contributions instead.
        </p>
      </div>

      {/* The action reads this to know how many rows to validate. */}
      <input type="hidden" name="contributorCount" value={rows.length} />

      <ol className="space-y-4">
        {rows.map((id, index) => (
          <li key={id}>
            <fieldset className="rounded-xl border p-4">
              <legend className="sr-only">Author {index + 1}</legend>

              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <GripVertical
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                  Author {index + 1}
                  {index === 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      (first author)
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(id, -1)}
                    disabled={index === 0}
                    aria-label={`Move author ${index + 1} up`}
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-brand-tint hover:text-brand-darker disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(id, 1)}
                    disabled={index === rows.length - 1}
                    aria-label={`Move author ${index + 1} down`}
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-brand-tint hover:text-brand-darker disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Down
                  </button>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(id)}
                      aria-label={`Remove author ${index + 1}`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Given name"
                  htmlFor={`givenName-${id}`}
                  required
                  error={state.errors?.[`givenName-${id}`]}
                >
                  <Input
                    name={`givenName-${id}`}
                    defaultValue={
                      v[`givenName-${id}`] ?? saved?.[id]?.givenName ?? ""
                    }
                  />
                </Field>
                <Field
                  label="Family name"
                  htmlFor={`familyName-${id}`}
                  required
                  error={state.errors?.[`familyName-${id}`]}
                >
                  <Input
                    name={`familyName-${id}`}
                    defaultValue={
                      v[`familyName-${id}`] ?? saved?.[id]?.familyName ?? ""
                    }
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Email address"
                  htmlFor={`email-${id}`}
                  required
                  error={state.errors?.[`email-${id}`]}
                  hint="Every author is emailed to confirm they agree to be listed."
                >
                  <Input
                    name={`email-${id}`}
                    type="email"
                    defaultValue={v[`email-${id}`] ?? saved?.[id]?.email ?? ""}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Institution"
                  htmlFor={`affiliation-${id}`}
                  required
                  error={state.errors?.[`affiliation-${id}`]}
                  hint="As it should be printed — the affiliation where the work was done."
                >
                  <Input
                    name={`affiliation-${id}`}
                    defaultValue={
                      v[`affiliation-${id}`] ?? saved?.[id]?.affiliation ?? ""
                    }
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="ORCID iD"
                  htmlFor={`orcid-${id}`}
                  optional
                  error={state.errors?.[`orcid-${id}`]}
                  hint="0000-0002-1825-0097"
                >
                  <Input
                    name={`orcid-${id}`}
                    defaultValue={v[`orcid-${id}`] ?? saved?.[id]?.orcid ?? ""}
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <label
                htmlFor={`corresponding-${id}`}
                className={cn(
                  "mt-4 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  corresponding === id
                    ? "border-brand bg-brand-tint/40"
                    : "border-brand-border hover:border-brand",
                )}
              >
                <Radio
                  id={`corresponding-${id}`}
                  name="corresponding"
                  value={String(id)}
                  checked={corresponding === id}
                  onChange={() => setCorresponding(id)}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    Corresponding author
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    Receives every decision and is accountable for the
                    submission. Exactly one.
                  </span>
                </span>
              </label>
            </fieldset>
          </li>
        ))}
      </ol>

      {state.errors?.corresponding && (
        <p className="text-xs font-medium text-danger">
          {state.errors.corresponding}
        </p>
      )}

      {rows.length < MAX_AUTHORS && (
        <Button type="button" variant="outline" onClick={addRow}>
          <Plus className="size-4" aria-hidden />
          Add another author
        </Button>
      )}

      <WizardNav
        backHref={`/submissions/new/${draftId}/metadata`}
        submitLabel="Continue to declarations"
      />
    </form>
  );
}
