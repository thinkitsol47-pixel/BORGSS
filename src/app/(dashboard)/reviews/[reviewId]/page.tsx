import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, PenLine, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { getReviewTaskById } from "@/lib/api/reviews";
import {
  REVIEW_CRITERIA,
  REVIEW_RECOMMENDATIONS,
} from "@/lib/validation/schemas";
import {
  DueDate,
  ReviewStatusBadge,
  reviewStatusDescription,
} from "@/components/portal/review-status";
import { InvitationResponse } from "@/components/portal/invitation-response";
import { Alert, Badge, Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ReviewTask } from "@/types";

export const metadata: Metadata = { title: "Review" };

/**
 * One review task.
 *
 * Three shapes, chosen by status: an invitation gets accept/decline and no
 * form; an accepted or overdue task gets the form; a returned one gets a
 * read-only copy of what was sent.
 *
 * Nothing on this page names an author — `ReviewTask` has no field for one.
 */
export default async function Page({
  params,
}: {
  params: { reviewId: string };
}) {
  await requireUser();
  const task = await getReviewTaskById(params.reviewId);
  if (!task) notFound();

  const isInvitation = task.status === "invited";
  const canWrite = task.status === "accepted" || task.status === "overdue";
  const isDone = task.status === "submitted";

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <Link
        href="/reviews"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All reviews
      </Link>

      <header className="mt-4 border-b pb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-medium text-muted-foreground">
            {task.reference}
          </span>
          <ReviewStatusBadge status={task.status} />
          {task.round > 1 && (
            <span className="text-sm text-muted-foreground">
              Round {task.round}
            </span>
          )}
        </div>

        <h1 className="mt-2 max-w-3xl font-serif text-xl font-semibold leading-snug tracking-tight md:text-2xl">
          {task.title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {reviewStatusDescription(task.status)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>{task.section}</span>
          {task.wordCount && (
            <span>{task.wordCount.toLocaleString()} words</span>
          )}
          <span>Invited {formatDate(task.invitedAt)}</span>
          {task.dueAt && !isDone && <DueDate dueAt={task.dueAt} />}
          {isDone && task.completedAt && (
            <span>Returned {formatDate(task.completedAt)}</span>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          {isInvitation && <InvitationResponse dueAt={task.dueAt} />}

          {task.invitationNote && (
            <section aria-labelledby="editor-note">
              <h2
                id="editor-note"
                className="font-serif text-lg font-semibold"
              >
                From the handling editor
              </h2>
              <Card className="mt-3 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {task.invitationNote}
                </p>
              </Card>
            </section>
          )}

          <section aria-labelledby="abstract">
            <h2 id="abstract" className="font-serif text-lg font-semibold">
              Abstract
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {task.abstract}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {task.keywords.map((k) => (
                <li
                  key={k}
                  className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-darker"
                >
                  {k}
                </li>
              ))}
            </ul>
          </section>

          {canWrite && (
            <section
              aria-labelledby="write"
              className="rounded-xl border border-brand-border bg-brand-tint/25 p-5"
            >
              <h2 id="write" className="font-serif text-base font-semibold">
                Your review
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Six scored criteria, an overall recommendation, and your written
                comments to the author and to the editor. It opens on its own
                page with the abstract kept beside it, so you can leave and come
                back.
              </p>
              <Button
                href={`/reviews/${task.id}/submit`}
                size="lg"
                className="mt-4"
              >
                <PenLine className="size-4" aria-hidden />
                Write your review
              </Button>
            </section>
          )}

          {isDone && task.review && (
            <SubmittedReview task={task} />
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-serif text-base font-semibold">Manuscript</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              The anonymised version. Author names and affiliations are on a
              separate title page you do not receive.
            </p>

            <ul className="mt-4 space-y-2">
              {task.files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2.5 rounded-lg border p-2.5"
                >
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-tint text-brand-dark"
                  >
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                      {f.filename}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {Math.round(f.sizeBytes / 1024)} KB
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Downloads become available when the file store is connected.
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-serif text-base font-semibold">
              <ShieldCheck className="size-4 text-brand" aria-hidden />
              Confidential
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              This manuscript is unpublished and confidential. Do not share it,
              cite it, use its findings, or upload it to any AI tool.
            </p>
            <Link
              href="/policies/reviewer-ethics"
              target="_blank"
              rel="noopener"
              className="mt-2.5 inline-block text-xs font-medium text-primary hover:text-brand-dark hover:underline"
            >
              Reviewer ethics policy
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/** Read-only copy of a report already returned. */
function SubmittedReview({ task }: { task: ReviewTask }) {
  const review = task.review!;
  const rec = REVIEW_RECOMMENDATIONS.find(
    (r) => r.value === review.recommendation,
  );

  return (
    <section aria-labelledby="submitted" className="border-t pt-8">
      <h2 id="submitted" className="font-serif text-lg font-semibold">
        Your review
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Returned {formatDate(review.submittedAt)}. A submitted report cannot be
        edited — contact the editorial office if something needs correcting.
      </p>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-medium">Scores</h3>
        <dl className="mt-3 space-y-2">
          {REVIEW_CRITERIA.map((c) => {
            const score = review.scores[c.id];
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <dt className="text-muted-foreground">{c.label}</dt>
                <dd className="flex items-center gap-2">
                  {/* Number and pips together, so the score is never conveyed
                      by the filled shapes alone. */}
                  <span className="font-semibold tabular-nums">
                    {score ?? "—"}
                  </span>
                  <span aria-hidden className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={
                          score !== null && n <= score
                            ? "size-1.5 rounded-full bg-brand"
                            : "size-1.5 rounded-full bg-border"
                        }
                      />
                    ))}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
          <span className="text-sm text-muted-foreground">Recommendation</span>
          <Badge variant="brand">{rec?.label ?? review.recommendation}</Badge>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-medium">Comments to the author</h3>
        <div className="mt-2.5 space-y-3 text-[15px] leading-relaxed">
          {review.commentsToAuthor.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Card>

      {review.commentsToEditor.length > 0 && (
        <Card className="mt-4 border-brand-border bg-brand-tint/25 p-5">
          <h3 className="text-sm font-medium">
            Confidential comments to the editor
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Not shown to the author.
          </p>
          <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {review.commentsToEditor.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Card>
      )}

      {review.concernsRaised && (
        <div className="mt-4">
          <Alert tone="warning" title="Concern raised">
            {review.concernsRaised}
          </Alert>
        </div>
      )}
    </section>
  );
}
