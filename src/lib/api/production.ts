import "server-only";
import { Prisma } from "@prisma/client";
import { db, isUuid } from "@/lib/db";
import type {
  GalleyFormat,
  ProductionGalley,
  ProductionJob,
  ProductionStage,
  ProductionStageRecord,
  ProofCorrection,
  StageState,
  Submission,
} from "@/types";
import {
  getEditorialIssueById,
  getEditorialSubmissionById,
} from "./editorial";

/**
 * Server-side data access for the production screens.
 *
 * Phase 3: reads Postgres through Prisma. Separate from `editorial.ts` for the
 * same reason that module is separate from `submissions.ts`: the question is
 * different. Editorial asks "what is waiting, and on whom?"; production asks
 * "what is on my bench, and what is blocking it?" — and the answers come from
 * `ProductionJob`, not from `Submission.status`, which has one value for all
 * of production.
 *
 * The manuscript itself is loaded through `editorial.ts`'s DB-backed mapper
 * (`getEditorialSubmissionById`), so a production screen renders the identical
 * `Submission` shape every other portal screen does, and the section-name
 * registry fix applies here too.
 */

export const STAGE_ORDER: ProductionStage[] = [
  "copyedit",
  "galleys",
  "proofread",
];

export const STAGE_LABEL: Record<ProductionStage, string> = {
  copyedit: "Copyediting",
  galleys: "Typesetting",
  proofread: "Proofreading",
};

export const STAGE_STATE_LABEL: Record<StageState, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "with-author": "With the author",
  done: "Done",
};

/**
 * Prisma Client's generated enums are camelCase (`@map()` only renames the
 * database column); `src/types` uses the kebab-case wire values the rest of
 * the app was built against. Same helper the other rewired modules carry.
 */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/* ------------------------------------------------------------------ *
 * Loading.
 * ------------------------------------------------------------------ */

const productionJobInclude = {
  submission: { select: { reference: true, title: true } },
  stages: { include: { assignedTo: { select: { name: true } } } },
  galleys: true,
  corrections: true,
} satisfies Prisma.ProductionJobInclude;

type ProductionJobRow = Prisma.ProductionJobGetPayload<{
  include: typeof productionJobInclude;
}>;

/**
 * A stage state stored on `ProductionGalley` has no label or filename column —
 * a reader-facing label and an author-facing filename are not what production
 * needs while a file is still being made (see the type's own comment). The
 * screens carry their own `FORMAT_LABEL`, so the label here only has to be
 * present and truthful; the filename is recovered from the storage key, which
 * the seed built from it.
 */
const GALLEY_LABEL: Record<GalleyFormat, string> = {
  pdf: "PDF galley",
  xml: "JATS XML",
  html: "HTML galley",
  epub: "EPUB galley",
};

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function toGalley(g: ProductionJobRow["galleys"][number]): ProductionGalley {
  const format = camelToKebab(g.format) as GalleyFormat;
  return {
    id: g.id,
    format,
    label: GALLEY_LABEL[format],
    filename: basename(g.storagePath),
    storagePath: g.storagePath,
    sizeBytes: g.sizeBytes === null ? 0 : Number(g.sizeBytes),
    createdAt: g.createdAt.toISOString(),
    version: g.version,
    isFinal: g.isFinal,
  };
}

/**
 * `ProofCorrection` maps almost one-to-one now.
 *
 * `location` and `raisedBy` became real columns in
 * `20260914120000_proof_correction_fields`. Until then the location was packed
 * into the front of `description` and split back out here, and `raisedBy` was
 * not stored at all — this function hard-coded `"author"`, which was wrong for
 * every correction the proofreader or copyeditor raised. Both are read
 * directly now; the split is gone.
 *
 * The one thing still derived is `state`: the table stores an `applied`
 * boolean plus an optional `declinedReason`, and the three-value state the
 * screen renders falls out of the pair. Storing it as well would allow a row
 * that is `applied` and `rejected` at once.
 */
function toCorrection(
  c: ProductionJobRow["corrections"][number],
): ProofCorrection {
  const state: ProofCorrection["state"] = c.applied
    ? "applied"
    : c.declinedReason
      ? "rejected"
      : "open";

  return {
    id: c.id,
    location: c.location,
    description: c.description,
    raisedBy: c.raisedBy as ProofCorrection["raisedBy"],
    raisedAt: c.reportedAt.toISOString(),
    state,
    resolution: c.declinedReason ?? undefined,
  };
}

function toStageRecord(
  s: ProductionJobRow["stages"][number],
): ProductionStageRecord {
  return {
    stage: camelToKebab(s.stage) as ProductionStage,
    state: camelToKebab(s.state) as StageState,
    assignee: s.assignedTo?.name ?? undefined,
    startedAt: s.startedAt?.toISOString(),
    sentToAuthorAt: s.sentToAuthorAt?.toISOString(),
    completedAt: s.completedAt?.toISOString(),
    dueAt: s.dueAt?.toISOString(),
    notes: s.notes.length ? s.notes : undefined,
  };
}

