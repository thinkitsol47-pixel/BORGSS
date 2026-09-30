import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { getReviewTaskById } from "@/lib/api/reviews";
import { DueDate } from "@/components/portal/review-status";
import { ReviewForm } from "@/components/portal/review-form";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Write your review" };

/**
 * Writing the report — its own route, not a section of the task page.
 *
 * This is how production editorial systems (Editorial Manager, ScholarOne,
 * OJS) all do it, and the reasons are practical rather than aesthetic:
 *
 *  - A review takes hours and is written across sittings. Its own URL can be
 *    bookmarked, and the eventual reminder email can link straight to it.
 *  - The task page is read by someone deciding whether to accept, or checking
 *    a deadline. Making them scroll past a six-part form to reach the abstract
 *    serves neither job.
 *
 * The abstract and files are repeated in this page's sidebar, so nothing sends
 * the reviewer back to the previous screen mid-sentence.
 */
export default async function Page({
  params,
}: {
  params: { reviewId: string };
}) {
  await requireUser();
  const task = await getReviewTaskById(params.reviewId);
  if (!task) notFound();

  // Only an accepted or overdue task can be written. An invitation has to be
  // accepted first, and a returned report cannot be edited — in both cases the
  // task page is the right place, so send them there rather than 404.
  if (task.status !== "accepted" && task.status !== "overdue") {
    redirect(`/reviews/${task.id}`);
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <Link
        href={`/reviews/${task.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to the manuscript
      </Link>

      <header className="mt-4 border-b pb-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            {task.reference}
          </span>
          {task.round > 1 && (
            <span className="text-xs text-muted-foreground">
              Round {task.round}
            </span>
          )}
          {task.dueAt && <DueDate dueAt={task.dueAt} />}
        </div>
        <h1 className="mt-2 font-serif text-xl font-semibold tracking-tight md:text-2xl">
          Write your review
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          {task.title}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0">
          <ReviewForm reviewId={task.id} reference={task.reference} />
        </div>

        {/* Sticky, so the abstract stays beside the form however far down the
            reviewer has scrolled. */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-5">
            <h2 className="font-serif text-base font-semibold">Abstract</h2>
            <p className="mt-2 max-h-64 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
              {task.abstract}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
              {task.keywords.map((k) => (
                <li
                  key={k}
                  className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand-darker"
                >
                  {k}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-base font-semibold">Files</h2>
            <ul className="mt-3 space-y-2">
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
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {f.filename}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 font-serif text-base font-semibold">
              <ShieldCheck className="size-4 text-brand" aria-hidden />
              Confidential
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Do not share this manuscript, cite it, use its findings, or upload
              it to any AI tool.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
