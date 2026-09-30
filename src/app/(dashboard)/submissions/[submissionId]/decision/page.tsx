import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gavel } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { getSubmissionById } from "@/lib/api/submissions";
import { SubmissionHeader } from "@/components/portal/submission-header";
import { Alert, Badge, Card, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { DecisionType } from "@/types";

export const metadata: Metadata = { title: "Decisions" };

/**
 * A decision is the most consequential thing the journal says to an author,
 * so each one is labelled in plain words with a colour that matches its
 * weight — and never a colour alone.
 */
const DECISION: Record<
  DecisionType,
  { label: string; variant: "success" | "warning" | "danger"; meaning: string }
> = {
  accept: {
    label: "Accepted",
    variant: "success",
    meaning: "Accepted for publication. The manuscript moves to production.",
  },
  "minor-revision": {
    label: "Minor revision",
    variant: "warning",
    meaning:
      "Small changes are needed. Another round of external review is unlikely.",
  },
  "major-revision": {
    label: "Major revision",
    variant: "warning",
    meaning:
      "Substantial changes are needed. The revision will normally go back to reviewers, and acceptance is not guaranteed.",
  },
  reject: {
    label: "Declined",
    variant: "danger",
    meaning: "Declined after external review.",
  },
  "desk-reject": {
    label: "Declined at desk",
    variant: "danger",
    meaning:
      "Declined without external review — usually a question of fit rather than quality.",
  },
};

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireUser();
  const submission = await getSubmissionById(params.submissionId);
  if (!submission) notFound();

  // Newest first: the decision that matters is the one still being acted on.
  const decisions = [...submission.decisions].sort((a, b) => b.round - a.round);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <SubmissionHeader submission={submission} active="decision" />

      <div className="mt-8 max-w-3xl">
        {decisions.length === 0 ? (
          <EmptyState
            icon={Gavel}
            title="No decision yet"
            // "You will also be emailed" was a promise the platform cannot
            // keep: the journal owns no domain, so no mail reaches an author.
            // Saying it here is worse than saying nothing — an author would
            // watch an inbox instead of this page.
            description="Decision letters appear here as soon as the handling editor has reached one. Check this page — the portal cannot email you yet, so nothing will arrive in your inbox."
          />
        ) : (
          <>
            {submission.status === "revision-requested" &&
              submission.revisionDueAt && (
                <Alert tone="warning" title="Your revision is due">
                  <p>
                    Please return the revised manuscript by{" "}
                    <strong>{formatDate(submission.revisionDueAt)}</strong>,
                    with a point-by-point response to each comment below.
                  </p>
                </Alert>
              )}

            <ol className="mt-6 space-y-6">
              {decisions.map((d) => {
                const meta = DECISION[d.type];
                return (
                  <li key={d.id}>
                    <Card className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b pb-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Round {d.round}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(d.decidedAt)} · {d.decidedBy}
                        </p>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {meta.meaning}
                      </p>

                      <div className="mt-4 space-y-3 border-t pt-4 text-[15px] leading-relaxed">
                        {d.letter.map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ol>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              If you believe a decision rests on a factual error or a procedural
              failure, the{" "}
              <a
                href="/policies/complaints-appeals"
                className="font-medium text-primary hover:text-brand-dark hover:underline"
              >
                complaints and appeals policy
              </a>{" "}
              sets out the grounds for an appeal and how one is handled.
              Disagreement with a reviewer&rsquo;s judgement is not in itself a
              ground for appeal.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
