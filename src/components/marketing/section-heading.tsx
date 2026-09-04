import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: { label: string; href: string };
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-8 gap-4",
        centered
          ? "mx-auto max-w-2xl text-center"
          : "flex flex-wrap items-end justify-between",
        className,
      )}
    >
      <div className={cn(!centered && "max-w-2xl")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          className={cn(
            "text-2xl font-semibold md:text-3xl",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h2>
        {lead && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-brand-dark"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
