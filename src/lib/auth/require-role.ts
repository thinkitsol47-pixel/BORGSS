import { redirect } from "next/navigation";
import { getCurrentUser } from "./current-user";
import { inRoleGroup, ROLE_GROUPS, type Role } from "@/config/roles";

/** Guard a server component: ensure a session exists. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Guard by explicit roles. */
export async function requireRoles(roles: Role[]) {
  const user = await requireUser();
  if (!roles.some((r) => user.roles.includes(r))) redirect("/dashboard");
  return user;
}

/** Guard by role group (staff / editorial / production / adminOnly). */
export async function requireGroup(group: keyof typeof ROLE_GROUPS) {
  const user = await requireUser();
  if (!inRoleGroup(user.roles, group)) redirect("/dashboard");
  return user;
}
