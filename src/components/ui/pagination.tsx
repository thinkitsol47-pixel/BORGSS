import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination: every control is a real link, so results stay
 * shareable and work without JavaScript.
 *
 * `buildHref` maps a page number to that page's URL, letting the caller keep
 * whatever filters are already in the query string.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);
  const prev = page > 1 ? buildHref(page - 1) : null;
  const next = page < totalPages ? buildHref(page + 1) : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <Step href={prev} label="Previous page">
        <ChevronLeft className="size-4" aria-hidden />
      </Step>

      {pages.map((p, i) =>
        p === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-lg border px-2.5 text-sm font-medium transition-colors",
              p === page
                ? "border-brand bg-brand text-brand-foreground"
                : "border-brand-border text-foreground hover:border-brand hover:bg-brand-tint/60",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Step href={next} label="Next page">
        <ChevronRight className="size-4" aria-hidden />
      </Step>
    </nav>
  );
}

function Step({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const shape =
    "grid size-9 place-items-center rounded-lg border border-brand-border";

  if (!href) {
    return (
      <span
        aria-disabled
        aria-label={label}
        className={cn(shape, "cursor-not-allowed text-muted-foreground/50")}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        shape,
        "text-foreground transition-colors hover:border-brand hover:bg-brand-tint/60",
      )}
    >
      {children}
    </Link>
  );
}

/** First, last, and a window around the current page; "gap" marks an ellipsis. */
function pageWindow(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const out: (number | "gap")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(total - 1, page + 1);

  if (from > 2) out.push("gap");
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total - 1) out.push("gap");

  out.push(total);
  return out;
}
