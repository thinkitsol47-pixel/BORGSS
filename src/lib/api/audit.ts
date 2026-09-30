import "server-only";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Write one entry to the append-only audit trail.
 *
 * The first real writer of `AuditEntry`. `/admin/audit-log` already states the
 * properties this has to keep — actor stored as id *and* name so a rename
 * cannot rewrite history, a typed target, and no update or delete path — so
 * this helper only ever inserts.
 *
 * `actorName` is captured now, from the acting user, rather than resolved at
 * read time: that is the whole point of storing it alongside the id.
 */
export async function recordAudit(entry: {
  action: string;
  targetType: string;
  targetId?: string;
  detail?: Prisma.InputJsonValue;
}): Promise<void> {
  const user = await getCurrentUser();
  // `getCurrentUser()` returns a non-UUID `"mock-user"` id when the database
  // has no matching row; the column is `@db.Uuid`, so store null in that case
  // and lean on `actorName`.
  const actorId = user && isUuid(user.id) ? user.id : null;
  await db.auditEntry.create({
    data: {
      actorId,
      actorName: user?.name ?? "Unknown",
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      detail: entry.detail ?? Prisma.JsonNull,
    },
  });
}
