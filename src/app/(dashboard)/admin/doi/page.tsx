import type { Metadata } from "next";
import Link from "next/link";
import { Fingerprint } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { hasCrossrefPrefix, listDoiRecords } from "@/lib/api/editorial";
import { PortalPage } from "@/components/layout/portal-page";
import {
  Alert,
  EmptyState,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import {
  DepositAllButton,
  DepositRowAction,
} from "@/components/portal/doi-actions";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DepositState } from "@/types";

export const metadata: Metadata = { title: "DOI / Crossref" };

/**
 * The Crossref deposit register.
 *
 * Written against the actual state of the journal, not against what a DOI
 * screen usually shows. BORJSS has no Crossref prefix: every DOI in the data
 * begins `10.xxxxx`, which is a placeholder no registry would issue. So this
 * page leads with that, and the register below it is a list of DOIs that do
 * not yet exist rather than a deposit log pretending they do.
 *
 * The alternative — a table of green "Registered" rows — would be the indexing
 * page's mistake again, and worse: an editor would quote a DOI to an author,
 * and it would not resolve.
 */

const STATES: {
  id: DepositState;
  label: string;
  className: string;
  meaning: string;
}[] = [
  {
    id: "registered",
    label: "Registered",
    className: "border-success/30 bg-success/10 text-success",
    meaning: "Crossref accepted the deposit and the DOI resolves.",
  },
  {
    id: "pending",
    label: "Pending",
    className: "border-brand-border bg-brand-tint text-brand-darker",
    meaning: "Submitted to Crossref; no result back yet.",
  },
  {
    id: "failed",
    label: "Failed",
    className: "border-danger/30 bg-danger/10 text-danger",
    meaning: "Crossref rejected the deposit. The reason is shown on the row.",
  },
  {
    id: "not-deposited",
    label: "Not deposited",
    className: "border-border bg-muted text-muted-foreground",
    meaning: "Never sent. This is where every article stands today.",
  },
];

const STATE_BY_ID = Object.fromEntries(STATES.map((s) => [s.id, s])) as Record<
  DepositState,
  (typeof STATES)[number]
>;

