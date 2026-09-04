import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<
  Tone,
  { icon: LucideIcon; wrap: string; icon_: string; title: string }
> = {
  info: {
    icon: Info,
    wrap: "border-brand-border bg-brand-tint/50",
    icon_: "text-brand",
    title: "text-brand-darker",
  },
  success: {
    icon: CheckCircle2,
    wrap: "border-success/30 bg-success/5",
    icon_: "text-success",
    title: "text-success",
  },
  warning: {
    icon: AlertTriangle,
    wrap: "border-warning/30 bg-warning/5",
    icon_: "text-warning",
    title: "text-warning",
  },
  danger: {
    icon: XCircle,
    wrap: "border-danger/30 bg-danger/5",
    icon_: "text-danger",
    title: "text-danger",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  const Icon = t.icon;

  return (
    <div
      // Assertive tones are announced immediately; info can wait its turn.
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4", t.wrap, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", t.icon_)} aria-hidden />
      <div className="min-w-0 text-sm">
        {title && (
          <p className={cn("font-semibold", t.title)}>{title}</p>
        )}
        {children && (
          <div className={cn("leading-relaxed text-foreground/80", title && "mt-1")}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
