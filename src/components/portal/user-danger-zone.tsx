"use client";

import { useState } from "react";
import { AlertOctagon, Ban, RotateCcw } from "lucide-react";
import { Button, Input } from "@/components/ui";
import type { AccountStatus } from "@/types";

/**
 * Suspend, restore, and the deletion that is deliberately refused.
 *
 * The refusal is the point of this block. An account is not a row that can be
 * removed: it owns submissions, it is named in the decision history of
 * manuscripts it touched, and it may be an author on a published article,
 * which is part of the permanent scholarly record. Offering a Delete button
 * that a backend would then have to refuse is worse than explaining now why
 * suspension is the operation that exists.
 *
 * UI ONLY. Nothing happens; there is no database.
 */
export function UserDangerZone({
  name,
  status,
  isSelf,
}: {
  name: string;
  status: AccountStatus;
  isSelf: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const suspended = status === "suspended";
  // Typing the name is the friction that stops a misclick. It is also how the
  // real action should work, so the interface does not change later.
  const canConfirm = typed.trim() === name;

  return (
    <section aria-labelledby="danger-heading">
      <h2 id="danger-heading" className="font-serif text-lg font-semibold">
        {suspended ? "Restore access" : "Suspend access"}
      </h2>

      <div className="mt-3 rounded-xl border border-warning/40 bg-warning/5 p-4">
        {isSelf ? (
          /* Locking yourself out of the only administrator account is a real
             way to lose a journal. Refused rather than merely warned about. */
          <p className="flex items-start gap-2 text-sm leading-relaxed">
            <AlertOctagon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <span>
              You cannot suspend your own account. Ask another administrator if
              this is genuinely what you want — an administrator who locks
              themselves out has no way back in.
            </span>
          </p>
        ) : suspended ? (
          <>
            <p className="text-sm leading-relaxed">
              This account cannot sign in. Restoring it returns access
              immediately; the reason it was suspended stays on the record.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  alert(
                    "Nothing changed — there is no database yet.\n\nRestoring an account is not built.",
                  )
                }
              >
                <RotateCcw className="size-4" aria-hidden />
                Restore access
              </Button>
            </div>
          </>
        ) : !confirming ? (
          <>
            <p className="text-sm leading-relaxed">
              A suspended account cannot sign in. It is not deleted: it keeps
              its submissions and stays in the decision history of manuscripts
              it was involved in.
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={() => setConfirming(true)}>
                <Ban className="size-4" aria-hidden />
                Suspend this account
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed">
              Type <span className="font-medium">{name}</span> to confirm.
            </p>
            <div className="mt-3 max-w-sm">
              <Input
                aria-label={`Type ${name} to confirm suspension`}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={name}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="danger"
                disabled={!canConfirm}
                onClick={() =>
                  alert(
                    "Nothing changed — there is no database yet.\n\nSuspending an account is not built.",
                  )
                }
              >
                Suspend account
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      {/* --------------------------------------------- deletion, explained */}
      <div className="mt-4 rounded-xl border border-dashed p-4">
        <h3 className="text-sm font-medium">Accounts are never deleted</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          There is no delete button here and there will not be one. This account
          may own submissions, appear in the decision history of manuscripts it
          reviewed, and be named as an author on a published article — which is
          part of the permanent scholarly record and cannot be withdrawn.
          Deleting it would break that record. Suspension is the operation that
          exists.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A request to erase personal data is handled under the privacy policy,
          which sets out where the right stops.
        </p>
      </div>
    </section>
  );
}
