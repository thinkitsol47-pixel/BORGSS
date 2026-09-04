import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Licensing Policy",
  description:
    "Articles in BORJSS are published under CC BY 4.0. This policy explains what the licence permits, how to attribute correctly, and how supplementary material and data are licensed.",
};

const TOC = [
  { id: "licence", label: "The licence" },
  { id: "permits", label: "What the licence permits" },
  { id: "conditions", label: "The conditions" },
  { id: "attribution", label: "How to attribute" },
  { id: "why-by", label: "Why CC BY and not a stricter licence" },
  { id: "supplementary", label: "Data and supplementary material" },
  { id: "exceptions", label: "Material outside the licence" },
  { id: "site", label: "The website and journal identity" },
  { id: "machine", label: "Machine-readable licence information" },
  { id: "changes", label: "Changes to this policy" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="licensing"
      title="Licensing Policy"
      lead="Every article is published under a Creative Commons Attribution 4.0 International licence. This page sets out exactly what that permits, and what it asks in return."
      toc={TOC}
      updated="2026-01-15"
      related={["copyright", "open-access", "data-availability"]}
    >
      <h2 id="licence">The licence</h2>
      <p>
        All articles published in {siteConfig.shortName} are licensed under the{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          Creative Commons Attribution 4.0 International licence
        </a>{" "}
        (CC&nbsp;BY&nbsp;4.0). The licence applies from the moment of
        publication, worldwide, for the full duration of copyright, and cannot
        be revoked.
      </p>
      <p>
        Copyright remains with the authors — the licence is granted by them, not
        by the journal. See the{" "}
        <Link href="/policies/copyright">copyright policy</Link>.
      </p>
      <p>
        CC&nbsp;BY is the least restrictive of the Creative Commons licences
        short of public domain dedication, and is the licence required or
        recommended by DOAJ, Plan S and most major research funders.
      </p>

      <h2 id="permits">What the licence permits</h2>
      <p>
        Anyone may do all of the following, for any purpose including a
        commercial one, without seeking permission:
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Share",
              "Copy and redistribute the article in any medium or format — post it, email it, print it, mirror it.",
            ],
            [
              "Adapt",
              "Remix, transform and build upon it, including creating derivative works.",
            ],
            [
              "Translate",
              "Produce and publish a translation into any language.",
            ],
            [
              "Reuse figures",
              "Reproduce figures, tables and excerpts in new work, including textbooks and commercial publications.",
            ],
            [
              "Teach",
              "Distribute copies to students, include the article in course packs, and adapt it for teaching.",
            ],
            [
              "Mine",
              "Perform text and data mining over the full text and metadata, including for computational analysis and model training.",
            ],
            [
              "Commercialise",
              "Include the work in a product or service that is sold.",
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
        No request to the journal is needed for any of this, and none should be
        sent. The licence <em>is</em> the permission.
      </p>

      <h2 id="conditions">The conditions</h2>
      <p>CC&nbsp;BY imposes three conditions, and no others.</p>
      <ol>
        <li>
          <strong>Attribution.</strong> Credit the authors and the source, in a
          reasonable manner given the medium.
        </li>
        <li>
          <strong>Link to the licence.</strong> Provide a link to the
          CC&nbsp;BY&nbsp;4.0 terms.
        </li>
        <li>
          <strong>Indicate changes.</strong> State whether you modified the
          material, and do not imply the original authors endorse your use.
        </li>
      </ol>
      <p>
        The licence adds no further restrictions. You may not impose any of your
        own on downstream users — for instance by republishing an article behind
        a paywall or under a more restrictive licence — and you may not apply
        technological measures that prevent others exercising these same rights.
      </p>

      <h2 id="attribution">How to attribute</h2>
      <p>
        For a citation in an academic work, a standard reference to the
        published version including the DOI is sufficient attribution.
      </p>
      <p>
        Where you reproduce or adapt material — a figure in a report, a
        republished full text, a translation — a fuller credit line is expected.
        The pattern that satisfies the licence is:
      </p>
      <div className="not-prose my-5 rounded-lg border border-brand-border bg-brand-tint/30 p-4">
        <p className="text-sm leading-relaxed">
          <span className="break-words">
            Author names. &ldquo;Article title.&rdquo; <em>{siteConfig.name}</em>,
            volume(issue), year, pages. DOI. Licensed under CC BY 4.0.
          </span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For an adaptation, add: &ldquo;Adapted from the original&rdquo;, and
          state what you changed.
        </p>
      </div>
      <p>
        Include a working link to the licence at{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          creativecommons.org/licenses/by/4.0/
        </a>
        . Where the medium makes a full credit line impractical, the licence
        asks for what is reasonable in the circumstances — a caption naming the
        authors and linking to the article satisfies it.
      </p>

      <h2 id="why-by">Why CC&nbsp;BY and not a stricter licence</h2>
      <p>
        Authors sometimes ask for a NonCommercial (NC) or NoDerivatives (ND)
        variant. The journal publishes everything under CC&nbsp;BY, for reasons
        worth stating plainly.
      </p>
      <ul>
        <li>
          <strong>NC is unclear in practice.</strong> &ldquo;Commercial&rdquo;
          has no settled definition. It plausibly blocks a private training
          provider, a newspaper, an NGO with commercial arms, and some
          university teaching — uses most authors want to permit. The ambiguity
          deters legitimate reuse without preventing the uses authors actually
          object to.
        </li>
        <li>
          <strong>ND blocks translation.</strong> A NoDerivatives licence
          prevents translating the article, which for a journal publishing
          research relevant across South Asia would remove one of the main
          routes by which the work reaches the people it concerns.
        </li>
        <li>
          <strong>Both fail funder and DOAJ requirements.</strong> NC and ND
          variants do not satisfy Plan S, and complicate DOAJ evaluation.
        </li>
        <li>
          <strong>Misuse is not what a licence prevents.</strong> Plagiarism,
          misrepresentation and uncredited republication breach CC&nbsp;BY
          already, and are dealt with as attribution failures — a stricter
          licence adds no protection against them.
        </li>
      </ul>
      <p>
        Authors who need a different licence for a specific reason should raise
        it with the editorial office before submitting, so the position is
        settled early.
      </p>

      <h2 id="supplementary">Data and supplementary material</h2>
      <p>
        Supplementary files published alongside an article — appendices,
        instruments, coding frames, additional tables — carry the same
        CC&nbsp;BY licence as the article unless the file itself states
        otherwise.
      </p>
      <p>
        Datasets are treated separately. Where data are deposited in a
        repository, they carry that repository&rsquo;s licence, and the journal
        recommends{" "}
        <a
          href="https://creativecommons.org/publicdomain/zero/1.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC0
        </a>{" "}
        for data, since attribution stacking across combined datasets makes
        CC&nbsp;BY awkward for reuse. The data availability statement records
        which licence applies — see the{" "}
        <Link href="/policies/data-availability">
          data availability policy
        </Link>
        .
      </p>
      <p>
        Data that cannot be shared for ethical or legal reasons are not licensed
        at all, and the statement says so and explains why.
      </p>

      <h2 id="exceptions">Material outside the licence</h2>
      <p>
        Occasionally an article contains third-party material that its rights
        holder would not release under CC&nbsp;BY. Where the journal accepts
        such an item, it carries its own rights line beside it stating that it
        is excluded from the article&rsquo;s licence and that reuse requires
        permission from the named holder.
      </p>
      <p>
        These exceptions are kept rare, and the rest of the article remains
        fully CC&nbsp;BY. Where no rights line appears, the material is covered
        by the article licence. Clearing such material is the authors&rsquo;
        responsibility under the{" "}
        <Link href="/policies/copyright">copyright policy</Link>.
      </p>

      <h2 id="site">The website and journal identity</h2>
      <p>
        This licence covers <strong>article content</strong>. It does not cover
        the journal&rsquo;s name, logo, branding or visual identity, which are
        not licensed for reuse, nor the design and code of this website.
      </p>
      <p>
        In practical terms: you may republish an article in full and say where
        it came from, but you may not use the journal&rsquo;s name or logo in a
        way that implies it published, endorsed or reviewed something it did
        not.
      </p>

      <h2 id="machine">Machine-readable licence information</h2>
      <p>
        Licence terms are stated in a form that indexes, aggregators and
        repositories can read automatically, not only in prose:
      </p>
      <ul>
        <li>
          Each article page carries structured metadata naming the licence URL;
        </li>
        <li>
          The licence is included in the metadata deposited with Crossref
          against each article&rsquo;s DOI;
        </li>
        <li>
          The licence statement appears on the article itself, so it travels
          with any copy of the PDF.
        </li>
      </ul>

      <h2 id="changes">Changes to this policy</h2>
      <p>
        The journal may change the licence it applies to <em>future</em>{" "}
        articles. It cannot change the licence on an article already published:
        CC&nbsp;BY is irrevocable, and anyone who obtained the article under it
        keeps those rights permanently.
      </p>
      <p>
        Any change would be announced before it took effect and would state the
        date from which it applied. Questions about reuse can be sent to{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        , though in most cases the answer is that the licence already permits
        what you want to do.
      </p>
    </PolicyPage>
  );
}
