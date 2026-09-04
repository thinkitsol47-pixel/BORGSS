/**
 * Role + permission model for the editorial platform.
 * The frontend uses this for route guards and role-aware navigation;
 * the backend must enforce the same matrix server-side.
 */

export const ROLES = [
  "superAdmin",
  "admin",
  "journalManager",
  "editorInChief",
  "managingEditor",
  "sectionEditor",
  "editorialBoard",
  "reviewer",
  "author",
  "copyeditor",
  "layoutEditor",
  "proofreader",
] as const;

export type Role = (typeof ROLES)[number];

/** Groups used for coarse route protection. */
export const ROLE_GROUPS = {
  staff: [
    "superAdmin",
    "admin",
    "journalManager",
    "editorInChief",
    "managingEditor",
    "sectionEditor",
  ],
  editorial: [
    "superAdmin",
    "admin",
    "journalManager",
    "editorInChief",
    "managingEditor",
    "sectionEditor",
    "editorialBoard",
  ],
  production: [
    "superAdmin",
    "admin",
    "journalManager",
    "copyeditor",
    "layoutEditor",
    "proofreader",
  ],
  adminOnly: ["superAdmin", "admin", "journalManager"],
  /** Platform-level operations no ordinary admin may perform. */
  superAdminOnly: ["superAdmin"],
} as const satisfies Record<string, readonly Role[]>;

/** Fine-grained permissions. Extend as features land. */
export type Permission =
  | "submission.create"
  | "submission.viewOwn"
  | "submission.viewAll"
  | "review.perform"
  | "review.assign"
  | "decision.make"
  | "issue.manage"
  | "production.work"
  | "users.manage"
  | "settings.manage"
  | "doi.manage"
  | "stats.viewAll"
  /* --- super-admin only: platform-level, deliberately withheld from `admin` --- */
  /** Grant or revoke the admin / superAdmin roles themselves. */
  | "roles.manageAdmins"
  /** Read the immutable audit trail of who changed what. */
  | "audit.view"
  /** Override any workflow state (unlock a stuck submission, force a decision). */
  | "workflow.override"
  /** Integration credentials, feature flags, data export/erasure, danger zone. */
  | "platform.manage";

export const PERMISSIONS: Record<Role, Permission[]> = {
  superAdmin: [
    "submission.viewAll",
    "review.assign",
    "decision.make",
    "issue.manage",
    "production.work",
    "users.manage",
    "settings.manage",
    "doi.manage",
    "stats.viewAll",
    "roles.manageAdmins",
    "audit.view",
    "workflow.override",
    "platform.manage",
  ],
  admin: [
    "submission.viewAll",
    "review.assign",
    "decision.make",
    "issue.manage",
    "production.work",
    "users.manage",
    "settings.manage",
    "doi.manage",
    "stats.viewAll",
  ],
  journalManager: [
    "submission.viewAll",
    "review.assign",
    "issue.manage",
    "production.work",
    "users.manage",
    "settings.manage",
    "doi.manage",
    "stats.viewAll",
  ],
  editorInChief: [
    "submission.viewAll",
    "review.assign",
    "decision.make",
    "issue.manage",
    "doi.manage",
    "stats.viewAll",
  ],
  managingEditor: ["submission.viewAll", "review.assign", "issue.manage"],
  sectionEditor: ["submission.viewAll", "review.assign", "decision.make"],
  editorialBoard: ["submission.viewAll"],
  reviewer: ["review.perform"],
  author: ["submission.create", "submission.viewOwn"],
  copyeditor: ["production.work"],
  layoutEditor: ["production.work"],
  proofreader: ["production.work"],
};

export function hasPermission(roles: Role[], permission: Permission): boolean {
  return roles.some((r) => PERMISSIONS[r]?.includes(permission));
}

export function inRoleGroup(
  roles: Role[],
  group: keyof typeof ROLE_GROUPS,
): boolean {
  const allowed = ROLE_GROUPS[group] as readonly Role[];
  return roles.some((r) => allowed.includes(r));
}

export function isSuperAdmin(roles: Role[]): boolean {
  return roles.includes("superAdmin");
}

/**
 * Roles a user may assign to others. Only a super admin can hand out
 * `admin` / `superAdmin`; this keeps an ordinary admin from escalating
 * privileges or removing the accounts that outrank them.
 */
export function assignableRoles(actorRoles: Role[]): Role[] {
  if (isSuperAdmin(actorRoles)) return [...ROLES];
  if (hasPermission(actorRoles, "users.manage")) {
    return ROLES.filter((r) => r !== "superAdmin" && r !== "admin");
  }
  return [];
}

export const ROLE_LABELS: Record<Role, string> = {
  superAdmin: "Super Administrator",
  admin: "Administrator",
  journalManager: "Journal Manager",
  editorInChief: "Editor-in-Chief",
  managingEditor: "Managing Editor",
  sectionEditor: "Section Editor",
  editorialBoard: "Editorial Board Member",
  reviewer: "Reviewer",
  author: "Author",
  copyeditor: "Copyeditor",
  layoutEditor: "Layout Editor",
  proofreader: "Proofreader",
};
