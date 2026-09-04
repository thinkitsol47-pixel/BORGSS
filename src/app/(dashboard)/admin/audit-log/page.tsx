import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { requireRoles } from "@/lib/auth/require-role";
import { auditActions, listAuditEntries } from "@/lib/api/admin";
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
 * The whole screen is written around one problem: **nothing in this
 * application records anything**, so every entry below is fabricated. An audit
 * log is the one screen where that matters most — it is consulted precisely
 * when someone is not trusted, and a log that looks real but is invented is
 * worse than no log at all.
 *
 * So the illustrative notice is the first thing on the page, in the warning
 * tone, above the table rather than beneath it. The rows are kept because the
 * shape — actor, action, target, detail, timestamp — is what the backend has
 * to produce, and it is easier to build against something visible.
 */
export default async function Page({
  searchParams,
}: {
  searchParams?: { action?: string };
}) {
  // `audit.view` is one of the four permissions withheld from `admin`.
  await requireRoles(["superAdmin"]);

  const actions = auditActions();
  const action = actions.includes(searchParams?.action ?? "")
    ? searchParams?.action
    : undefined;

  const entries = await listAuditEntries(action);

  return (
    <PortalPage
      title="Audit log"
      lead="The record of who changed what, and when. Visible to super administrators only."
    >
      <Alert tone="warning" title="These entries are illustrative, not real">
        <p>
          Nothing on this platform writes an audit entry. There is no database,
          and no action anywhere in the portal is recorded. Every row below was
          written by hand to show the shape the real log must take — actor,
          action, target and timestamp — and none of it happened.
        </p>
        <p className="mt-2">
          Treat this screen as a specification until the backend lands. An audit
          log is consulted when someone is not trusted; one that looked
          authoritative while being invented would be worse than none.
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
          What the real log has to do
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Recorded here because it is the specification, and because these are
          the properties that are hard to add afterwards.
        </p>
        <dl className="mt-4 divide-y rounded-xl border">
          {REQUIREMENTS.map((r) => (
            <div key={r.title} className="p-4">
              <dt className="text-sm font-medium">{r.title}</dt>
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
        ; every change there will write an entry here.
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
