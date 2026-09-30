import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { requireRoles } from "@/lib/auth/require-role";
import {
  auditActions,
  listAuditEntries,
  seededAuditCount,
} from "@/lib/api/admin";
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
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit Log" };

/**
 * The audit trail.
 *
 * **This screen is live.** `recordAudit()` is called from 36 places —
 * decisions, reviewer assignment and withdrawal, role and status changes, the
 * reviewer pool, every production stage transition, galleys, proof
 * corrections, issue planning, announcements, the two public-form queues and
 * journal settings — and each writes one append-only row.
 *
 * It was written before any of that existed, around the opposite problem: the
 * rows were fabricated, and an audit log is the one screen where that matters
 * most, because it is consulted precisely when someone is not trusted. The
 * notice at the top has been narrowed to what is still true rather than
 * removed, because two things remain: the eight seeded rows describe events
 * that never happened, and **reads are not recorded** — a write-only log
 * misses someone opening a manuscript they have no reason to see, which is
 * exactly what the specification below says this log is for.
 */
export default async function Page({
  searchParams,
}: {
  searchParams?: { action?: string };
}) {
  // `audit.view` is one of the four permissions withheld from `admin`.
  await requireRoles(["superAdmin"]);

  const actions = await auditActions();
  const action = actions.includes(searchParams?.action ?? "")
    ? searchParams?.action
    : undefined;

  const [entries, seeded] = await Promise.all([
    listAuditEntries(action),
    seededAuditCount(),
  ]);

  return (
    <PortalPage
      title="Audit log"
      lead="The record of who changed what, and when. Visible to super administrators only."
    >
      {/* This notice used to say the whole screen was illustrative and that
          editorial decisions, role grants and production work "do not write
          entries yet". All three do, from 36 call sites.

          The seeded count is derived, not written here, so the sentence
          corrects itself: it drops as real entries accumulate and the first
          paragraph stands alone once a reseed stops replacing them. A
          hard-coded "eight" would have become wrong the day someone reseeded
          with a different fixture. */}
      <Alert
        tone={seeded > 0 ? "warning" : "info"}
        title={
          seeded > 0
            ? `${seeded} ${seeded === 1 ? "row" : "rows"} here ${seeded === 1 ? "was" : "were"} seeded, not recorded`
            : "Every row here was recorded by the application"
        }
      >
        <p>
          <strong>The log is live.</strong> Editorial decisions, reviewer
          assignments, role and status changes, the reviewer pool, production
          stages, galleys, proof corrections, issue planning, announcements,
          contact messages, reviewer applications and journal settings all write
          an entry as they happen.
        </p>
        {seeded > 0 && (
          <p className="mt-2">
            What is not real are the {seeded} rows the seed wrote to show the
            shape the log takes — actor, action, target, detail and timestamp.
            Those events did not happen, and they are dated before this database
            existed. They disappear the first time the seed is not re-run.
          </p>
        )}
        <p className="mt-2">
          <strong>Reads are still not recorded</strong>, only writes — see the
          specification below. Someone opening a manuscript they have no reason
          to see is exactly what an audit log exists to surface, and this one
          would not show it.
        </p>
      </Alert>

      {/* -------------------------------------------------------- filter */}
      <nav aria-label="Filter by action" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <FilterLink href="/admin/audit-log" active={!action}>
              All actions
            </FilterLink>
          </li>
          {actions.map((a) => (
            <li key={a}>
              <FilterLink
                href={`/admin/audit-log?action=${a}`}
                active={action === a}
              >
                <code className="font-mono text-[0.9em]">{a}</code>
              </FilterLink>
            </li>
          ))}
        </ul>
      </nav>

      {entries.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ScrollText}
            title="No entries for that action"
            description="Nothing has been recorded under this action."
            action={{ label: "Show all", href: "/admin/audit-log" }}
          />
        </div>
      ) : (
        <>
          {/* Cards below md, table from md up. */}
          <ul className="mt-6 space-y-3 md:hidden">
            {entries.map((e) => (
              <li key={e.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <code className="font-mono text-xs font-medium text-brand-darker">
                    {e.action}
                  </code>
                  <time
                    dateTime={e.at}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatStamp(e.at)}
                  </time>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{e.actorName}</span>
                  {" → "}
                  <span className="text-muted-foreground">{e.target}</span>
                </p>
                {e.detail && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden md:block">
            <Table caption="Audit entries: when, who, action, target and detail">
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Who</TH>
                  <TH>Action</TH>
                  <TH>Target</TH>
                  <TH>Detail</TH>
                </TR>
              </THead>
              <TBody>
                {entries.map((e) => (
                  <TR key={e.id}>
                    <TD className="whitespace-nowrap text-muted-foreground">
                      <time dateTime={e.at}>{formatStamp(e.at)}</time>
                    </TD>
                    <TD className="whitespace-nowrap font-medium">
                      {e.actorName}
                    </TD>
                    <TD className="whitespace-nowrap">
                      <code className="font-mono text-xs text-brand-darker">
                        {e.action}
                      </code>
                    </TD>
                    <TD>{e.target}</TD>
                    <TD className="text-muted-foreground">{e.detail ?? "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </>
      )}

      {/* ------------------------------------------- what the real one needs */}
      <section aria-labelledby="spec-heading" className="mt-10">
        <h2 id="spec-heading" className="font-serif text-lg font-semibold">
          What this log has to keep
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Written down because these are the properties that are hard to add
          afterwards. Four of the five hold today; recording reads does not.
        </p>
        <dl className="mt-4 divide-y rounded-xl border">
          {REQUIREMENTS.map((r) => (
            <div key={r.title} className="p-4">
              <dt className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {r.title}
                {"outstanding" in r && (
                  <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    Not yet
                  </span>
                )}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {r.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-8 text-sm text-muted-foreground">
        Accounts and roles are managed on the{" "}
        <Link href="/admin/users" className="font-medium text-primary hover:underline">
          users screen
        </Link>
        ; every change there writes an entry here.
      </p>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const REQUIREMENTS = [
  {
    title: "Append-only",
    detail:
      "No edit, no delete, not even for a super administrator. A log that can be changed by the people it records is not evidence of anything.",
  },
  {
    title: "The actor is stored as an id and a name",
    detail:
      "The name is what was true at the time. An account that is later renamed or suspended must not silently rewrite its own history.",
  },
  {
    title: "It records the four withheld permissions above all",
    detail:
      "Granting an administrator role, overriding the workflow, changing integration credentials and reading this log are the actions most worth recording — and the reason `audit.view` is withheld from Administrator.",
  },
  {
    title: "Reads are recorded, not only writes",
    detail:
      "Someone opening a manuscript they have no editorial reason to see is the kind of thing an audit log exists to surface. A write-only log misses it entirely.",
    // The one item on this list that is not met. Marked rather than left
    // looking identical to the four that are — a specification whose unmet
    // requirement reads the same as its met ones tells the reader nothing.
    outstanding: true,
  },
  {
    title: "Retention is stated in the privacy policy",
    detail:
      "The log holds personal data. How long it is kept has to be decided and published, not left to whatever the database does by default.",
  },
];

/** Date and time together — an audit entry without a time is not usable. */
function formatStamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
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
