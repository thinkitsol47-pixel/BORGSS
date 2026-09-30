import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, FileCheck2, ListOrdered, Pencil } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getEditorialIssueById,
  getIssueContents,
  getUnscheduledAccepted,
  issueLabel,
} from "@/lib/api/editorial";
import { StatusBadge } from "@/components/portal/status-badge";
import { Alert, Badge, EmptyState } from "@/components/ui";
import {
  IssueContentsControls,
  PlaceInIssueButton,
} from "@/components/portal/issue-contents-controls";
import { formatDate } from "@/lib/utils";
import type { IssueState } from "@/types";

export const metadata: Metadata = { title: "Issue" };

const STATE_LABEL: Record<IssueState, string> = {
  planned: "Planned",
  "in-production": "In production",
  published: "Published",
};

const STATE_VARIANT: Record<IssueState, "brand" | "warning" | "success"> = {
  planned: "brand",
  "in-production": "warning",
  published: "success",
};

export default async function Page({
  params,
}: {
  params: { issueId: string };
}) {
  await requireGroup("editorial");

  const issue = await getEditorialIssueById(params.issueId);
  if (!issue) notFound();

  const [contents, unscheduled] = await Promise.all([
    getIssueContents(issue),
    getUnscheduledAccepted(),
  ]);

  const short = issue.plannedArticles
    ? issue.plannedArticles - contents.length
    : 0;

  /* This screen is its own title block, like `/editorial/[submissionId]` —
     the issue's identity is more than a page heading can carry. */
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <Link
        href="/editorial/issues"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Issues
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-medium text-muted-foreground">
            {issueLabel(issue)}
          </span>
          <Badge variant={STATE_VARIANT[issue.state]} size="sm">
            {STATE_LABEL[issue.state]}
          </Badge>
          {/* Not offered on a published issue: `saveIssue` refuses one, since
              its volume, number and year are in other people's bibliographies
              by then. A button that leads to a form that will not save is
              worse than no button. */}
          {issue.state !== "published" && (
            <Link
              href={`/editorial/issues/${issue.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50"
            >
              <Pencil className="size-3" aria-hidden />
              Edit issue
            </Link>
          )}
        </div>
        {issue.title && (
          <h1 className="mt-2 max-w-3xl font-serif text-xl font-semibold leading-snug tracking-tight md:text-2xl">
            {issue.title}
          </h1>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-b pb-5 text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>{issue.state === "published" ? "Published" : "Target date"}</dt>
            <dd className="flex items-center gap-1 font-medium text-foreground">
              <CalendarClock className="size-3.5" aria-hidden />
              {formatDate(issue.publishedAt ?? issue.targetDate)}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Articles placed</dt>
            <dd className="font-medium text-foreground">
              {contents.length}
              {issue.plannedArticles ? ` of ${issue.plannedArticles} planned` : ""}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-8 max-w-4xl space-y-10">
        {/* ------------------------------------------------ table of contents */}
        <section aria-labelledby="contents-heading">
          <h2 id="contents-heading" className="font-serif text-lg font-semibold">
            Table of contents
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            In running order. Order is an editorial decision, so it is shown
            explicitly rather than left to whatever the data returns.
          </p>

          {contents.length === 0 ? (
            <div className="mt-3">
              {/* The second sentence points at the "Available to place"
                  section, which is not rendered on a published issue — so it
                  is not said there. An empty state that refers to a list the
                  reader cannot see is worse than a short one. */}
              <EmptyState
                icon={ListOrdered}
                title="Nothing placed yet"
                description={
                  issue.state === "published"
                    ? "This issue was published with no manuscript scheduled into it."
                    : "No manuscript has been scheduled into this issue. Accepted manuscripts waiting for one are listed below."
                }
              />
            </div>
          ) : (
            <ol className="mt-3 divide-y rounded-xl border">
              {contents.map(({ item, submission }, i) => (
                <li key={item.submissionId} className="flex gap-3 p-4">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-tint text-xs font-semibold text-brand-darker"
                    aria-hidden
                  >
                    {item.position}
                  </span>

                  {submission ? (
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0">
                          <Link
                            href={`/editorial/${submission.id}`}
                            className="text-sm font-medium hover:text-primary hover:underline"
                          >
                            {submission.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {submission.reference} ·{" "}
                            {submission.contributors
                              .map((c) => `${c.givenName} ${c.familyName}`)
                              .join(", ")}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={submission.status} />
                          {issue.state !== "published" && (
                            <IssueContentsControls
                              issueId={issue.id}
                              submissionId={submission.id}
                              title={submission.title}
                              position={item.position}
                              isFirst={i === 0}
                              isLast={i === contents.length - 1}
                            />
                          )}
                        </div>
                      </div>
                      {item.pages && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          pp. {item.pages}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* A placement pointing at a manuscript that cannot be
                       found is shown as a gap, not dropped. A silently
                       shortened table of contents is the harder bug. */
                    <p className="flex-1 text-sm text-warning">
                      Placed manuscript{" "}
                      <span className="font-medium">{item.submissionId}</span>{" "}
                      could not be found.
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}

          {issue.state !== "published" && short > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {short} more {short === 1 ? "article" : "articles"} planned for
              this issue. A target, not a requirement — an issue publishes when
              its contents are ready.
            </p>
          )}
        </section>

        {/* ------------------------------------------------------ available */}
        {issue.state !== "published" && (
          <section aria-labelledby="available-heading">
            <h2
              id="available-heading"
              className="font-serif text-lg font-semibold"
            >
              Available to place
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Accepted manuscripts not yet in any issue.
            </p>

            {unscheduled.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={FileCheck2}
                  title="Nothing available"
                  description="Every accepted manuscript has already been placed."
                />
              </div>
            ) : (
              <ul className="mt-3 divide-y rounded-xl border">
                {unscheduled.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 p-4"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/editorial/${s.id}`}
                        className="text-sm font-medium hover:text-primary hover:underline"
                      >
                        {s.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.reference} · {s.section}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={s.status} />
                      <PlaceInIssueButton
                        issueId={issue.id}
                        submissionId={s.id}
                        title={s.title}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {issue.state === "published" && issue.slug && (
          <section aria-labelledby="public-heading">
            <h2 id="public-heading" className="font-serif text-lg font-semibold">
              The published issue
            </h2>
            <p className="mt-2 text-sm">
              <Link
                href={`/issues/${issue.slug}`}
                className="font-medium text-primary hover:text-brand-dark hover:underline"
              >
                Open {issueLabel(issue)} on the public site
              </Link>
            </p>
          </section>
        )}

        {/* Placing, reordering and removing all save. What genuinely does not
            work is publishing, and page numbers, so the notice names those two
            rather than the whole screen — and it is not shown on an issue that
            is already published, where it would read as a denial of what the
            badge at the top of the same screen states. */}
        {issue.state !== "published" && (
          <Alert tone="warning" title="This issue cannot be published yet">
            Its contents save, but publishing mints a DOI for every article the
            issue carries and the journal has no Crossref prefix, so those
            identifiers would resolve nowhere. Page numbers are not recorded
            here either — they are settled in production, once the galleys are
            final.
          </Alert>
        )}
      </div>
    </div>
  );
}
