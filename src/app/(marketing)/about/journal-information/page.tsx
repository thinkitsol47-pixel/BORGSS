import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { getJournalSettings } from "@/lib/api/journal-settings";
import { DocPage, DocAside } from "@/components/layout/doc-page";

export const metadata: Metadata = {
  title: "Journal Information",
  description:
    "Formal publishing record for BORJSS: title, ISSN, publisher, frequency, licensing, archiving and indexing.",
};

const TOC = [
  { id: "identity", label: "Journal identity" },
  { id: "publishing", label: "Publishing details" },
  { id: "access", label: "Access & licensing" },
  { id: "preservation", label: "Archiving & preservation" },
  { id: "indexing", label: "Indexing" },
  { id: "contact", label: "Editorial office" },
];

/** Two-column definition row used throughout this page. */
function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{term}</dt>
      {/* addresses and long email strings must wrap rather than widen the row */}
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

export default async function JournalInformationPage() {
  // The stored values, falling back to the config file for anything unset —
  // so an ISSN entered in /admin/settings/journal appears here the same day,
  // without a deploy.
  const settings = await getJournalSettings();

  return (
    <DocPage
      eyebrow="About the Journal"
      title="Journal Information"
      lead="The formal publishing record: title, identifiers, publisher, frequency, licensing and preservation."
      breadcrumb={[
        { label: "About", href: "/about" },
        { label: "Journal Information" },
      ]}
      toc={TOC}
      updated="2026-01-15"
      aside={
        <DocAside title="Related">
          <Link
            href="/policies/open-access"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Open access policy →
          </Link>
          <Link
            href="/policies/licensing"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Licensing →
          </Link>
          <Link
            href="/indexing"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Indexing &amp; abstracting →
          </Link>
        </DocAside>
      }
    >
      <h2 id="identity">Journal identity</h2>
      <dl className="not-prose divide-y divide-border rounded-lg border border-brand-border">
        <Row term="Full title">{siteConfig.name}</Row>
        <Row term="Abbreviated title">{siteConfig.shortName}</Row>
        <Row term="ISSN (print)">
          {settings.issn || (
            <span className="text-muted-foreground">
              Application in progress
            </span>
          )}
        </Row>
        <Row term="e-ISSN (online)">
          {settings.eIssn || (
            <span className="text-muted-foreground">
              Application in progress
            </span>
          )}
        </Row>
        <Row term="DOI prefix">{settings.doiPrefix}</Row>
        <Row term="Subject area">Social Sciences (multidisciplinary)</Row>
        <Row term="Language of publication">English</Row>
      </dl>

      <h2 id="publishing">Publishing details</h2>
      <dl className="not-prose divide-y divide-border rounded-lg border border-brand-border">
        <Row term="Publisher">{siteConfig.publisher}</Row>
        <Row term="Country of publication">
          {siteConfig.countryOfPublication}
        </Row>
        <Row term="Publication frequency">{siteConfig.frequency}</Row>
        <Row term="First published">2026</Row>
        <Row term="Review model">
          Double-blind, minimum two independent reviewers
        </Row>
        <Row term="Median time to first decision">Approximately six weeks</Row>
        <Row term="Article processing charge">
          <Link href="/apc">See publication charges</Link>
        </Row>
      </dl>

      <h2 id="access">Access &amp; licensing</h2>
      <p>
        {siteConfig.shortName} is a fully open-access journal. Every article is
        free to read from the moment of publication; there is no subscription,
        no reader fee and no embargo period.
      </p>
      <p>
        Articles are published under a{" "}
        <strong>Creative Commons Attribution 4.0 International licence</strong>{" "}
        (CC&nbsp;BY&nbsp;4.0). Readers may share and adapt the work for any
        purpose, including commercially, provided the original authors and
        source are credited. Authors retain copyright in their work.
      </p>
      <p>
        Full terms are set out in the{" "}
        <Link href="/policies/licensing">licensing policy</Link> and the{" "}
        <Link href="/policies/copyright">copyright policy</Link>.
      </p>

      <h2 id="preservation">Archiving &amp; preservation</h2>
      <p>
        Long-term availability does not depend on this website remaining online.
        The journal&rsquo;s preservation arrangements are:
      </p>
      <ul>
        <li>
          <strong>Digital object identifiers.</strong> Crossref membership is
          being arranged. Once it is in place, every article — including those
          already published — is assigned a registered DOI, so citations
          resolve even if a URL changes.
        </li>
        <li>
          <strong>Third-party deposit.</strong> Published articles are deposited
          with an independent preservation service, ensuring content survives
          independently of the publisher.
        </li>
        <li>
          <strong>Author self-archiving.</strong> Authors are free to deposit
          the published version in their institutional repository immediately,
          with no embargo.
        </li>
      </ul>

      <h2 id="indexing">Indexing</h2>
      <p>
        Current indexing coverage, and the databases the journal has applied to,
        are listed on the <Link href="/indexing">indexing page</Link>. As a
        journal first published in 2026, {siteConfig.shortName} is building the
        publication record that established indexes require before evaluation.
      </p>

      <h2 id="contact">Editorial office</h2>
      <dl className="not-prose divide-y divide-border rounded-lg border border-brand-border">
        <Row term="Editorial enquiries">
          <a href={`mailto:${settings.editorialOffice}`}>
            {settings.editorialOffice}
          </a>
        </Row>
        <Row term="Submissions">
          <a href={`mailto:${siteConfig.contact.submissions}`}>
            {siteConfig.contact.submissions}
          </a>
        </Row>
        <Row term="Technical support">
          <a href={`mailto:${siteConfig.contact.support}`}>
            {siteConfig.contact.support}
          </a>
        </Row>
        <Row term="Postal address">{siteConfig.contact.address}</Row>
      </dl>
    </DocPage>
  );
}
