import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Open Access Policy",
  description:
    "BORJSS is fully open access: every article free to read from publication, under CC BY 4.0, with no embargo, no reader fee, and authors free to self-archive.",
};

const TOC = [
  { id: "statement", label: "Open access statement" },
  { id: "what-it-means", label: "What this means for readers" },
  { id: "for-authors", label: "What this means for authors" },
  { id: "model", label: "How it is paid for" },
  { id: "self-archiving", label: "Self-archiving and preprints" },
  { id: "preservation", label: "Preservation" },
  { id: "text-mining", label: "Text and data mining" },
  { id: "why", label: "Why the journal chose this model" },
  { id: "standards", label: "Standards and definitions" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="open-access"
      title="Open Access Policy"
      lead="Every article this journal publishes is free to read, download and reuse from the day it appears. There is no subscription, no paywall and no embargo."
      toc={TOC}
      related={["licensing", "copyright", "editorial-independence"]}
    >
      <h2 id="statement">Open access statement</h2>
      <p>
        {siteConfig.shortName} is a <strong>fully open access</strong> journal.
        It publishes no subscription content and operates no paywall of any
        kind. Every article is available in full, to every reader, from the
        moment of publication.
      </p>
      <p>
        Articles are published under a{" "}
        <strong>Creative Commons Attribution 4.0 International licence</strong>{" "}
        (CC&nbsp;BY&nbsp;4.0), and{" "}
        <strong>authors retain copyright in their own work</strong>. The journal
        takes no transfer of copyright and asks for no exclusive rights. Terms
        are set out in the <Link href="/policies/licensing">licensing policy</Link>{" "}
        and the <Link href="/policies/copyright">copyright policy</Link>.
      </p>

      <h2 id="what-it-means">What this means for readers</h2>
      <p>
        Anyone, anywhere, may do the following with any article in this journal
        without asking permission and without paying anything:
      </p>
      <ul>
        <li>Read it, and download the full text;</li>
        <li>Print it, copy it and distribute it;</li>
        <li>Use it in teaching, and include it in a course pack;</li>
        <li>
          Translate it, build on it, and reuse its figures and tables in new
          work;
        </li>
        <li>Use it commercially;</li>
        <li>Mine the text and data computationally.</li>
      </ul>
      <p>
        The single condition is attribution: credit the original authors and the
        journal, link to the licence, and indicate any changes you made. There
        is no registration requirement, and readers are never asked for an
        account or an email address to read an article.
      </p>

      <h2 id="for-authors">What this means for authors</h2>
      <ul>
        <li>
          <strong>You keep your copyright.</strong> You grant the journal a
          non-exclusive right to publish; ownership stays with you.
        </li>
        <li>
          <strong>No embargo.</strong> You may share the published version
          immediately and anywhere — your repository, your website, a scholarly
          network, a mailing list.
        </li>
        <li>
          <strong>Wider reach.</strong> Your work is readable by researchers,
          practitioners and policymakers who have no journal subscription, which
          in this journal&rsquo;s subject area is most of them.
        </li>
        <li>
          <strong>Funder compliance.</strong> Immediate CC&nbsp;BY publication
          with retained copyright satisfies the open access requirements of most
          research funders, including Plan S conditions on licence and embargo.
        </li>
      </ul>

      <h2 id="model">How it is paid for</h2>
      <p>
        Open access removes the reader-side income a journal would otherwise
        have. {siteConfig.shortName} covers its costs through a single article
        processing charge on <strong>accepted</strong> manuscripts. There is no
        submission fee, and nothing is charged on a manuscript that is declined.
      </p>
      <p>
        The charge is waived where it would be a barrier. No manuscript is
        rejected, and no accepted manuscript is withheld, because an author
        cannot pay. Full waivers are granted automatically for students and
        early-career researchers without institutional funding, for unfunded
        research, and for corresponding authors in low- and lower-middle-income
        countries.
      </p>
      <p>
        Charges and waivers are administered by the editorial office{" "}
        <strong>after</strong> a decision has been taken. Editors and reviewers
        are not told whether a fee will be paid or a waiver requested — see{" "}
        <Link href="/policies/editorial-independence">
          editorial independence
        </Link>
        . Current rates are on the{" "}
        <Link href="/apc">publication charges</Link> page.
      </p>

      <h2 id="self-archiving">Self-archiving and preprints</h2>
      <p>
        Because authors retain copyright and the licence is CC&nbsp;BY, there is
        nothing the journal needs to permit — but for the avoidance of doubt:
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Preprint (before review)",
              "May be posted on any preprint server or repository at any time. Prior posting is not treated as prior publication.",
            ],
            [
              "Accepted manuscript",
              "May be deposited anywhere immediately on acceptance, with no embargo.",
            ],
            [
              "Published version",
              "May be deposited and shared anywhere immediately, including the journal's own typeset PDF.",
            ],
            [
              "Requested credit",
              "Cite the published version and include its DOI, so that readers reach the version of record.",
            ],
          ].map(([term, value]) => (
            <div
              key={term}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[16rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {term}
              </dt>
              <dd className="min-w-0 break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p>
        Authors who posted a preprint should declare it at submission and cite
        it, as the{" "}
        <Link href="/policies/plagiarism">plagiarism policy</Link> requires for
        any earlier version.
      </p>

      <h2 id="preservation">Preservation</h2>
      <p>
        Free to read is only meaningful if the article remains reachable. Two
        arrangements support that:
      </p>
      <ul>
        <li>
          <strong>Persistent identifiers.</strong> Every article carries a DOI
          registered with Crossref, so citations resolve even if this
          website&rsquo;s addresses change.
        </li>
        <li>
          <strong>Independent deposit.</strong> Published content is deposited
          with a third-party preservation service so it survives independently
          of the publisher. This arrangement is being established alongside the
          journal&rsquo;s indexing applications — its current status is shown on
          the <Link href="/indexing">indexing and archiving</Link> page.
        </li>
      </ul>
      <p>
        Authors&rsquo; own right to deposit the published version in an
        institutional repository is itself a preservation measure, and the
        journal encourages it for that reason as well as for reach.
      </p>

      <h2 id="text-mining">Text and data mining</h2>
      <p>
        The CC&nbsp;BY licence permits text and data mining of the full corpus,
        including for commercial purposes and including for training
        computational models, subject only to attribution. No separate
        permission is needed and none should be sought.
      </p>
      <p>
        The journal asks only that automated collection be reasonable in rate so
        that the site remains usable for other readers. Where a machine-readable
        metadata feed would serve better than crawling, see the{" "}
        <Link href="/indexing">indexing and archiving</Link> page for what is
        available.
      </p>

      <h2 id="why">Why the journal chose this model</h2>
      <p>
        {siteConfig.shortName} publishes social science research substantially
        from institutions in South Asia and comparable settings. Those
        institutions are also the ones least likely to hold subscriptions to the
        journals in which such research would otherwise appear.
      </p>
      <p>
        A subscription model would therefore place this work behind a barrier
        for exactly the researchers, practitioners and policymakers it most
        concerns. Open access is not a marketing position here; it is the only
        model consistent with the journal&rsquo;s purpose. The commitment to
        waivers follows from the same reasoning — an author-pays model that
        excluded unfunded authors would reproduce the barrier on the other side.
      </p>

      <h2 id="standards">Standards and definitions</h2>
      <p>
        This policy follows the definition of open access set out in the{" "}
        <a
          href="https://www.budapestopenaccessinitiative.org"
          target="_blank"
          rel="noreferrer"
        >
          Budapest Open Access Initiative
        </a>{" "}
        — free availability on the public internet, with no barriers other than
        the requirement of attribution.
      </p>
      <p>
        The journal meets the licensing, copyright and access criteria of the{" "}
        <a href="https://doaj.org" target="_blank" rel="noreferrer">
          Directory of Open Access Journals
        </a>
        , and will apply for listing once it has published the volume of content
        DOAJ requires before evaluation.
      </p>
      <p>
        Questions about access, reuse or repository deposit can be sent to{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        .
      </p>
    </PolicyPage>
  );
}
