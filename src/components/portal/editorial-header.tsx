import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { WaitingBadge } from "./waiting-badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types";
import type { WaitingOn } from "@/lib/api/editorial";

/**
 * Identity block above an editorial manuscript's tabs.
 *
 * The author's `SubmissionHeader` cannot be reused as-is: its tabs are hard
 * wired to `/submissions/[id]`, and — more importantly — it deliberately shows
 * no author names, because the author viewing it already knows who they are
 * and reviewer identities must stay hidden.
 *
 * This is the same manuscript from the other side. The editor is the one
 * person who is allowed to see both ends: the author list and, on the
 * reviewers tab, the reviewer names. Double-blind separates authors and
 * reviewers from each other, never the editor from either.
 */
export type EditorialTab = "overview" | "reviewers" | "decision" | "production";

export function EditorialHeader({
  submission,
  active,
  waiting,
}: {
  submission: Submission;
  active: EditorialTab;
  waiting: WaitingOn;
}) {
  const tabs: { id: EditorialTab; label: string; href: string }[] = [
    { id: "overview", label: "Overview", href: `/editorial/${submission.id}` },
    {
      id: "reviewers",
      label: "Reviewers",
      href: `/editorial/${submission.id}/reviewers`,
    },
    {
      id: "decision",
      label: "Decision",
      href: `/editorial/${submission.id}/decision`,
    },
    {
      id: "production",
      label: "Production",
      href: `/editorial/${submission.id}/production`,
    },
  ];

  const corresponding =
    submission.contributors.find((c) => c.isCorresponding) ??
    submission.contributors[0];

  return (
    <div>
      <Link
        href="/editorial/queue"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Submission queue
      </Link>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-medium text-muted-foreground">
            {submission.reference}
          </span>
          <StatusBadge status={submission.status} />
          <WaitingBadge waiting={waiting} />
        </div>
        <h1 className="mt-2 max-w-3xl font-serif text-xl font-semibold leading-snug tracking-tight md:text-2xl">
          {submission.title}
        </h1>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>Corresponding</dt>
          <dd className="font-medium text-foreground">
            {corresponding
              ? `${corresponding.givenName} ${corresponding.familyName}`
              : "—"}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Section</dt>
          <dd className="font-medium text-foreground">{submission.section}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Submitted</dt>
          <dd className="font-medium text-foreground">
            {formatDate(submission.submittedAt)}
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Last updated</dt>
          <dd className="font-medium text-foreground">
            {formatDate(submission.updatedAt)}
          </dd>
        </div>
        {submission.round > 1 && (
          <div className="flex gap-1.5">
            <dt>Round</dt>
            <dd className="font-medium text-foreground">{submission.round}</dd>
          </div>
        )}
      </dl>

      <nav
        aria-label="Manuscript sections"
        className="-mx-4 mt-6 px-4 md:mx-0 md:px-0"
      >
        <ul className="flex gap-1 overflow-x-auto border-b pb-px">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
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
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
