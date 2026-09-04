import { cn } from "@/lib/utils";

/**
 * The screen shown after a form succeeds, and for the verify-email states.
 *
 * Four pages were each hand-rolling this — an icon disc, a serif heading, a
 * paragraph and some actions — with the disc colour and spacing drifting
 * between them. One component keeps them identical.
 *
 * Deliberately a Server Component, and in its own file rather than in
 * `auth-parts.tsx`: that file is `"use client"`, and `verify-email/page.tsx`
 * is a Server Component that passes an icon — a function — as a prop. Those
 * cannot cross the server/client boundary, so putting this beside the client
 * parts throws at runtime while still typechecking clean.
 */
export function AuthResult({
  icon: Icon,
  tone = "brand",
  title,
  children,
  actions,
}: {
  icon: React.ElementType;
  /** brand = informational, success = the thing worked, warning = dead end. */
  tone?: "brand" | "success" | "warning";
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const discs = {
    brand: "bg-brand-tint text-brand-dark",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  } as const;

  return (
    <div className="text-center">
      <span
        aria-hidden
        className={cn(
          "mx-auto grid size-12 place-items-center rounded-full",
          discs[tone],
        )}
      >
        <Icon className="size-6" />
      </span>
      <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight">
        {title}
      </h1>
      {children && (
        <div className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
      {actions && <div className="mt-6 space-y-3">{actions}</div>}
    </div>
  );
}
