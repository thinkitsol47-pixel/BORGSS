"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Save, UserMinus, UserPlus } from "lucide-react";
import {
  removeFromReviewerPool,
  saveReviewerPool,
  type UserAdminState,
} from "@/app/(dashboard)/admin/users/actions";
import { Alert, Button, Checkbox, Field, Textarea } from "@/components/ui";
import { givenNameOf } from "@/lib/utils";

const initialState: UserAdminState = { status: "idle" };

/**
 * Put an account into the reviewer pool, or edit what its entry says.
 *
 * **The role and the pool are different things**, and this form exists because
 * nothing in the portal joined them. Registration grants `reviewer` to anyone
 * who ticks the box; an editor's shortlist is built from `ReviewerProfile`,
 * which only the seed ever wrote. An account could hold the role for months
 * and never reach a single editor — with nothing on any screen to explain the
 * silence.
 *
 * Two fields do the work, and each is shaped by how the matcher reads it:
 *
 * - **Expertise** is compared against a manuscript's keywords in both
 *   directions, so "microfinance" matches a manuscript keyed "microfinance
 *   access" and the reverse. One term per line, because each is judged alone —
 *   a sentence would match nothing.
 * - **Sections** are checkboxes from the live registry, never free text.
 *   `sectionMatch` is an exact string comparison, so "Psychology" typed against
 *   a registry reading "Psychology & Behavioural Science" silently never
 *   matches. The seeded rows carry exactly that bug; a form that accepted
 *   typing would keep making it.
 *
 * Availability is deliberately absent. It separates the reviewer's own
 * statement ("unavailable until March") from the journal's inference ("holding
 * three already"), and an administrator setting either would be putting words
 * in someone else's mouth.
 */
export function ReviewerPoolForm({
  userId,
  name,
  inPool,
  expertise,
  sections,
  note,
  allSections,
  hasReviewerRole,
}: {
  userId: string;
  name: string;
  inPool: boolean;
  expertise: string[];
  sections: string[];
  note?: string;
  /** Section names from the registry, in display order. */
  allSections: string[];
  hasReviewerRole: boolean;
}) {
  const [state, formAction] = useFormState(saveReviewerPool, initialState);
  const [removeState, removeAction] = useFormState(
    removeFromReviewerPool,
    initialState,
  );
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const firstName = givenNameOf(name);

  // Stated before the form rather than after a refused save: without the role
  // an editor cannot invite them, so a pool entry would surface on the
  // shortlist and fail at the click.
  if (!hasReviewerRole) {
    return (
      <Alert tone="info" title="Not a reviewer yet">
        {firstName} does not hold the Reviewer role, so an editor could not
        invite them. Grant it above, save, and this section becomes the form
        that adds them to the pool.
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      {state.status === "success" && (
        <Alert tone="success" title="Saved">
          {state.message}
        </Alert>
      )}
      {state.status === "error" && (
        <Alert tone="danger" title="Nothing was changed">
          {state.message ??
            state.errors?.expertise ??
            state.errors?.sections ??
            state.errors?.note ??
            "Please check the form."}
        </Alert>
      )}
      {removeState.status === "success" && (
        <Alert tone="success" title="Removed">
          {removeState.message}
        </Alert>
      )}
      {removeState.status === "error" && (
        <Alert tone="danger" title="Nothing was changed">
          {removeState.message}
        </Alert>
      )}

      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {inPool ? (
          <>
            {firstName} is in the pool and appears on editors&rsquo; shortlists,
            ranked by how well this entry matches each manuscript.
          </>
        ) : (
          <>
            Holding the Reviewer role is not the same as being in the pool.{" "}
            {firstName} can sign in and see an empty review queue, but no editor
            is offered them until this entry exists.
          </>
        )}
      </p>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="userId" value={userId} />

        <Field
          label="Subject areas"
          htmlFor="expertise"
          required
          hint="One per line. Matched against each manuscript's keywords, so specific terms work better than broad ones — “microfinance” finds more than “economics”."
          error={state.errors?.expertise}
        >
          <Textarea
            id="expertise"
            name="expertise"
            rows={6}
            defaultValue={expertise.join("\n")}
            placeholder={"development economics\nmicrofinance\npanel data"}
          />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium">
            Sections they review for
          </legend>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Optional — a methodologist who reviews across every section is a
            real case, and subject areas still find them. Only sections this
            journal publishes are offered: a name typed by hand would never
            match anything.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {allSections.map((s) => (
              <li key={s}>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-brand-border p-3 text-sm transition-colors hover:border-brand hover:bg-brand-tint/40 has-[:checked]:border-brand has-[:checked]:bg-brand-tint/60">
                  <Checkbox
                    name="sections"
                    value={s}
                    defaultChecked={sections.includes(s)}
                  />
                  <span className="min-w-0 font-medium">{s}</span>
                </label>
              </li>
            ))}
          </ul>
          {state.errors?.sections && (
            <p className="mt-2 text-xs font-medium text-danger">
              {state.errors.sections}
            </p>
          )}
        </fieldset>

        <Field
          label="Editor-only note"
          htmlFor="note"
          optional
          hint="Seen by editors choosing a reviewer, never by the reviewer or an author. e.g. “thorough on quantitative methods; slow in summer”."
          error={state.errors?.note}
        >
          <Textarea id="note" name="note" rows={3} defaultValue={note ?? ""} />
        </Field>

        <div className="flex flex-wrap items-center gap-3 border-t pt-5">
          <SaveButton inPool={inPool} />
          <p className="text-xs text-muted-foreground">
            Written to the audit log with your name against it.
          </p>
        </div>
      </form>

      {inPool && (
        <div className="border-t pt-5">
          {!confirmingRemoval ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmingRemoval(true)}
            >
              <UserMinus className="size-4" aria-hidden />
              Remove from the pool
            </Button>
          ) : (
            <form action={removeAction} className="space-y-3">
              <input type="hidden" name="userId" value={userId} />
              <Alert tone="warning" title="Remove from the reviewer pool?">
                {firstName} stops appearing on shortlists. Their account, the
                Reviewer role and every report they have already returned stay
                exactly as they are — a report is part of a manuscript&rsquo;s
                history and outlives pool membership.
              </Alert>
              <div className="flex flex-wrap gap-2">
                <RemoveButton />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmingRemoval(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function SaveButton({ inPool }: { inPool: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Saving…
        </>
      ) : inPool ? (
        <>
          <Save className="size-4" aria-hidden />
          Save reviewer entry
        </>
      ) : (
        <>
          <UserPlus className="size-4" aria-hidden />
          Add to the reviewer pool
        </>
      )}
    </Button>
  );
}

function RemoveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" size="sm" disabled={pending}>
      {pending ? "Removing…" : "Yes, remove from the pool"}
    </Button>
  );
}
