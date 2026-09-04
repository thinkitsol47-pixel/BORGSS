import { REVIEW_CRITERIA, REVIEW_RECOMMENDATIONS } from "@/lib/validation/schemas";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ReviewCriterion, ReviewRecommendation, ReviewerReport } from "@/types";

/**
 * One reviewer's report, as the editor reads it.
 *
 * Rendered from `REVIEW_CRITERIA` and `REVIEW_RECOMMENDATIONS` — the same two
 * lists the reviewer's own form is built from — so a criterion cannot be
 * scored under one name and read back under another. Adding a criterion to the
 * form adds it here.
 *
 * This component is editorial-only. It renders `reviewerName`, which no
 * author-facing screen may do.
 */

const RECOMMENDATION_TONE: Record<ReviewRecommendation, string> = {
  accept: "border-success/30 bg-success/10 text-success",
  "minor-revision": "border-brand-border bg-brand-tint text-brand-darker",
  "major-revision": "border-warning/40 bg-warning/10 text-warning",
  reject: "border-danger/30 bg-danger/10 text-danger",
};

export function recommendationLabel(r: ReviewRecommendation): string {
  return REVIEW_RECOMMENDATIONS.find((x) => x.value === r)?.label ?? r;
}

export function RecommendationBadge({
  recommendation,
}: {
  recommendation: ReviewRecommendation;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        RECOMMENDATION_TONE[recommendation],
      )}
    >
      {recommendationLabel(recommendation)}
    </span>
  );
}

/**
 * The six scores as a row of small bars.
 *
 * The number is printed beside every bar rather than being conveyed by length
 * alone, matching the review form where the number *is* the label. A single
 * hue throughout: with the value written out, colour would be decoration.
 */
function ScoreGrid({
  scores,
}: {
  scores: Record<ReviewCriterion, number | null>;
}) {
  return (
    <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {REVIEW_CRITERIA.map((c) => {
        const score = scores[c.id as ReviewCriterion];
        return (
          <div key={c.id} className="flex items-center justify-between gap-3">
            <dt className="min-w-0 truncate text-xs text-muted-foreground">
              {c.label}
            </dt>
            <dd className="flex shrink-0 items-center gap-2">
              <span
                className="flex gap-0.5"
                aria-hidden
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1.5 w-3 rounded-full",
                      score !== null && n <= score ? "bg-brand" : "bg-muted",
                    )}
                  />
                ))}
              </span>
              <span className="w-8 text-right text-xs font-medium tabular-nums">
                {score === null ? "—" : `${score}/5`}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function ReviewerReportCard({
  report,
  /** Rounds other than the one in progress are dimmed and labelled. */
  muted = false,
}: {
  report: ReviewerReport;
  muted?: boolean;
}) {
  const { body } = report;

  return (
    <article
      className={cn(
        "rounded-xl border p-4 md:p-5",
        muted && "border-dashed bg-muted/20",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            {report.label}
            <span className="ml-2 font-normal text-muted-foreground">
              {report.reviewerName}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Round {report.round} · returned {formatDate(body.submittedAt)}
          </p>
        </div>
        <RecommendationBadge recommendation={body.recommendation} />
      </header>

      <div className="mt-4 border-t pt-4">
        <ScoreGrid scores={body.scores} />
      </div>

      <section className="mt-4 border-t pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Comments to the author
        </h4>
        <div className="mt-2 space-y-2.5 text-sm leading-relaxed">
          {body.commentsToAuthor.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Marked plainly rather than merely placed lower. A confidential note
          pasted into a decision letter by mistake is the failure this label
          exists to prevent. */}
      {body.commentsToEditor.length > 0 && (
        <section className="mt-4 rounded-lg border border-brand-border bg-brand-tint/40 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-darker">
            Confidential to the editor
          </h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Not sent to the author, whatever else goes with the letter.
          </p>
          <div className="mt-2 space-y-2.5 text-sm leading-relaxed">
            {body.commentsToEditor.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {body.concernsRaised && (
        <section className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-warning">
            Concern raised
          </h4>
          <p className="mt-2 text-sm leading-relaxed">{body.concernsRaised}</p>
        </section>
      )}
    </article>
  );
}
