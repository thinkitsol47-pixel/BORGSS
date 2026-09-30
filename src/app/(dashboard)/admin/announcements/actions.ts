"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, isUuid } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { postSchema } from "@/lib/validation/schemas";
import type { PostKind } from "@/types";

/**
 * Announcement / news / event actions.
 *
 * These write to the same `Post` rows the public site reads, so a change here
 * is live the moment it saves — which is why `revalidatePath` covers the
 * public lists and the detail page as well as the admin screen. Getting that
 * wrong would leave an editor looking at their edit on the admin page while
 * the public page still served the old copy from cache.
 *
 * `requireGroup("adminOnly")` is repeated in every action: the page's guard
 * proves nothing about a Server Action, which is its own entry point.
 */

export type PostState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

function fieldErrors(error: {
  issues: { path: (string | number)[]; message: string }[];
}) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Prisma's enums are camelCase; the form posts the kebab-case wire values. */
function kebabToCamel(value: string): string {
  return value.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** The body is one textarea; the column is paragraphs. */
function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}

/** "" from an empty date input is not a date and must not become one. */
function toDate(value?: string): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

/** Which public list a kind appears on, for revalidation. */
const PUBLIC_LIST: Record<PostKind, string> = {
  announcement: "/announcements",
  news: "/news",
  event: "/events",
};

function revalidateFor(kind: PostKind, slug: string) {
  revalidatePath("/admin/announcements");
  revalidatePath(PUBLIC_LIST[kind]);
  revalidatePath(`${PUBLIC_LIST[kind]}/${slug}`);
  // The home page carries the latest announcements.
  if (kind === "announcement") revalidatePath("/");
}

/**
 * Builds the row from validated form data. Shared by create and update so the
 * two cannot drift — an edit that wrote a field the create path did not would
 * be found only by someone comparing two posts.
 */
function rowData(d: ReturnType<typeof postSchema.parse>) {
  const isEvent = d.kind === "event";
  return {
    kind: d.kind as never,
    slug: d.slug,
    title: d.title,
    summary: d.summary,
    body: toParagraphs(d.body),
    publishedAt: toDate(d.publishedAt)!,
    // A category belongs to an announcement. Clearing it on the other two
    // kinds matters on *edit*: a post switched from announcement to news would
    // otherwise keep a badge its new list cannot filter.
    category:
      d.kind === "announcement" && d.category
        ? (kebabToCamel(d.category) as never)
        : null,
    expiresAt: toDate(d.expiresAt),
    // Same reasoning for the event block: switching an event to news must not
    // leave a start date behind that makes it sort as an event.
    eventStartsAt: isEvent ? toDate(d.startsAt) : null,
    eventEndsAt: isEvent ? toDate(d.endsAt) : null,
    eventLocation: isEvent ? d.location || null : null,
    eventDeadline: isEvent ? toDate(d.deadline) : null,
    eventRegisterUrl: isEvent ? d.registerUrl || null : null,
  };
}

export async function createPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  await requireGroup("adminOnly");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  const d = parsed.data;

  // The slug is the public URL and is unique per kind. Checked here so the
  // editor gets a message on the field rather than a constraint violation.
  const clash = await db.post.findUnique({
    where: { kind_slug: { kind: d.kind as never, slug: d.slug } },
  });
  if (clash) {
    return {
      status: "error",
      message: "That web address is already in use.",
      errors: {
        slug: `Another ${d.kind} already uses “${d.slug}”. Change it to something unique.`,
      },
      values: raw,
    };
  }

  const created = await db.post.create({ data: rowData(d) });

  await recordAudit({
    action: "post.created",
    targetType: "post",
    targetId: created.id,
    detail: { kind: d.kind, slug: d.slug, title: d.title },
  });

  revalidateFor(d.kind, d.slug);
  // redirect() throws, so it must be the last thing — anything after it never
  // runs. The list is where an editor wants to land: they can see it there.
  redirect("/admin/announcements");
}

