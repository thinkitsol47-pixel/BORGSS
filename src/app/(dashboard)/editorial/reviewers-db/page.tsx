import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getReviewerSections,
  listReviewers,
  type ReviewerSort,
} from "@/lib/api/editorial";
import { PortalPage } from "@/components/layout/portal-page";
import {
  AvailabilityBadge,
  ReviewerStats,
} from "@/components/portal/reviewer-stats";
import {
  Alert,
  Button,
  EmptyState,
  Input,
  Pagination,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ReviewerAvailability, ReviewerProfile } from "@/types";

export const metadata: Metadata = { title: "Reviewer Database" };

const SORTS: ReviewerSort[] = ["name", "turnaround", "completed", "recent"];

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    section?: string;
    availability?: string;
    sort?: string;
    page?: string;
  };
}) {
  await requireGroup("editorial");

  const q = searchParams?.q?.trim() || undefined;
  const section = searchParams?.section?.trim() || undefined;
  const availability = asAvailability(searchParams?.availability);
  const sort = SORTS.includes(searchParams?.sort as ReviewerSort)
    ? (searchParams?.sort as ReviewerSort)
    : "name";
  const page = Number(searchParams?.page) || 1;

  const { items, total, page: current, totalPages } = await listReviewers({
    q,
    section,
    availability,
    sort,
    page,
  });

  const sections = getReviewerSections();
  const filtered = Boolean(q || section || availability);

  return (
    <PortalPage
      title="Reviewer database"
      lead="Everyone in the reviewer pool, what they cover, and how they have performed."
    >
      <form
        action="/editorial/reviewers-db"
        method="get"
        className="rounded-xl border border-brand-border bg-brand-tint/20 p-3 sm:p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="q"
              className="block text-xs font-medium text-muted-foreground"
            >
              Search
            </label>
            <Input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Name, expertise, institution or country"
              icon={<Search />}
              className="mt-1.5"
            />
          </div>

          <div className="sm:w-52">
            <label
              htmlFor="section"
              className="block text-xs font-medium text-muted-foreground"
            >
              Section
            </label>
            <Select
              id="section"
              name="section"
              defaultValue={section ?? ""}
              className="mt-1.5"
            >
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:w-44">
            <label
              htmlFor="availability"
              className="block text-xs font-medium text-muted-foreground"
            >
              Availability
            </label>
            <Select
              id="availability"
              name="availability"
              defaultValue={availability ?? ""}
              className="mt-1.5"
            >
              <option value="">Anyone</option>
              <option value="available">Available</option>
              <option value="overloaded">Heavily loaded</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </div>

          <div className="sm:w-44">
            <label
              htmlFor="sort"
              className="block text-xs font-medium text-muted-foreground"
            >
              Sort by
            </label>
            <Select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="mt-1.5"
            >
              <option value="name">Name A–Z</option>
              <option value="turnaround">Fastest turnaround</option>
              <option value="completed">Most reviews</option>
              <option value="recent">Most recently active</option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              Apply
            </Button>
            {filtered && (
              <Button
                href="/editorial/reviewers-db"
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="No reviewers match those filters"
            description="Try a different section or availability, or clear the filters to see the whole pool."
            action={{ label: "Clear filters", href: "/editorial/reviewers-db" }}
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {total} {total === 1 ? "reviewer" : "reviewers"}
            {filtered && " matching your filters"}
          </p>

          <ul className="mt-3 space-y-3 lg:hidden">
            {items.map((r) => (
              <li key={r.id}>
                <ReviewerCard reviewer={r} />
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden lg:block">
            <Table caption="Reviewer directory: name, expertise, availability and past turnaround">
              <THead>
                <TR>
                  <TH>Reviewer</TH>
                  <TH>Expertise</TH>
                  <TH>Availability</TH>
                  <TH>Completed</TH>
                  <TH>Turnaround</TH>
                  <TH>Last review</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      <span className="font-medium">{r.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {r.affiliation} · {r.country}
                      </span>
                      {r.orcid && (
                        <Link
                          href={`https://orcid.org/${r.orcid}`}
                          target="_blank"
                          rel="noopener"
                          className="mt-0.5 block text-xs text-primary hover:underline"
                        >
                          {r.orcid}
                        </Link>
                      )}
                    </TD>
                    <TD className="max-w-xs">
                      <span className="text-xs text-muted-foreground">
                        {r.expertise.join(", ")}
                      </span>
                    </TD>
                    <TD>
                      <AvailabilityBadge reviewer={r} />
                    </TD>
                    <TD className="whitespace-nowrap text-xs">
                      <span className="font-medium">{r.completed}</span>
                      {(r.declined > 0 || r.unanswered > 0) && (
                        <span className="mt-0.5 block text-muted-foreground">
                          {r.declined} declined
                          {r.unanswered > 0 && (
                            <span
                              className={
                                r.unanswered >= 3
                                  ? "font-medium text-warning"
                                  : undefined
                              }
                            >
                              {" · "}
                              {r.unanswered} unanswered
                            </span>
                          )}
                        </span>
                      )}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {/* Never a zero: no completed review means no turnaround
                          to report, which is not the same as being fast. */}
                      {r.averageTurnaroundDays === null
                        ? "—"
                        : `${r.averageTurnaroundDays} days`}
                    </TD>
                    <TD className="whitespace-nowrap text-xs text-muted-foreground">
                      {r.lastReviewedAt ? formatDate(r.lastReviewedAt) : "Never"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <Pagination
            page={current}
            totalPages={totalPages}
            buildHref={(p) =>
              buildHref({ q, section, availability, sort, page: p })
            }
            className="mt-8"
          />
        </>
      )}

      <div className="mt-8 max-w-3xl">
        <Alert tone="info" title="What this screen cannot do yet">
          Reviewers cannot be added, edited or invited from here — there is no
          database behind it. The counts and turnaround figures come from
          scaffold data, not from real review history. Invitations are sent by
          the editorial office by email.
        </Alert>
      </div>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Phone and tablet card
 * ------------------------------------------------------------------ */

function ReviewerCard({ reviewer: r }: { reviewer: ReviewerProfile }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <p className="font-medium">{r.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {r.affiliation} · {r.country}
          </p>
        </div>
        <AvailabilityBadge reviewer={r} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {r.expertise.map((e) => (
          <li
            key={e}
            className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {e}
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t pt-3">
        <ReviewerStats reviewer={r} />
      </div>

      {r.note && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {r.note}
        </p>
      )}
    </div>
  );
}

function asAvailability(value?: string): ReviewerAvailability | undefined {
  const all: ReviewerAvailability[] = [
    "available",
    "unavailable",
    "overloaded",
  ];
  return all.includes(value as ReviewerAvailability)
    ? (value as ReviewerAvailability)
    : undefined;
}

function buildHref({
  q,
  section,
  availability,
  sort,
  page,
}: {
  q?: string;
  section?: string;
  availability?: string;
  sort?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (section) params.set("section", section);
  if (availability) params.set("availability", availability);
  if (sort && sort !== "name") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/editorial/reviewers-db?${qs}` : "/editorial/reviewers-db";
}
