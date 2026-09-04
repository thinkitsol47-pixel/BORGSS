import { ArrowRight, BookOpen, ShieldCheck, Unlock } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/button";
import { FounderCard } from "./founder-card";

const TRUST = [
  { icon: ShieldCheck, label: "Double-blind peer review" },
  { icon: Unlock, label: "Open access, no paywall" },
  { icon: BookOpen, label: "Biannual publication" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      <div className="container relative grid items-stretch gap-10 pb-10 pt-4 md:pb-12 md:pt-5 lg:grid-cols-12 lg:pb-14">
        {/* ------------------------------------------------------ copy */}
        <div className="lg:col-span-6">
          {/* wrapper keeps the pill's hit area to its own width — without it
              the inline box stretches across the column */}
          <div className="flex">
            <span className="inline-flex w-fit select-none items-center gap-2 rounded-full border border-brand/25 bg-brand-tint/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-brand-darker">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              Now accepting submissions
            </span>
          </div>

          <h1 className="mt-5 max-w-xl text-display-sm font-bold md:text-display-md">
            Blue Ocean Research Journal for{" "}
            <span className="text-brand-dark">Social Sciences</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/for-authors/how-to-submit" size="lg">
              Submit Your Manuscript
              <ArrowRight className="size-4" />
            </Button>
            <Button href="/issues/current" size="lg" variant="outline">
              View Current Issue
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Icon className="size-4 text-brand" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* -------------------------------------------------- founder card */}
        <div className="lg:col-span-6">
          <FounderCard />
        </div>
      </div>
    </section>
  );
}
