"use client";

import { useState } from "react";
import { Button, Field, Input, Select } from "@/components/ui";
import type { AnnouncementCategory, Post, PostKind } from "@/types";

/**
 * Create or edit an announcement, news item or event.
 *
 * One form for all three kinds, because `Post` is one shape and three
 * near-identical forms would drift. The kind selector changes which extra
 * fields appear: a category for announcements, date and location for events.
 *
 * UI ONLY. Nothing is saved — there is no database.
 */

const CATEGORIES: { value: AnnouncementCategory; label: string }[] = [
  { value: "call-for-papers", label: "Call for papers" },
  { value: "policy-update", label: "Policy update" },
  { value: "issue-release", label: "Issue release" },
  { value: "general", label: "General" },
];

const textareaClass =
  "w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export function PostForm({ post }: { post?: Post }) {
  const [kind, setKind] = useState<PostKind>(post?.kind ?? "announcement");
  const isEdit = Boolean(post);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert(
      "Nothing was saved — there is no database yet.\n\nAnnouncements, news and events are fixtures in mock-data.ts; adding one means editing that file and deploying.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            <Field label="Category" htmlFor="category" required>
              <Select
                id="category"
                name="category"
                defaultValue={post?.category ?? "general"}
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
          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              defaultValue={post?.title}
              placeholder="Call for Papers — Volume 2, Issue 1"
              required
            />
          </Field>

          <Field
            label="URL slug"
            htmlFor="slug"
            required
            hint={
              isEdit
                ? "Changing this breaks every existing link to the post."
                : "Lowercase words joined by hyphens. It becomes the page address."
            }
          >
            <Input
              id="slug"
              name="slug"
              defaultValue={post?.slug}
              placeholder="call-for-papers-volume-2"
              pattern="[a-z0-9-]+"
              required
            />
          </Field>

          <Field
            label="Summary"
            htmlFor="summary"
            required
            hint="One sentence. It is what the listing page and any social card shows."
          >
            <textarea
              id="summary"
              name="summary"
              rows={2}
              defaultValue={post?.summary}
              required
              className={textareaClass}
            />
          </Field>

          <Field
            label="Body"
            htmlFor="body"
            required
            hint="One paragraph per line. Blank lines are ignored."
          >
            <textarea
              id="body"
              name="body"
              rows={10}
              defaultValue={post?.body.join("\n\n")}
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
            hint="A date in the future is scheduled: the public list shows it when it arrives."
          >
            <Input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={post?.publishedAt}
              required
            />
          </Field>

          <Field
            label="Expires"
            htmlFor="expiresAt"
            optional
            hint="After this it drops off the public list. Leave blank for no expiry."
          >
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={post?.expiresAt}
            />
          </Field>
        </div>
      </section>

      {/* ---------------------------------------------------------- event */}
      {kind === "event" && (
        <section>
          <h2 className="font-serif text-lg font-semibold">Event details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Starts" htmlFor="startsAt" required>
              <Input
                id="startsAt"
                name="startsAt"
                type="date"
                defaultValue={post?.event?.startsAt}
                required
              />
            </Field>
            <Field label="Ends" htmlFor="endsAt" optional>
              <Input
                id="endsAt"
                name="endsAt"
                type="date"
                defaultValue={post?.event?.endsAt}
              />
            </Field>
            <Field
              label="Location"
              htmlFor="location"
              required
              hint="A place, or “Online” for a remote event."
            >
              <Input
                id="location"
                name="location"
                defaultValue={post?.event?.location}
                placeholder="Karachi, Pakistan"
                required
              />
            </Field>
            <Field label="Registration deadline" htmlFor="deadline" optional>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={post?.event?.deadline}
              />
            </Field>
            <Field
              label="Registration link"
              htmlFor="registerUrl"
              optional
              className="sm:col-span-2"
            >
              <Input
                id="registerUrl"
                name="registerUrl"
                type="url"
                defaultValue={post?.event?.registerUrl}
                placeholder="https://…"
              />
            </Field>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- actions */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit">{isEdit ? "Save changes" : "Publish"}</Button>
        <Button href="/admin/announcements" variant="outline">
          Cancel
        </Button>
        <p className="text-xs text-muted-foreground">
          Nothing is saved yet — there is no database.
        </p>
      </div>
    </form>
  );
}
