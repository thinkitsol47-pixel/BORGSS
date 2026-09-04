import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Clock,
  CreditCard,
  FileText,
  LifeBuoy,
  Mail,
  MapPin,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumb, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the BORJSS editorial office, submissions desk, technical support or publication charges team.",
};

const DESKS: {
  icon: LucideIcon;
  label: string;
  email: string;
  detail: string;
}[] = [
  {
    icon: Mail,
    label: "Editorial office",
    email: siteConfig.contact.editorialOffice,
    detail:
      "Scope enquiries, editorial policy, board matters, and anything not covered below.",
  },
  {
    icon: FileText,
    label: "Submissions",
    email: siteConfig.contact.submissions,
    detail:
      "Questions about a manuscript in review, revisions, or the submission process.",
  },
  {
    icon: LifeBuoy,
    label: "Technical support",
    email: siteConfig.contact.support,
    detail:
      "Login problems, upload failures, or anything wrong with this website.",
  },
  {
    icon: CreditCard,
    label: "Publication charges",
    email: siteConfig.contact.charges,
    detail: "Invoices, waivers, and questions about article processing charges.",
  },
];

const BEFORE_YOU_WRITE: { label: string; href: string; body: string }[] = [
  {
    label: "Author guidelines",
    href: "/for-authors/guidelines",
    body: "Formatting, word limits, reference style and file requirements.",
  },
  {
    label: "Submission process",
    href: "/for-authors/submission-process",
    body: "What happens after you submit, and how long each stage takes.",
  },
  {
    label: "Aims & scope",
    href: "/about/aims-scope",
    body: "Whether your manuscript fits what the journal publishes.",
  },
  {
    label: "Publication charges",
    href: "/apc",
    body: "What we charge, and the waiver policy.",
  },
];

export default function ContactPage() {
  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb items={[{ label: "Contact" }]} />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Contact the journal
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Write to the desk that fits your enquiry and we will route it
          correctly. Most messages receive a reply within two working days.
        </p>
      </header>

      {/* --------------------------------------------------------- desks */}
      <section aria-labelledby="desks" className="mt-10">
        <h2 id="desks" className="font-serif text-xl font-bold">
          Who to write to
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {DESKS.map(({ icon: Icon, label, email, detail }) => (
            <li key={label}>
              <Card className="h-full p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand-dark">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-base font-semibold">
                      {label}
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-0.5 block break-all text-sm font-medium text-primary hover:text-brand-dark hover:underline"
                    >
                      {email}
                    </a>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------- form + details */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <section aria-labelledby="form" className="min-w-0">
          <h2 id="form" className="font-serif text-xl font-bold">
            Send a message
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Use this form if you are unsure which desk you need — we will pass
            it on.
          </p>

          <div className="mt-6 rounded-lg border border-brand-border bg-card p-6 shadow-card sm:p-7">
            <ContactForm />
          </div>
        </section>

        {/* ------------------------------------------------------- aside */}
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
              <Building2 className="size-3.5" aria-hidden />
              Editorial office
            </p>
            <address className="mt-3 space-y-3 not-italic text-sm">
              <p className="flex items-start gap-2 leading-relaxed">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden
                />
                <span>
                  {siteConfig.publisher}
                  <br />
                  {siteConfig.contact.address}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <a
                  href={`mailto:${siteConfig.contact.editorialOffice}`}
                  className="break-all text-primary hover:underline"
                >
                  {siteConfig.contact.editorialOffice}
                </a>
              </p>
            </address>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
              <Clock className="size-3.5" aria-hidden />
              Response times
            </p>
            <dl className="mt-3 space-y-2.5 text-sm">
              {[
                ["General enquiries", "1–2 working days"],
                ["Manuscript status", "2–3 working days"],
                ["Technical problems", "Same working day"],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{term}</dt>
                  <dd className="shrink-0 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The office observes Pakistani public holidays; replies may take
              longer around those dates.
            </p>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
              <ScrollText className="size-3.5" aria-hidden />
              Before you write
            </p>
            <ul className="mt-3 space-y-3">
              {BEFORE_YOU_WRITE.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-primary hover:text-brand-dark"
                  >
                    {item.label} →
                  </Link>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-brand-tint/30 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4 text-brand" aria-hidden />
              Complaints and appeals
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              If you wish to appeal an editorial decision or raise a concern
              about the review of your manuscript, follow the formal procedure
              rather than this form.
            </p>
            <Link
              href="/policies/complaints-appeals"
              className="mt-2.5 inline-block text-sm font-medium text-primary hover:text-brand-dark"
            >
              Complaints &amp; appeals policy →
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
