import { CalendarClock, UserRound } from "lucide-react";
import { StageBadge } from "./stage-badge";
import { formatDate } from "@/lib/utils";
import { STAGE_LABEL } from "@/lib/api/production";
import type { ProductionStageRecord } from "@/types";

/**
 * The state of one production stage: who holds it, since when, and what they
 * have recorded.
 *
 * Shared by all three stage screens rather than written three times, because
 * the three differ in the *work* they show — copyedits, galleys, corrections —
 * not in how the stage itself is described. Writing this block three times
 * would guarantee three slightly different answers to "who has this?".
 */
export function StagePanel({
  record,
  /** Shown when the stage has not started, to say what it is waiting for. */
  notStartedHint,
}: {
  record: ProductionStageRecord;
  notStartedHint?: string;
}) {
  return (
    <section aria-labelledby="stage-state-heading">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="stage-state-heading" className="font-serif text-lg font-semibold">
          {STAGE_LABEL[record.stage]}
        </h2>
        <StageBadge state={record.state} />
      </div>

      {record.state === "not-started" ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {notStartedHint ??
            "This stage has not started. Nobody has picked it up yet."}
        </p>
      ) : (
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border p-4 text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>Held by</dt>
            <dd className="flex items-center gap-1 font-medium text-foreground">
              <UserRound className="size-3.5" aria-hidden />
              {record.assignee ?? "Nobody"}
            </dd>
          </div>
          {record.startedAt && (
            <div className="flex gap-1.5">
              <dt>Started</dt>
              <dd className="font-medium text-foreground">
                {formatDate(record.startedAt)}
              </dd>
            </div>
          )}
          {/* Only shown when it is still the live fact. Once the stage is done,
              "sent to the author" is history and reads as if it were current. */}
          {record.sentToAuthorAt && record.state === "with-author" && (
            <div className="flex gap-1.5">
              <dt>Sent to author</dt>
              <dd className="font-medium text-warning">
                {formatDate(record.sentToAuthorAt)}
              </dd>
            </div>
          )}
          {record.dueAt && record.state !== "done" && (
            <div className="flex gap-1.5">
              <dt>Due</dt>
              <dd className="flex items-center gap-1 font-medium text-foreground">
                <CalendarClock className="size-3.5" aria-hidden />
                {formatDate(record.dueAt)}
              </dd>
            </div>
          )}
          {record.completedAt && (
            <div className="flex gap-1.5">
              <dt>Completed</dt>
              <dd className="font-medium text-success">
                {formatDate(record.completedAt)}
              </dd>
            </div>
          )}
        </dl>
      )}

      {record.notes && record.notes.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes on this stage
          </h3>
          <ul className="mt-2 space-y-2 rounded-xl border p-4 text-sm leading-relaxed">
            {record.notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" aria-hidden />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
