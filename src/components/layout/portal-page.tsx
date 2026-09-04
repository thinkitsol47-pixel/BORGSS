import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Page wrapper for every screen inside the portal.
 *
 * `PageShell` is the marketing/policy wrapper: it centres a narrow measure
 * inside `container` and adds its own vertical rhythm. The portal already
 * sits inside a sidebar column, so it needs the opposite — full width of the
 * column, tighter padding, and room for actions beside the title.
 */
export function PortalPage({
  title,
  lead,
  actions,
  breadcrumb,
  children,
  className,
}: {
  title: string;
  lead?: string;
  /** Buttons or links aligned with the title; they wrap below it on phones. */
  actions?: React.ReactNode;
  /** Trail back up the portal, nearest parent last. */
  breadcrumb?: { title: string; href: string }[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-6 md:px-8 md:py-10", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {breadcrumb.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <Link href={crumb.href} className="link-underline">
                  {crumb.title}
                </Link>
                <span aria-hidden>/</span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b pb-5">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {lead}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>

      {children}
    </div>
  );
}
