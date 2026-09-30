"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireGroup } from "@/lib/auth/require-role";
import { recordAudit } from "@/lib/api/audit";
import { assignableRoles, isSuperAdmin, ROLE_LABELS, type Role } from "@/config/roles";
import {
  reviewerPoolSchema,
  userRolesSchema,
  userStatusSchema,
} from "@/lib/validation/schemas";
import type { AccountStatus } from "@/types";

/**
 * Account administration Server Actions.
 *
 * Phase 4: these write. The screen that renders their forms already guards on
 * `adminOnly`, but **a Server Action is its own entry point** — it can be
 * invoked without the page that renders its form ever loading — so every action
 * here repeats the guard rather than assuming it, the same way `recordDecision`
 * does on the editorial side.
 *
 * The rule these enforce is `assignableRoles()`, which has lived in
 * `src/config/roles.ts` since phase 12 and until now was enforced nowhere:
 *
 * - a `superAdmin` may grant all twelve roles, `admin` and `superAdmin` included
 * - an ordinary `admin` may grant the other ten, and neither of those two
 *
 * That is what stops an administrator promoting themselves, and what stops them
 * granting a second administrator as a way of doing it indirectly. The check is
 * applied to **both directions of every change**: granting a withheld role and
 * *revoking* one are the same escalation. An admin who could strip `superAdmin`
 * from the account above them would have found the back door.
 */

export type UserAdminState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
};

function fieldErrors(error: {
  issues: { path: (string | number)[]; message: string }[];
}) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

function revalidateUser(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath(`/admin/users/${userId}/edit`);
  // The matrix prints how many accounts hold each role.
  revalidatePath("/admin/roles");
}

/* ------------------------------------------------------------------ *
 * Roles.
 * ------------------------------------------------------------------ */

