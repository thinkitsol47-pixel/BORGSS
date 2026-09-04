import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Check, HandCoins, Info, Unlock, X } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Alert, Breadcrumb, Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Publication Charges (APC)",
  description:
    "Article processing charges at BORJSS, what they cover, the waiver policy, and what authors are never charged for.",
};

const INCLUDED = [
  "Editorial handling and desk assessment",
  "Double-blind peer review by at least two reviewers",
  "Plagiarism and similarity screening",
  "Professional copy-editing and typesetting",
  "DOI registration with Crossref",
  "Permanent hosting and third-party preservation",
  "Open access to every reader, forever",
];

const NEVER_CHARGED = [
  "Submitting a manuscript",
  "Peer review, whatever the outcome",
  "Manuscripts that are declined",
  "Colour figures, in print or online",
  "Supplementary files",
  "Reading any article in the journal",
];

const RATES = [
  {
    tier: "Standard",
    price: "PKR 15,000",
    usd: "≈ USD 55",
    who: "Authors at institutions in Pakistan",
    highlight: false,
  },
  {
    tier: "International",
    price: "USD 120",
    usd: "Per accepted article",
    who: "Authors at institutions outside Pakistan",
    highlight: false,
  },
  {
    tier: "Waiver",
    price: "No charge",
    usd: "On request",
    who: "Students, unfunded research, and low-income-country authors",
    highlight: true,
  },
];

export default function ApcPage() {
  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Publication Charges" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>For Authors</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Publication Charges
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {siteConfig.shortName} is fully open access, so there is no
          subscription income. A single article processing charge on accepted
          manuscripts covers the cost of publishing — and it is waived for
          anyone who cannot meet it.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-tint/50 px-3 py-1.5 text-xs font-medium text-brand-darker">
            <Unlock className="size-3.5" aria-hidden />
            No charge to readers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-tint/50 px-3 py-1.5 text-xs font-medium text-brand-darker">
            <BadgeCheck className="size-3.5" aria-hidden />
            No submission fee
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-tint/50 px-3 py-1.5 text-xs font-medium text-brand-darker">
            <HandCoins className="size-3.5" aria-hidden />
            Waivers granted on request
          </span>
        </div>
      </header>

      {/* ---------------------------------------------------------- rates */}
      <section aria-labelledby="rates" className="mt-10">
        <h2 id="rates" className="font-serif text-xl font-bold">
          Charges
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Charged once, only when a manuscript is accepted. There is nothing to
          pay at submission.
        </p>

        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {RATES.map((r) => (
            <li key={r.tier}>
              <Card
                className={
                  r.highlight
                    ? "flex h-full flex-col border-brand bg-brand-tint/30 p-6"
                    : "flex h-full flex-col p-6"
                }
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-darker">
                  {r.tier}
                </p>
                <p className="mt-3 font-serif text-3xl font-bold">{r.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.usd}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {r.who}
                </p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Alert tone="info" title="Rates are indicative for the launch period">
            Charges for the inaugural volume are being finalised. Authors whose
            manuscripts are accepted before rates are confirmed will not be
            charged more than the figures above. Confirm the current rate with{" "}
            <a
              href={`mailto:${siteConfig.contact.charges}`}
              className="font-medium underline"
            >
              {siteConfig.contact.charges}
            </a>{" "}
            before you submit if cost is a deciding factor.
          </Alert>
        </div>
      </section>

      {/* -------------------------------------------------- what it covers */}
      <section aria-labelledby="covers" className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 id="covers" className="font-serif text-lg font-bold">
            What the charge covers
          </h2>
          <ul className="mt-4 space-y-2.5">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-lg font-bold">
            What you are never charged for
          </h2>
          <ul className="mt-4 space-y-2.5">
            {NEVER_CHARGED.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <X
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* --------------------------------------------------------- waivers */}
      <section aria-labelledby="waivers" className="mt-12">
        <h2 id="waivers" className="font-serif text-xl font-bold">
          Waivers and discounts
        </h2>

        <div className="prose mt-4 max-w-3xl">
          <p>
            No manuscript is rejected, and no accepted manuscript is withheld,
            because an author cannot pay. If the charge is a barrier, request a
            waiver — it is granted in the large majority of cases, and the
            request never reaches the reviewers or influences the editorial
            decision.
          </p>

          <p>Full waivers are granted automatically where:</p>
          <ul>
            <li>
              The corresponding author is a student or early-career researcher
              without institutional funding.
            </li>
            <li>
              The research was conducted without external grant support.
            </li>
            <li>
              The corresponding author is based in a country classified by the
              World Bank as low-income or lower-middle-income.
            </li>
          </ul>

          <p>
            Partial discounts are available in other circumstances. Apply when
            you submit, or at any point before acceptance, by writing to{" "}
            <a href={`mailto:${siteConfig.contact.charges}`}>
              {siteConfig.contact.charges}
            </a>{" "}
            with your manuscript ID and a brief explanation. No supporting
            documentation is required.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------- editorial wall */}
      <section className="mt-12">
        <Card className="border-brand bg-brand-tint/30 p-6 sm:p-8">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
              <Info className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold">
                Payment never affects the decision
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Editors and reviewers are not told whether an author intends to
                pay, has requested a waiver, or has been granted one. The
                editorial process is separated from the finance process
                entirely, and the invoice is only raised after acceptance.
              </p>
              <Link
                href="/policies/editorial-independence"
                className="mt-3 inline-block text-sm font-medium text-primary hover:text-brand-dark"
              >
                Editorial independence policy →
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* --------------------------------------------------------- payment */}
      <section aria-labelledby="payment" className="mt-12">
        <h2 id="payment" className="font-serif text-xl font-bold">
          How payment works
        </h2>
        <ol className="mt-5 max-w-3xl space-y-4">
          {[
            [
              "Acceptance",
              "You receive the acceptance letter. Only at this point does any charge arise.",
            ],
            [
              "Invoice",
              "The editorial office issues an invoice to the corresponding author or their institution, as you prefer.",
            ],
            [
              "Payment",
              "Payable by bank transfer within 30 days. Institutional purchase orders are accepted.",
            ],
            [
              "Production",
              "Production begins on acceptance, not on payment — your article is not held up while an invoice is processed.",
            ],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-tint font-serif text-sm font-bold text-brand-darker"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ cta */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              Questions about charges?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ask before you submit if cost affects your decision. We would
              rather answer early than have you hold back a good manuscript.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={`mailto:${siteConfig.contact.charges}`}>
              Email the charges desk
            </Button>
            <Button href="/for-authors/guidelines" variant="outline">
              Author guidelines
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
