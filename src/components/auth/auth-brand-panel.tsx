import { BookOpen, ShieldCheck, Unlock, Users } from "lucide-react";
import { siteConfig } from "@/config/site.config";

/**
 * The right-hand column of the auth layout.
 *
 * Hidden below `lg` — on a phone the form is the whole job, and a panel of
 * journal facts underneath it is just something to scroll past. Everything
 * stated here is true of the journal today: no claims about indexing,
 * impact factor or volume that the site cannot back up elsewhere.
 */

/**
 * Kept to one line of body each. The panel has to fit a laptop viewport
 * (~650px of usable height) without scrolling or clipping the journal name,
 * so anything longer pushes the heading off the top.
 */
const POINTS = [
  {
    icon: ShieldCheck,
    title: "Double-blind peer review",
    body: "At least two independent reviewers on every manuscript.",
  },
  {
    icon: Unlock,
    title: "Open access, no embargo",
    body: "CC BY 4.0 from day one — and you keep the copyright.",
  },
  {
    icon: BookOpen,
    title: "One portal for everything",
    body: "Submit, track and review from the same account.",
  },
  {
    icon: Users,
    title: "Waivers, not barriers",
    body: "Charges waived for students and unfunded research.",
  },
];

export function AuthBrandPanel() {
  return (
    // A grid column is as tall as the tallest cell, so on a long form (register
    // is ~1600px) this column stretched to match and `justify-center` pushed
    // the panel's content to the middle of *that*, far below the fold. Sticking
    // the inner panel to the viewport keeps it beside the form at any length.
    <aside className="relative hidden bg-brand-gradient text-brand-foreground lg:block">
      {/* Sizes step up only once there is height to spend for them: a 660px
          laptop viewport gets the compact set, a tall screen the roomy one. */}
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden px-10 py-8 xl:px-14">
        {/* soft light bloom so the flat gradient has some depth */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative max-w-md">
          <p className="font-serif text-xl font-bold leading-snug xl:text-2xl">
            {siteConfig.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-brand-foreground/85">
            A peer-reviewed, open access journal for social science research —
            published in {siteConfig.countryOfPublication}, read anywhere.
          </p>

          <ul className="mt-6 space-y-4">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15 ring-1 ring-inset ring-white/20"
                >
                  <Icon className="size-[1.1rem]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-medium leading-snug">
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-brand-foreground/80">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 border-t border-white/20 pt-4 text-xs leading-relaxed text-brand-foreground/70">
            Published by {siteConfig.publisher}. Editorial policies follow COPE
            Core Practices.
          </p>
        </div>
      </div>
    </aside>
  );
}
