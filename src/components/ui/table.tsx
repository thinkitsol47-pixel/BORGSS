import { cn } from "@/lib/utils";

/**
 * Data table. Wrapped in a horizontal scroller so wide tables never force
 * the page itself to scroll sideways.
 *
 * `caption` is required rather than optional. A screen reader announces a
 * table by its caption; without one the user is told only "table, 6 columns,
 * 14 rows" and has to read the headers to work out what they have landed in —
 * which is exactly the situation a table is meant to save them from. Making it
 * a required prop means a new table cannot ship without one.
 *
 * It is rendered visually hidden by default: every one of these tables already
 * sits under a heading that names it on screen, so a visible caption would
 * repeat it. Pass `showCaption` when the table stands alone.
 */
export function Table({
  className,
  caption,
  showCaption = false,
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement> & {
  caption: string;
  showCaption?: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-brand">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      >
        <caption
          className={cn(
            showCaption
              ? "px-3 py-2 text-left text-xs text-muted-foreground"
              : "sr-only",
          )}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function THead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b border-brand-border bg-brand-tint/40", className)}
      {...props}
    />
  );
}

export function TBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-border", className)} {...props} />
  );
}

export function TR({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        interactive && "transition-colors hover:bg-brand-tint/30",
        className,
      )}
      {...props}
    />
  );
}

export function TH({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-top", className)} {...props} />;
}
