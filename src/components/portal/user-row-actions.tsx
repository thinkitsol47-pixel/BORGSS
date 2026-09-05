"use client";

import { useState } from "react";
import { Ban, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import type { AccountStatus } from "@/types";

/**
 * Per-row account actions: edit, suspend or reinstate, and delete.
 *
 * UI ONLY. Nothing is saved — there is no database. Each action confirms and
 * then says so, rather than removing the row and letting the reader believe it
 * is gone until they reload.
 *
 * **Delete is offered but discouraged, and never on your own account.** A
 * suspended account still owns submissions and appears in the decision history
 * of manuscripts it touched, so deleting one breaks the record — which is why
 * suspension is the primary action and deletion sits behind a confirmation
 * that says what it would destroy. Locking an administrator out of their own
 * account is the other mistake worth making impossible.
 */
export function UserRowActions({
  userId,
  name,
  status,
  isMe,
}: {
  userId: string;
  name: string;
  status: AccountStatus;
  isMe: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const suspended = status === "suspended";

  if (done) {
    return (
      <p className="whitespace-nowrap text-xs text-muted-foreground">{done}</p>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs text-muted-foreground">Delete {name}?</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDone("Nothing was deleted — no database yet.")}
        >
          <Check className="size-3.5" aria-hidden />
          Yes
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          No
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        href={`/admin/users/${userId}/edit`}
        aria-label={`Edit ${name}`}
      >
        <Pencil className="size-3.5" aria-hidden />
        Edit
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={isMe}
        onClick={() =>
          setDone(
            suspended
              ? "Nothing changed — no database yet."
              : "Nothing was suspended — no database yet.",
          )
        }
        aria-label={
          suspended ? `Reinstate ${name}` : `Suspend ${name}`
        }
      >
        <Ban className="size-3.5" aria-hidden />
        {suspended ? "Reinstate" : "Suspend"}
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={isMe}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="size-3.5" aria-hidden />
        Delete
      </Button>
    </div>
  );
}
