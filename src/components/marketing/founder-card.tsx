import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Quote, Users } from "lucide-react";

/**
 * Founder panel shown opposite the hero copy: details on the left, a
 * background-free portrait on the right.
 *
 * /public/images/founder.png is a transparent cut-out cropped to the upper
 * half of the figure, so it sits directly on the tinted panel with no visible
 * image box. It is 593x825 and is never rendered larger than that.
 */

const FOUNDER = {
  name: "Dr. Mubashir Quddus",
  /* A bare "PhD" reads as a fragment; name the discipline so the line says
     something. */
  credential: "PhD in Management Sciences",
  role: "CEO",
  affiliation: "Blue Ocean Educational Services (Pvt.) Ltd.",
  affiliationShort: "Blue Ocean Educational Services",
  quote:
    "Rigorous, open scholarship should be within reach of every researcher — not locked behind a paywall.",
  facts: [
    "Founder of BORJSS",
    "Chairs the editorial direction",
    "Open-access advocate",
  ],
  image: "/images/founder.png",
};

export function FounderCard() {
  return (
    <figure className="relative flex h-full items-stretch overflow-hidden rounded-2xl border border-brand-border bg-card sm:min-h-[24rem]">
      {/* ------------------------------------------------------- details */}
      {/* pr keeps the copy clear of the portrait, which is pulled left by -ml */}
      <figcaption className="relative z-10 min-w-0 flex-1 p-4 pr-1 xs:p-5 xs:pr-2 sm:p-7 sm:pr-5">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-foreground">
          <GraduationCap className="size-3.5 shrink-0" aria-hidden />
          {FOUNDER.role}
        </p>

        <p className="mt-3 font-serif text-xl font-bold leading-tight xs:text-2xl sm:text-[1.75rem]">
          {FOUNDER.name}
        </p>
        <p className="mt-1.5 text-sm font-semibold text-primary sm:text-base">
          {FOUNDER.credential}
        </p>
        {/* The legal suffix is dropped on a phone, where it costs a whole
            extra line for no useful information. */}
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          <span className="sm:hidden">{FOUNDER.affiliationShort}</span>
          <span className="hidden sm:inline">{FOUNDER.affiliation}</span>
        </p>

        <blockquote className="relative mt-4 hidden pl-5 text-sm leading-relaxed text-foreground/85 xs:block">
          <Quote
            className="absolute left-0 top-0.5 size-3.5 text-brand"
            aria-hidden
          />
          {FOUNDER.quote}
        </blockquote>

        <ul className="mt-4 space-y-1.5">
          {FOUNDER.facts.map((fact) => (
            <li
              key={fact}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-brand"
              />
              {fact}
            </li>
          ))}
        </ul>

        <Link
          href="/about/editorial-board"
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-tint/60 px-3 py-2 text-xs font-semibold text-brand-darker transition-colors hover:border-brand hover:bg-brand-tint"
        >
          <Users className="size-3.5 shrink-0" aria-hidden />
          <span className="sm:hidden">Editorial board</span>
          <span className="hidden sm:inline">Meet the editorial board</span>
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      </figcaption>

      {/* ------------------------------------------------------ portrait */}
      {/* The cut-out is 593x825 (1:1.39). Sizing the column by height and
          letting object-contain set the width keeps the figure filling the
          panel from top to bottom without ever being upscaled. */}
      {/* The portrait is pulled left so it overlaps the copy column. Its width
          is a share of the card rather than a fixed size, so the copy keeps a
          usable measure at every width instead of being squeezed on a phone. */}
      <div className="relative -ml-4 w-[42%] max-w-[17rem] shrink-0 self-stretch sm:-ml-16 sm:w-[17rem]">
        <Image
          src={FOUNDER.image}
          alt={`${FOUNDER.name}, ${FOUNDER.role} of ${FOUNDER.affiliation}`}
          fill
          priority
          quality={92}
          sizes="(min-width: 640px) 17rem, 38vw"
          className="object-contain object-bottom"
        />
      </div>
    </figure>
  );
}
