import { cn } from "@/lib/utils";
import { WAITING_ON_LABEL, type WaitingOn } from "@/lib/api/editorial";

/**
 * Who a manuscript is waiting on.
 *
 * Distinct from `StatusBadge`, which says what stage the work is at. The two
 * answer different questions and an editor needs both: "under review" with all
 * reports in is waiting on the editor, not on the reviewers.
 *
 * The word is the label — colour only reinforces it, never carries it alone.
 * "Editor" is the only tone that draws the eye, because it is the only one the
 * person reading this screen can act on.
 */
const TONES: Record<WaitingOn, string> = {
  editor: "border-warning/40 bg-warning/10 text-warning",
  reviewers: "border-brand-border bg-brand-tint text-brand-darker",
  author: "border-border bg-muted text-muted-foreground",
  production: "border-success/30 bg-success/10 text-success",
  none: "border-border bg-muted text-muted-foreground",
};

export function WaitingBadge({
  waiting,
  className,
}: {
  waiting: WaitingOn;
  className?: string;
}) {
  if (waiting === "none") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[waiting],
        className,
      )}
    >
      <span className="sr-only">Waiting on </span>
      {WAITING_ON_LABEL[waiting]}
    </span>
  );
}
