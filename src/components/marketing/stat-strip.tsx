import { cn } from "@/lib/utils";

export type Stat = {
  value: string;
  label: string;
  hint?: string;
};

/**
 * Row of headline numbers. Sits directly on white — separated by hairlines,
 * with the figures themselves carrying the brand colour.
 */
export function StatStrip({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <section className={cn("border-b", className)}>
      <div className="container">
        <dl className="grid grid-cols-2 divide-y divide-border sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "group px-2 py-7 text-center lg:px-6",
                // vertical rule between the two mobile columns
                i % 2 === 0 && "border-r lg:border-r-0",
              )}
            >
              <dd className="font-serif text-4xl font-bold text-brand-dark md:text-[2.75rem]">
                {s.value}
              </dd>
              <dt className="mt-2 text-sm font-semibold text-foreground">
                {s.label}
              </dt>
              {s.hint && (
                <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
