import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Conflict of Interest Policy",
  description:
    "What BORJSS requires authors, reviewers and editors to disclose, what counts as a competing interest, and what happens when one is found undisclosed.",
};

const TOC = [
  { id: "principle", label: "The principle" },
  { id: "what-counts", label: "What counts as a competing interest" },
  { id: "authors", label: "Disclosure by authors" },
  { id: "funding", label: "Funding" },
  { id: "reviewers", label: "Disclosure by reviewers" },
  { id: "editors", label: "Disclosure by editors" },
  { id: "editor-submissions", label: "Submissions from editors" },
  { id: "publication", label: "What readers see" },
  { id: "undisclosed", label: "Undisclosed interests" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="conflict-of-interest"
      title="Conflict of Interest Policy"
      lead="A competing interest is not misconduct. Failing to declare one is. This policy sets out what must be disclosed, by whom, and what the journal does with the disclosure."
      toc={TOC}
      updated="2026-01-15"
      related={["publication-ethics", "editorial-independence", "reviewer-ethics"]}
    >
      <h2 id="principle">The principle</h2>
      <p>
        A competing interest exists where a person involved in publishing a
        manuscript has a relationship or commitment that a reasonable reader
        might think could have influenced their judgement — whether or not it
        actually did.
      </p>
      <p>
        The test is deliberately set at appearance rather than effect. Nobody
        can demonstrate that their own judgement was unaffected, and asking them
        to try is the wrong question. The journal&rsquo;s position is therefore
        simple: <strong>declare it and let the reader weigh it</strong>.
      </p>
      <p>
        Having an interest rarely stops a manuscript being published or a review
        being accepted. Most declared interests are recorded and the work
        proceeds normally. What triggers action is concealment.
      </p>

      <h2 id="what-counts">What counts as a competing interest</h2>
      <p>
        Interests are financial and non-financial. In the social sciences the
        non-financial ones are usually the more consequential, and are the ones
        most often overlooked.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Employment and consultancy",
              "Employment, paid advisory roles, consultancy or expert-witness work with an organisation with a stake in the findings.",
            ],
            [
              "Funding",
              "Grants, contracts, fellowships or in-kind support for this work or related work, including where the funder had no role.",
            ],
            [
              "Financial holdings",
              "Shares, patents, royalties or any financial interest whose value could be affected by the findings.",
            ],
            [
              "Payments in kind",
              "Travel, accommodation, honoraria, equipment or fees from an interested party.",
            ],
            [
              "Personal relationships",
              "Family, close friendship, or a current or recent partnership with someone the work concerns or evaluates.",
            ],
            [
              "Institutional interests",
              "Research evaluating the author's own employer, programme, department or intervention.",
            ],
            [
              "Political and advocacy roles",
              "Membership of, office in, or active advocacy for a party, movement or campaign the work bears on.",
            ],
            [
              "Intellectual commitments",
              "A public position, prior publication or contested theory the author has a stake in defending.",
            ],
            [
              "Recent collaboration",
              "Co-authorship, shared grants, or a supervisory relationship within the previous three years.",
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
        Where you are unsure whether something qualifies, declare it. An
        unnecessary declaration costs nothing; an omitted one can cost a
        published article.
      </p>

      <h2 id="authors">Disclosure by authors</h2>
      <p>
        Every author declares their own interests at submission. The
        corresponding author collects these and confirms they are complete — but
        each author remains responsible for the accuracy of their own.
      </p>
      <p>
        Declarations cover the period of the work and the{" "}
        <strong>three years</strong> preceding submission. They belong in a
        competing-interests statement in the manuscript, which is published with
        the article. Where there are none, the statement says so explicitly:
        &ldquo;The authors declare no competing interests.&rdquo; A missing
        statement is not read as an absence of interests, and the manuscript is
        returned for one.
      </p>
      <p>
        An interest arising after submission — a new post, a new grant — must be
        reported to the editorial office as it arises, not left until
        publication.
      </p>

      <h2 id="funding">Funding</h2>
      <p>
        All funding is declared, naming the funder and the grant or award
        number, together with a statement of the funder&rsquo;s role in the
        design, conduct, analysis, or decision to publish. Where the funder had
        no such role, say so.
      </p>
      <p>
        The journal will not publish work where a funder holds a right of veto
        over publication, or where publication was conditional on the findings.
        A contractual right to review a draft before submission is acceptable
        only if it carries no right to require changes, and the arrangement is
        disclosed.
      </p>
      <p>
        Research that is unfunded is declared as unfunded, which is a
        meaningful piece of information rather than a gap to leave blank.
      </p>

      <h2 id="reviewers">Disclosure by reviewers</h2>
      <p>
        A reviewer assesses their position before accepting an invitation, on
        the basis of the manuscript title and abstract. They must decline where
        they have a competing interest of the kinds listed above, and in
        particular where they have, within three years, co-authored with an
        author, worked at the same institution, or held a supervisory
        relationship.
      </p>
      <p>
        Under double-blind review a reviewer may not know who the authors are.
        Where they come to recognise the authorship during review and a
        competing interest follows from it, they must stop and tell the handling
        editor rather than complete the report. The full set of obligations is
        in the{" "}
        <Link href="/policies/reviewer-ethics">peer reviewer ethics policy</Link>
        .
      </p>
      <p>
        A lesser interest — knowing the field closely, or having published a
        contrary view — is disclosed to the editor rather than treated as
        disqualifying. The editor decides whether it affects the weight given to
        the report.
      </p>

      <h2 id="editors">Disclosure by editors</h2>
      <p>
        Editors and editorial board members disclose their interests to the
        Editor-in-Chief on appointment and update the disclosure annually.
      </p>
      <p>
        A handling editor with a competing interest in a specific submission
        transfers it to another editor immediately, takes no part in reviewer
        selection or the decision, and has no access to the reviewer identities.
        The transfer is recorded. Where the Editor-in-Chief is the interested
        party, another member of the editorial board takes the decision.
      </p>

      <h2 id="editor-submissions">Submissions from editors</h2>
      <p>
        Editors and board members may submit their own work to the journal, and
        it is assessed on the same terms as anyone else&rsquo;s. Three
        safeguards apply:
      </p>
      <ul>
        <li>
          The submission is handled by an editor with no reporting relationship
          to the author, and the author has no access to any part of its record;
        </li>
        <li>
          Reviewers are selected by that handling editor alone, and are
          independent of the author&rsquo;s institution;
        </li>
        <li>
          The published article states that an author is a member of the
          editorial team and that they were excluded from the decision.
        </li>
      </ul>
      <p>
        The journal monitors the proportion of published work authored by its
        own editorial team, and reports it in the annual editorial statement.
        See{" "}
        <Link href="/policies/editorial-independence">
          editorial independence
        </Link>
        .
      </p>

      <h2 id="publication">What readers see</h2>
      <p>
        The competing-interests statement and the funding statement are
        published with every article, whether or not anything was declared.
        Where an author is a member of the editorial team, that is stated too.
      </p>
      <p>
        Reviewer and editor disclosures are held by the editorial office and are
        not published, because publishing them under a double-blind model would
        identify the reviewers.
      </p>

      <h2 id="undisclosed">Undisclosed interests</h2>
      <p>
        Where an undisclosed interest comes to light, the journal establishes
        the facts and asks the person concerned to explain, following the
        procedure in the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        . The response is proportionate:
      </p>
      <ul>
        <li>
          <strong>Before publication</strong> — the statement is corrected, and
          where the interest is material the manuscript may be reassessed or
          reviewed afresh by different reviewers.
        </li>
        <li>
          <strong>After publication</strong> — a correction is published
          amending the statement. Where the interest is serious enough that
          readers would have judged the work differently, an expression of
          concern or a retraction may follow under the{" "}
          <Link href="/policies/retraction-correction">
            retraction and correction policy
          </Link>
          .
        </li>
        <li>
          <strong>Reviewers and editors</strong> — a report from a reviewer with
          a concealed interest is discarded and the manuscript re-reviewed. An
          editor who concealed one is removed from the manuscript, and, where
          deliberate, from the editorial team.
        </li>
      </ul>
      <p>
        Questions about whether something needs declaring can be sent to the
        editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        before submission. Asking is never held against an author.
      </p>
    </PolicyPage>
  );
}
