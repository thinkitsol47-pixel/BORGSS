"use client";

import { Button, Field, Input, Select } from "@/components/ui";
import type { EditorialIssue } from "@/types";

/**
 * Create or edit an issue.
 *
 * Volume, number and year identify an issue and appear in every citation of
 * every article in it, so they are the fields that most need getting right
 * before anything is placed. The target date is explicitly a plan: an issue
 * publishes when its contents are ready, and the form says so rather than
 * letting the date read as a commitment made to authors.
 *
 * UI ONLY. Nothing is saved — there is no database.
 */
export function IssueForm({ issue }: { issue?: EditorialIssue }) {
  const isEdit = Boolean(issue);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert(
      "Nothing was saved — there is no database yet.\n\nIssue planning is not built; the editorial office plans issues outside the system for now.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <h2 className="font-serif text-lg font-semibold">Identity</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Volume, number and year appear in the citation of every article this
          issue carries. They are worth settling before anything is placed in
          it, because a citation that has been published cannot be corrected
          quietly.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Volume" htmlFor="volume" required>
            <Input
              id="volume"
              name="volume"
              type="number"
              min={1}
              defaultValue={issue?.volume ?? 2}
              required
            />
          </Field>
          <Field label="Number" htmlFor="number" required>
            <Input
              id="number"
              name="number"
              type="number"
              min={1}
              defaultValue={issue?.number ?? 1}
              required
            />
          </Field>
          <Field label="Year" htmlFor="year" required>
            <Input
              id="year"
              name="year"
              type="number"
              min={2020}
              defaultValue={issue?.year ?? new Date().getFullYear()}
              required
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="Issue title"
            htmlFor="title"
            optional
            hint="A theme, if the issue has one. Most do not, and that is fine."
          >
            <Input
              id="title"
              name="title"
              defaultValue={issue?.title}
              placeholder="Credit, Care and Communication"
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold">Planning</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Target publication date"
            htmlFor="targetDate"
            required
            hint="A plan, not a promise. An issue publishes when its contents are ready."
          >
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              defaultValue={issue?.targetDate}
              required
            />
          </Field>

          <Field
            label="Articles planned"
            htmlFor="plannedArticles"
            optional
            hint="A target for your own planning, never a cap on what can go in."
          >
            <Input
              id="plannedArticles"
              name="plannedArticles"
              type="number"
              min={1}
              defaultValue={issue?.plannedArticles}
              placeholder="5"
            />
          </Field>

          <Field
            label="State"
            htmlFor="state"
            required
            hint="Publishing an issue makes it public and cannot be undone quietly."
          >
            <Select id="state" name="state" defaultValue={issue?.state ?? "planned"}>
              <option value="planned">Planned — open for manuscripts</option>
              <option value="in-production">
                In production — contents fixed
              </option>
              <option value="published">Published — public</option>
            </Select>
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit">{isEdit ? "Save changes" : "Create issue"}</Button>
        <Button
          href={isEdit ? `/editorial/issues/${issue!.id}` : "/editorial/issues"}
          variant="outline"
        >
          Cancel
        </Button>
        <p className="text-xs text-muted-foreground">
          Nothing is saved yet — there is no database.
        </p>
      </div>
    </form>
  );
}
