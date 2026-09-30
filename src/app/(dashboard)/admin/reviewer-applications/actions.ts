"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { reviewerApplicationExists } from "@/lib/api/inbox";

/**
 * Reviewer-application queue actions.
 *
 * **Accept only records the decision.** Turning an accepted application into a
 * `ReviewerProfile` and a `User` account needs the accounts system, which is
 * not built — so this sets `status` and no more, and the screen says that
 * plainly rather than implying a profile now exists. Decline is complete as it
 * is.
 *
 * Re-guarded here because a Server Action is its own entry point.
 */

export type ApplicationActionState = { ok: boolean; error?: string };

async function setStatus(
  id: string,
  status: "accepted" | "declined" | "pending",
): Promise<ApplicationActionState> {
  await requireGroup("adminOnly");

  if (!(await reviewerApplicationExists(id))) {
    return { ok: false, error: "That application no longer exists." };
  }

  await db.reviewerApplication.update({ where: { id }, data: { status } });

  await recordAudit({
    action: `reviewer-application.${status}`,
    targetType: "reviewer-application",
    targetId: id,
  });

  revalidatePath("/admin/reviewer-applications");
  return { ok: true };
}

export async function acceptApplication(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  return setStatus(String(formData.get("id") ?? ""), "accepted");
}

export async function declineApplication(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  return setStatus(String(formData.get("id") ?? ""), "declined");
}

export async function reopenApplication(
  _prev: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  return setStatus(String(formData.get("id") ?? ""), "pending");
}
