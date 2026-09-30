import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FilePlus,
  Inbox,
  Settings,
  Users,
  Wand2,
} from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import {
  getAuthorStats,
  getAuthorTimings,
  getSubmissionsForAuthor,
} from "@/lib/api/submissions";
import { ROLE_LABELS, hasPermission } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { StatusBadge } from "@/components/portal/status-badge";
import { PipelineChart } from "@/components/portal/pipeline-chart";
import {
  DueDate,
  ReviewStatusBadge,
} from "@/components/portal/review-status";
import { getReviewerStats } from "@/lib/api/reviews";
import { Button, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Submission } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The portal's home.
 *
 * An earlier version was a grid of cards linking to other pages, which the
 * client rightly rejected: a dashboard whose every tile is a link tells you
 * nothing you did not already know from the sidebar. This one leads with
 * counts and with the rows that need action, and links are what the numbers
 * happen to be wrapped in rather than the point.
 *
 * Sections are gated on permissions, not roles, so all 12 roles are covered by
 * one page and a user holding several sees each section once.
 */
export default async function DashboardHome() {
  const user = await requireUser();
  const firstName = user.name.split(" ").slice(-1)[0];

  const isAuthor = hasPermission(user.roles, "submission.viewOwn");
  const stats = isAuthor ? await getAuthorStats(user.id) : null;
  const timings = isAuthor ? await getAuthorTimings(user.id) : null;
  const mine = isAuthor ? await getSubmissionsForAuthor(user.id) : [];

  const isReviewer = hasPermission(user.roles, "review.perform");
  const reviewStats = isReviewer ? await getReviewerStats() : null;

  return (
    <PortalPage
      title={`Welcome back, ${firstName}`}
      lead={`Signed in as ${user.roles.map((r) => ROLE_LABELS[r]).join(", ")}.`}
      actions={
        hasPermission(user.roles, "submission.create") ? (
          <Button href="/submissions/new">
            <FilePlus className="size-4" aria-hidden />
            New submission
          </Button>
        ) : undefined
      }
    >

      {/* ------------------------------------------------------- author */}
      {stats && (
        <>
          <section aria-labelledby="your-work" className="mt-8">
            <h2 id="your-work" className="font-serif text-lg font-semibold">
              Your submissions
            </h2>

            <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat
                label="Total"
                value={stats.total}
                href="/submissions"
              />
              <Stat
                label="In progress"
                value={stats.inProgress}
                href="/submissions?status=under-review"
                hint="With the journal"
              />
              <Stat
                label="Need your action"
                value={stats.needsAttention}
                href="/submissions?status=revision-requested"
                hint="Waiting on you"
                emphasis={stats.needsAttention > 0}
              />
              <Stat
                label="Accepted"
                value={stats.published}
                href="/submissions?status=accepted"
              />
            </dl>
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_18rem]">
            <PipelineChart submissions={mine} />
            {timings && <TimingsCard timings={timings} />}
          </div>

          {stats.attentionItems.length > 0 && (
            <section aria-labelledby="attention" className="mt-8">
              <h2 id="attention" className="font-serif text-lg font-semibold">
                Needs your attention
              </h2>
              <ul className="mt-3 space-y-3">
                {stats.attentionItems.map((s) => (
                  <li key={s.id}>
                    <AttentionRow submission={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="recent" className="mt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="recent" className="font-serif text-lg font-semibold">
                Recent activity
              </h2>
              <Link
                href="/submissions"
                className="text-sm font-medium text-primary hover:text-brand-dark"
              >
                View all
              </Link>
            </div>

            {stats.recent.length === 0 ? (
              <Card className="mt-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You have not submitted anything yet.
                </p>
                <Button href="/submissions/new" size="sm" className="mt-3">
                  Start a submission
                </Button>
              </Card>
            ) : (
              <ul className="mt-3 divide-y rounded-xl border">
                {stats.recent.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/submissions/${s.id}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition-colors hover:bg-brand-tint/30"
                    >
                      <span className="shrink-0 text-sm font-medium text-primary">
                        {s.reference}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {s.title}
                      </span>
                      <StatusBadge status={s.status} size="sm" />
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(s.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* ----------------------------------------------------- reviewer */}
      {reviewStats && (
        <section aria-labelledby="reviewing" className="mt-10 border-t pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="reviewing" className="font-serif text-lg font-semibold">
              Your reviewing
            </h2>
            <Link
              href="/reviews"
              className="text-sm font-medium text-primary hover:text-brand-dark"
            >
              View all
            </Link>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Awaiting response"
              value={reviewStats.invited}
              href="/reviews?status=invited"
              hint="Accept or decline"
              emphasis={reviewStats.invited > 0}
            />
            <Stat
              label="In progress"
              value={reviewStats.inProgress}
              href="/reviews?status=accepted"
            />
            <Stat
              label="Overdue"
              value={reviewStats.overdue}
              href="/reviews?status=overdue"
              emphasis={reviewStats.overdue > 0}
            />
            <Stat
              label="Returned"
              value={reviewStats.completed}
              href="/reviews?status=submitted"
            />
          </dl>

          {reviewStats.actionable.length > 0 && (
            <ul className="mt-4 divide-y rounded-xl border">
              {reviewStats.actionable.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/reviews/${task.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition-colors hover:bg-brand-tint/30"
                  >
                    <span className="shrink-0 text-sm font-medium text-primary">
                      {task.reference}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {task.title}
                    </span>
                    <ReviewStatusBadge status={task.status} size="sm" />
                    {task.dueAt && <DueDate dueAt={task.dueAt} />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ------------------------------------- other roles this user holds */}
      <OtherAreas roles={user.roles} hasReviewSection={Boolean(reviewStats)} />
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  href,
  hint,
  emphasis,
}: {
  label: string;
  value: number;
  href: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <Link
        href={href}
        className={
          emphasis
            ? "block rounded-xl border border-warning/40 bg-warning/5 p-4 transition-colors hover:border-warning"
            : "block rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/30"
        }
      >
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={
            emphasis
              ? "mt-1 font-serif text-3xl font-bold text-warning"
              : "mt-1 font-serif text-3xl font-bold"
          }
        >
          {value}
        </dd>
        {hint && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </Link>
    </div>
  );
}

/**
 * How long things have taken on this author's own manuscripts.
 *
 * Two numbers rather than a chart: with a handful of submissions there is no
 * distribution worth plotting, and the reader's question is simply "how long
 * does this take?" Each states what it is averaged over, so a mean of one is
 * not mistaken for a journal-wide figure.
 */
function TimingsCard({
  timings,
}: {
  timings: {
    firstDecisionDays: number | null;
    firstDecisionCount: number;
    reviewDays: number | null;
    reviewCount: number;
  };
}) {
  const hasAny =
    timings.firstDecisionDays !== null || timings.reviewDays !== null;

  return (
    <div className="rounded-xl border p-5">
      <h3 className="font-serif text-base font-semibold">
        Your turnaround so far
      </h3>

      {!hasAny ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nothing has completed a review round yet, so there is nothing to
          average.
        </p>
      ) : (
        <dl className="mt-4 space-y-4">
          {timings.firstDecisionDays !== null && (
            <div>
              <dt className="text-xs text-muted-foreground">
                Submission to first decision
              </dt>
              <dd className="mt-0.5 font-serif text-2xl font-bold">
                {timings.firstDecisionDays}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  days
                </span>
              </dd>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                across {timings.firstDecisionCount}{" "}
                {timings.firstDecisionCount === 1
                  ? "manuscript"
                  : "manuscripts"}
              </p>
            </div>
          )}

          {timings.reviewDays !== null && (
            <div className="border-t pt-4">
              <dt className="text-xs text-muted-foreground">
                Reviewer invitation to report
              </dt>
              <dd className="mt-0.5 font-serif text-2xl font-bold">
                {timings.reviewDays}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  days
                </span>
              </dd>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                across {timings.reviewCount}{" "}
                {timings.reviewCount === 1 ? "report" : "reports"}
              </p>
            </div>
          )}
        </dl>
      )}

      <p className="mt-4 border-t pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Your own history, not a journal-wide average.
      </p>
    </div>
  );
}

/** A submission the author has to act on, with the deadline stated. */
function AttentionRow({ submission }: { submission: Submission }) {
  return (
    <Card className="border-warning/40 bg-warning/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm font-medium text-primary">
              {submission.reference}
            </span>
            <StatusBadge status={submission.status} size="sm" />
          </div>
          <p className="mt-1.5 font-serif text-[15px] font-semibold leading-snug">
            {submission.title}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A revision has been requested
            {submission.revisionDueAt && (
              <>
                {" "}
                — due{" "}
                <strong className="text-foreground">
                  {formatDate(submission.revisionDueAt)}
                </strong>
              </>
            )}
            .
          </p>
        </div>
        <Button
          href={`/submissions/${submission.id}/decision`}
          size="sm"
          className="shrink-0"
        >
          Read the letter
        </Button>
      </div>
    </Card>
  );
}

/**
 * The user's non-author areas.
 *
 * Counts are not shown here because the data for them arrives in later phases
 * — a hard-coded "4 reviews due" is a claim the app cannot keep. These are
 * deliberately links until phase 14 and 16 give them real numbers.
 */
function OtherAreas({
  roles,
  hasReviewSection,
}: {
  roles: Parameters<typeof hasPermission>[0];
  hasReviewSection: boolean;
}) {
  const areas = [
    // Reviewing has its own section above once the user holds the permission;
    // the card is the fallback for a state that cannot currently occur but
    // would if the section were ever gated on something narrower.
    ...(hasReviewSection
      ? []
      : [
          {
            permission: "review.perform" as const,
            icon: ClipboardCheck,
            title: "Reviews",
            body: "Invitations awaiting your response, and reviews you have accepted.",
            href: "/reviews",
          },
        ]),
    {
      permission: "submission.viewAll" as const,
      icon: Inbox,
      title: "Editorial queue",
      body: "Manuscripts awaiting desk assessment, reviewers or a decision.",
      href: "/editorial/queue",
    },
    {
      permission: "production.work" as const,
      icon: Wand2,
      title: "Production",
      body: "Accepted manuscripts in copyediting, layout and proofreading.",
      href: "/production",
    },
    {
      permission: "users.manage" as const,
      icon: Users,
      title: "Users and roles",
      body: "Accounts, role assignments and reviewer records.",
      href: "/admin/users",
    },
    {
      permission: "settings.manage" as const,
      icon: Settings,
      title: "Journal settings",
      body: "Sections, review forms, email templates and policy pages.",
      href: "/admin/settings/journal",
    },
  ].filter((a) => hasPermission(roles, a.permission));

  if (areas.length === 0) return null;

  return (
    <section aria-labelledby="other-areas" className="mt-10 border-t pt-8">
      <h2 id="other-areas" className="font-serif text-lg font-semibold">
        Your other areas
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Shown because of the roles you hold. These screens are still being
        built.
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {areas.map(({ icon: Icon, title, body, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/30"
            >
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-brand-tint text-brand-dark"
              >
                <Icon className="size-4" />
              </span>
              <p className="mt-3 font-serif text-[15px] font-semibold">
                {title}
              </p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                {body}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