/**
 * The issue's target date, if the job is scheduled into one. The mock data
 * denormalised this onto the job; the schema keeps it on `EditorialIssue`, so
 * it is joined in here rather than stored twice.
 */
function toProductionJob(
  row: ProductionJobRow,
  targetDate: string | undefined,
): ProductionJob {
  return {
    id: row.id,
    submissionId: row.submissionId,
    reference: row.submission.reference,
    title: row.submission.title,
    issueId: row.issueId ?? undefined,
    stages: row.stages
      .map(toStageRecord)
      .sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
      ),
    galleys: row.galleys
      .map(toGalley)
      .sort((a, b) => b.version - a.version || a.format.localeCompare(b.format)),
    corrections: row.corrections
      .map(toCorrection)
      .sort((a, b) => +new Date(a.raisedAt) - +new Date(b.raisedAt)),
    enteredProductionAt: row.enteredAt.toISOString(),
    targetDate,
  };
}

/** Every job's issue target date, in one query rather than N. */
async function targetDatesByIssue(
  issueIds: string[],
): Promise<Map<string, string>> {
  const ids = [...new Set(issueIds)];
  if (ids.length === 0) return new Map();
  const issues = await db.editorialIssue.findMany({
    where: { id: { in: ids } },
    select: { id: true, targetDate: true },
  });
  return new Map(issues.map((i) => [i.id, i.targetDate.toISOString()]));
}

export async function getProductionJobs(): Promise<ProductionJob[]> {
  const rows = await db.productionJob.findMany({
    include: productionJobInclude,
  });
  const targets = await targetDatesByIssue(
    rows.flatMap((r) => (r.issueId ? [r.issueId] : [])),
  );
  return rows.map((r) =>
    toProductionJob(r, r.issueId ? targets.get(r.issueId) : undefined),
  );
}

export async function getProductionJob(
  submissionId: string,
): Promise<ProductionJob | null> {
  if (!isUuid(submissionId)) return null;
  const row = await db.productionJob.findUnique({
    where: { submissionId },
    include: productionJobInclude,
  });
  if (!row) return null;
  const targets = await targetDatesByIssue(row.issueId ? [row.issueId] : []);
  return toProductionJob(
    row,
    row.issueId ? targets.get(row.issueId) : undefined,
  );
}

export async function getProductionSubmission(
  submissionId: string,
): Promise<Submission | null> {
  return getEditorialSubmissionById(submissionId);
}

/**
 * The job and its manuscript together, which every detail screen needs.
 *
 * Returns null if either is missing rather than half a page: a production
 * screen with no manuscript behind it cannot say whose work it is showing.
 */
export async function getProductionContext(submissionId: string) {
  const [job, submission] = await Promise.all([
    getProductionJob(submissionId),
    getProductionSubmission(submissionId),
  ]);
  if (!job || !submission) return null;

  const issue = job.issueId ? await getEditorialIssueById(job.issueId) : null;

  return { job, submission, issue };
}

/**
 * The people who can hold a production stage.
 *
 * Read from the account directory rather than hard-coded: the stage screens
 * used to offer three names as plain strings, which meant a stage could be
 * assigned to someone who has no account and therefore cannot open it. The
 * roles here are `ROLE_GROUPS.production` — kept in step with it by the same
 * list the action re-checks against, because an assignee the form offers and
 * the action refuses is the worst of both.
 */
export async function getProductionTeam(): Promise<
  { id: string; name: string }[]
