import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ExternalLink, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { db } from "@/lib/db";
import {
  getSubmissionById,
  latestDecision,
  reviewProgress,
} from "@/lib/api/submissions";
import { SubmissionHeader } from "@/components/portal/submission-header";
import { Alert, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Submission } from "@/types";

export const metadata: Metadata = { title: "Submission" };

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireUser();
  const submission = await getSubmissionById(params.submissionId);
  if (!submission) notFound();

  const decision = latestDecision(submission);
  // The article's own page, so the author can copy the link to share.
  const article = submission.articleId
    ? await db.article.findUnique({
        where: { id: submission.articleId },
        select: { slug: true },
      })
    : null;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <SubmissionHeader submission={submission} active="overview" />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {submission.status === "revision-requested" && (
            <Alert tone="warning" title="A revision has been requested">
              <p>
                The editor has asked for changes.{" "}
                {submission.revisionDueAt && (
                  <>Please return the revision by{" "}
                  <strong>{formatDate(submission.revisionDueAt)}</strong>.{" "}</>
                )}
                Read the decision letter first — it lists exactly what is
                expected.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button href={`/submissions/${submission.id}/decision`} size="sm">
                  Read the decision letter
                </Button>
                <Button
                  href={`/submissions/${submission.id}/revisions`}
                  size="sm"
                  variant="outline"
                >
                  Files &amp; revisions
                </Button>
              </div>
            </Alert>
          )}

          <section aria-labelledby="abstract">
            <h2 id="abstract" className="font-serif text-lg font-semibold">
              Abstract
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {submission.abstract}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {submission.keywords.map((k) => (
                <li
                  key={k}
                  className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-darker"
                >
                  {k}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="authors">
            <h2
              id="authors"
              className="flex items-center gap-2 font-serif text-lg font-semibold"
            >
              <Users className="size-4 text-brand" aria-hidden />
              Authors
            </h2>
            <ul className="mt-3 space-y-3">
              {submission.contributors.map((c) => (
                <li key={c.id} className="text-sm">
                  <p className="font-medium">
                    {c.givenName} {c.familyName}
                    {c.isCorresponding && (
                      <span className="ml-2 rounded bg-brand-tint px-1.5 py-0.5 text-[11px] font-medium text-brand-darker">
                        Corresponding
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {c.affiliations.map((a) => a.name).join("; ")}
                  </p>
                  {c.orcid && (
                    <a
                      href={`https://orcid.org/${c.orcid}`}
                      target="_blank"
                      rel="noopener"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:text-brand-dark hover:underline"
                    >
                      {c.orcid}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {decision && (
            <section aria-labelledby="latest-decision">
              <h2
                id="latest-decision"
                className="font-serif text-lg font-semibold"
              >
                Most recent decision
              </h2>
              <Card className="mt-3 p-5">
                <p className="text-sm text-muted-foreground">
                  {formatDate(decision.decidedAt)} · {decision.decidedBy}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed">
                  {decision.letter[0]}
                </p>
                <Link
                  href={`/submissions/${submission.id}/decision`}
                  className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-dark"
                >
                  Read the full letter →
                </Link>
              </Card>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <ReviewPanel submission={submission} />

          {article && (
            <Card className="p-5">
              <h2 className="font-serif text-base font-semibold">Published</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                This manuscript has a public article page.
              </p>
              <Button
                href={`/articles/${article.slug}`}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                View on the site
              </Button>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

/**
 * Review progress, without ever naming a reviewer.
 *
 * The journal runs double-blind, so the author sees counts and labels
 * ("Reviewer 1") but never `reviewerName` — that field exists for the
 * editorial screens in phase 16.
 */
function ReviewPanel({ submission }: { submission: Submission }) {
  const current = submission.reviewAssignments.filter(
    (r) => r.round === submission.round && r.status !== "declined",
  );

  if (current.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="font-serif text-base font-semibold">Review</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          No reviewers have been assigned for this round yet.
        </p>
      </Card>
    );
  }

  const { completed, total } = reviewProgress(submission);

  return (
    <Card className="p-5">
      <h2 className="font-serif text-base font-semibold">Review</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {completed} of {total} {total === 1 ? "report" : "reports"} returned
        {submission.round > 1 && ` in round ${submission.round}`}.
      </p>

      <ul className="mt-4 space-y-3">
        {current.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.label}</p>
              {r.dueAt && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="size-3" aria-hidden />
                  Due {formatDate(r.dueAt)}
                </p>
              )}
            </div>
            <span
              className={
                r.status === "completed"
                  ? "shrink-0 text-xs font-medium text-success"
                  : r.status === "overdue"
                    ? "shrink-0 text-xs font-medium text-warning"
                    : "shrink-0 text-xs text-muted-foreground"
              }
            >
              {r.status === "completed"
                ? "Returned"
                : r.status === "overdue"
                  ? "Overdue"
                  : r.status === "accepted"
                    ? "In progress"
                    : "Invited"}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        Reviews are double-blind, so reviewer identities are not shown.
      </p>
    </Card>
  );
}
