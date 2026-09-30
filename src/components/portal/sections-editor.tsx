"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Check, Pencil, Plus, X } from "lucide-react";
import {
  createSection,
  renameSection,
  toggleSection,
  type SettingsState,
} from "@/app/(dashboard)/admin/settings/actions";
import { Alert, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * The journal's subject sections, editable.
 *
 * **`Section` is a real table with a foreign key**, so renaming here moves
 * every manuscript filed under it — the whole point of the registry. Before it
 * existed a submission's section was a plain string, and the fixtures drifted:
 * manuscripts filed under "Gender Studies" when the declared area was
 * "Gender & Development". Two names for one section split its queue filter in
 * half and would split its statistics too.
 *
 * **Nothing is deleted.** A section holding manuscripts cannot be removed
 * without breaking their history, and an empty one may still be named on the
 * public aims & scope page. Deactivating stops it being offered to new authors
 * while everything already filed under it keeps working, which is what the
 * `active` column exists for — so the control says "Stop offering", not
 * "Delete".
 */

export type SectionRow = {
  id: string;
  name: string;
  active: boolean;
  submissionCount: number;
  /** Whether the public aims & scope page declares this name. */
  declared: boolean;
};

const initialState: SettingsState = { status: "idle" };

export function SectionsEditor({ sections }: { sections: SectionRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [createState, createAction] = useFormState(createSection, initialState);
  const [renameState, renameAction] = useFormState(renameSection, initialState);
  const [toggleState, toggleAction] = useFormState(toggleSection, initialState);

  // One banner for whichever action last spoke. Three separate ones would put
  // a success message from a rename above an error from an add.
  const last =
    [createState, renameState, toggleState].find(
      (s) => s.status !== "idle" && s.message,
    ) ?? null;

  return (
    <div>
      {last?.status === "error" && (
        <Alert tone="danger" title="Could not save" className="mb-4">
          {last.message}
        </Alert>
      )}
      {last?.status === "success" && (
        <Alert tone="success" title="Saved" className="mb-4">
          {last.message}
        </Alert>
      )}

      <ul className="divide-y rounded-xl border">
        {sections.map((s) => (
          <li key={s.id} className="p-4">
            {editing === s.id ? (
              <form action={renameAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="sectionId" value={s.id} />
                <label htmlFor={`name-${s.id}`} className="sr-only">
                  New name for {s.name}
                </label>
                <Input
                  id={`name-${s.id}`}
                  name="name"
                  defaultValue={s.name}
                  className="min-w-0 flex-1"
                  autoFocus
                />
                <Button type="submit" size="sm">
                  <Check className="size-4" aria-hidden />
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span
                  className={cn(
                    "min-w-0 flex-1 font-medium",
                    !s.active && "text-muted-foreground line-through",
                  )}
                >
                  {s.name}
                </span>

                <span className="text-xs text-muted-foreground">
                  {s.submissionCount === 0
                    ? "No manuscripts"
                    : `${s.submissionCount} manuscript${s.submissionCount === 1 ? "" : "s"}`}
                </span>

                {!s.declared && (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    Not on aims &amp; scope
                  </span>
                )}

                {!s.active && (
                  <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                    Not offered
                  </span>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(s.id);
                    setAdding(false);
                  }}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Rename
                </Button>

                <form action={toggleAction}>
                  <input type="hidden" name="sectionId" value={s.id} />
                  <Button type="submit" size="sm" variant="outline">
                    {s.active ? (
                      <>
                        <X className="size-3.5" aria-hidden />
                        Stop offering
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5" aria-hidden />
                        Offer again
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {adding ? (
          <form action={createAction} className="flex flex-wrap gap-2">
            <label htmlFor="new-section" className="sr-only">
              New section name
            </label>
            <Input
              id="new-section"
              name="name"
              placeholder="e.g. Migration & Diaspora Studies"
              className="min-w-0 flex-1"
              autoFocus
            />
            <Button type="submit" size="sm">
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add a section
          </Button>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Renaming moves every manuscript filed under a section — they hold a
        reference to it, not a copy of its name. Sections are never deleted: one
        that is no longer offered keeps its history and can be offered again.
      </p>
    </div>
  );
}
