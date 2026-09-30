"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, Save } from "lucide-react";
import {
  saveUserStatus,
  type UserAdminState,
} from "@/app/(dashboard)/admin/users/actions";
import { Alert, Button, Field, Select } from "@/components/ui";
import type { AccountStatus } from "@/types";

const initialState: UserAdminState = { status: "idle" };

/**
 * Whether an account can sign in.
 *
 * Separate from the roles form: an ordinary administrator may change ten roles
 * on an ordinary account and nothing at all on an administrator's, so one
 * combined form would have to refuse the whole submission over either half.
 *
 * **Suspension, not deletion.** A suspended account still owns its submissions
 * and appears in the decision history of manuscripts it touched; deleting it
 * would break the published record. There is deliberately no delete here.
 */
export function UserStatusForm({
  userId,
  name,
  current,
  currentReason,
  /** True when the acting administrator is looking at their own account. */
  isMe,
  /** True when the target holds `admin` or `superAdmin` and the actor does not. */
  isProtected,
}: {
  userId: string;
  name: string;
  current: AccountStatus;
  currentReason?: string;
  isMe: boolean;
  isProtected: boolean;
}) {
  const [state, formAction] = useFormState(saveUserStatus, initialState);
  const [status, setStatus] = useState<AccountStatus>(current);

  const locked = isMe || isProtected;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="userId" value={userId} />

      {state.status === "success" && (
        <Alert tone="success" title="Status updated">
          {state.message}
        </Alert>
      )}
      {state.status === "error" && (
        <Alert tone="danger" title="Nothing was changed">
          {state.message ??
            state.errors?.suspendedReason ??
            state.errors?.status ??
            "Please check the form."}
        </Alert>
      )}

      {/* Both refusals are stated before the attempt, not after it. */}
      {isMe && (
        <Alert tone="info" title="This is your own account">
          You cannot change your own status. Locking yourself out of the account
          that administers the platform is the one mistake worth making
          impossible — ask another administrator.
        </Alert>
      )}
      {isProtected && !isMe && (
        <Alert tone="info" title="This is an administrator account">
          Only a super administrator can suspend or reinstate an administrator.
          Suspension removes access as completely as revoking a role, so it
          obeys the same rule.
        </Alert>
      )}

      <div className="max-w-sm">
        <Field label="Account status" htmlFor="status">
          <Select
            id="status"
            name="status"
            value={status}
            disabled={locked}
            onChange={(e) => setStatus(e.target.value as AccountStatus)}
          >
            <option value="invited">Invited — has not set a password</option>
            <option value="active">Active — can sign in</option>
            <option value="suspended">Suspended — cannot sign in</option>
          </Select>
        </Field>
      </div>

      {status === "suspended" && (
        <div>
          <Field
            label="Reason for suspension"
            htmlFor="suspendedReason"
            required
            hint="Held against the account. A suspension nobody can explain later is not defensible against an appeal."
          >
            <textarea
              id="suspendedReason"
              name="suspendedReason"
              rows={3}
              defaultValue={currentReason}
              required
              disabled={locked}
              className="w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:bg-muted/40"
            />
          </Field>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
            Suspending does not delete. {name} keeps their submissions and stays
            in the decision history of manuscripts they touched.
          </p>
        </div>
      )}

      <div className="border-t pt-5">
        <SaveButton disabled={locked || status === current} />
      </div>
    </form>
  );
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? (
        <>
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Saving…
        </>
      ) : (
        <>
          <Save className="size-4" aria-hidden />
          Save status
        </>
      )}
    </Button>
  );
}
