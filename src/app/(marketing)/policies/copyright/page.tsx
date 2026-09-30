import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Copyright Policy",
  description:
    "Authors retain copyright in work published by BORJSS. This policy sets out what the journal is granted, third-party permissions, moral rights and infringement.",
};

const TOC = [
  { id: "ownership", label: "Who owns the copyright" },
  { id: "grant", label: "What authors grant the journal" },
  { id: "publishing-agreement", label: "The publishing agreement" },
  { id: "employers", label: "Employers, funders and Crown copyright" },
  { id: "third-party", label: "Third-party material" },
  { id: "permission", label: "Obtaining permission" },
  { id: "moral", label: "Moral rights and attribution" },
  { id: "reusing", label: "Reusing your own article" },
  { id: "readers", label: "What readers may do" },
  { id: "infringement", label: "Infringement" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="copyright"
      title="Copyright Policy"
      lead="Authors keep the copyright in what they publish here. The journal takes no transfer of ownership and no exclusive rights — only what it needs to publish the work and keep it available."
      toc={TOC}
      related={["licensing", "open-access", "authorship"]}
    >
      <h2 id="ownership">Who owns the copyright</h2>
      <p>
        <strong>Authors retain copyright in their articles.</strong> Publication
        in {siteConfig.shortName} involves no assignment or transfer of
        copyright to the journal or its publisher, at any stage.
      </p>
      <p>
        This is the reverse of the traditional arrangement, in which an author
        signs copyright over and is then licensed back a limited set of rights.
        Here you remain the owner and may do anything an owner may do with your
        own work — republish it, translate it, adapt it, include it in a thesis
        or a book, or license it to someone else — without asking the journal.
      </p>
      <p>
        The journal holds copyright only in material it creates itself: the
        typeset layout of an article, the journal&rsquo;s own name and branding,
        editorials and the website. Those are separate from the article content.
      </p>

      <h2 id="grant">What authors grant the journal</h2>
      <p>
        On acceptance, authors grant the journal a{" "}
        <strong>non-exclusive, irrevocable licence</strong> to do the following.
        Non-exclusive means the same rights remain yours to exercise or grant
        elsewhere.
      </p>
      <ul>
        <li>Publish the article, in any format, online;</li>
        <li>
          Distribute it under the{" "}
          <Link href="/policies/licensing">CC&nbsp;BY 4.0 licence</Link> the
          journal applies to all content;
        </li>
        <li>
          Deposit it with preservation services and supply it to indexes and
          aggregators;
        </li>
        <li>
          Register a DOI for it and deposit its metadata with Crossref;
        </li>
        <li>
          Keep it available permanently, including after any change of publisher
          or of this website.
        </li>
      </ul>
      <p>
        The licence is irrevocable because the article, once published under
        CC&nbsp;BY, has been relied on by readers and cited by others. An author
        may correct or retract an article under the{" "}
        <Link href="/policies/retraction-correction">
          retraction and correction policy
        </Link>
        , but cannot withdraw it from the published record.
      </p>

      <h2 id="publishing-agreement">The publishing agreement</h2>
      <p>
        The corresponding author signs a short publishing agreement on
        acceptance, on behalf of all authors and with their confirmed consent.
        In signing it, the authors confirm that:
      </p>
      <ul>
        <li>The work is theirs and is original;</li>
        <li>
          They are entitled to grant the licence — nobody else holds rights that
          would prevent it;
        </li>
        <li>
          All third-party material is either used with permission or falls
          within a recognised exception;
        </li>
        <li>
          The work does not infringe anyone&rsquo;s copyright, and contains
          nothing unlawful or defamatory;
        </li>
        <li>
          Everyone listed meets the{" "}
          <Link href="/policies/authorship">authorship</Link> criteria and has
          approved the version being published.
        </li>
      </ul>
      <p>
        The agreement is signed after acceptance, not at submission. Submitting
        a manuscript commits an author to nothing.
      </p>

      <h2 id="employers">Employers, funders and Crown copyright</h2>
      <p>
        Some authors do not personally own the copyright in their own work.
        Where a contract of employment vests copyright in an employer, or where
        work carries government or Crown copyright, the licence must be granted
        by whoever holds the rights.
      </p>
      <p>
        In those cases the corresponding author should confirm at acceptance who
        the owner is, and that they have the authority to grant the licence on
        the owner&rsquo;s behalf. The published article records the copyright
        holder accordingly — the employer or funding body rather than the
        individual — and everything else in this policy is unchanged.
      </p>
      <p>
        Where a funder requires a specific licence or a rights-retention
        statement, tell the editorial office at submission. CC&nbsp;BY with
        retained copyright and no embargo satisfies the requirements of most
        funders, but a specific wording is easier to accommodate before
        acceptance than after.
      </p>

      <h2 id="third-party">Third-party material</h2>
      <p>
        Anything in your manuscript that you did not create is third-party
        material, and it is the authors&rsquo; responsibility to clear it before
        the article is published.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Figures and tables",
              "Reproduced or adapted from another publication — permission required, including where you have redrawn it.",
            ],
            [
              "Photographs and images",
              "Permission from the photographer or rights holder, plus consent from any identifiable person shown.",
            ],
            [
              "Instruments and scales",
              "Many questionnaires and psychometric scales are under copyright and licensed separately; check before reproducing one in an appendix.",
            ],
            [
              "Extended quotation",
              "Short quotation with citation is normally fair dealing; extended passages, and any quotation from poetry or song lyrics, need permission.",
            ],
            [
              "Datasets",
              "Reuse must be within the terms of the dataset's own licence, and the licence should be cited.",
            ],
            [
              "Maps and software output",
              "Check the source's terms — some permit reuse with attribution, others require written permission.",
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
        Attribution alone is not permission. Citing a source correctly satisfies
        the <Link href="/policies/plagiarism">plagiarism policy</Link>; it does
        not satisfy copyright law where the material is reproduced rather than
        described.
      </p>

      <h2 id="permission">Obtaining permission</h2>
      <p>
        Because the journal publishes under CC&nbsp;BY, permission must cover
        reuse under an open licence — not merely reproduction in one article.
        When you write to a rights holder, ask for permission to reproduce the
        material:
      </p>
      <ul>
        <li>In an open access article published under CC&nbsp;BY 4.0;</li>
        <li>Worldwide, in all formats, without a time limit;</li>
        <li>Including in translations and adaptations of the article.</li>
      </ul>
      <p>
        Where a rights holder will not grant those terms, the alternatives are
        to redraw the figure from the underlying data with the source cited, to
        describe the material rather than reproduce it, or to omit it. The
        journal cannot publish an item under more restrictive terms than the
        rest of the article; where an exception is unavoidable, the item carries
        its own rights line stating that it is excluded from the article&rsquo;s
        licence.
      </p>
      <p>
        Permissions should be obtained <strong>before submission</strong> and
        must be produced at acceptance. Requests to rights holders routinely
        take weeks, and an article is not published while a permission is
        outstanding.
      </p>

      <h2 id="moral">Moral rights and attribution</h2>
      <p>
        Retaining copyright does not exhaust an author&rsquo;s interest in their
        work. Independently of ownership, authors have the right to be
        identified as the authors of the article and to object to derogatory
        treatment of it. Nothing in the licence waives those rights.
      </p>
      <p>
        The CC&nbsp;BY licence requires anyone reusing the work to credit the
        authors, link to the licence, and state whether they made changes. An
        adaptation must not be presented in a way that suggests the original
        authors endorse it.
      </p>

      <h2 id="reusing">Reusing your own article</h2>
      <p>
        As copyright holder you need no permission from the journal to reuse
        your own work. You may, without asking:
      </p>
      <ul>
        <li>
          Deposit the published version in any repository, immediately and with
          no embargo;
        </li>
        <li>Include it as a chapter in your thesis or in a book;</li>
        <li>Reuse its text, figures and tables in later work;</li>
        <li>Translate it, or authorise a translation;</li>
        <li>Post it on your own site or a scholarly network;</li>
        <li>Distribute copies for teaching.</li>
      </ul>
      <p>
        The journal asks only that you cite the published version and its DOI,
        so readers can find the version of record. Where you reuse substantial
        text in a new manuscript, the disclosure requirements of the{" "}
        <Link href="/policies/plagiarism">plagiarism policy</Link> still apply —
        owning the copyright does not remove the obligation to tell readers what
        has been published before.
      </p>

      <h2 id="readers">What readers may do</h2>
      <p>
        Readers may share, adapt and build on any article, including
        commercially, provided they credit the authors and the journal, link to
        the licence and indicate changes. No permission request is necessary and
        none should be sent — the licence is the permission. The full terms are
        in the <Link href="/policies/licensing">licensing policy</Link>.
      </p>

      <h2 id="infringement">Infringement</h2>
      <p>
        Where an article published here appears to infringe someone&rsquo;s
        copyright, write to the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        identifying the article, the material concerned and the rights you hold.
        The journal investigates under the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        , asking the authors to respond. Where infringement is established, the
        journal publishes a correction removing or replacing the material, or
        retracts the article where the infringement goes to its substance.
      </p>
      <p>
        Where someone has used <em>your</em> published article beyond what
        CC&nbsp;BY allows — most commonly by republishing it without attribution
        — the right of action is yours, since you hold the copyright. The
        journal will confirm in writing the licence terms and the date of
        publication to support you, and will correct the record where the
        misuse concerns the journal&rsquo;s own identity.
      </p>
    </PolicyPage>
  );
}