export async function saveUserRoles(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  const actor = await requireGroup("adminOnly");

  const userId = String(formData.get("userId") ?? "");
  const parsed = userRolesSchema.safeParse({
    roles: formData.getAll("roles").map(String),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!target) {
    return { status: "error", message: "That account no longer exists." };
  }

  const before = target.roles.map((r) => r.role as Role);
  const after = parsed.data.roles;

  const grantable = assignableRoles(actor.roles);

  // Both directions. Adding a role you may not grant is the obvious
  // escalation; removing one is the same power pointed the other way, and it
  // is how an administrator would remove the account that outranks them.
  const added = after.filter((r) => !before.includes(r));
  const removed = before.filter((r) => !after.includes(r));
  const refused = [...added, ...removed].filter((r) => !grantable.includes(r));

  if (refused.length > 0) {
    const names = [...new Set(refused)].map((r) => ROLE_LABELS[r]).join(" and ");
    return {
      status: "error",
      message: `${names} is not yours to grant or revoke. Only a super administrator changes the administrator roles.`,
    };
  }

  if (added.length === 0 && removed.length === 0) {
    return { status: "success", message: "No roles changed." };
  }

  // The lockout guard. A journal with no super administrator cannot appoint
  // one — nobody left holds `roles.manageAdmins` — so the platform would be
  // permanently stuck. Checked here rather than in the schema because it is a
  // fact about the whole table, not about this form.
  if (before.includes("superAdmin") && !after.includes("superAdmin")) {
    const others = await db.userRole.count({
      where: { role: "superAdmin", userId: { not: userId } },
    });
    if (others === 0) {
      return {
        status: "error",
        message:
          "This is the last super administrator. Removing the role would leave nobody able to grant it back, so the platform could not be recovered. Appoint another super administrator first.",
      };
    }
  }

  // Replaced wholesale rather than diffed against the stored rows. `UserRole`
  // is keyed on (userId, role) and carries nothing else, so there is no state
  // to preserve, and a delete-then-insert cannot leave a half-applied set the
  // way a sequence of individual grants can.
  await db.$transaction([
    db.userRole.deleteMany({ where: { userId } }),
    db.userRole.createMany({
      data: after.map((role) => ({ userId, role })),
    }),
  ]);

  await recordAudit({
    action: "user.rolesChanged",
    targetType: "user",
    targetId: userId,
    // Both sides stored, not just the new set: "who granted admin, and what did
    // they take away to do it" is the question an audit log is read to answer.
    detail: { before, after, added, removed },
  });

  revalidateUser(userId);

  const parts: string[] = [];
  if (added.length > 0) {
    parts.push(`Granted ${added.map((r) => ROLE_LABELS[r]).join(", ")}`);
  }
  if (removed.length > 0) {
    parts.push(`revoked ${removed.map((r) => ROLE_LABELS[r]).join(", ")}`);
  }

  return { status: "success", message: `${parts.join("; ")}.` };
}

/* ------------------------------------------------------------------ *
 * Status.
 * ------------------------------------------------------------------ */

export async function saveUserStatus(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  const actor = await requireGroup("adminOnly");

  const userId = String(formData.get("userId") ?? "");
  const parsed = userStatusSchema.safeParse({
    status: String(formData.get("status") ?? ""),
    suspendedReason: String(formData.get("suspendedReason") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  // Locking yourself out of your own account is the other mistake worth making
  // impossible, and it is a click away on a screen full of other people.
  if (userId === actor.id) {
    return {
      status: "error",
      message:
        "You cannot change your own account status. Ask another administrator.",
    };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!target) {
    return { status: "error", message: "That account no longer exists." };
  }

  const targetRoles = target.roles.map((r) => r.role as Role);

  // Suspension is not a role change, but it removes an account's access just
  // as completely — so it obeys the same rule. An ordinary administrator who
  // could suspend a super administrator would have the escalation back.
  if (!isSuperAdmin(actor.roles) && targetRoles.some((r) => r === "superAdmin" || r === "admin")) {
    return {
      status: "error",
      message:
        "Only a super administrator can change the status of an administrator account.",
    };
  }

  const d = parsed.data;
  const nextStatus = d.status as AccountStatus;

  if (target.status === nextStatus && nextStatus !== "suspended") {
    return { status: "success", message: "No change." };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      status: nextStatus,
      // Cleared whenever the account is not suspended, so a reason cannot
      // outlive the suspension it described and reappear on the next one.
      suspendedReason: nextStatus === "suspended" ? d.suspendedReason || null : null,
    },
  });

  await recordAudit({
    action: nextStatus === "suspended" ? "user.suspended" : "user.statusChanged",
    targetType: "user",
    targetId: userId,
    detail: {
      before: target.status,
      after: nextStatus,
      reason: nextStatus === "suspended" ? d.suspendedReason : undefined,
    },
  });

  revalidateUser(userId);

  return {
    status: "success",
    message:
      nextStatus === "suspended"
        ? `${target.name} is suspended and can no longer sign in. The account is kept — it still owns its submissions and stays in the decision history of manuscripts it touched.`
        : `${target.name} is now ${nextStatus}.`,
  };
}

/* ------------------------------------------------------------------ *
 * The reviewer pool.
 * ------------------------------------------------------------------ */

function revalidatePool(userId: string) {
  revalidateUser(userId);
  // The two screens that read the pool. Without these an editor keeps seeing
  // yesterday's shortlist, which is the failure that looks like "the save did
  // not work".
  revalidatePath("/editorial/reviewers-db");
  // Every manuscript's reviewers tab, not one — a pool change affects every
  // shortlist at once and this action has no submission id to name. The
  // literal-segment form with `"page"` is what Next provides for that; it is
  // the only call of its kind in this file, so if a stale shortlist is ever
  // reported after a pool edit, check here first.
  revalidatePath("/editorial/[submissionId]/reviewers", "page");
}

/**
 * Add an account to the reviewer pool, or edit what its entry says.
 *
 * **This is the step that was missing.** Registration grants the `reviewer`
 * role to anyone who asks, but an editor's shortlist is built from
 * `ReviewerProfile`, and nothing wrote a row there except the seed — so an
 * account could hold the role indefinitely and never be offered to a single
 * editor. The public application screen says as much on its face ("Accepting
 * does not create an account"); this closes the half of that gap which does
 * not need email.
 *
 * `upsert`, not create-or-update by hand: the row is keyed on `userId`, and
 * two administrators opening the same account would otherwise race into a
 * unique-constraint error that reads as a crash rather than a conflict.
 */
export async function saveReviewerPool(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  await requireGroup("adminOnly");

  const userId = String(formData.get("userId") ?? "");

  // One term per line is what the textarea posts. Commas are accepted too,
  // because anyone who has typed a keyword list before will reach for them.
  const expertise = String(formData.get("expertise") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = reviewerPoolSchema.safeParse({
    expertise,
    sections: formData.getAll("sections").map(String),
    note: String(formData.get("note") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
  if (!target) {
    return { status: "error", message: "That account no longer exists." };
  }

  // The pool is a list of people an editor may invite, and `inviteReviewer`
  // refuses anyone without the role. A pool entry for an account that cannot
  // be invited would surface on the shortlist and fail at the click.
  if (!target.roles.some((r) => r.role === "reviewer")) {
    return {
      status: "error",
      message: `${target.name} does not hold the Reviewer role, so an editor could not invite them. Grant it above first.`,
    };
  }

  // Checked against the live registry rather than trusted from the form.
  // `sectionMatch` is an exact `sections.includes(submission.section)`, so a
  // name that is not in the table never matches anything and the reviewer is
  // invisible for their own subject with nothing on screen to explain it —
  // which is precisely the state the seeded rows are in.
  if (parsed.data.sections.length > 0) {
    const known = await db.section.findMany({ select: { name: true } });
    const names = new Set(known.map((s) => s.name));
    const unknown = parsed.data.sections.filter((s) => !names.has(s));
    if (unknown.length > 0) {
      return {
        status: "error",
        message: `Not a section this journal publishes: ${unknown.join(", ")}.`,
      };
    }
  }

  const existing = await db.reviewerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  await db.reviewerProfile.upsert({
    where: { userId },
    create: {
      userId,
      expertise: parsed.data.expertise,
      sections: parsed.data.sections,
      note: parsed.data.note || null,
      // Never set here. `availability` distinguishes the reviewer's own
      // statement ("unavailable until March") from the journal's inference
      // ("holding three already"); an administrator typing either would be
      // putting words in someone else's mouth. A new entry starts available
      // and the reviewer owns it from there.
    },
    update: {
      expertise: parsed.data.expertise,
      sections: parsed.data.sections,
      note: parsed.data.note || null,
    },
  });

  await recordAudit({
    action: existing ? "reviewerPool.updated" : "reviewerPool.added",
    targetType: "user",
    targetId: userId,
    detail: {
      expertise: parsed.data.expertise,
      sections: parsed.data.sections,
    },
  });

  revalidatePool(userId);

  return {
    status: "success",
    message: existing
      ? `${target.name}'s reviewer entry is updated.`
      : `${target.name} is in the reviewer pool and will now appear on editors' shortlists.`,
  };
}

/**
 * Take an account out of the pool.
 *
 * The `ReviewerProfile` row goes; the `reviewer` role, the account, and every
 * review already returned stay exactly where they are. Removing someone from
 * the shortlist is not the same as erasing that they reviewed — a report is
 * part of a manuscript's history and outlives the reviewer's membership.
 */
export async function removeFromReviewerPool(
  _prev: UserAdminState,
  formData: FormData,
): Promise<UserAdminState> {
  await requireGroup("adminOnly");

  const userId = String(formData.get("userId") ?? "");

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!target) {
    return { status: "error", message: "That account no longer exists." };
  }

  const existing = await db.reviewerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!existing) {
    return { status: "error", message: "That account is not in the pool." };
  }

  // An open invitation outlives the pool entry — `ReviewAssignment` points at
  // the `User`, not the profile — so it would sit in the reviewer's queue with
  // nobody expecting a report. Saying so beats silently orphaning it.
  const live = await db.reviewAssignment.count({
    where: { reviewerId: userId, status: { in: ["invited", "accepted"] } },
  });
  if (live > 0) {
    return {
      status: "error",
      message: `${target.name} holds ${live} open ${live === 1 ? "review" : "reviews"}. Withdraw ${live === 1 ? "it" : "them"} from the manuscript first — removing the pool entry would leave ${live === 1 ? "it" : "them"} in their queue with nobody expecting a report.`,
    };
  }

  await db.reviewerProfile.delete({ where: { userId } });

  await recordAudit({
    action: "reviewerPool.removed",
    targetType: "user",
    targetId: userId,
    detail: {},
  });

  revalidatePool(userId);

  return {
    status: "success",
    message: `${target.name} is out of the reviewer pool. Their account, role and past reports are untouched.`,
  };
}
