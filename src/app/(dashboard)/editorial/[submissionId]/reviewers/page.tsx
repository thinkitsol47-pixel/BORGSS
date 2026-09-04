import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Ban, Check, Users } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getEditorialSubmissionById,
  getReviewerMatches,
  roundProgress,
  waitingOn,
  type ReviewerMatch,
} from "@/lib/api/editorial";
import { EditorialHeader } from "@/components/portal/editorial-header";
import { ReviewerStats } from "@/components/portal/reviewer-stats";
import {
  AssignmentActions,
  InviteReviewerButton,
} from "@/components/portal/invite-reviewer";
import { Alert, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ReviewAssignment, Submission } from "@/types";

export const metadata: Metadata = { title: "Manuscript — Reviewers" };

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireGroup("editorial");

  const submission = await getEditorialSubmissionById(params.submissionId);
  if (!submission) notFound();

  const matches = await getReviewerMatches(submission);
  const { completed, total, overdue } = roundProgress(submission);

  const thisRound = submission.reviewAssignments.filter(
    (r) => r.round === submission.round,
  );
  const earlierRounds = submission.reviewAssignments.filter(
    (r) => r.round !== submission.round,
  );

  // The header is this page's title block; see the overview page.
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <EditorialHeader
        submission={submission}
        active="reviewers"
        waiting={waitingOn(submission)}
      />

      <div className="mt-8 max-w-4xl space-y-10">
        {/* Names appear here, and only from this side. The author's view of
            the same assignments renders `label` — "Reviewer 2" — instead. */}
        <section aria-labelledby="assigned-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2
              id="assigned-heading"
              className="font-serif text-lg font-semibold"
            >
              Round {submission.round}
            </h2>
            {total > 0 && (
              <p className="text-sm text-muted-foreground">
                {completed} of {total} returned
                {overdue > 0 && (
                  <span className="ml-1 font-medium text-warning">
                    · {overdue} overdue
                  </span>
                )}
              </p>
            )}
          </div>

          {thisRound.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={Users}
                title="No reviewers invited yet"
                description="Nobody has been approached for this round. The suggestions below are matched on the manuscript's keywords and section."
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y rounded-xl border">
              {thisRound.map((a) => (
                <li key={a.id} className="p-4">
                  <AssignmentRow assignment={a} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {earlierRounds.length > 0 && (
          <section aria-labelledby="earlier-heading">
            <h2
              id="earlier-heading"
              className="font-serif text-lg font-semibold"
            >
              Earlier rounds
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Who has already seen this manuscript. Returning to the same
              reviewers on a revision is normal; sending it to someone new after
              a major revision is a judgement call.
            </p>
            <ul className="mt-3 divide-y rounded-xl border">
              {earlierRounds.map((a) => (
                <li key={a.id} className="p-4">
                  <AssignmentRow assignment={a} showRound />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="suggestions-heading">
          <h2
            id="suggestions-heading"
            className="font-serif text-lg font-semibold"
          >
            Suggested reviewers
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Ordered by how many of the manuscript&rsquo;s keywords each reviewer
            covers, then by how much work they already hold. The matched
            keywords are shown so you can judge the suggestion rather than
            trust it.
          </p>

          <ul className="mt-4 space-y-3">
            {matches.map((m) => (
              <li key={m.reviewer.id}>
                <MatchCard match={m} submission={submission} />
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-muted-foreground">
            <Link
              href="/editorial/reviewers-db"
              className="font-medium text-primary hover:text-brand-dark hover:underline"
            >
              Browse the full reviewer database
            </Link>
          </p>
        </section>

        <Alert tone="warning" title="Inviting is not built yet">
          The controls are built, but there is no database and no mail
          provider, so no invitation actually goes anywhere. The editorial
          office invites reviewers by email in the meantime, quoting{" "}
          <span className="font-medium">{submission.reference}</span>. Conflict
          checking is also incomplete — only a shared affiliation is detected,
          so check co-authorship and supervision yourself before inviting.
        </Alert>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const ASSIGNMENT_TONE: Record<
  ReviewAssignment["status"],
  { label: string; className: string }
> = {
  invited: {
    label: "Invited",
    className: "border-border bg-muted text-muted-foreground",
  },
  accepted: {
    label: "Accepted",
    className: "border-brand-border bg-brand-tint text-brand-darker",
  },
  declined: {
    label: "Declined",
    className: "border-border bg-muted text-muted-foreground",
  },
  completed: {
    label: "Report returned",
    className: "border-success/30 bg-success/10 text-success",
  },
  overdue: {
    label: "Overdue",
    className: "border-warning/40 bg-warning/10 text-warning",
  },
};

function AssignmentRow({
  assignment: a,
  showRound = false,
}: {
  assignment: ReviewAssignment;
  showRound?: boolean;
}) {
  const tone = ASSIGNMENT_TONE[a.status];

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{a.reviewerName}</span>
          <span className="text-xs text-muted-foreground">({a.label})</span>
          {showRound && (
            <span className="text-xs text-muted-foreground">
              · round {a.round}
            </span>
          )}
        </div>
        <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>Invited</dt>
            <dd className="font-medium text-foreground">
              {formatDate(a.invitedAt)}
            </dd>
          </div>
          {a.dueAt && (
            <div className="flex gap-1.5">
              <dt>Due</dt>
              <dd
                className={
                  a.status === "overdue"
                    ? "font-medium text-warning"
                    : "font-medium text-foreground"
                }
              >
                {formatDate(a.dueAt)}
              </dd>
            </div>
          )}
          {a.completedAt && (
            <div className="flex gap-1.5">
              <dt>Returned</dt>
              <dd className="font-medium text-foreground">
                {formatDate(a.completedAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone.className}`}
        >
          {tone.label}
        </span>
        {!showRound && (
          <AssignmentActions reviewerName={a.reviewerName} status={a.status} />
        )}
      </div>
    </div>
  );
}

/**
 * One candidate.
 *
 * A blocked reviewer is shown greyed with the reason stated, not hidden. An
 * editor who cannot see that the obvious choice shares the author's department
 * will keep searching for them.
 */
function MatchCard({
  match: m,
  submission,
}: {
  match: ReviewerMatch;
  submission: Submission;
}) {
  const blocked = Boolean(m.conflict) || m.alreadyAssigned;
  const r = m.reviewer;

  return (
    <div
      className={
        blocked
          ? "rounded-xl border border-dashed bg-muted/30 p-4"
          : "rounded-xl border p-4"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{r.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {r.affiliation} · {r.country}
          </p>
        </div>

        {m.alreadyAssigned ? (
          <Badge variant="outline" size="sm">
            <Check className="size-3" aria-hidden />
            Already assigned
          </Badge>
        ) : m.conflict ? (
          <Badge variant="warning" size="sm">
            <Ban className="size-3" aria-hidden />
            Cannot invite
          </Badge>
        ) : null}
      </div>

      {m.conflict && !m.alreadyAssigned && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-warning">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          {m.conflict}
        </p>
      )}

      {(m.matchedKeywords.length > 0 || m.sectionMatch) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {m.sectionMatch && (
            <span className="rounded-full border border-brand-border bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand-darker">
              {submission.section}
            </span>
          )}
          {m.matchedKeywords.map((k) => (
            <span
              key={k}
              className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {m.matchedKeywords.length === 0 && !m.sectionMatch && (
        <p className="mt-3 text-xs text-muted-foreground">
          No keyword or section overlap — listed for completeness.
        </p>
      )}

      <div className="mt-3">
        <ReviewerStats reviewer={r} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end">
        <InviteReviewerButton
          reviewerName={r.name}
          reference={submission.reference}
          disabled={blocked}
          disabledReason={
            m.alreadyAssigned
              ? "Already invited or reviewing this manuscript"
              : (m.conflict ?? undefined)
          }
        />
      </div>

      {r.note && (
        <p className="mt-3 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
          {r.note}
        </p>
      )}
    </div>
  );
}
