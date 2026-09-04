import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Wand2 } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  currentStage,
  listProductionQueue,
  openCorrections,
  productionNeedsAttention,
  productionWaitingOn,
  stageProgress,
  stageRecord,
  stalledDays,
  STAGE_LABEL,
  STAGE_ORDER,
  type ProductionSort,
  type ProductionWaitingOn,
} from "@/lib/api/production";
import { PortalPage } from "@/components/layout/portal-page";
import {
  ProductionWaitingBadge,
  StageBadge,
} from "@/components/portal/stage-badge";
import { ProductionFilters } from "@/components/portal/production-filters";
import {
  Alert,
  EmptyState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductionJob, ProductionStage } from "@/types";

export const metadata: Metadata = { title: "Production Queue" };

const SORTS: ProductionSort[] = ["stalled", "target", "entered", "title"];
const WAITING: ProductionWaitingOn[] = [
  "production",
  "author",
  "unassigned",
  "none",
];

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    stage?: string;
    waitingOn?: string;
    sort?: string;
  };
}) {
  await requireGroup("production");

  const q = searchParams?.q?.trim() || undefined;
  const stage = STAGE_ORDER.includes(searchParams?.stage as ProductionStage)
    ? (searchParams?.stage as ProductionStage)
    : undefined;
  const waiting = WAITING.includes(searchParams?.waitingOn as ProductionWaitingOn)
    ? (searchParams?.waitingOn as ProductionWaitingOn)
    : undefined;
  const sort = SORTS.includes(searchParams?.sort as ProductionSort)
    ? (searchParams?.sort as ProductionSort)
    : "stalled";

  const { items, stats } = await listProductionQueue({
    q,
    stage,
    waitingOn: waiting,
    sort,
  });

  const filtered = Boolean(q || stage || waiting);

  return (
    <PortalPage
      title="Production queue"
      lead="Accepted manuscripts in copyediting, typesetting and proofreading — and what each one is waiting on."
    >
      {/* Counts first, as on the editorial queue. A production editor opens
          this page to find what has stopped moving, not to browse. */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QueueStat label="In production" value={stats.total} href="/production" />
        <QueueStat
          label="With authors"
          value={stats.withAuthor}
          href="/production?waitingOn=author"
          tone={stats.withAuthor > 0 ? "warning" : "plain"}
        />
        <QueueStat
          label="Unassigned"
          value={stats.unassigned}
          href="/production?waitingOn=unassigned"
        />
        <QueueStat
          label="Ready to publish"
          value={stats.ready}
          href="/production?waitingOn=none"
        />
      </dl>

      {stats.attention > 0 && (
        <div className="mt-6">
          <Alert tone="warning" title={`${stats.attention} need attention`}>
            A stage is past its due date, or has been sitting with the author or
            unassigned for more than a fortnight. Flagged rows are marked below.
          </Alert>
        </div>
      )}

      <div className="mt-6">
        <ProductionFilters q={q} stage={stage} waiting={waiting} sort={sort} />
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Wand2}
            title={
              filtered
                ? "No manuscripts match those filters"
                : "Nothing is in production"
            }
            description={
              filtered
                ? "Try a different stage, or clear the filters to see everything."
                : "Accepted manuscripts appear here once the editor hands them over."
            }
            action={
              filtered ? { label: "Clear filters", href: "/production" } : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Cards below md, table from md up. A six-column production table
              on a phone is unreadable however it scrolls. */}
          <ul className="mt-6 space-y-3 md:hidden">
            {items.map((job) => (
              <li key={job.id}>
                <JobCard job={job} />
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden md:block">
            <Table caption="Production queue: manuscript, stage, who it waits on, who holds it, and target date">
              <THead>
                <TR>
                  <TH>Manuscript</TH>
                  <TH>Stage</TH>
                  <TH>Waiting on</TH>
                  <TH>Held by</TH>
                  <TH>Waiting</TH>
                  <TH>Target</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((job) => {
                  const stageId = currentStage(job);
                  const record = stageId ? stageRecord(job, stageId) : null;
                  const flagged = productionNeedsAttention(job);
                  const open = openCorrections(job).length;

                  return (
                    <TR key={job.id}>
                      <TD>
                        <div className="flex items-start gap-2">
                          {flagged && (
                            <AlertTriangle
                              className="mt-0.5 size-4 shrink-0 text-warning"
                              aria-hidden
                            />
                          )}
                          <div className="min-w-0">
                            <Link
                              href={jobHref(job)}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {job.title}
                            </Link>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {job.reference}
                              {open > 0 && (
                                <span className="ml-2 text-warning">
                                  {open} open{" "}
                                  {open === 1 ? "correction" : "corrections"}
                                </span>
                              )}
                            </p>
                            {flagged && (
                              <span className="sr-only">Needs attention</span>
                            )}
                          </div>
                        </div>
                      </TD>
                      <TD className="whitespace-nowrap">
                        {stageId ? (
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium">
                              {STAGE_LABEL[stageId]}
                            </span>
                            {record && <StageBadge state={record.state} />}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TD>
                      <TD>
                        <ProductionWaitingBadge
                          waiting={productionWaitingOn(job)}
                        />
                      </TD>
                      <TD className="whitespace-nowrap text-muted-foreground">
                        {/* Never "unassigned" written as a person's absence in
                            the same column as a name — it is its own word. */}
                        {record?.assignee ?? "—"}
                      </TD>
                      <TD className="whitespace-nowrap">
                        <span
                          className={cn(
                            "tabular-nums",
                            flagged
                              ? "font-medium text-warning"
                              : "text-muted-foreground",
                          )}
                        >
                          {stalledDays(job)} days
                        </span>
                      </TD>
                      <TD className="whitespace-nowrap text-muted-foreground">
                        {job.targetDate ? formatDate(job.targetDate) : "—"}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </>
      )}

      <div className="mt-8">
        <Alert tone="warning" title="Production is not built yet">
          Nothing here can be changed: no stage can be advanced or assigned, no
          galley uploaded, and no correction marked applied. There is no
          database and no file storage. These screens read the current state;
          production is coordinated by email in the meantime.
        </Alert>
      </div>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

/** A job's own screen is its current stage — the one somebody has to work on. */
function jobHref(job: ProductionJob) {
  const stage = currentStage(job) ?? "proofread";
  return `/production/${job.submissionId}/${stage}`;
}

function JobCard({ job }: { job: ProductionJob }) {
  const stageId = currentStage(job);
  const record = stageId ? stageRecord(job, stageId) : null;
  const flagged = productionNeedsAttention(job);
  const { done, total } = stageProgress(job);
  const open = openCorrections(job).length;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        flagged && "border-warning/40 bg-warning/5",
      )}
    >
      <div className="flex items-start gap-2">
        {flagged && (
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-warning"
            aria-hidden
          />
        )}
        <div className="min-w-0">
          <Link
            href={jobHref(job)}
            className="text-sm font-medium hover:text-primary hover:underline"
          >
            {job.title}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{job.reference}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {stageId && (
          <span className="text-xs font-medium">{STAGE_LABEL[stageId]}</span>
        )}
        {record && <StageBadge state={record.state} />}
        <ProductionWaitingBadge waiting={productionWaitingOn(job)} />
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>Stages</dt>
          <dd className="font-medium text-foreground">
            {done} of {total}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Held by</dt>
          <dd className="font-medium text-foreground">
            {record?.assignee ?? "Nobody"}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Waiting</dt>
          <dd
            className={cn(
              "font-medium",
              flagged ? "text-warning" : "text-foreground",
            )}
          >
            {stalledDays(job)} days
          </dd>
        </div>
        {job.targetDate && (
          <div className="flex gap-1.5">
            <dt>Target</dt>
            <dd className="font-medium text-foreground">
              {formatDate(job.targetDate)}
            </dd>
          </div>
        )}
      </dl>

      {open > 0 && (
        <p className="mt-2 text-xs font-medium text-warning">
          {open} open {open === 1 ? "correction" : "corrections"}
        </p>
      )}
    </div>
  );
}

function QueueStat({
  label,
  value,
  href,
  tone = "plain",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "plain" | "warning";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/40"
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-serif text-2xl font-semibold tabular-nums",
          tone === "warning" && value > 0 && "text-warning",
        )}
      >
        {value}
      </dd>
    </Link>
  );
}
