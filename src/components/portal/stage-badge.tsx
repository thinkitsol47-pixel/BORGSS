import { cn } from "@/lib/utils";
import { STAGE_STATE_LABEL, PRODUCTION_WAITING_LABEL } from "@/lib/api/production";
import type { ProductionWaitingOn } from "@/lib/api/production";
import type { StageState } from "@/types";

/**
 * How a production stage is going, and who a job is waiting on.
 *
 * Two badges rather than one, and they sit side by side in the queue for the
 * same reason `StatusBadge` and `WaitingBadge` do on the editorial side: a
 * stage state says what is happening, and the waiting badge says whose move it
 * is. "In progress" and "waiting on the author" are different facts, and a
 * production editor needs both.
 *
 * Every state is a `Record` keyed by the union, so adding a state without
 * giving it a label is a type error rather than a blank chip.
 */

const STATE_TONE: Record<StageState, string> = {
  "not-started": "border-border bg-muted text-muted-foreground",
  "in-progress": "border-brand-border bg-brand-tint text-brand-darker",
  // The author holding something is not an error, but it is the state a
  // production editor most needs to pick out of a list at a glance.
  "with-author": "border-warning/40 bg-warning/10 text-warning",
  done: "border-success/30 bg-success/10 text-success",
};

export function StageBadge({ state }: { state: StageState }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATE_TONE[state],
      )}
    >
      {STAGE_STATE_LABEL[state]}
    </span>
  );
}

const WAITING_TONE: Record<ProductionWaitingOn, string> = {
  production: "border-brand-border bg-brand-tint text-brand-darker",
  author: "border-warning/40 bg-warning/10 text-warning",
  unassigned: "border-border-strong bg-background text-muted-foreground",
  none: "border-success/30 bg-success/10 text-success",
};

export function ProductionWaitingBadge({
  waiting,
}: {
  waiting: ProductionWaitingOn;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        WAITING_TONE[waiting],
      )}
    >
      {PRODUCTION_WAITING_LABEL[waiting]}
    </span>
  );
}
