import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, FileCheck2, Library, Plus } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getUnscheduledAccepted,
  issueLabel,
  listEditorialIssues,
} from "@/lib/api/editorial";
import { PortalPage } from "@/components/layout/portal-page";
import { StatusBadge } from "@/components/portal/status-badge";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { EditorialIssue, IssueState } from "@/types";

export const metadata: Metadata = { title: "Issues" };

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

export default async function Page() {
  await requireGroup("editorial");

  const [issues, unscheduled] = await Promise.all([
    listEditorialIssues(),
    getUnscheduledAccepted(),
  ]);

  const open = issues.filter((i) => i.state !== "published");
  const published = issues.filter((i) => i.state === "published");

  return (
    <PortalPage
      title="Issues"
      lead="Issues being assembled, and the accepted manuscripts waiting for one."
      actions={
        <Link
          href="/editorial/issues/new"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-dark bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark"
        >
          <Plus className="size-4" aria-hidden />
          New issue
        </Link>
      }
    >
      {/* Issues in preparation come first. The published archive is a matter
          of record and is already public; what an editor opens this page to
          decide is what goes into the issue not yet out. */}
      <section aria-labelledby="open-heading">
        <h2 id="open-heading" className="font-serif text-lg font-semibold">
          In preparation
        </h2>

        {open.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={Library}
              title="No issue is being assembled"
              description="Nothing is currently open for accepted manuscripts to be placed into."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {open.map((issue) => (
              <li key={issue.id}>
                <IssueCard issue={issue} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ----------------------------------------------------- unscheduled */}
      <section aria-labelledby="waiting-heading" className="mt-10">
        <h2 id="waiting-heading" className="font-serif text-lg font-semibold">
          Accepted, not yet scheduled
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manuscripts that have been accepted but placed in no issue. A short
          wait here is normal; a long one is what this list exists to make
          visible, because the author has been told their paper is accepted and
          is waiting to be told where it will appear.
        </p>

        {unscheduled.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={FileCheck2}
              title="Nothing is waiting"
              description="Every accepted manuscript has been placed in an issue."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border">
            {unscheduled.map((s) => (
              <li key={s.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
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
                  <StatusBadge status={s.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------- published */}
      {published.length > 0 && (
        <section aria-labelledby="published-heading" className="mt-10">
          <h2 id="published-heading" className="font-serif text-lg font-semibold">
            Published
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Out and public. These are shown for reference; the reader&rsquo;s
            version is the one that matters.
          </p>
          <ul className="mt-3 space-y-3">
            {published.map((issue) => (
              <li key={issue.id}>
                <IssueCard issue={issue} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* No notice about publishing here. This screen has no publish control
          and never had one, so the note answered a question nobody had asked —
          and it sat directly beneath the "Published" section, where it read as
          a denial of the two issues listed above it. The place that question
          arises is an individual issue, and `[issueId]/page.tsx` carries it
          there, shown only while the issue is not yet published. */}
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function IssueCard({ issue }: { issue: EditorialIssue }) {
  const placed = issue.items.length;
  const planned = issue.plannedArticles;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 md:p-5",
        issue.state === "published" && "bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <Link
            href={`/editorial/issues/${issue.id}`}
            className="font-serif text-base font-semibold hover:text-primary hover:underline"
          >
            {issueLabel(issue)}
          </Link>
          {issue.title && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {issue.title}
            </p>
          )}
        </div>
        <Badge variant={STATE_VARIANT[issue.state]} size="sm">
          {STATE_LABEL[issue.state]}
        </Badge>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>{issue.state === "published" ? "Published" : "Target"}</dt>
          <dd className="flex items-center gap-1 font-medium text-foreground">
            <CalendarClock className="size-3.5" aria-hidden />
            {formatDate(issue.publishedAt ?? issue.targetDate)}
          </dd>
        </div>
        {issue.state !== "published" && (
          <div className="flex gap-1.5">
            <dt>Placed</dt>
            {/* "1 of 5 planned" rather than a progress bar. Five is a target an
                editor set, not a capacity, and a bar would read as a quota. */}
            <dd className="font-medium text-foreground">
              {planned ? `${placed} of ${planned} planned` : `${placed}`}
            </dd>
          </div>
        )}
      </dl>

      {issue.state === "published" && issue.slug && (
        <p className="mt-3 text-sm">
          <Link
            href={`/issues/${issue.slug}`}
            className="font-medium text-primary hover:text-brand-dark hover:underline"
          >
            View the public issue
          </Link>
        </p>
      )}
    </div>
  );
}
