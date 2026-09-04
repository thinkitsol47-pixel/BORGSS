import { cn } from "@/lib/utils";

/**
 * White surface with a sky border. The border sits at rest in the soft
 * brand tone and deepens to full brand on hover, so a card reads as part
 * of the identity even before you touch it. Depth comes from that border
 * and a very soft shadow — never from a grey fill.
 */
export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-brand bg-card shadow-card",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t px-5 py-3.5", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-serif text-lg font-semibold leading-snug", className)}
      {...props}
    />
  );
}
