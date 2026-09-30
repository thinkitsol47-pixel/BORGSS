"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CalendarX, Trash2 } from "lucide-react";
import {
  deletePost,
  expirePost,
  type DeleteState,
} from "@/app/(dashboard)/admin/announcements/actions";
import { Alert, Button } from "@/components/ui";
import type { PostKind } from "@/types";

const PUBLIC_PATH: Record<PostKind, string> = {
  announcement: "/announcements",
  news: "/news",
  event: "/events",
};

/**
 * Expiring or deleting a post.
 *
 * Expiry is offered first and deletion second, in that order deliberately. A
 * post that has been public has been linked to, indexed and possibly cited in
 * an email; expiring it removes it from the list while the URL keeps working,
 * and deleting it turns every one of those links into a 404. For a call for
 * papers that has closed, expiry is almost always the right answer.
 *
 * Deletion is still offered — unlike an account, a post owns nothing and is
 * not part of the scholarly record — but it says what it costs.
 *
 * **Both write.** Deletion navigates away, because the page being edited no
 * longer exists; expiry stays put and says so, because the post is still there
 * and the editor may want to look at it. A failure is reported where the
 * button is rather than as an alert, so it survives being read.
 */

const initialState: DeleteState = { ok: true };

export function PostDangerZone({
  id,
  title,
  kind,
  slug,
}: {
  id: string;
  title: string;
  kind: PostKind;
  slug: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const [expireState, expireAction] = useFormState(expirePost, initialState);
  const [deleteState, deleteAction] = useFormState(deletePost, initialState);

  /* The post is gone, so the screen editing it has to go too. Done in an
     effect rather than a `redirect()` inside the action: the action returns a
     result the form can render on failure, and a redirect would throw past it. */
  const deleted = deleteState.ok && deleteState !== initialState;
  useEffect(() => {
    if (deleted) router.push("/admin/announcements");
  }, [deleted, router]);

  const expired = expireState.ok && expireState !== initialState;

  return (
    <section aria-labelledby="danger-heading">
      <h2 id="danger-heading" className="font-serif text-lg font-semibold">
        Taking this down
      </h2>

      {/* -------------------------------------------------------- expire */}
      <div className="mt-3 rounded-xl border p-4">
        <h3 className="text-sm font-medium">Expire it</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Sets the expiry date to today. The post drops off the public list but
          its page keeps working, so links in old emails and search results do
          not break. This is the right answer for a call for papers that has
          closed.
        </p>

        {expired ? (
          <Alert tone="success" title="Expired" className="mt-4">
            It has come off{" "}
            <Link
              href={PUBLIC_PATH[kind]}
              className="font-medium text-primary hover:underline"
            >
              the public list
            </Link>
            . Its own page still works, so nothing linking to it is broken.
          </Alert>
        ) : (
          <>
            {!expireState.ok && expireState.error && (
              <Alert tone="danger" title="Not expired" className="mt-4">
                {expireState.error}
              </Alert>
            )}
            <form action={expireAction} className="mt-4">
              <input type="hidden" name="id" value={id} />
              <ExpireButton />
            </form>
          </>
        )}
      </div>

      {/* -------------------------------------------------------- delete */}
      <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
        <h3 className="text-sm font-medium text-danger">Delete permanently</h3>
        <p className="mt-1.5 text-sm leading-relaxed">
          Removes the post and its page. Anyone following{" "}
          <Link
            href={`${PUBLIC_PATH[kind]}/${slug}`}
            className="font-mono text-[0.9em] underline"
          >
            {PUBLIC_PATH[kind]}/{slug}
          </Link>{" "}
          from an email, a bookmark or a search result gets a 404. Consider
          expiring it instead.
        </p>

        {!deleteState.ok && deleteState.error && (
          <Alert tone="danger" title="Not deleted" className="mt-4">
            {deleteState.error}
          </Alert>
        )}

        {!confirming ? (
          <div className="mt-4">
            <Button variant="danger" onClick={() => setConfirming(true)}>
              <Trash2 className="size-4" aria-hidden />
              Delete this post
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm font-medium">
              Delete &ldquo;{title}&rdquo;? This cannot be undone.
            </p>
            <form action={deleteAction} className="mt-3 flex flex-wrap gap-3">
              <input type="hidden" name="id" value={id} />
              <DeleteButton />
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

function ExpireButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      <CalendarX className="size-4" aria-hidden />
      {pending ? "Expiring…" : "Expire today"}
    </Button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Deleting…" : "Yes, delete it"}
    </Button>
  );
}
