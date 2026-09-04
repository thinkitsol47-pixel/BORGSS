import { cn } from "@/lib/utils";

/**
 * Standard page wrapper: title block + optional lead + content area.
 * Used by every marketing / policy / dashboard page so spacing stays consistent.
 */
export function PageShell({
  title,
  lead,
  children,
  className,
  width = "default",
}: {
  title?: string;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
  width?: "prose" | "default" | "wide";
}) {
  const max =
    width === "prose"
      ? "max-w-prose"
      : width === "wide"
        ? "max-w-6xl"
        : "max-w-4xl";
  return (
    <div className={cn("container py-10 md:py-14", max, className)}>
      {title && (
        <header className="mb-8 border-b pb-6">
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-3 text-lg text-muted-foreground">{lead}</p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}

/** Placeholder body for pages that are scaffolded but not built yet. */
export function Placeholder({ note }: { note?: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
      {note ?? "This page is scaffolded. Content and data wiring come next."}
    </div>
  );
}