export async function updatePost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  await requireGroup("adminOnly");

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const id = String(raw.id ?? "");

  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values: raw,
    };
  }

  if (!isUuid(id)) {
    return { status: "error", message: "That post could not be found.", values: raw };
  }
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "That post could not be found.", values: raw };
  }

  const d = parsed.data;

  // The slug or the kind may have changed; either can collide with a different
  // post. Excluding this row is what lets an editor save without touching it.
  const clash = await db.post.findUnique({
    where: { kind_slug: { kind: d.kind as never, slug: d.slug } },
  });
  if (clash && clash.id !== id) {
    return {
      status: "error",
      message: "That web address is already in use.",
      errors: {
        slug: `Another ${d.kind} already uses “${d.slug}”. Change it to something unique.`,
      },
      values: raw,
    };
  }

  await db.post.update({ where: { id }, data: rowData(d) });

  await recordAudit({
    action: "post.updated",
    targetType: "post",
    targetId: id,
    detail: { kind: d.kind, slug: d.slug, title: d.title },
  });

  // Both the old and the new location, because a changed slug or kind leaves
  // the previous public URL cached and now wrong.
  revalidateFor(existing.kind as PostKind, existing.slug);
  revalidateFor(d.kind, d.slug);
  redirect("/admin/announcements");
}

export type DeleteState = { ok: boolean; error?: string };

/**
 * Delete a post.
 *
 * Deleted rather than archived, unlike an account or a decision: a post is
 * journal-published copy with nothing hanging off it — no foreign key, no
 * record anyone is entitled to appeal against. The audit entry keeps what was
 * removed and by whom, which is the part that has to survive.
 */
export async function deletePost(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  await requireGroup("adminOnly");

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, error: "That post could not be found." };

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return { ok: false, error: "That post could not be found." };

  await db.post.delete({ where: { id } });

  await recordAudit({
    action: "post.deleted",
    targetType: "post",
    targetId: id,
    detail: { kind: post.kind, slug: post.slug, title: post.title },
  });

  revalidateFor(post.kind as PostKind, post.slug);
  return { ok: true };
}

/**
 * Expire a post today.
 *
 * Offered before deletion, and the reason is in the wording on screen: a post
 * that has been public has been linked to, indexed and quite possibly cited in
 * an email. Expiring drops it off the public list while its URL keeps working;
 * deleting turns every one of those links into a 404. For a call for papers
 * that has closed, expiry is almost always what was meant.
 *
 * The date is set to **a second ago**, and the second matters. Every public
 * filter keeps a post while `expiresAt >= now` — `getLatestAnnouncements()`,
 * `/announcements`, `/news`, `/events` all agree on that — so a timestamp of
 * exactly now leaves the post on the list for the instant it is pressed and
 * takes it off a moment later. Verified against the database: setting `now`
 * left it listed. Midnight is no better in the other direction: the start of
 * today reads as long past, the end of it leaves the post up for hours after
 * someone pressed a button that says "today".
 *
 * Re-expiring an already-expired post is refused rather than silently moving
 * its date forward — that would quietly rewrite when it came down.
 */
export async function expirePost(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  await requireGroup("adminOnly");

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { ok: false, error: "That post could not be found." };

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return { ok: false, error: "That post could not be found." };

  const now = new Date();
  if (post.expiresAt && post.expiresAt <= now) {
    return {
      ok: false,
      error: "That post has already expired, and is no longer on the public list.",
    };
  }

  // A second ago, not now — see the note above.
  await db.post.update({
    where: { id },
    data: { expiresAt: new Date(now.getTime() - 1000) },
  });

  await recordAudit({
    action: "post.expired",
    targetType: "post",
    targetId: id,
    detail: { kind: post.kind, slug: post.slug, title: post.title },
  });

  revalidateFor(post.kind as PostKind, post.slug);
  return { ok: true };
}
