import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { footerNav } from "@/config/nav.config";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-background">
      {/* thin brand rule so the footer reads as part of the identity */}
      <div aria-hidden className="h-1 bg-brand-gradient" />

      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:pr-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-xl bg-brand-gradient font-serif text-lg font-bold text-brand-foreground"
            >
              B
            </span>
            <span className="font-serif text-xl font-bold">
              {siteConfig.shortName}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {siteConfig.name}
          </p>
          <p className="mt-3 text-sm font-medium text-primary">
            {siteConfig.tagline}
          </p>

          <dl className="mt-5 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <dt className="sr-only">Access model</dt>
              <dd>
                {siteConfig.accessModel} · {siteConfig.frequency}
              </dd>
            </div>
            {(siteConfig.issn || siteConfig.eIssn) && (
              <div>
                <dt className="sr-only">ISSN</dt>
                <dd>
                  {siteConfig.issn && `ISSN ${siteConfig.issn}`}
                  {siteConfig.issn && siteConfig.eIssn && " · "}
                  {siteConfig.eIssn && `e-ISSN ${siteConfig.eIssn}`}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {footerNav.map((col) => (
          <div key={col.heading}>
            <p className="font-serif text-sm font-bold uppercase tracking-wide">
              {col.heading}
            </p>
            <span
              aria-hidden
              className="mt-2 block h-0.5 w-8 rounded-full bg-brand"
            />
            <ul className="mt-4 space-y-2.5">
              {col.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {i.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* contact strip */}
      <div className="border-t">
        <div className="container flex flex-col gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
          <a
            href={`mailto:${siteConfig.contact.editorialOffice}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <Mail className="size-4 text-brand" aria-hidden />
            {siteConfig.contact.editorialOffice}
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-brand" aria-hidden />
            {siteConfig.contact.address}
          </span>
        </div>
      </div>

      <div className="border-t">
        <div className="container flex flex-col justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.publisher}. All rights
            reserved.
          </p>
          <p className="flex flex-wrap items-center gap-x-2">
            <span>Published in {siteConfig.countryOfPublication}</span>
            <span aria-hidden>·</span>
            <Link href="/policies/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/policies/licensing" className="hover:text-primary">
              Licensing
            </Link>
            <span aria-hidden>·</span>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
