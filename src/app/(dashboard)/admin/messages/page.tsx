import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MailCheck } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  listContactMessages,
  type MessageFilter,
} from "@/lib/api/inbox";
import { PortalPage } from "@/components/layout/portal-page";
import { MessageHandledToggle } from "@/components/portal/message-handled-toggle";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

const FILTERS: { value: MessageFilter; label: string }[] = [
  { value: "unhandled", label: "Unhandled" },
  { value: "handled", label: "Handled" },
  { value: "all", label: "All" },
];

/**
 * The editorial office's view of the public contact form.
 *
 * The form (`/contact`) now writes a `ContactMessage` row; this is where those
 * rows are read and worked. There is no email yet — nothing was sent to the
 * sender or to the office — so each message shows the sender's address for a
 * reply by hand, and "Mark handled" is how the queue is cleared.
 */
export default async function Page({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  await requireGroup("adminOnly");

  const filter = (FILTERS.find((f) => f.value === searchParams?.filter)?.value ??
    "unhandled") as MessageFilter;

  const { items, stats } = await listContactMessages(filter);

  return (
    <PortalPage
      title="Contact messages"
      lead="Enquiries sent through the public contact form. Reply from your own mailbox — mail to a sender is refused until the journal owns a domain."
    >
      {/* No standing notice. The lead above already says replies go from your
          own mailbox and why, and repeating it in a box over an empty queue is
          how a reader learns to skip these. */}
      <dl className="grid grid-cols-1 gap-3 xs:grid-cols-3">
        <Stat label="Unhandled" value={stats.unhandled} tone="warning" />
        <Stat label="Handled" value={stats.handled} />
        <Stat label="Total" value={stats.total} />
      </dl>

      <nav aria-label="Filter messages" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <li key={f.value}>
              <FilterLink
                href={
                  f.value === "unhandled"
                    ? "/admin/messages"
                    : `/admin/messages?filter=${f.value}`
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
            icon={filter === "handled" ? MailCheck : Mail}
            title={
              filter === "unhandled"
                ? "Nothing waiting"
                : filter === "handled"
                  ? "Nothing handled yet"
                  : "No messages"
            }
            description={
              filter === "unhandled"
                ? "Every enquiry has been dealt with."
                : "No message matches this filter."
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((m) => (
            <li key={m.id}>
              <MessageRow message={m} />
            </li>
          ))}
        </ul>
      )}
    </PortalPage>
  );
}

function MessageRow({
  message: m,
}: {
  message: Awaited<ReturnType<typeof listContactMessages>>["items"][number];
}) {
  const handled = Boolean(m.handledAt);
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        handled && "border-dashed bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {m.name}
            {m.affiliation && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {m.affiliation}
              </span>
            )}
          </p>
          <a
            href={`mailto:${m.email}`}
            className="text-xs text-primary hover:underline"
          >
            {m.email}
          </a>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="outline" size="sm">
            {m.topicLabel}
          </Badge>
          {handled ? (
            <Badge variant="success" size="sm">
              Handled
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Unhandled
            </Badge>
          )}
        </div>
      </div>

      {m.manuscriptId && (
        <p className="mt-2 text-xs text-muted-foreground">
          Manuscript reference given:{" "}
          <span className="font-medium text-foreground">{m.manuscriptId}</span>
        </p>
      )}

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
        {m.message}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
        <span>
          {handled ? "Handled" : "Received"}{" "}
          <span className="font-medium text-foreground">
            {formatDate(handled ? m.handledAt! : m.createdAt)}
          </span>
        </span>
        <MessageHandledToggle id={m.id} handled={handled} />
      </div>
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
