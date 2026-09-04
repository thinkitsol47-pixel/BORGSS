import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shown when a list, table or search has no rows. Always says what happened
 * and, where there is one, offers the next action — never just "No results".
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-brand-border px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-tint text-brand-dark">
          <Icon className="size-6" aria-hidden />
        </span>
      )}

      <p className={cn("font-serif text-lg font-semibold", Icon && "mt-4")}>
        {title}
      </p>

      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {action && (
            <Button href={action.href} size="sm">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button href={secondaryAction.href} size="sm" variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
