import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The one place on the public site where a full-width solid brand panel is
 * allowed. Everything else stays on white.
 */
export function CtaBand({
  title,
  lead,
  primary,
  secondary,
}: {
  title: string;
  lead: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="container py-12">
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient px-6 py-8 text-center text-brand-foreground md:px-14">
        <div
          aria-hidden
          className="absolute -right-10 -top-14 size-44 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-8 size-44 rounded-full bg-white/10"
        />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mt-2.5 text-base leading-relaxed opacity-95">
            {lead}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href={primary.href} size="lg" variant="inverse">
              {primary.label}
              <ArrowRight className="size-4" />
            </Button>
            {secondary && (
              <Button
                href={secondary.href}
                size="lg"
                className="border border-white/40 bg-white/10 text-white shadow-none hover:bg-white/20"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
