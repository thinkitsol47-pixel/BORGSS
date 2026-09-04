import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Tab strip for one submission's four views.
 *
 * Real links, not client-side state: each tab is its own route, so it can be
 * bookmarked and linked to from an email. `active` is passed in by the page
 * rather than read from the pathname, which keeps this a Server Component.
 *
 * The same shape is reused by `/editorial/[id]` and `/production/[id]` in
 * later phases — the same manuscript seen by a different role.
 */
export type SubmissionTab = "overview" | "revisions" | "messages" | "decision";

export function SubmissionTabs({
  submissionId,
  active,
  /** Shown as a small count beside a tab, e.g. unread messages. */
  counts,
}: {
  submissionId: string;
  active: SubmissionTab;
  counts?: Partial<Record<SubmissionTab, number>>;
}) {
  const tabs: { id: SubmissionTab; label: string; href: string }[] = [
    { id: "overview", label: "Overview", href: `/submissions/${submissionId}` },
    {
      id: "revisions",
      label: "Files & revisions",
      href: `/submissions/${submissionId}/revisions`,
    },
    {
      id: "messages",
      label: "Messages",
      href: `/submissions/${submissionId}/messages`,
    },
    {
      id: "decision",
      label: "Decisions",
      href: `/submissions/${submissionId}/decision`,
    },
  ];

  return (
    // Scrolls sideways on a narrow phone rather than wrapping into two rows,
    // which would push the page content down on every tab.
    <nav aria-label="Submission sections" className="-mx-4 px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1 overflow-x-auto border-b pb-px">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          const count = counts?.[tab.id];
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
                {typeof count === "number" && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-brand-tint text-brand-darker"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
