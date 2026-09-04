import "server-only";
import type {
  ProductionJob,
  ProductionStage,
  ProductionStageRecord,
  StageState,
  Submission,
} from "@/types";
import {
  mockProductionJobs,
  mockProductionSubmissions,
} from "./mock-production";
import { mockSubmissions } from "./mock-submissions";
import { mockQueueSubmissions } from "./mock-queue-submissions";
import { mockEditorialIssues } from "./mock-issues";

/**
 * Server-side data access for the production screens.
 * SCAFFOLD: reads mock data. Swap each body for a real query.
 *
 * Separate from `editorial.ts` for the same reason that module is separate
 * from `submissions.ts`: the question is different. Editorial asks "what is
 * waiting, and on whom?"; production asks "what is on my bench, and what is
 * blocking it?" — and the answers come from `ProductionJob`, not from
 * `Submission.status`, which has one value for all of production.
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

/* ------------------------------------------------------------------ *
 * Loading.
 * ------------------------------------------------------------------ */

/** Every manuscript production might hold, from all three fixture files. */
function allSubmissions(): Submission[] {
  return [
    ...mockSubmissions,
    ...mockQueueSubmissions,
    ...mockProductionSubmissions,
  ];
}

export async function getProductionJobs(): Promise<ProductionJob[]> {
  return [...mockProductionJobs];
}

export async function getProductionJob(
  submissionId: string,
): Promise<ProductionJob | null> {
  return (
    mockProductionJobs.find((j) => j.submissionId === submissionId) ?? null
  );
}

export async function getProductionSubmission(
  submissionId: string,
): Promise<Submission | null> {
  return allSubmissions().find((s) => s.id === submissionId) ?? null;
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

  const issue = job.issueId
    ? (mockEditorialIssues.find((i) => i.id === job.issueId) ?? null)
    : null;

  return { job, submission, issue };
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
