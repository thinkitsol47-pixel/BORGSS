import { type Role } from "@/config/roles";
import { supabaseServer } from "./supabase";
import { db } from "@/lib/db";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  orcid?: string;
  /* The account's own editable details, so /profile can prefill from the
     database rather than showing empty fields over stored values. */
  affiliation?: string;
  department?: string;
  position?: string;
  country?: string;
  bio?: string;
  /** Which emails this account wants; the defaults live on the column. */
  notifications?: {
    submissionStatus: boolean;
    editorialMessages: boolean;
    newInvitations: boolean;
    reviewReminders: boolean;
    issuePublished: boolean;
    journalNews: boolean;
  };
};

/**
 * What an account with no roles falls back to.
 *
 * Reaching this means a `User` row exists with no `UserRole` rows — a
 * half-created account, or one whose roles were all revoked. `author` alone is
 * the safe answer: it lets them see their own submissions and nothing else.
 * Anything wider would hand someone editorial access by accident.
 */
const DEFAULT_ROLES: Role[] = ["author"];

/**
 * Whether a thrown error is Postgres being momentarily unreachable, rather
 * than anything about the query.
 *
 * Supabase's free-tier pooler drops connections — it pauses after a week idle,
 * and it sheds transient ones besides. Prisma reports both as `P1001`.
 */
function isUnreachable(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: unknown }).code === "P1001"
  );
}

/**
 * Read the profile, retrying once through a brief connection drop.
 *
 * **Why this is retried and almost nothing else is.** `getCurrentUser()` runs
 * on every portal render, so a single dropped connection here does not fail one
 * query — it replaces the entire portal with a runtime error screen, for a
 * fault that is over by the time the reader has finished reading it. One retry
 * after a short pause converts the common case into a slightly slow page.
 *
 * A genuine outage still throws, and should: signing someone in against a
 * database nobody can reach would mean rendering a portal with no roles in it.
 */
async function loadProfile(userId: string) {
  const query = () =>
    db.user.findUnique({ where: { id: userId }, include: { roles: true } });

  try {
    return await query();
  } catch (e) {
    if (!isUnreachable(e)) throw e;
    await new Promise((r) => setTimeout(r, 400));
    return query();
  }
}

/**
 * The signed-in account, or null.
 *
 * **The real session is checked first, and it wins.** Supabase Auth holds the
 * credentials; this app's `User` table holds everything the portal renders —
 * name, roles, affiliation, notification settings. They are joined on the id,
 * which is why `User.id` was made the `auth.users` id back in phase 1 rather
 * than carrying a second key.
 *
 * `getUser()`, not `getSession()`: the former verifies the token with Supabase,
 * the latter trusts a cookie. Roles are read from the database on every call,
 * never from the token — a JWT minted before someone was made an editor would
 * otherwise keep saying they are not one until it expired.
 *
 * There is no other way in. The demo door — a cookie that named a role and a
 * one-click sign-in that checked no password — was deleted once real accounts
 * existed. Nothing here reads a cookie; the Supabase session is the only
 * identity.
 *
 * The profile read goes through `loadProfile`, which retries once on a dropped
 * connection — see the note there for why this one query earns that and the
 * rest of the app does not.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data } = await supabaseServer().auth.getUser();
  const authUser = data.user;

  if (authUser) {
    const row = await loadProfile(authUser.id);

    // Authenticated with Supabase but no profile row. This happens if
    // registration created the auth account and then failed before writing the
    // profile. Returning null sends them back to /login rather than rendering a
    // portal for a user whose name and roles are unknown.
    if (!row) return null;

    return toCurrentUser(row);
  }

  // No session. The middleware has already redirected any portal route, so
  // reaching here is a public page asking who is signed in and being content
  // with nobody.
  return null;
}

/** The shape the portal renders, from the row the database holds. */
function toCurrentUser(
  user: {
    id: string;
    name: string;
    email: string;
    orcid: string | null;
    affiliation: string | null;
    department: string | null;
    position: string | null;
    country: string | null;
    bio: string | null;
    notifySubmissionStatus: boolean;
    notifyEditorialMessages: boolean;
    notifyNewInvitations: boolean;
    notifyReviewReminders: boolean;
    notifyIssuePublished: boolean;
    notifyJournalNews: boolean;
    roles: { role: string }[];
  },
): CurrentUser {
  const dbRoles = user.roles.map((r) => r.role) as Role[];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: dbRoles.length > 0 ? dbRoles : DEFAULT_ROLES,
    orcid: user.orcid ?? undefined,
    affiliation: user.affiliation ?? undefined,
    department: user.department ?? undefined,
    position: user.position ?? undefined,
    country: user.country ?? undefined,
    bio: user.bio ?? undefined,
    notifications: {
      submissionStatus: user.notifySubmissionStatus,
      editorialMessages: user.notifyEditorialMessages,
      newInvitations: user.notifyNewInvitations,
      reviewReminders: user.notifyReviewReminders,
      issuePublished: user.notifyIssuePublished,
      journalNews: user.notifyJournalNews,
    },
  };
}
