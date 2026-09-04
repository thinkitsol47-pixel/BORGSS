import { Badge } from "@/components/ui";
import type { SubmissionStatus } from "@/types";

/**
 * The one place a submission status becomes a label and a colour.
 *
 * Every portal phase shows this — author list, editorial queue, production —
 * so it is defined once over the union type. Adding a status to
 * `SubmissionStatus` without adding it here is a type error, which is the
 * point: a status that renders as a blank chip is worse than a build failure.
 *
 * Colour carries meaning and is never the only signal — the label always says
 * the same thing in words.
 */
const STATUS: Record<
  SubmissionStatus,
  {
    label: string;
    variant: "brand" | "outline" | "success" | "warning" | "danger";
    /** Shown under a heading on detail pages; omitted in dense tables. */
    description: string;
  }
> = {
  draft: {
    label: "Draft",
    variant: "outline",
    description: "Not submitted yet. Only you can see this.",
  },
  submitted: {
    label: "Submitted",
    variant: "brand",
    description: "Received by the editorial office and awaiting a first look.",
  },
  "desk-review": {
    label: "Desk review",
    variant: "brand",
    description:
      "An editor is checking scope and completeness before involving reviewers.",
  },
  "under-review": {
    label: "Under review",
    variant: "brand",
    description: "With reviewers. This is normally the longest stage.",
  },
  "awaiting-decision": {
    label: "Awaiting decision",
    variant: "brand",
    description: "Reviews are in and the editor is deciding.",
  },
  "revision-requested": {
    label: "Revision requested",
    variant: "warning",
    description: "Waiting on you — see the decision letter for what to change.",
  },
  "revision-submitted": {
    label: "Revision submitted",
    variant: "brand",
    description: "Your revised manuscript is back with the editor.",
  },
  accepted: {
    label: "Accepted",
    variant: "success",
    description: "Accepted for publication and moving to production.",
  },
  "in-production": {
    label: "In production",
    variant: "brand",
    description: "In copyediting, layout and proofreading.",
  },
  published: {
    label: "Published",
    variant: "success",
    description: "Published and publicly available.",
  },
  "desk-rejected": {
    label: "Declined at desk",
    variant: "danger",
    description: "Declined without external review.",
  },
  rejected: {
    label: "Declined",
    variant: "danger",
    description: "Declined after review.",
  },
  withdrawn: {
    label: "Withdrawn",
    variant: "outline",
    description: "Withdrawn before a decision was reached.",
  },
};

export function StatusBadge({
  status,
  size = "md",
}: {
  status: SubmissionStatus;
  size?: "sm" | "md";
}) {
  const { label, variant } = STATUS[status];
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

/** The sentence under a heading on a detail page. */
export function statusDescription(status: SubmissionStatus) {
  return STATUS[status].description;
}

export function statusLabel(status: SubmissionStatus) {
  return STATUS[status].label;
}

/**
 * Statuses offered in the author's filter bar, in the order shown.
 * `draft` is excluded — drafts live in the wizard, not the submissions list.
 */
export const AUTHOR_FILTER_STATUSES: SubmissionStatus[] = [
  "submitted",
  "desk-review",
  "under-review",
  "awaiting-decision",
  "revision-requested",
  "accepted",
  "in-production",
  "published",
  "rejected",
];
