import type { AuditEntry, UserAccount } from "@/types";

/**
 * SCAFFOLD MOCK DATA — the account directory.
 *
 * Names are reused from the existing fixtures on purpose. The reviewers in
 * `mock-reviewers.ts`, the editors who signed decision letters, and the
 * copyeditor and typesetter in `mock-production.ts` all appear here as
 * accounts, because in a real journal they are the same people — and a user
 * directory holding twelve names nobody else in the app has heard of would
 * teach the screen nothing about how roles actually land on real people.
 *
 * The set is chosen to make `assignableRoles()` visible rather than to look
 * tidy: one super admin, one ordinary admin (who cannot grant either of those
 * two roles), several multi-role accounts, an invitation nobody has accepted,
 * and a suspended account that still owns submissions.
 */

export const mockUsers: UserAccount[] = [
  /* ------------------------------------------------------------ platform */
  {
    id: "u1",
    name: "Dr. Mubashir Quddus",
    email: "m.quddus@borjss.example",
    roles: ["superAdmin", "editorInChief"],
    status: "active",
    affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    createdAt: "2025-06-01",
    lastActiveAt: "2026-09-03",
  },
  {
    id: "u2",
    name: "Faryal Mirza",
    email: "f.mirza@borjss.example",
    // An ordinary admin: everything except the four platform permissions, and
    // unable to grant `admin` or `superAdmin` to anyone.
    roles: ["admin"],
    status: "active",
    affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    createdAt: "2025-06-14",
    lastActiveAt: "2026-09-02",
  },
  {
    id: "u3",
    name: "Adnan Rafiq",
    email: "a.rafiq@borjss.example",
    roles: ["journalManager"],
    status: "active",
    affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    createdAt: "2025-07-02",
    lastActiveAt: "2026-08-29",
  },

  /* ----------------------------------------------------------- editorial */
  {
    id: "u4",
    // The mock signed-in account. Three roles, which is the normal case at a
    // journal this size and the reason the portal is unified.
    name: "Dr. Ayesha Khan",
    email: "a.khan@example.edu",
    roles: ["sectionEditor", "reviewer", "author"],
    status: "active",
    affiliation: "Institute of Business Administration",
    country: "Pakistan",
    orcid: "0000-0002-1825-0097",
    createdAt: "2025-08-19",
    lastActiveAt: "2026-09-04",
  },
  {
    id: "u5",
    name: "Prof. Saira Malik",
    email: "s.malik@example.edu",
    roles: ["managingEditor", "reviewer"],
    status: "active",
    affiliation: "Lahore University of Management Sciences",
    country: "Pakistan",
    createdAt: "2025-09-05",
    lastActiveAt: "2026-08-27",
  },
  {
    id: "u6",
    name: "Dr. Samuel Okonkwo",
    email: "s.okonkwo@example.edu",
    roles: ["editorialBoard", "reviewer"],
    status: "active",
    affiliation: "University of Lagos",
    country: "Nigeria",
    orcid: "0000-0002-6614-8890",
    createdAt: "2025-11-11",
    lastActiveAt: "2026-07-18",
  },

  /* ----------------------------------------------------------- reviewers */
  {
    id: "u7",
    name: "Dr. Priya Raghavan",
    email: "p.raghavan@example.edu",
    roles: ["reviewer"],
    status: "active",
    affiliation: "Jawaharlal Nehru University",
    country: "India",
    orcid: "0000-0003-1174-2290",
    createdAt: "2026-01-08",
    lastActiveAt: "2026-08-04",
  },
  {
    id: "u8",
    name: "Prof. Imran Baig",
    email: "i.baig@example.edu",
    roles: ["reviewer", "author"],
    status: "active",
    affiliation: "Quaid-i-Azam University",
    country: "Pakistan",
    createdAt: "2025-10-22",
    lastActiveAt: "2026-08-30",
  },
  {
    id: "u9",
    name: "Dr. Tariq Mehmood",
    email: "t.mehmood@example.edu",
    roles: ["reviewer"],
    status: "active",
    affiliation: "University of Peshawar",
    country: "Pakistan",
    createdAt: "2026-02-14",
    // Invited to review three times and has answered none. The account is
    // active; it is the person who has gone quiet, which is a different fact
    // and belongs on the reviewer screen, not here.
    lastActiveAt: "2026-04-02",
  },

  /* ---------------------------------------------------------- production */
  {
    id: "u10",
    name: "Hina Aslam",
    email: "h.aslam@borjss.example",
    roles: ["copyeditor"],
    status: "active",
    affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    createdAt: "2026-03-01",
    lastActiveAt: "2026-08-29",
  },
  {
    id: "u11",
    name: "Faisal Nadeem",
    email: "f.nadeem@borjss.example",
    roles: ["layoutEditor"],
    status: "active",
    affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    createdAt: "2026-03-01",
    lastActiveAt: "2026-08-28",
  },
  {
    id: "u12",
    name: "Nida Sheikh",
    email: "n.sheikh@borjss.example",
    roles: ["proofreader"],
    status: "active",
    affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    createdAt: "2026-05-19",
    lastActiveAt: "2026-08-31",
  },

  /* --------------------------------------------- an invitation, unclaimed */
  {
    id: "u13",
    name: "Dr. Mei-Ling Chen",
    email: "m.chen@example.edu",
    roles: ["reviewer"],
    // Created by an administrator; the owner has never set a password, so
    // there is no `lastActiveAt` at all — not a zero, and not "never" dressed
    // up as a date.
    status: "invited",
    affiliation: "National Taiwan University",
    country: "Taiwan",
    createdAt: "2026-08-21",
  },

  /* ----------------------------------------- suspended, but still an owner */
  {
    id: "u14",
    name: "Dr. Kamran Yusuf",
    email: "k.yusuf@example.edu",
    roles: ["author"],
    status: "suspended",
    affiliation: "Independent researcher",
    country: "Pakistan",
    createdAt: "2025-12-03",
    lastActiveAt: "2026-05-16",
    // Accounts are suspended, not deleted: this one still owns a withdrawn
    // submission, and the record of it has to survive.
    suspendedReason:
      "Suspended on 16 May 2026 pending a publication-ethics investigation into a duplicate submission. Handled under the publication ethics policy; the account is retained because it owns submissions that form part of the record.",
  },
];

