import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Circle, Lock } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getEditorialSubmissionById,
  issueLabel,
  listEditorialIssues,
  waitingOn,
} from "@/lib/api/editorial";
import { EditorialHeader } from "@/components/portal/editorial-header";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types";

export const metadata: Metadata = { title: "Manuscript — Production" };

/**
 * The handover point between editorial and production.
 *
 * This is deliberately *not* the copyediting workspace — that is phase 18,
 * under `/production/[id]`. What an editor needs here is narrower and comes
 * first: has this manuscript reached production at all, which issue is it
 * going into, and what has been done to it since acceptance. The work itself
 * belongs to the production editor, on their own screens.
 */

/** The stages between acceptance and publication, in order. */
const STAGES = [
  {
    id: "accepted",
    label: "Accepted",
    hint: "The decision is recorded and the author has been told.",
  },
  {
    id: "copyedit",
    label: "Copyediting",
    hint: "Language, references and house style, returned to the author for approval.",
  },
  {
    id: "galleys",
    label: "Typesetting",
    hint: "Laid out as the published PDF and, where used, XML.",
  },
  {
    id: "proofread",
    label: "Proofreading",
    hint: "Author and production editor check the galley against the accepted text.",
  },
  {
    id: "published",
    label: "Published",
    hint: "Assigned to an issue, given a DOI, and made public.",
  },
] as const;

/**
 * How far along a manuscript is.
 *
 * Derived from the submission's status, which is all the data supports today.
 * The three middle stages have no status of their own — `in-production` covers
 * all of them — so the screen says "in progress" across them rather than
 * inventing a precision it does not have.
 */
function stageState(s: Submission, stageId: string) {
  const published = s.status === "published";
  const inProduction = s.status === "in-production";
  const accepted = s.status === "accepted";

  if (published) return "done" as const;
  if (stageId === "accepted" && (accepted || inProduction)) return "done" as const;
  if (inProduction && stageId !== "published") return "current" as const;
  return "todo" as const;
}

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireGroup("editorial");

  const submission = await getEditorialSubmissionById(params.submissionId);
  if (!submission) notFound();

  const reached =
    submission.status === "accepted" ||
    submission.status === "in-production" ||
    submission.status === "published";

  const issues = await listEditorialIssues();
  const placedIn = issues.find((i) =>
    i.items.some((it) => it.submissionId === submission.id),
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <EditorialHeader
        submission={submission}
        active="production"
        waiting={waitingOn(submission)}
      />

      <div className="mt-8 max-w-4xl space-y-10">
        {!reached ? (
          /* A manuscript that has not been accepted has no production state,
             and showing an empty five-stage tracker would imply it does. */
          <EmptyState
            icon={Lock}
            title="Not in production"
            description="Production begins at acceptance. This manuscript is still in the editorial process, so there is nothing to typeset, proofread or schedule yet."
            action={{
              label: "Go to the decision",
              href: `/editorial/${submission.id}/decision`,
            }}
          />
        ) : (
          <>
            {/* ---------------------------------------------------- stages */}
            <section aria-labelledby="stages-heading">
              <h2 id="stages-heading" className="font-serif text-lg font-semibold">
                Where it has reached
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Copyediting, typesetting and proofreading are tracked as one
                stage here. The production editor&rsquo;s own screens will
                separate them.
              </p>

              <ol className="mt-4 space-y-2.5">
                {STAGES.map((stage) => {
                  const state = stageState(submission, stage.id);
                  return (
                    <li
                      key={stage.id}
                      className={cn(
                        "flex gap-3 rounded-xl border p-4",
                        state === "current" &&
                          "border-brand-border bg-brand-tint/40",
                        state === "todo" && "border-dashed",
                      )}
                    >
                      {state === "done" ? (
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-success"
                          aria-hidden
                        />
                      ) : (
                        <Circle
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            state === "current"
                              ? "text-brand"
                              : "text-muted-foreground",
                          )}
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-medium">
                            {stage.label}
                          </span>
                          {/* The state is written out, never carried by the
                              icon's colour alone. */}
                          <span className="text-xs text-muted-foreground">
                            {state === "done"
                              ? "Done"
                              : state === "current"
                                ? "In progress"
                                : "Not started"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {stage.hint}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* ----------------------------------------------------- issue */}
            <section aria-labelledby="issue-heading">
              <h2 id="issue-heading" className="font-serif text-lg font-semibold">
                Issue
              </h2>

              {placedIn ? (
                <div className="mt-3 rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {issueLabel(placedIn)}
                      </p>
                      {placedIn.title && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {placedIn.title}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        placedIn.state === "published" ? "success" : "brand"
                      }
                      size="sm"
                    >
                      {placedIn.state === "published"
                        ? "Published"
                        : placedIn.state === "in-production"
                          ? "In production"
                          : "Planned"}
                    </Badge>
                  </div>
                  <p className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5 shrink-0" aria-hidden />
                    {placedIn.state === "published" && placedIn.publishedAt
                      ? `Published ${formatDate(placedIn.publishedAt)}`
                      : `Target ${formatDate(placedIn.targetDate)} — a planned date, not a commitment to the author`}
                  </p>
                  <p className="mt-3 text-sm">
                    <Link
                      href={`/editorial/issues/${placedIn.id}`}
                      className="font-medium text-primary hover:text-brand-dark hover:underline"
                    >
                      Open the issue
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <EmptyState
                    icon={CalendarClock}
                    title="Not scheduled into an issue"
                    description="Accepted manuscripts wait here until an issue is being assembled. Nothing is wrong with that — an accepted paper commonly waits, and the author should be told which issue only once it is settled."
                    action={{
                      label: "Schedule into an issue",
                      href: "/editorial/issues",
                    }}
                    secondaryAction={{
                      label: "Production queue",
                      href: "/production",
                    }}
                  />
                </div>
              )}
            </section>

            {/* ----------------------------------------------------- files */}
            {submission.files.length > 0 && (
              <section aria-labelledby="files-heading">
                <h2 id="files-heading" className="font-serif text-lg font-semibold">
                  Files handed to production
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The accepted version and everything submitted alongside it.
                  Downloads are not wired into this screen yet — open them from
                  the manuscript&rsquo;s own page.
                </p>
                <ul className="mt-3 divide-y rounded-xl border">
                  {submission.files.map((f) => (
                    <li
                      key={f.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {f.filename}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {f.kind.replace(/-/g, " ")} · uploaded{" "}
                          {formatDate(f.uploadedAt)}
                          {f.round > 0 && ` · revision ${f.round}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {Math.round(f.sizeBytes / 1024).toLocaleString()} KB
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* No notice. This is the editor's *view* of production — nothing
                is done from here, so there is nothing to warn about before
                doing it. The email limit is stated on each production screen,
                where someone is about to send something. */}
          </>
        )}
      </div>
    </div>
  );
}
