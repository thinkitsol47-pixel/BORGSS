import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Breadcrumb, type Crumb, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Shell for long-form documentation pages — About, policies, guidelines.
 *
 * Breadcrumb + title, an optional in-page table of contents in a sticky rail,
 * and a `.prose` body at reading width. Every such page shares this so they
 * read as one document set rather than a dozen one-off layouts.
 */

export type TocEntry = { id: string; label: string };

export function DocPage({
  eyebrow,
  title,
  lead,
  breadcrumb,
  toc,
  updated,
  aside,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumb: Crumb[];
  /** Renders a sticky in-page nav; ids must match headings in the body. */
  toc?: TocEntry[];
  /** ISO date shown as "Last updated" — expected on every policy page. */
  updated?: string;
  /** Extra panels below the table of contents. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const hasRail = Boolean(toc?.length || aside);

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={breadcrumb} />

      <header className="mt-4 border-b pb-8">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1
          className={cn(
            "text-3xl font-bold md:text-4xl",
            eyebrow ? "mt-2" : "mt-0",
          )}
        >
          {title}
        </h1>
        {lead && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
        {updated && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 text-brand" aria-hidden />
            Last updated{" "}
            <time dateTime={updated}>
              {new Date(updated).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </p>
        )}
      </header>

      <div
        className={cn(
          "pt-8",
          hasRail && "grid gap-10 lg:grid-cols-[1fr_18rem]",
        )}
      >
        <div className="prose min-w-0">{children}</div>

        {hasRail && (
          <aside
            /* top matches --header-offset so the rail clears the sticky
               header rather than sliding under it */
            style={{ top: "var(--header-offset)" }}
            className="order-first space-y-6 lg:order-none lg:sticky lg:self-start"
          >
            {toc && toc.length > 0 && (
              <nav aria-labelledby="onthispage">
                <p
                  id="onthispage"
                  className="text-xs font-semibold uppercase tracking-wide text-brand-darker"
                >
                  On this page
                </p>
                <ul className="mt-3 space-y-1 border-l-2 border-brand-border">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`#${t.id}`}
                        className="-ml-0.5 block border-l-2 border-transparent py-1 pl-3 text-sm text-muted-foreground transition-colors hover:border-brand hover:text-primary"
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}

/** Small sky panel for the rail — related links, contact, downloads. */
export function DocAside({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-tint/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-darker">
        {title}
      </p>
      <div className="mt-2.5 space-y-2 text-sm">{children}</div>
    </div>
  );
}