/**
 * SCAFFOLD MOCK DATA — the audit trail.
 *
 * Deliberately thin. A convincing audit log would be hundreds of entries, and
 * inventing them would make the screen look like a working feature: nothing in
 * this application records anything, and every one of these is fabricated.
 * The eight below exist to show the *shape* — actor, action, target, detail —
 * and the screen says plainly that they are illustrative.
 *
 * Actions use the permission vocabulary (`roles.granted`, `decision.recorded`)
 * so the log reads against the same words the rest of the platform uses.
 */

export const mockAuditEntries: AuditEntry[] = [
  {
    id: "au1",
    at: "2026-09-03T09:14:00Z",
    actorId: "u1",
    actorName: "Dr. Mubashir Quddus",
    action: "roles.granted",
    target: "Dr. Ayesha Khan",
    detail: "Granted sectionEditor",
  },
  {
    id: "au2",
    at: "2026-09-02T15:41:00Z",
    actorId: "u2",
    actorName: "Faryal Mirza",
    action: "users.invited",
    target: "Dr. Mei-Ling Chen",
    detail: "Invited as reviewer",
  },
  {
    id: "au3",
    at: "2026-09-01T11:07:00Z",
    actorId: "u4",
    actorName: "Dr. Ayesha Khan",
    action: "decision.recorded",
    target: "BORJSS-2026-0068",
    detail: "Accept, round 1",
  },
  {
    id: "au4",
    at: "2026-08-30T16:22:00Z",
    actorId: "u4",
    actorName: "Dr. Ayesha Khan",
    action: "review.assigned",
    target: "BORJSS-2026-0037",
    detail: "Invited Dr. Fatima Siddiqui, round 2",
  },
  {
    id: "au5",
    at: "2026-08-29T10:03:00Z",
    actorId: "u3",
    actorName: "Adnan Rafiq",
    action: "settings.changed",
    target: "Journal settings",
    detail: "Updated the editorial office address",
  },
  {
    id: "au6",
    at: "2026-08-25T13:55:00Z",
    actorId: "u1",
    actorName: "Dr. Mubashir Quddus",
    action: "workflow.override",
    target: "BORJSS-2026-0061",
    detail: "Reopened a review round closed in error",
  },
  {
    id: "au7",
    at: "2026-05-16T08:30:00Z",
    actorId: "u1",
    actorName: "Dr. Mubashir Quddus",
    action: "users.suspended",
    target: "Dr. Kamran Yusuf",
    detail: "Pending publication-ethics investigation",
  },
  {
    id: "au8",
    at: "2026-03-01T09:00:00Z",
    actorId: "u2",
    actorName: "Faryal Mirza",
    action: "users.created",
    target: "Hina Aslam",
    detail: "Created with role copyeditor",
  },
];
