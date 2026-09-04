import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Authorship Policy",
  description:
    "Who qualifies as an author at BORJSS, how contributions are declared, the roles of corresponding and co-authors, and how changes and disputes are handled.",
};

const TOC = [
  { id: "criteria", label: "Who qualifies as an author" },
  { id: "acknowledgement", label: "Contributions that are acknowledged" },
  { id: "improper", label: "Improper authorship" },
  { id: "order", label: "Order of authors" },
  { id: "corresponding", label: "The corresponding author" },
  { id: "statement", label: "Contribution statement" },
  { id: "affiliation", label: "Affiliations and identifiers" },
  { id: "changes", label: "Changing the author list" },
  { id: "disputes", label: "Disputes" },
  { id: "deceased", label: "Deceased and uncontactable authors" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="authorship"
      title="Authorship Policy"
      lead="Authorship confers credit and carries accountability. This policy sets out who qualifies, how contributions are recorded, and what happens when the author list is contested."
      toc={TOC}
      updated="2026-01-15"
      related={["publication-ethics", "conflict-of-interest", "research-integrity"]}
    >
      <h2 id="criteria">Who qualifies as an author</h2>
      <p>
        {siteConfig.shortName} applies the four criteria set out by the
        International Committee of Medical Journal Editors, which are the
        standard across scholarly publishing. An author must meet{" "}
        <strong>all four</strong>:
      </p>
      <ol>
        <li>
          Substantial contribution to the conception or design of the work, or
          to the acquisition, analysis or interpretation of its data;
        </li>
        <li>
          Drafting the manuscript, or revising it critically for important
          intellectual content;
        </li>
        <li>Final approval of the version submitted for publication;</li>
        <li>
          Agreement to be accountable for all aspects of the work — meaning that
          questions about the accuracy or integrity of any part are properly
          investigated and resolved.
        </li>
      </ol>
      <p>
        Criteria three and four apply to every listed author without exception.
        An author who contributed to one section is still accountable for the
        whole, and must have read and approved what is being submitted under
        their name.
      </p>
      <p>
        Anyone who meets the first criterion should be given the opportunity to
        meet the others. Excluding a qualifying contributor is as serious as
        including someone who does not qualify.
      </p>

      <h2 id="acknowledgement">Contributions that are acknowledged</h2>
      <p>
        Real and valuable contributions that do not meet all four criteria
        belong in the acknowledgements, with the contribution described and the
        person&rsquo;s permission obtained. These typically include:
      </p>
      <ul>
        <li>Securing funding, alone;</li>
        <li>General supervision of a research group, alone;</li>
        <li>Providing access to a site, a population or materials;</li>
        <li>Data entry, transcription, translation or routine data collection;</li>
        <li>Language editing, proofreading or technical writing assistance;</li>
        <li>Comments on a draft that did not amount to critical revision.</li>
      </ul>
      <p>
        Use of a generative AI tool is never acknowledged as a contribution of
        this kind. AI tools cannot be authors and cannot be acknowledged as
        collaborators; their use is disclosed separately under the{" "}
        <Link href="/policies/ai-policy">AI-assisted writing policy</Link>.
      </p>

      <h2 id="improper">Improper authorship</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Gift authorship",
              "Listing someone as a favour, in exchange for a reciprocal listing, or to strengthen the paper's standing.",
            ],
            [
              "Guest authorship",
              "Adding a senior or well-known name that had no substantial involvement.",
            ],
            [
              "Coercive authorship",
              "A supervisor, head of department or funder requiring inclusion by virtue of their position.",
            ],
            [
              "Ghost authorship",
              "Omitting someone who qualifies — commonly a student, a junior researcher, or a professional writer.",
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
        All four are treated as misconduct under the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        . The journal recognises that coercive authorship is difficult for a
        junior researcher to refuse. A student or early-career researcher who
        raises such a concern with the editorial office will have it handled
        confidentially, and the journal will not disclose their identity to the
        person concerned.
      </p>

      <h2 id="order">Order of authors</h2>
      <p>
        The journal does not impose a convention on author order. Ordering
        practice differs across social science disciplines — contribution order
        in some, alphabetical in others — and the choice is the authors&rsquo;.
      </p>
      <p>
        What the journal requires is that the order be agreed by all authors
        before submission, and that it not be changed afterwards without the
        agreement of all. Where the order carries a specific meaning, or where
        two authors contributed equally, say so in a footnote.
      </p>

      <h2 id="corresponding">The corresponding author</h2>
      <p>
        One author is designated corresponding author. This is an administrative
        role, not a mark of seniority, and it carries specific duties:
      </p>
      <ul>
        <li>
          Managing communication with the journal through submission, review and
          production;
        </li>
        <li>
          Confirming that every listed author has seen and approved the
          submitted version and any revision;
        </li>
        <li>
          Ensuring that competing interests, funding, ethics approval and data
          availability are declared accurately for all authors;
        </li>
        <li>
          Remaining reachable after publication to respond to queries about the
          work;
        </li>
        <li>
          Acting on any error or concern raised, including initiating a
          correction.
        </li>
      </ul>
      <p>
        The corresponding author&rsquo;s email address is published with the
        article. Where it is an institutional address that may lapse, adding an{" "}
        <a href="https://orcid.org" target="_blank" rel="noreferrer">
          ORCID iD
        </a>{" "}
        keeps the author findable.
      </p>

      <h2 id="statement">Contribution statement</h2>
      <p>
        Every accepted manuscript carries a contribution statement, published
        with the article. It names each author and states what they did — the
        journal accepts either{" "}
        <a href="https://credit.niso.org" target="_blank" rel="noreferrer">
          CRediT
        </a>{" "}
        taxonomy terms or a plain sentence per author.
      </p>
      <p>
        A statement in which every author is credited with everything is not
        accepted; the point of the statement is to distinguish contributions.
        Where authorship is alphabetical and contribution genuinely equal, say
        that explicitly instead.
      </p>

      <h2 id="affiliation">Affiliations and identifiers</h2>
      <p>
        Each author lists the institution at which the work was carried out. A
        subsequent move is recorded as a present-address note rather than by
        replacing the original affiliation. Authors with more than one relevant
        affiliation may list both.
      </p>
      <p>
        An ORCID iD is strongly encouraged for every author and required for the
        corresponding author. It distinguishes authors who share a name and
        keeps the attribution durable — which matters most for authors publishing
        from institutions that are not widely indexed.
      </p>

      <h2 id="changes">Changing the author list</h2>
      <p>
        Adding, removing or reordering authors after submission requires a
        written request to the editorial office from the corresponding author,
        stating the reason, together with written confirmation of agreement from{" "}
        <strong>every</strong> author — including the person being added or
        removed.
      </p>
      <p>
        Requests received without complete agreement are not actioned; the
        manuscript is held until the matter is resolved. Changes after
        acceptance are made only where the reason is compelling, and changes
        after publication require a published correction under the{" "}
        <Link href="/policies/retraction-correction">
          retraction and correction policy
        </Link>
        .
      </p>

      <h2 id="disputes">Disputes</h2>
      <p>
        A journal is not able to adjudicate who contributed what to a piece of
        research — it was not present, and it has no means of establishing the
        facts. The journal therefore follows COPE guidance:
      </p>
      <ol>
        <li>
          On being notified of a dispute, the journal suspends handling of the
          manuscript, or, where already published, considers an expression of
          concern.
        </li>
        <li>
          The authors are asked to resolve it between themselves and report the
          agreed outcome in writing.
        </li>
        <li>
          Where they cannot, the matter is referred to the institution at which
          the research was conducted, which is the body able to investigate it.
        </li>
        <li>
          The journal acts on the institution&rsquo;s finding, correcting the
          record if the article has been published.
        </li>
      </ol>
      <p>
        A manuscript under an unresolved authorship dispute is not published.
      </p>

      <h2 id="deceased">Deceased and uncontactable authors</h2>
      <p>
        Where an author dies before publication, they remain listed and a
        footnote records this. The corresponding author confirms that the
        deceased author had approved the substance of the work, and, where
        practicable, informs their next of kin or department.
      </p>
      <p>
        Where an author cannot be contacted for approval of a revision, the
        corresponding author must tell the editorial office rather than
        proceeding on their behalf. The journal will decide how to proceed, and
        will not publish work an author has not approved unless satisfied that
        every reasonable effort to reach them has been made.
      </p>
      <p>
        Questions about any of the above can be sent to{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        .
      </p>
    </PolicyPage>
  );
}
