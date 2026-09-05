"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";

export type SectionRow = {
  name: string;
  count: number;
  /** On manuscripts but not in the declared scope — the drift this page exists to show. */
  declared: boolean;
};

/**
 * Add, rename and remove subject sections.
 *
 * UI ONLY. Edits live in component state and are gone on reload — there is no
 * section registry to write to, and a deployed app cannot rewrite the aims &
 * scope page it copies its list from. The form is the interface a registry will
 * attach to.
 *
 * Undeclared rows keep their marking while being edited, because renaming
 * "Gender Studies" to "Gender & Development" is exactly the operation this
 * screen exists to make possible, and the reader needs to see which row is the
 * problem while they fix it.
 */
export function SectionsEditor({ initial }: { initial: SectionRow[] }) {
  const [rows, setRows] = useState<SectionRow[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function startEdit(name: string) {
    setEditing(name);
    setDraft(name);
    setAdding(false);
  }

  function commitEdit(original: string) {
    const name = draft.trim();
    if (!name) return;
    setRows((current) =>
      current.map((r) =>
        // Renaming a row to a declared name is the reconciliation, so the row
        // stops being marked at the same moment.
        r.name === original
          ? { ...r, name, declared: r.declared || isDeclaredName(name, current) }
          : r,
      ),
    );
    setEditing(null);
  }

  function remove(name: string) {
    setRows((current) => current.filter((r) => r.name !== name));
  }

  function add() {
    const name = newName.trim();
    if (!name) return;
    setRows((current) => [...current, { name, count: 0, declared: true }]);
    setNewName("");
    setAdding(false);
  }

  return (
    <div>
      <ul className="mt-3 divide-y rounded-xl border">
        {rows.map((row) => (
          <li
            key={row.name}
            className={
              row.declared
                ? "p-3"
                : "bg-warning/5 p-3"
            }
          >
            {editing === row.name ? (
              /* ------------------------------------------- rename in place */
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Field label="Section name" htmlFor={`rename-${row.name}`}>
                    <Input
                      id={`rename-${row.name}`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      autoFocus
                    />
                  </Field>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => commitEdit(row.name)}>
                    <Check className="size-4" aria-hidden />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(null)}
                  >
                    <X className="size-4" aria-hidden />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ------------------------------------------------- read row */
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                  {!row.declared && (
                    <AlertTriangle
                      className="size-3.5 shrink-0 text-warning"
                      aria-hidden
                    />
                  )}
                  {row.name}
                  {!row.declared && (
                    <span className="text-xs font-normal text-warning">
                      not declared
                    </span>
                  )}
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {row.count === 0 ? (
                      "No manuscripts"
                    ) : (
                      <Link
                        href={`/editorial/queue?section=${encodeURIComponent(row.name)}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.count}{" "}
                        {row.count === 1 ? "manuscript" : "manuscripts"}
                      </Link>
                    )}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(row.name)}
                    aria-label={`Rename ${row.name}`}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Rename
                  </Button>

                  {/* A section holding manuscripts cannot be removed without
                      deciding where they go, and that decision needs the
                      registry this screen does not have yet. */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(row.name)}
                    disabled={row.count > 0}
                    aria-label={`Remove ${row.name}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Remove
                  </Button>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* ------------------------------------------------------------- add */}
      <div className="mt-3">
        {adding ? (
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-brand-border bg-brand-tint/30 p-3">
            <div className="min-w-0 flex-1">
              <Field
                label="New section name"
                htmlFor="new-section"
                hint="Use the name exactly as the aims & scope page states it."
              >
                <Input
                  id="new-section"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Gender & Development"
                  autoFocus
                />
              </Field>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" onClick={add}>
                <Check className="size-4" aria-hidden />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Add a section
          </Button>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Changes here are not saved — there is no section registry yet, so they
        are gone on reload.
      </p>
    </div>
  );
}

/** A renamed row is reconciled when it matches a name already declared. */
function isDeclaredName(name: string, rows: SectionRow[]) {
  return rows.some((r) => r.declared && r.name === name);
}
