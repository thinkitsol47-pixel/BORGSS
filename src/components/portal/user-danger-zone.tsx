"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertOctagon, Ban, RotateCcw } from "lucide-react";
import {
  saveUserStatus,
  type UserAdminState,
} from "@/app/(dashboard)/admin/users/actions";
import { Alert, Button, Field, Input } from "@/components/ui";
import type { AccountStatus } from "@/types";

const initialState: UserAdminState = { status: "idle" };

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
 * Phase 4: these save. The two refusals — your own account, and an
 * administrator's if you are not a super administrator — are rendered here as
 * an explanation and repeated in `saveUserStatus`, which is the actual guard.
 */
export function UserDangerZone({
  userId,
  name,
  status,
  isSelf,
  /** True when the target outranks what this administrator may change. */
  isProtected,
}: {
  userId: string;
  name: string;
  status: AccountStatus;
  isSelf: boolean;
  isProtected: boolean;
}) {
  const [state, formAction] = useFormState(saveUserStatus, initialState);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const suspended = status === "suspended";
  // Typing the name is the friction that stops a misclick on a screen full of
  // other people's accounts.
  const canConfirm = typed.trim() === name;

  return (
    <section aria-labelledby="danger-heading">
      <h2 id="danger-heading" className="font-serif text-lg font-semibold">
        {suspended ? "Restore access" : "Suspend access"}
      </h2>

      {state.status === "success" && (
        <div className="mt-3">
          <Alert tone="success" title="Saved">
            {state.message}
          </Alert>
        </div>
      )}
      {state.status === "error" && (
        <div className="mt-3">
          <Alert tone="danger" title="Nothing was changed">
            {state.message ??
              state.errors?.suspendedReason ??
              "Please check the form."}
          </Alert>
        </div>
      )}

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
        ) : isProtected ? (
          <p className="flex items-start gap-2 text-sm leading-relaxed">
            <AlertOctagon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <span>
              This is an administrator account. Only a super administrator can
              suspend or restore one — suspension removes access as completely
              as revoking the role, so it obeys the same rule.
            </span>
          </p>
        ) : suspended ? (
          <>
            <p className="text-sm leading-relaxed">
              This account cannot sign in. Restoring it returns access
              immediately; the reason it was suspended stays on the record.
            </p>
            <form action={formAction} className="mt-4">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="status" value="active" />
              <RestoreButton />
            </form>
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
          <form action={formAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="status" value="suspended" />

            {/* A suspension nobody can explain later is not defensible against
                an appeal, so the reason is asked for here rather than left to
                the edit screen. */}
            <Field
              label="Reason for suspension"
              htmlFor="suspendedReason"
              required
              hint="Held against the account and shown on it."
            >
              <textarea
                id="suspendedReason"
                name="suspendedReason"
                rows={3}
                required
                className="w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </Field>

            <p className="mt-4 text-sm leading-relaxed">
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
              <SuspendButton disabled={!canConfirm} />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
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

function RestoreButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      <RotateCcw className="size-4" aria-hidden />
      {pending ? "Restoring…" : "Restore access"}
    </Button>
  );
}

function SuspendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={disabled || pending}>
      {pending ? "Suspending…" : "Suspend account"}
    </Button>
  );
}
