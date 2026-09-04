import { cn } from "@/lib/utils";

export function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}

/** Short brand rule used under section headings. */
export function BrandRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block h-0.5 w-10 rounded-full bg-brand", className)}
    />
  );
}
