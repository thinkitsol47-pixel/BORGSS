"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
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
 * UI ONLY. Nothing happens; there is no database.
 */
export function PostDangerZone({
  title,
  kind,
  slug,
}: {
  title: string;
  kind: PostKind;
  slug: string;
}) {
  const [confirming, setConfirming] = useState(false);

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
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() =>
              alert("Nothing changed — there is no database yet.")
            }
          >
            <CalendarX className="size-4" aria-hidden />
            Expire today
          </Button>
        </div>
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
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                variant="danger"
                onClick={() =>
                  alert("Nothing was deleted — there is no database yet.")
                }
              >
                Yes, delete it
              </Button>
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
