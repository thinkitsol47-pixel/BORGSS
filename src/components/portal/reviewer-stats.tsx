import { cn, formatDate } from "@/lib/utils";
import type { ReviewerProfile } from "@/types";

/**
 * A reviewer's record, in one line.
 *
 * Four numbers, and every one of them is here because leaving it out would
 * mislead an editor choosing between people:
 *
 * - completed and turnaround say whether the reviewer delivers, and how fast;
 * - declined says how often an invitation will come back a no;
 * - unanswered says how often it will come back as nothing at all, which costs
 *   an editor more than a decline — a decline can be replaced the same day.
 *
 * A reviewer with no completed reviews shows "—", never a zero-day turnaround:
 * an absence of history is not a fast record.
 */
export function ReviewerStats({
  reviewer: r,
  className,
}: {
  reviewer: ReviewerProfile;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <Stat label="Completed" value={String(r.completed)} />
      <Stat
        label="Turnaround"
        value={
          r.averageTurnaroundDays === null
            ? "—"
            : `${r.averageTurnaroundDays} days`
        }
      />
      <Stat label="Declined" value={String(r.declined)} />
      <Stat
        label="Unanswered"
        value={String(r.unanswered)}
        tone={r.unanswered >= 3 ? "warning" : "plain"}
      />
      <Stat
        label="Active now"
        value={String(r.activeReviews)}
        tone={r.activeReviews >= 3 ? "warning" : "plain"}
      />
    </dl>
  );
}

function Stat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: string;
  tone?: "plain" | "warning";
}) {
  return (
    <div className="flex gap-1.5">
      <dt>{label}</dt>
      <dd
        className={cn(
          "font-medium",
          tone === "warning" ? "text-warning" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Availability, as a chip. The word carries the meaning; colour only
 * reinforces it.
 *
 * "Overloaded" is deliberately worded as the journal's inference rather than
 * the reviewer's choice — they have not refused anything, they simply already
 * hold several reviews.
 */
export function AvailabilityBadge({
  reviewer: r,
  className,
}: {
  reviewer: ReviewerProfile;
  className?: string;
}) {
  const map = {
    available: {
      label: "Available",
      className: "border-success/30 bg-success/10 text-success",
    },
    unavailable: {
      // Same raw-ISO bug as the conflict line in `editorial.ts` — the badge
      // was showing the full timestamp rather than a readable date.
      label: r.unavailableUntil
        ? `Unavailable to ${formatDate(r.unavailableUntil)}`
        : "Unavailable",
      className: "border-border bg-muted text-muted-foreground",
    },
    overloaded: {
      label: `Holding ${r.activeReviews}`,
      className: "border-warning/40 bg-warning/10 text-warning",
    },
  } as const;

  const tone = map[r.availability];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone.className,
        className,
      )}
    >
      {tone.label}
    </span>
  );
}
