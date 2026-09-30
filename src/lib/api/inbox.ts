import "server-only";
import type { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";

/**
 * Server-side data access for the two editorial-office queues fed by the
 * public forms: contact enquiries and reviewer applications.
 *
 * Phase 4: these are the first *reads of data the site itself wrote*. The
 * write side is `contact/actions.ts` and `become-a-reviewer/actions.ts`; this
 * module is what `/admin/messages` and `/admin/reviewer-applications` render.
 *
 * No `camelToKebab` here — `ContactTopic` and the reviewer-application enums
 * carry no `@map()`, so Prisma's values are the wire values.
 */

/* ------------------------------------------------------------------ *
 * Contact messages.
 * ------------------------------------------------------------------ */

export type MessageFilter = "unhandled" | "handled" | "all";

export const CONTACT_TOPIC_LABEL: Record<string, string> = {
  submission: "Submission enquiry",
  review: "Peer review",
  editorial: "Editorial",
  technical: "Technical",
  charges: "Charges / APC",
  permissions: "Permissions",
  other: "Other",
};

export async function listContactMessages(filter: MessageFilter = "unhandled") {
  const where: Prisma.ContactMessageWhereInput =
    filter === "unhandled"
      ? { handledAt: null }
      : filter === "handled"
        ? { handledAt: { not: null } }
        : {};

  const [items, unhandled, total] = await Promise.all([
    db.contactMessage.findMany({
      where,
      // Oldest unanswered first — a contact queue exists to surface what has
      // been waiting, the same reasoning as the editorial queue's default.
      orderBy: { createdAt: filter === "handled" ? "desc" : "asc" },
    }),
    db.contactMessage.count({ where: { handledAt: null } }),
    db.contactMessage.count(),
  ]);

  return {
    items: items.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      affiliation: m.affiliation ?? undefined,
      topic: m.topic,
      topicLabel: CONTACT_TOPIC_LABEL[m.topic] ?? m.topic,
      manuscriptId: m.manuscriptId ?? undefined,
      message: m.message,
      handledAt: m.handledAt?.toISOString(),
      createdAt: m.createdAt.toISOString(),
    })),
    stats: { unhandled, handled: total - unhandled, total },
  };
}

export type ContactMessageListItem = Awaited<
  ReturnType<typeof listContactMessages>
>["items"][number];

/* ------------------------------------------------------------------ *
 * Reviewer applications.
 * ------------------------------------------------------------------ */

export type ApplicationFilter = "pending" | "accepted" | "declined" | "all";

export const DEGREE_LABEL: Record<string, string> = {
  phd: "PhD",
  doctoralCandidate: "Doctoral candidate",
  masters: "Master's",
  other: "Other",
};

export const CAPACITY_LABEL: Record<string, string> = {
  "1-2": "1–2 reviews / year",
  "3-4": "3–4 reviews / year",
  "5-6": "5–6 reviews / year",
  more: "More than 6 / year",
};

export async function listReviewerApplications(
  filter: ApplicationFilter = "pending",
) {
  const where: Prisma.ReviewerApplicationWhereInput =
    filter === "all" ? {} : { status: filter };

  const [items, pending, accepted, declined] = await Promise.all([
    db.reviewerApplication.findMany({
      where,
      orderBy: { createdAt: filter === "pending" || filter === "all" ? "asc" : "desc" },
    }),
    db.reviewerApplication.count({ where: { status: "pending" } }),
    db.reviewerApplication.count({ where: { status: "accepted" } }),
    db.reviewerApplication.count({ where: { status: "declined" } }),
  ]);

  return {
    items: items.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      institution: a.institution,
      position: a.position,
      country: a.country,
      degree: a.degree,
      degreeLabel: DEGREE_LABEL[a.degree] ?? a.degree,
      orcid: a.orcid ?? undefined,
      scholarUrl: a.scholarUrl ?? undefined,
      subjects: a.subjects,
      methods: a.methods,
      keywords: a.keywords,
      experience: a.experience ?? undefined,
      capacity: a.capacity,
      capacityLabel: CAPACITY_LABEL[a.capacity] ?? a.capacity,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
    })),
    stats: { pending, accepted, declined, total: pending + accepted + declined },
  };
}

export type ReviewerApplicationListItem = Awaited<
  ReturnType<typeof listReviewerApplications>
>["items"][number];

/* ------------------------------------------------------------------ *
 * Existence checks, for the actions to guard on.
 * ------------------------------------------------------------------ */

export async function contactMessageExists(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  return (
    (await db.contactMessage.count({ where: { id } })) > 0
  );
}

export async function reviewerApplicationExists(id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  return (
    (await db.reviewerApplication.count({ where: { id } })) > 0
  );
}
