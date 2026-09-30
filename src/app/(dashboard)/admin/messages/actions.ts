"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { contactMessageExists } from "@/lib/api/inbox";

/**
 * Contact-message queue actions.
 *
 * The page calls `requireGroup("adminOnly")`, but a Server Action is its own
 * entry point, so the check is repeated here rather than assumed — the pattern
 * from `recordDecision`.
 */

export type MessageActionState = { ok: boolean; error?: string };

async function setHandled(
  id: string,
  handled: boolean,
): Promise<MessageActionState> {
  await requireGroup("adminOnly");

  if (!(await contactMessageExists(id))) {
    return { ok: false, error: "That message no longer exists." };
  }

  await db.contactMessage.update({
    where: { id },
    data: { handledAt: handled ? new Date() : null },
  });

  await recordAudit({
    action: handled ? "message.handled" : "message.reopened",
    targetType: "contact-message",
    targetId: id,
  });

  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function markMessageHandled(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  return setHandled(String(formData.get("id") ?? ""), true);
}

export async function reopenMessage(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  return setHandled(String(formData.get("id") ?? ""), false);
}
