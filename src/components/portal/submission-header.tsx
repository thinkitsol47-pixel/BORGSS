import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge, statusDescription } from "./status-badge";
import { SubmissionTabs, type SubmissionTab } from "./submission-tabs";
import { formatDate } from "@/lib/utils";
import type { Submission } from "@/types";

/**
 * Identity block shown above all four of a submission's tabs.
 *
 * Kept in one component so the reference, title and status cannot drift
 * between tabs — on a tabbed detail view, the header is what tells the reader
 * they are still looking at the same manuscript.
 */
export function SubmissionHeader({
  submission,
  active,
}: {
  submission: Submission;
  active: SubmissionTab;
}) {
  return (
    <div>
      <Link
        href="/submissions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All submissions
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-medium text-muted-foreground">
              {submission.reference}
            </span>
            <StatusBadge status={submission.status} />
          </div>
          <h1 className="mt-2 max-w-3xl font-serif text-xl font-semibold leading-snug tracking-tight md:text-2xl">
            {submission.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {statusDescription(submission.status)}
          </p>
        </div>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
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

      <div className="mt-6">
        <SubmissionTabs
          submissionId={submission.id}
          active={active}
          counts={{
            messages: submission.messages.length,
            decision: submission.decisions.length,
          }}
        />
      </div>
    </div>
  );
}
