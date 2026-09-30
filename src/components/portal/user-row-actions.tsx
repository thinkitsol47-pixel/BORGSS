"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import {
  saveUserStatus,
  type UserAdminState,
} from "@/app/(dashboard)/admin/users/actions";
import { Button } from "@/components/ui";
import type { AccountStatus } from "@/types";

const initialState: UserAdminState = { status: "idle" };

/**
 * Per-row account actions: edit, and reinstate.
 *
 * **Suspending is not here; reinstating is.** A suspension needs a stated
 * reason — one nobody can explain later is not defensible against an appeal —
 * and a reason cannot be typed into a table row, so Suspend links to the edit
 * screen where the field lives. Lifting one needs no explanation, so it is one
 * click.
 *
 * **There is no delete.** A suspended account still owns its submissions and
 * appears in the decision history of manuscripts it touched; deleting it would
 * break the published record. The users screen says so in full.
 *
 * The disabled states here are a courtesy to the reader. `saveUserStatus`
 * repeats every check server-side, because a form post is trivially forged.
 */
export function UserRowActions({
  userId,
  name,
  status,
  isMe,
  /** True when the target outranks what this administrator may change. */
  isProtected,
}: {
  userId: string;
  name: string;
  status: AccountStatus;
  isMe: boolean;
  isProtected: boolean;
}) {
  const [state, formAction] = useFormState(saveUserStatus, initialState);

  const suspended = status === "suspended";
  const locked = isMe || isProtected;

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

      {suspended ? (
        <form action={formAction} className="contents">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="status" value="active" />
          <ReinstateButton name={name} disabled={locked} />
        </form>
      ) : locked ? (
        /* A link cannot be disabled, and a greyed-out link that still
           navigates is worse than none. Omitted instead — the edit screen
           states why the action is unavailable. */
        null
      ) : (
        <Button
          size="sm"
          variant="outline"
          href={`/admin/users/${userId}/edit`}
          aria-label={`Suspend ${name}`}
        >
          <Ban className="size-3.5" aria-hidden />
          Suspend
        </Button>
      )}

      {state.status === "error" && (
        <p role="status" className="text-xs text-warning">
          {state.message ?? "Nothing was changed."}
        </p>
      )}
    </div>
  );
}

function ReinstateButton({
  name,
  disabled,
}: {
  name: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      disabled={disabled || pending}
      aria-label={`Reinstate ${name}`}
    >
      <RotateCcw className="size-3.5" aria-hidden />
      {pending ? "Reinstating…" : "Reinstate"}
    </Button>
  );
}
