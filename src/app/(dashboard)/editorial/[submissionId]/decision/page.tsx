import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileQuestion, Scale } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  availableDecisions,
  decisionBlockedReason,
  getDecisionContext,
  getEditorialSubmissionById,
  waitingOn,
} from "@/lib/api/editorial";
import { EditorialHeader } from "@/components/portal/editorial-header";
import { ReviewerReportCard } from "@/components/portal/reviewer-report";
import { DecisionForm } from "@/components/portal/decision-form";
import { Alert, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { DecisionType } from "@/types";

export const metadata: Metadata = { title: "Manuscript — Decision" };

const DECISION_LABEL: Record<DecisionType, string> = {
  accept: "Accepted",
  "minor-revision": "Minor revision requested",
  "major-revision": "Major revision requested",
  reject: "Rejected",
  "desk-reject": "Desk rejected",
};

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireGroup("editorial");

  const submission = await getEditorialSubmissionById(params.submissionId);
  if (!submission) notFound();

  const ctx = await getDecisionContext(submission);
  const blocked = decisionBlockedReason(submission);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <EditorialHeader
        submission={submission}
        active="decision"
        waiting={waitingOn(submission)}
      />

      <div className="mt-8 max-w-4xl space-y-10">
        {/* ------------------------------------------------ what was decided
            History first and in full. An appeal is heard against the record,
            and a decision screen that showed only the latest one would let an
            editor contradict a predecessor without knowing they had. */}
        {submission.decisions.length > 0 && (
          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="font-serif text-lg font-semibold">
              Decisions already taken
            </h2>
            <ul className="mt-3 space-y-3">
              {[...submission.decisions]
                .sort((a, b) => b.round - a.round)
                .map((d) => (
                  <li key={d.id} className="rounded-xl border p-4 md:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-sm font-semibold">
                        {DECISION_LABEL[d.type]}
                        <span className="ml-2 font-normal text-muted-foreground">
                          round {d.round}
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {d.decidedBy} · {formatDate(d.decidedAt)}
                      </p>
                    </div>
                    <div className="mt-3 space-y-2.5 border-t pt-3 text-sm leading-relaxed">
                      {d.letter.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* ------------------------------------------------------- reports */}
        <section aria-labelledby="reports-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="reports-heading" className="font-serif text-lg font-semibold">
              Reports — round {submission.round}
            </h2>
            {ctx.currentRound.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {ctx.currentRound.length} returned
                {ctx.missing.length > 0 && (
                  <span className="ml-1 font-medium text-warning">
                    · {ctx.missing.length} outstanding
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Two reviewers who disagree is the case this screen exists for, so
              it is named rather than left for the editor to notice. */}
          {ctx.disagreement && (
            <div className="mt-3">
              <Alert tone="info" title="The reviewers do not agree">
                Their recommendations differ. Weighing them is your judgement to
                make, and it is worth telling the author in the letter which
                reasoning you followed — a decision that contradicts a report
                the author can read is the decision most often appealed.
              </Alert>
            </div>
          )}

          {ctx.currentRound.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={FileQuestion}
                title="No reports for this round yet"
                description="Nothing has been returned for the round in progress. A decision can still be recorded — a desk rejection needs no reports at all — but anything taken after review should wait for one."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {ctx.currentRound.map((r) => (
                <li key={r.id}>
                  <ReviewerReportCard report={r} />
                </li>
              ))}
            </ul>
          )}

          {/* An assignment with no report is a reviewer who has not reported.
              Listing them is the point: the queue's status column cannot show
              this, and deciding without noticing is the mistake to prevent. */}
          {ctx.missing.length > 0 && (
            <div className="mt-4 rounded-xl border border-dashed p-4">
              <h3 className="text-sm font-medium">Still outstanding</h3>
              <ul className="mt-2 space-y-1.5">
                {ctx.missing.map((m) => (
                  <li
                    key={m.label}
                    className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {m.label}
                    </span>
                    <span>{m.reviewerName}</span>
                    <span
                      className={
                        m.status === "overdue"
                          ? "font-medium text-warning"
                          : undefined
                      }
                    >
                      · {m.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Earlier rounds are dimmed rather than hidden. On a resubmission the
            question an editor is actually answering is whether the author did
            what round 1 asked, which cannot be judged without round 1. */}
        {ctx.earlierRounds.length > 0 && (
          <section aria-labelledby="earlier-reports-heading">
            <h2
              id="earlier-reports-heading"
              className="font-serif text-lg font-semibold"
            >
              Reports from earlier rounds
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What was asked for last time, so you can judge whether the
              revision answers it.
            </p>
            <ul className="mt-4 space-y-4">
              {ctx.earlierRounds.map((r) => (
                <li key={r.id}>
                  <ReviewerReportCard report={r} muted />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* -------------------------------------------------------- the form */}
        <section aria-labelledby="decide-heading">
          <h2 id="decide-heading" className="sr-only">
            Record a decision
          </h2>

          {blocked ? (
            <EmptyState
              icon={Scale}
              title="No decision to take"
              description={`${blocked} There is nothing further to record on this manuscript.`}
            />
          ) : (
            <>
              <DecisionForm
                submissionId={submission.id}
                reference={submission.reference}
                available={availableDecisions(submission)}
                hasMissingReports={ctx.missing.length > 0}
              />

              <div className="mt-8">
                {/* Kept: this sits directly above the submit, and an editor
                    who records a decision believing the author has been told
                    is the mistake it prevents. "There is no mail provider yet"
                    was wrong — there is one; it cannot reach the author. */}
                <Alert tone="info" title="The letter is still sent by hand">
                  Recording a decision does <strong>not</strong> email the author
                  or the reviewers — the journal owns no domain, so nothing can
                  reach them. Send the letter from the editorial office, quoting{" "}
                  <span className="font-medium">{submission.reference}</span>.
                </Alert>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