> {
  const rows = await db.user.findMany({
    where: {
      status: "active",
      roles: {
        some: {
          role: {
            in: [
              "superAdmin",
              "admin",
              "journalManager",
              "copyeditor",
              "layoutEditor",
              "proofreader",
            ],
          },
        },
      },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return rows;
}

/* ------------------------------------------------------------------ *
 * Reading a job.
 * ------------------------------------------------------------------ */

export function stageRecord(
  job: ProductionJob,
  stage: ProductionStage,
): ProductionStageRecord {
  return (
    job.stages.find((s) => s.stage === stage) ?? {
      stage,
      state: "not-started",
    }
  );
}

/**
 * The stage a job is actually at.
 *
 * The first stage that is not done — not the first one in progress, because a
 * job can sit with nothing in progress at all (nobody has picked it up), and
 * that job is still *at* copyediting. Returns null only when all three are
 * done, which is the one case that means "ready to publish".
 */
export function currentStage(job: ProductionJob): ProductionStage | null {
  for (const stage of STAGE_ORDER) {
    if (stageRecord(job, stage).state !== "done") return stage;
  }
  return null;
}

/** Stages finished, out of three. */
export function stageProgress(job: ProductionJob) {
  const done = STAGE_ORDER.filter(
    (s) => stageRecord(job, s).state === "done",
  ).length;
  return { done, total: STAGE_ORDER.length };
}

/**
 * Who a job is waiting on, in production's own terms.
 *
 * The mirror of `waitingOn()` in `editorial.ts`, and derived for the same
 * reason: a stage state says what is happening, not whose move it is. A stage
 * marked `with-author` is production doing nothing and waiting, which is
 * invisible in a progress bar and is the single most common reason an issue
 * slips.
 */
export type ProductionWaitingOn = "production" | "author" | "unassigned" | "none";

export function productionWaitingOn(job: ProductionJob): ProductionWaitingOn {
  const stage = currentStage(job);
  if (!stage) return "none";

  const record = stageRecord(job, stage);
  if (record.state === "with-author") return "author";
  if (record.state === "not-started" && !record.assignee) return "unassigned";
  return "production";
}

export const PRODUCTION_WAITING_LABEL: Record<ProductionWaitingOn, string> = {
  production: "Production",
  author: "Author",
  unassigned: "Unassigned",
  none: "Ready to publish",
};

/** Whole days since an ISO date. */
export function daysSince(iso: string, now = new Date()): number {
  return Math.max(0, Math.floor((+now - +new Date(iso)) / 86_400_000));
}

/**
 * How long the current stage has been sitting, and why that matters.
 *
 * Measured from whichever event actually started the wait: being sent to the
 * author, or the stage starting. A job nobody has picked up is aged from when
 * it entered production, because "untouched for six weeks" is exactly what a
 * production queue exists to surface.
 */
export function stalledDays(job: ProductionJob, now = new Date()): number {
  const stage = currentStage(job);
  if (!stage) return 0;

  const record = stageRecord(job, stage);
  const from =
    record.sentToAuthorAt ?? record.startedAt ?? job.enteredProductionAt;
  return daysSince(from, now);
}

/**
 * Whether the queue should flag this job.
 *
 * Three triggers, all about time rather than state: an overdue stage, an
 * author sitting on something past the two-week mark, or a job nobody has
 * picked up after a fortnight. The thresholds live here so the queue and any
 * later dashboard cannot disagree.
 */
export const AUTHOR_WAIT_DAYS = 14;
export const UNASSIGNED_DAYS = 14;

export function productionNeedsAttention(
  job: ProductionJob,
  now = new Date(),
): boolean {
  const stage = currentStage(job);
  if (!stage) return false;

  const record = stageRecord(job, stage);

  if (record.dueAt && +new Date(record.dueAt) < +now) return true;

  const waiting = productionWaitingOn(job);
  if (waiting === "author") return stalledDays(job, now) > AUTHOR_WAIT_DAYS;
  if (waiting === "unassigned") return stalledDays(job, now) > UNASSIGNED_DAYS;

  return false;
}

/** Open proof corrections — the ones that stop a job being finished. */
export function openCorrections(job: ProductionJob) {
  return job.corrections.filter((c) => c.state === "open");
}

/* ------------------------------------------------------------------ *
 * The queue.
 * ------------------------------------------------------------------ */

export type ProductionSort = "stalled" | "target" | "entered" | "title";

export type ProductionQuery = {
  q?: string;
  stage?: ProductionStage;
  waitingOn?: ProductionWaitingOn;
  sort?: ProductionSort;
};

export async function listProductionQueue(query: ProductionQuery = {}) {
  const { q, stage, waitingOn: waiting, sort = "stalled" } = query;

  const all = await getProductionJobs();

  const stats = {
    total: all.length,
    withAuthor: all.filter((j) => productionWaitingOn(j) === "author").length,
    unassigned: all.filter((j) => productionWaitingOn(j) === "unassigned")
      .length,
    attention: all.filter((j) => productionNeedsAttention(j)).length,
    ready: all.filter((j) => currentStage(j) === null).length,
  };

  let items = all;

  if (stage) items = items.filter((j) => currentStage(j) === stage);
  if (waiting) items = items.filter((j) => productionWaitingOn(j) === waiting);

  if (q) {
    const needle = q.toLowerCase().trim();
    items = items.filter(
      (j) =>
        j.reference.toLowerCase().includes(needle) ||
        j.title.toLowerCase().includes(needle) ||
        // Production searches by who holds the work — the question a
        // production editor actually asks of a queue.
        j.stages.some((s) => s.assignee?.toLowerCase().includes(needle)),
    );
  }

  return { items: sortJobs(items, sort), stats };
}

/**
 * Default sort is "stalled longest", not newest.
 *
 * Same reasoning as the editorial queue: a queue exists to surface what has
 * been ignored, and newest-first buries it.
 */
function sortJobs(items: ProductionJob[], sort: ProductionSort) {
  const sorted = [...items];
  switch (sort) {
    case "target":
      // Jobs with no target date sink; an unscheduled paper is not urgent by
      // virtue of having no date.
      return sorted.sort((a, b) => {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return +new Date(a.targetDate) - +new Date(b.targetDate);
      });
    case "entered":
      return sorted.sort(
        (a, b) =>
          +new Date(a.enteredProductionAt) - +new Date(b.enteredProductionAt),
      );
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "stalled":
    default:
      return sorted.sort((a, b) => stalledDays(b) - stalledDays(a));
  }
}