export default async function Page({
  searchParams,
}: {
  searchParams?: { state?: string };
}) {
  // Depositing DOIs is journal-management work, not a super-admin-only power
  // like the audit log — `staff` is the right gate.
  await requireGroup("staff");

  const state = STATES.some((s) => s.id === searchParams?.state)
    ? (searchParams?.state as DepositState)
    : undefined;

  const { items, counts } = await listDoiRecords(state);
  const prefix = hasCrossrefPrefix();

  return (
    <PortalPage
      title="DOI / Crossref"
      lead="Every published article and whether its DOI has been registered with Crossref."
      actions={<DepositAllButton hasPrefix={prefix} />}
    >
      {/* The truth about the prefix comes before the register, because it is
          what every row below actually depends on. */}
      {!prefix && (
        <Alert tone="warning" title="The journal has no Crossref prefix yet">
          <p>
            Every identifier below begins{" "}
            <span className="font-mono text-[0.9em]">10.xxxxx</span>, which is a
            placeholder — no registry issues that prefix. Until BORJSS is a
            Crossref member and has been assigned a real one, these DOIs cannot
            be deposited and none of them resolves.
          </p>
          <p className="mt-2">
            The article pages display these identifiers, and the{" "}
            <Link href="/indexing" className="font-medium underline">
              indexing page
            </Link>{" "}
            describes DOI registration as planned rather than active. Keep both
            that way until a prefix is assigned.
          </p>
        </Alert>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DoiStat label="Articles" value={counts.total} href="/admin/doi" />
        <DoiStat
          label="Registered"
          value={counts.registered}
          href="/admin/doi?state=registered"
        />
        <DoiStat
          label="Failed"
          value={counts.failed}
          href="/admin/doi?state=failed"
          tone={counts.failed > 0 ? "warning" : "plain"}
        />
        <DoiStat
          label="Not deposited"
          value={counts.notDeposited}
          href="/admin/doi?state=not-deposited"
        />
      </dl>

      {/* A GET-form-free filter: four links, matching the queue's shareable
          URLs and working with JavaScript off. */}
      <nav aria-label="Filter by deposit state" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <FilterLink href="/admin/doi" active={!state}>
              All
            </FilterLink>
          </li>
          {STATES.map((s) => (
            <li key={s.id}>
              <FilterLink
                href={`/admin/doi?state=${s.id}`}
                active={state === s.id}
              >
                {s.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </nav>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Fingerprint}
            title="No articles in that state"
            description="Try another state, or clear the filter to see the whole register."
            action={{ label: "Show all", href: "/admin/doi" }}
          />
        </div>
      ) : (
        <>
          {/* Cards below md, table from md up — a five-column register is
              unreadable on a phone however it scrolls. */}
          <ul className="mt-6 space-y-3 md:hidden">
            {items.map((r) => {
              const s = STATE_BY_ID[r.state];
              return (
                <li key={r.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <Link
                      href={`/articles/${r.articleSlug}`}
                      className="min-w-0 text-sm font-medium hover:text-primary hover:underline"
                    >
                      {r.articleTitle}
                    </Link>
                    <StateChip state={r.state} />
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                    {r.doi}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.issueLabel}
                  </p>
                  {r.failureReason && (
                    <p className="mt-2 text-xs text-danger">{r.failureReason}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {r.registeredAt
                      ? `Registered ${formatDate(r.registeredAt)}`
                      : r.lastAttemptAt
                        ? `Last attempt ${formatDate(r.lastAttemptAt)}`
                        : "Never attempted"}
                  </p>
                  <div className="mt-2">
                    <DepositRowAction
                      state={r.state}
                      doi={r.doi}
                      hasPrefix={prefix}
                    />
                  </div>
                  <span className="sr-only">{s.meaning}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 hidden md:block">
            <Table caption="DOI register: article, DOI, issue, deposit state, last attempt and the action available">
              <THead>
                <TR>
                  <TH>Article</TH>
                  <TH>DOI</TH>
                  <TH>Issue</TH>
                  <TH>State</TH>
                  <TH>Last attempt</TH>
                  <TH>Action</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      <Link
                        href={`/articles/${r.articleSlug}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {r.articleTitle}
                      </Link>
                      {r.failureReason && (
                        <p className="mt-1 text-xs text-danger">
                          {r.failureReason}
                        </p>
                      )}
                    </TD>
                    <TD className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {r.doi}
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">
                      {r.issueLabel}
                    </TD>
                    <TD>
                      <StateChip state={r.state} />
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">
                      {/* Never "0 attempts, today". An absence of history is
                          not an event. */}
                      {r.registeredAt
                        ? formatDate(r.registeredAt)
                        : r.lastAttemptAt
                          ? formatDate(r.lastAttemptAt)
                          : "—"}
                    </TD>
                    <TD>
                      <DepositRowAction
                        state={r.state}
                        doi={r.doi}
                        hasPrefix={prefix}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </>
      )}

      {/* What each state means, written out. The chips are colour plus text,
          but the meanings are not obvious from the labels alone. */}
      <section aria-labelledby="states-heading" className="mt-10">
        <h2 id="states-heading" className="font-serif text-lg font-semibold">
          What the states mean
        </h2>
        <dl className="mt-3 divide-y rounded-xl border">
          {STATES.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-3"
            >
              <dt className="shrink-0">
                <StateChip state={s.id} />
              </dt>
              <dd className="min-w-0 flex-1 text-sm text-muted-foreground">
                {s.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8">
        <Alert tone="warning" title="Depositing is not built yet">
          The deposit and retry controls are built but disabled, and nothing
          here talks to Crossref. There could not be a deposit — the journal has
          no member account and no prefix. When both exist, this screen becomes
          the place deposits are made from and failures retried.
        </Alert>
      </div>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function StateChip({ state }: { state: DepositState }) {
  const s = STATE_BY_ID[state];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        s.className,
      )}
    >
      {s.label}
    </span>
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

function DoiStat({
  label,
  value,
  href,
  tone = "plain",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "plain" | "warning";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 transition-colors hover:border-brand-border hover:bg-brand-tint/40"
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-serif text-2xl font-semibold tabular-nums",
          tone === "warning" && value > 0 && "text-warning",
        )}
      >
        {value}
      </dd>
    </Link>
  );
}
