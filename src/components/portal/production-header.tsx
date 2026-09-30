import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StageBadge } from "./stage-badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  currentStage,
  stageProgress,
  STAGE_LABEL,
  stageRecord,
} from "@/lib/api/production";
import type { EditorialIssue, ProductionJob, Submission } from "@/types";

/**
 * Identity block above a manuscript's production tabs.
 *
 * A sibling of `EditorialHeader`, not a rewrite of it — the same relationship
 * `EditorialHeader` has to `SubmissionHeader`. The three headers show the same
 * manuscript to three people who need different things: the author needs their
 * own status, the editor needs the author list and the decision, and
 * production needs the stage, who holds it, and which issue it is due in.
 */
export type ProductionTab = "copyedit" | "galleys" | "proofread";

export function ProductionHeader({
  job,
  submission,
  issue,
  active,
}: {
  job: ProductionJob;
  submission: Submission;
  issue: EditorialIssue | null;
  active: ProductionTab;
}) {
  const tabs: { id: ProductionTab; label: string; href: string }[] = [
    {
      id: "copyedit",
      label: "Copyediting",
      href: `/production/${submission.id}/copyedit`,
    },
    {
      id: "galleys",
      label: "Typesetting",
      href: `/production/${submission.id}/galleys`,
    },
    {
      id: "proofread",
      label: "Proofreading",
      href: `/production/${submission.id}/proofread`,
    },
  ];

  const stage = currentStage(job);
  const { done, total } = stageProgress(job);
  const corresponding =
    submission.contributors.find((c) => c.isCorresponding) ??
    submission.contributors[0];

  return (
    <div>
      <Link
        href="/production"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Production queue
      </Link>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-medium text-muted-foreground">
            {job.reference}
          </span>
          {/* The stage a job is at, and how that stage is going, are two
              different facts. Both are shown; neither stands for the other. */}
          {stage ? (
            <>
              <span className="text-sm font-medium text-brand-darker">
                {STAGE_LABEL[stage]}
              </span>
              <StageBadge state={stageRecord(job, stage).state} />
            </>
          ) : (
            <span className="text-sm font-medium text-success">
              All stages complete
            </span>
          )}
        </div>
        <h1 className="mt-2 max-w-3xl font-serif text-xl font-semibold leading-snug tracking-tight md:text-2xl">
          {job.title}
        </h1>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>Stages done</dt>
          <dd className="font-medium text-foreground">
            {done} of {total}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Corresponding</dt>
          <dd className="font-medium text-foreground">
            {corresponding
              ? `${corresponding.givenName} ${corresponding.familyName}`
              : "—"}
          </dd>
        </div>
        {/* Said once, here, rather than in a standing box on each of the three
            stage screens — where it was the same fact three times, always on,
            and therefore read by nobody. Nothing in production leaves the
            portal: no mail, no tracked-changes pipeline, no author link to a
            galley. Everything is circulated from the office against the
            reference shown above. */}
        <div className="flex gap-1.5">
          <dt>Files and proofs</dt>
          <dd className="font-medium text-foreground">Circulated by hand</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>In production since</dt>
          <dd className="font-medium text-foreground">
            {formatDate(job.enteredProductionAt)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Issue</dt>
          <dd className="font-medium text-foreground">
            {issue ? (
              <Link
                href={`/editorial/issues/${issue.id}`}
                className="text-primary hover:underline"
              >
                Vol. {issue.volume}, No. {issue.number} ({issue.year})
              </Link>
            ) : (
              /* Said plainly. An unscheduled paper has no target date, and a
                 blank here would read as one that simply was not filled in. */
              "Not scheduled"
            )}
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

      <nav
        aria-label="Production stages"
        className="-mx-4 mt-6 px-4 md:mx-0 md:px-0"
      >
        <ul className="flex gap-1 overflow-x-auto border-b pb-px">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            const record = stageRecord(job, tab.id);
            return (
              <li key={tab.id} className="shrink-0">
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-brand text-brand-darker"
                      : "border-transparent text-muted-foreground hover:border-brand-border hover:text-brand-darker",
                  )}
                >
                  {tab.label}
                  {/* A tick on the tab, with the state named in the label for
                      anyone not reading colour or shape. */}
                  {record.state === "done" && (
                    <span className="text-success" aria-hidden>
                      ✓
                    </span>
                  )}
                  <span className="sr-only">
                    {record.state === "done" ? " — done" : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
