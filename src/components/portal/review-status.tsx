import { Badge } from "@/components/ui";
import { daysUntil } from "@/lib/api/reviews";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ReviewTaskStatus } from "@/types";

/**
 * Status of one review task. Same construction as `StatusBadge` — a `Record`
 * over the union, so a new status without a label is a type error.
 */
const STATUS: Record<
  ReviewTaskStatus,
  {
    label: string;
    variant: "brand" | "outline" | "success" | "warning" | "danger";
    description: string;
  }
> = {
  invited: {
    label: "Invitation",
    variant: "brand",
    description:
      "You have been invited to review this manuscript. Please accept or decline.",
  },
  accepted: {
    label: "In progress",
    variant: "brand",
    description: "You accepted this review and it is not yet returned.",
  },
  declined: {
    label: "Declined",
    variant: "outline",
    description: "You declined this invitation.",
  },
  overdue: {
    label: "Overdue",
    variant: "warning",
    description:
      "This review is past its due date. The editor cannot decide without it.",
  },
  submitted: {
    label: "Returned",
    variant: "success",
    description: "You have returned this review. Thank you.",
  },
};

export function ReviewStatusBadge({
  status,
  size = "md",
}: {
  status: ReviewTaskStatus;
  size?: "sm" | "md";
}) {
  const { label, variant } = STATUS[status];
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

export function reviewStatusDescription(status: ReviewTaskStatus) {
  return STATUS[status].description;
}

export function reviewStatusLabel(status: ReviewTaskStatus) {
  return STATUS[status].label;
}

export const REVIEW_FILTER_STATUSES: ReviewTaskStatus[] = [
  "invited",
  "accepted",
  "overdue",
  "submitted",
  "declined",
];

/**
 * A deadline said in the way a reviewer actually reads one: "in 9 days",
 * "due tomorrow", "11 days overdue" — with the date itself alongside, because
 * a relative phrase alone is useless for putting in a calendar.
 *
 * Colour is never the only signal; the words carry the urgency themselves.
 */
export function DueDate({
  dueAt,
  className,
}: {
  dueAt: string;
  className?: string;
}) {
  const days = daysUntil(dueAt);

  const phrase =
    days < 0
      ? `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} overdue`
      : days === 0
        ? "Due today"
        : days === 1
          ? "Due tomorrow"
          : `Due in ${days} days`;

  const tone =
    days < 0
      ? "text-danger"
      : days <= 3
        ? "text-warning"
        : "text-muted-foreground";

  return (
    <span className={cn("text-xs", tone, className)}>
      <span className="font-medium">{phrase}</span>
      <span className="text-muted-foreground"> · {formatDate(dueAt)}</span>
    </span>
  );
}
