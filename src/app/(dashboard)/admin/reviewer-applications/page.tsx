import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus, UserCheck, UserX } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  listReviewerApplications,
  type ApplicationFilter,
} from "@/lib/api/inbox";
import { PortalPage } from "@/components/layout/portal-page";
import { ApplicationDecision } from "@/components/portal/application-decision";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviewer applications" };

const FILTERS: { value: ApplicationFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "All" },
];

/**
 * The editorial view of the public "become a reviewer" form.
 *
 * The form now writes a `ReviewerApplication` (status `pending`); this screen
 * is where an editor reads and decides. **Accept only records the decision** —
 * turning the application into a `ReviewerProfile` and a login account needs
 * the accounts system, which does not exist yet, so the screen says so.
 */
export default async function Page({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  await requireGroup("adminOnly");

  const filter = (FILTERS.find((f) => f.value === searchParams?.filter)?.value ??
    "pending") as ApplicationFilter;

  const { items, stats } = await listReviewerApplications(filter);

  return (
    <PortalPage
      title="Reviewer applications"
      lead="People who applied through the public form. A decision sets the application's status — it does not create an account, because the invitation would have to be emailed and the journal owns no domain. Contact the applicant from your own mailbox, then add them to the reviewer pool once they have an account."
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Pending" value={stats.pending} tone="warning" />
        <Stat label="Accepted" value={stats.accepted} />
        <Stat label="Declined" value={stats.declined} />
        <Stat label="Total" value={stats.total} />
      </dl>

      <nav aria-label="Filter applications" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <li key={f.value}>
              <FilterLink
                href={
                  f.value === "pending"
                    ? "/admin/reviewer-applications"
                    : `/admin/reviewer-applications?filter=${f.value}`
                }
                active={filter === f.value}
              >
                {f.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </nav>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={
              filter === "accepted"
                ? UserCheck
                : filter === "declined"
                  ? UserX
                  : UserPlus
            }
            title={
              filter === "pending" ? "Nothing to review" : "Nothing here"
            }
            description={
              filter === "pending"
                ? "Every application has been decided."
                : "No application matches this filter."
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((a) => (
            <li key={a.id}>
              <ApplicationRow application={a} />
            </li>
          ))}
        </ul>
      )}
    </PortalPage>
  );
}

function ApplicationRow({
  application: a,
}: {
  application: Awaited<
    ReturnType<typeof listReviewerApplications>
  >["items"][number];
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        a.status !== "pending" && "border-dashed bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{a.name}</p>
          <p className="text-xs text-muted-foreground">
            {a.position}, {a.institution} · {a.country}
          </p>
          <a
            href={`mailto:${a.email}`}
            className="text-xs text-primary hover:underline"
          >
            {a.email}
          </a>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {a.degreeLabel}
          </Badge>
          {a.status === "accepted" ? (
            <Badge variant="success" size="sm">
              Accepted
            </Badge>
          ) : a.status === "declined" ? (
            <Badge variant="danger" size="sm">
              Declined
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Pending
            </Badge>
          )}
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
        <Row term="Subjects">{a.subjects.join(", ")}</Row>
        {a.methods.length > 0 && (
          <Row term="Methods">{a.methods.join(", ")}</Row>
        )}
        <Row term="Topics">{a.keywords}</Row>
        <Row term="Capacity">{a.capacityLabel}</Row>
        {a.orcid && (
          <Row term="ORCID">
            <a
              href={`https://orcid.org/${a.orcid}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {a.orcid}
            </a>
          </Row>
        )}
        {a.scholarUrl && (
          <Row term="Profile">
            <a
              href={a.scholarUrl}
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {a.scholarUrl}
            </a>
          </Row>
        )}
        {a.experience && <Row term="Experience">{a.experience}</Row>}
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
        <span>
          Applied{" "}
          <span className="font-medium text-foreground">
            {formatDate(a.createdAt)}
          </span>
        </span>
        <ApplicationDecision id={a.id} status={a.status} />
      </div>
    </div>
  );
}

function Row({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="w-20 shrink-0 text-muted-foreground">{term}</dt>
      <dd className="min-w-0 flex-1 break-words">{children}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: number;
  tone?: "plain" | "warning";
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "warning" && value > 0 && "text-warning",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand-tint text-brand-darker"
          : "border-border text-muted-foreground hover:border-brand-border hover:text-brand-darker",
      )}
    >
      {children}
    </Link>
  );
}
