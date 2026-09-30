"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createPost,
  updatePost,
  type PostState,
} from "@/app/(dashboard)/admin/announcements/actions";
import { Alert, Button, Field, Input, Select } from "@/components/ui";
import type { AnnouncementCategory, Post, PostKind } from "@/types";

/**
 * Create or edit an announcement, news item or event.
 *
 * One form for all three kinds, because `Post` is one shape and three
 * near-identical forms would drift. The kind selector changes which extra
 * fields appear: a category for announcements, date and location for events.
 *
 * On success the action redirects to the list, so there is no success state
 * here — only the error path renders, with every field echoed back.
 */

const initialState: PostState = { status: "idle" };

const CATEGORIES: { value: AnnouncementCategory; label: string }[] = [
  { value: "call-for-papers", label: "Call for papers" },
  { value: "policy-update", label: "Policy update" },
  { value: "issue-release", label: "Issue release" },
  { value: "general", label: "General" },
];

const textareaClass =
  "w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export function PostForm({ post }: { post?: Post }) {
  const isEdit = Boolean(post);
  const [state, formAction] = useFormState(
    isEdit ? updatePost : createPost,
    initialState,
  );
  const v = state.values ?? {};
  const [kind, setKind] = useState<PostKind>(
    (v.kind as PostKind) ?? post?.kind ?? "announcement",
  );

  /** A date column arrives as an ISO timestamp; the input wants YYYY-MM-DD. */
  const day = (iso?: string) => iso?.slice(0, 10);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {isEdit && <input type="hidden" name="id" value={post!.id} />}

      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not save">
          {state.message}
        </Alert>
      )}

      {/* ----------------------------------------------------------- what */}
      <section>
        <h2 className="font-serif text-lg font-semibold">What this is</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Kind"
            htmlFor="kind"
            required
            hint={
              isEdit
                ? "Changing the kind moves the post to a different public list."
                : "Which of the three public lists it appears on."
            }
          >
            <Select
              id="kind"
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as PostKind)}
            >
              <option value="announcement">Announcement</option>
              <option value="news">News</option>
              <option value="event">Event</option>
            </Select>
          </Field>

          {/* Only announcements are grouped by category on the public list. */}
          {kind === "announcement" && (
            <Field label="Category" htmlFor="category" required error={state.errors?.category}>
              <Select
                id="category"
                name="category"
                defaultValue={v.category ?? post?.category ?? "general"}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- content */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Content</h2>
        <div className="mt-4 space-y-4">
          <Field label="Title" htmlFor="title" required error={state.errors?.title}>
            <Input
              id="title"
              name="title"
              defaultValue={v.title ?? post?.title}
              placeholder="Call for Papers — Volume 2, Issue 1"
              required
            />
          </Field>

          <Field
            label="URL slug"
            htmlFor="slug"
            required
            error={state.errors?.slug}
            hint={
              isEdit
                ? "Changing this breaks every existing link to the post."
                : "Lowercase words joined by hyphens. It becomes the page address."
            }
          >
            <Input
              id="slug"
              name="slug"
              defaultValue={v.slug ?? post?.slug}
              placeholder="call-for-papers-volume-2"
              pattern="[a-z0-9-]+"
              required
            />
          </Field>

          <Field
            label="Summary"
            htmlFor="summary"
            required
            error={state.errors?.summary}
            hint="One sentence. It is what the listing page and any social card shows."
          >
            <textarea
              id="summary"
              name="summary"
              rows={2}
              defaultValue={v.summary ?? post?.summary}
              required
              className={textareaClass}
            />
          </Field>

          <Field
            label="Body"
            htmlFor="body"
            required
            error={state.errors?.body}
            hint="One paragraph per line. Blank lines are ignored."
          >
            <textarea
              id="body"
              name="body"
              rows={10}
              defaultValue={v.body ?? post?.body.join("\n\n")}
              required
              className={textareaClass}
            />
          </Field>
        </div>
      </section>

      {/* ----------------------------------------------------------- dates */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Publication date"
            htmlFor="publishedAt"
            required
            error={state.errors?.publishedAt}
            hint="A date in the future is scheduled: the public list shows it when it arrives."
          >
            <Input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={v.publishedAt ?? day(post?.publishedAt)}
              required
            />
          </Field>

          <Field
            label="Expires"
            htmlFor="expiresAt"
            optional
            error={state.errors?.expiresAt}
            hint="After this it drops off the public list. Leave blank for no expiry."
          >
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={v.expiresAt ?? day(post?.expiresAt)}
            />
          </Field>
        </div>
      </section>

      {/* ---------------------------------------------------------- event */}
      {kind === "event" && (
        <section>
          <h2 className="font-serif text-lg font-semibold">Event details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Starts" htmlFor="startsAt" required error={state.errors?.startsAt}>
              <Input
                id="startsAt"
                name="startsAt"
                type="date"
                defaultValue={v.startsAt ?? day(post?.event?.startsAt)}
                required
              />
            </Field>
            <Field label="Ends" htmlFor="endsAt" optional error={state.errors?.endsAt}>
              <Input
                id="endsAt"
                name="endsAt"
                type="date"
                defaultValue={v.endsAt ?? day(post?.event?.endsAt)}
              />
            </Field>
            <Field
              label="Location"
              htmlFor="location"
              required
              error={state.errors?.location}
              hint="A place, or “Online” for a remote event."
            >
              <Input
                id="location"
                name="location"
                defaultValue={v.location ?? post?.event?.location}
                placeholder="Karachi, Pakistan"
                required
              />
            </Field>
            <Field label="Registration deadline" htmlFor="deadline" optional error={state.errors?.deadline}>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={v.deadline ?? day(post?.event?.deadline)}
              />
            </Field>
            <Field
              label="Registration link"
              htmlFor="registerUrl"
              optional
              error={state.errors?.registerUrl}
              className="sm:col-span-2"
            >
              <Input
                id="registerUrl"
                name="registerUrl"
                type="url"
                defaultValue={v.registerUrl ?? post?.event?.registerUrl}
                placeholder="https://…"
              />
            </Field>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- actions */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <SubmitButton isEdit={isEdit} />
        <Button href="/admin/announcements" variant="outline">
          Cancel
        </Button>
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? "Saving updates the public page immediately."
            : "Publishing puts this on the public site straight away."}
        </p>
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : isEdit ? "Save changes" : "Publish"}
    </Button>
  );
}
