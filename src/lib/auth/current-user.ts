import { cookies } from "next/headers";
import { ROLES, type Role } from "@/config/roles";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  orcid?: string;
};

/**
 * The default. Three roles, because a journal this size has people who are
 * author, reviewer and editor at once — which is the whole reason the portal is
 * unified rather than split per role.
 */
const DEFAULT_ROLES: Role[] = ["author", "reviewer", "sectionEditor"];

/** Set by a successful demo sign-in. Development only. */
export const ROLE_COOKIE = "borjss_dev_role";

/**
 * DEVELOPMENT ONLY — demo sign-ins, so the portal can be walked before there
 * is an auth provider. Any password is accepted; only the address is read.
 *
 * The accounts match real rows in `mock-users.ts`, so signing in as one shows
 * a person who exists elsewhere in the app rather than an invented identity.
 * `signIn` consults this only when `NODE_ENV` is not production — a build that
 * ships must not contain a login that accepts anything.
 */
export const DEMO_ACCOUNTS: Record<string, Role> = {
  "m.quddus@borjss.example": "superAdmin",
  "f.mirza@borjss.example": "admin",
  "a.rafiq@borjss.example": "journalManager",
  "a.khan@example.edu": "sectionEditor",
  "h.aslam@borjss.example": "copyeditor",
  "p.raghavan@example.edu": "reviewer",
};

/** Display identity per role, so the topbar does not say "Ayesha Khan" for all. */
const IDENTITIES: Partial<Record<Role, { name: string; email: string }>> = {
  superAdmin: { name: "Dr. Mubashir Quddus", email: "m.quddus@borjss.example" },
  admin: { name: "Faryal Mirza", email: "f.mirza@borjss.example" },
  journalManager: { name: "Adnan Rafiq", email: "a.rafiq@borjss.example" },
  copyeditor: { name: "Hina Aslam", email: "h.aslam@borjss.example" },
  reviewer: { name: "Dr. Priya Raghavan", email: "p.raghavan@example.edu" },
};

/**
 * SCAFFOLD STUB — replace with a real session lookup (Auth.js / Supabase).
 * Returns a mock user so the portal renders during frontend build.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const role = devRole();

  if (role && IDENTITIES[role]) {
    const who = IDENTITIES[role]!;
    return {
      id: "mock-user",
      name: who.name,
      email: who.email,
      // `author` and `reviewer` ride along so "My submissions" and "My
      // reviews" stay in the sidebar — the multi-role case is the real one.
      roles: ["author", "reviewer", role],
    };
  }

  return {
    id: "mock-user",
    name: "Dr. Ayesha Khan",
    email: "a.khan@example.edu",
    roles: DEFAULT_ROLES,
    orcid: "0000-0002-1825-0097",
  };
}

/** The role a demo sign-in selected, if any. Never honoured in production. */
function devRole(): Role | null {
  if (process.env.NODE_ENV === "production") return null;

  const value = cookies().get(ROLE_COOKIE)?.value;
  if (!value || !ROLES.includes(value as Role)) return null;
  return value as Role;
}
