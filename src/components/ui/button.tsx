import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Every variant carries a border, so each button reads as a defined shape
   rather than a floating patch of colour. Solid variants border in their own
   tone; quiet ones border in the soft brand line. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-brand-dark bg-brand text-brand-foreground hover:border-brand-darker hover:bg-brand-dark active:translate-y-px",
        outline:
          "border-brand-border bg-background text-foreground hover:border-brand hover:bg-brand-tint/50 hover:text-brand-darker active:translate-y-px",
        ghost:
          "border-transparent text-foreground hover:border-brand-border hover:bg-brand-tint/60 hover:text-brand-darker",
        subtle:
          "border-brand-border bg-brand-tint text-brand-darker hover:border-brand hover:bg-brand/15",
        danger:
          "border-danger bg-danger text-white hover:bg-danger/90 active:translate-y-px",
        /* For use on top of a sky-blue panel. */
        inverse:
          "border-white bg-white text-brand-darker hover:bg-white/90 active:translate-y-px",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-10 px-4.5",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    href?: undefined;
  };

type ButtonLinkProps = ButtonBaseProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "color"> & {
    href: string;
  };

export function Button(props: ButtonProps | ButtonLinkProps) {
  const { className, variant, size, children, ...rest } = props;
  const classes = cn(buttonVariants({ variant, size }), className);

  if (typeof rest.href === "string") {
    const { href, ...linkProps } = rest as ButtonLinkProps;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export { buttonVariants };
