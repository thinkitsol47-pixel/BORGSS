import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form primitives. Every control shares one shape so a submission form, a
 * search filter and an admin table filter all look like the same system:
 * white ground, soft sky border at rest, full brand border on focus.
 */

const controlBase =
  "w-full rounded-lg border border-brand-border bg-background text-sm text-foreground shadow-sm transition-colors " +
  "placeholder:text-muted-foreground/70 " +
  "hover:border-brand/60 " +
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/30 " +
  "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none " +
  "read-only:bg-muted/50 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:border-danger aria-[invalid=true]:focus:ring-danger/25";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    /** Icon rendered inside the field, e.g. a magnifier on a search box. */
    icon?: React.ReactNode;
    /** Static text before the value, e.g. "https://doi.org/". */
    prefix?: string;
  }
>(function Input({ className, icon, prefix, ...props }, ref) {
  const field = (
    <input
      ref={ref}
      className={cn(
        controlBase,
        "h-10 px-3",
        icon && "pl-9",
        prefix && "rounded-l-none border-l-0",
        className,
      )}
      {...props}
    />
  );

  if (!icon && !prefix) return field;

  return (
    <div className={cn("relative flex", prefix && "items-stretch")}>
      {prefix && (
        <span className="inline-flex shrink-0 items-center rounded-l-lg border border-r-0 border-brand-border bg-brand-tint/50 px-3 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      {icon && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4"
        >
          {icon}
        </span>
      )}
      {field}
    </div>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(controlBase, "resize-y px-3 py-2 leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="group relative">
      <select
        ref={ref}
        className={cn(
          controlBase,
          "h-10 cursor-pointer appearance-none pl-3 pr-10",
          // An unchosen select shows its placeholder in muted grey; once a real
          // option is picked (:valid) the text goes full-strength.
          "invalid:text-muted-foreground",
          // The dropdown list itself is painted by the OS — set an explicit
          // colour so options never inherit the muted placeholder tone.
          "[&>option]:bg-background [&>option]:text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      {/* chevron sits in a soft brand chip so the control reads as openable */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md bg-brand-tint text-brand-dark transition-colors group-focus-within:bg-brand group-focus-within:text-brand-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
});

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn("block text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

/**
 * Label + control + help/error text, wired together. Pass `error` and the
 * control is marked invalid for assistive tech automatically.
 */
export function Field({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  counter,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  /** Marks the field "Optional" — useful on forms where most fields are not. */
  optional?: boolean;
  hint?: string;
  error?: string;
  /** e.g. "180 / 300 words" — sits opposite the label. */
  counter?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} required={required}>
          {label}
          {optional && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              Optional
            </span>
          )}
        </Label>
        {counter && (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {counter}
          </span>
        )}
      </div>

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement, {
            id: htmlFor,
            required: required || undefined,
            "aria-invalid": error ? true : undefined,
            "aria-describedby":
              [errorId, hintId].filter(Boolean).join(" ") || undefined,
          })
        : children}

      {hint && !error && (
        <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs font-medium text-danger"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Groups related fields under a heading — a submission form's "Authors" or
 * "Declarations" block, for example.
 */
export function Fieldset({
  legend,
  description,
  className,
  children,
}: {
  legend: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="font-serif text-lg font-semibold">{legend}</legend>
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  );
}

const tickBase =
  "size-[1.05rem] shrink-0 cursor-pointer border-2 border-brand-border accent-brand transition-colors " +
  "hover:border-brand " +
  "checked:border-brand " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:border-border disabled:opacity-60";

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(tickBase, "rounded", className)}
      {...props}
    />
  );
}

export function Radio({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="radio"
      className={cn(tickBase, "rounded-full", className)}
      {...props}
    />
  );
}

/**
 * Checkbox or radio with its label, as one clickable row. Use for consent
 * boxes and option lists — the whole row is the hit target, not just the tick.
 */
export function CheckOption({
  id,
  label,
  description,
  type = "checkbox",
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  description?: string;
  type?: "checkbox" | "radio";
}) {
  const Control = type === "radio" ? Radio : Checkbox;
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer gap-3 rounded-lg border border-brand-border p-3 transition-colors hover:border-brand hover:bg-brand-tint/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        className,
      )}
    >
      <Control id={id} className="mt-0.5" {...props} />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
