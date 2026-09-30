import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Publication Ethics Policy",
  description:
    "The ethical obligations BORJSS places on authors, reviewers and editors, the misconduct it acts on, and the procedure it follows when a concern is raised.",
};

const TOC = [
  { id: "basis", label: "Basis of this policy" },
  { id: "authors", label: "Duties of authors" },
  { id: "reviewers", label: "Duties of reviewers" },
  { id: "editors", label: "Duties of editors" },
  { id: "publisher", label: "Duties of the publisher" },
  { id: "misconduct", label: "What counts as misconduct" },
  { id: "procedure", label: "How concerns are handled" },
  { id: "sanctions", label: "Outcomes and sanctions" },
  { id: "raising", label: "Raising a concern" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="publication-ethics"
      title="Publication Ethics Policy"
      lead="This policy states what the journal expects of everyone involved in publishing a manuscript — authors, reviewers, editors and the publisher — and what happens when those expectations are not met."
      toc={TOC}
      related={["research-integrity", "plagiarism", "retraction-correction"]}
    >
      <h2 id="basis">Basis of this policy</h2>
      <p>
        {siteConfig.shortName} follows the{" "}
        <strong>COPE Core Practices</strong> and the principles of transparency
        and best practice set out jointly by COPE, the Directory of Open Access
        Journals, the Open Access Scholarly Publishers Association and the World
        Association of Medical Editors.
      </p>
      <p>
        Those documents describe the standards. This policy describes how the
        journal applies them in practice: who is responsible for what, and what
        procedure follows an allegation. Where a situation arises that this
        policy does not cover, COPE guidance and its published flowcharts apply.
      </p>

      <h2 id="authors">Duties of authors</h2>
      <p>
        By submitting a manuscript, every listed author confirms the following.
        These are conditions of submission, not aspirations.
      </p>
      <ul>
        <li>
          <strong>The work is original.</strong> It has not been published
          elsewhere and is not under consideration at another journal. Text and
          ideas taken from other sources are attributed. See the{" "}
          <Link href="/policies/plagiarism">plagiarism policy</Link>.
        </li>
        <li>
          <strong>The data are real and reported honestly.</strong> Results have
          not been fabricated, and images or figures have not been manipulated
          in a way that misrepresents what was observed.
        </li>
        <li>
          <strong>Authorship is accurate.</strong> Everyone listed meets the
          criteria in the{" "}
          <Link href="/policies/authorship">authorship policy</Link>, and nobody
          who meets them has been left off.
        </li>
        <li>
          <strong>Competing interests are declared.</strong> Financial and
          non-financial interests that a reader might reasonably consider
          relevant are disclosed at submission — see the{" "}
          <Link href="/policies/conflict-of-interest">
            conflict of interest policy
          </Link>
          .
        </li>
        <li>
          <strong>Human and animal research was approved.</strong> Where the
          research involved participants, their data, or animals, ethics
          approval and consent are documented under the{" "}
          <Link href="/policies/research-ethics">research ethics policy</Link>.
        </li>
        <li>
          <strong>Errors are reported.</strong> An author who discovers a
          significant error in their own published work must tell the editorial
          office promptly so it can be corrected or retracted.
        </li>
      </ul>

      <h2 id="reviewers">Duties of reviewers</h2>
      <p>
        Reviewers hold unpublished work in confidence and advise the editor
        honestly. In summary, a reviewer must:
      </p>
      <ul>
        <li>
          Decline an invitation where they have a competing interest, or where
          they cannot review within the agreed timeframe;
        </li>
        <li>
          Treat the manuscript as confidential — not sharing it, citing it, or
          entering any part of it into a generative AI service;
        </li>
        <li>
          Comment on the work rather than the author, and support criticism with
          reasons;
        </li>
        <li>
          Tell the editor of any substantial similarity to published work, or of
          any suspicion of misconduct, rather than acting on it themselves.
        </li>
      </ul>
      <p>
        These duties are set out in full in the{" "}
        <Link href="/policies/reviewer-ethics">peer reviewer ethics policy</Link>
        .
      </p>

      <h2 id="editors">Duties of editors</h2>
      <p>
        Editors decide what the journal publishes, and that authority carries
        corresponding obligations.
      </p>
      <ul>
        <li>
          <strong>Judge the work, not the author.</strong> Decisions rest on
          scholarly merit and fit with scope, without regard to the
          author&rsquo;s nationality, institution, gender, seniority, religion
          or politics.
        </li>
        <li>
          <strong>Stand back where interested.</strong> An editor with any
          competing interest in a submission — including one authored by a
          colleague or collaborator — hands it to another editor and takes no
          part in the decision.
        </li>
        <li>
          <strong>Keep submissions confidential.</strong> A manuscript is
          disclosed only to those involved in handling it.
        </li>
        <li>
          <strong>Act on concerns.</strong> A credible allegation is
          investigated, whether it arrives before or after publication, and
          however long ago the article appeared.
        </li>
        <li>
          <strong>Correct the record.</strong> Where something published is
          wrong, the journal publishes a correction or retraction promptly and
          visibly.
        </li>
      </ul>
      <p>
        Editorial decisions are not subject to commercial or institutional
        influence — see{" "}
        <Link href="/policies/editorial-independence">
          editorial independence
        </Link>
        .
      </p>

      <h2 id="publisher">Duties of the publisher</h2>
      <p>
        The publisher supports editorial independence rather than directing it.
        It is responsible for maintaining the published record, ensuring that
        articles remain accessible under the journal&rsquo;s{" "}
        <Link href="/policies/open-access">open access policy</Link>, and
        ensuring that a change of editor, ownership or funding does not affect
        decisions already taken or the availability of what has been published.
      </p>

      <h2 id="misconduct">What counts as misconduct</h2>
      <p>
        The journal treats the following as publication misconduct. The list is
        illustrative rather than exhaustive.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Fabrication",
              "Reporting data, results or sources that do not exist.",
            ],
            [
              "Falsification",
              "Manipulating data, images or method descriptions so that the research is misrepresented.",
            ],
            [
              "Plagiarism",
              "Presenting another person's text, ideas or data as one's own, including self-plagiarism of substantial passages.",
            ],
            [
              "Redundant publication",
              "Publishing the same work, or substantially the same work, more than once without disclosure.",
            ],
            [
              "Salami slicing",
              "Splitting one study into several papers to inflate output, where the parts share method and dataset.",
            ],
            [
              "Improper authorship",
              "Gift, guest or ghost authorship, or omitting someone who qualifies.",
            ],
            [
              "Undisclosed competing interest",
              "Withholding an interest a reader would reasonably consider relevant.",
            ],
            [
              "Citation manipulation",
              "Adding citations that serve to inflate a metric rather than support the argument.",
            ],
            [
              "Peer review manipulation",
              "Supplying false reviewer identities or contact details, or arranging favourable review.",
            ],
            [
              "Ethics breach",
              "Conducting research on people or animals without required approval or consent.",
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
        Honest error is not misconduct. A mistake found and reported in good
        faith is corrected, and the author is thanked rather than sanctioned.
        The distinction the journal draws is intent and candour, not the size of
        the error.
      </p>

      <h2 id="procedure">How concerns are handled</h2>
      <p>
        Every credible concern follows the same procedure, whatever its source
        and whoever it concerns.
      </p>
      <ol>
        <li>
          <strong>Assessment.</strong> The editorial office establishes whether
          the concern is specific enough to act on. Anonymous allegations are
          considered, but only where they present evidence that can be checked
          independently of the person raising it.
        </li>
        <li>
          <strong>Author response.</strong> The corresponding author is told
          what has been alleged and given a fair opportunity to respond, usually
          within 21 days. The identity of the person raising the concern is not
          disclosed.
        </li>
        <li>
          <strong>Review.</strong> An editor with no involvement in the original
          decision examines the response, and may seek independent expert advice.
        </li>
        <li>
          <strong>Institutional referral.</strong> Where the allegation concerns
          research conduct rather than publication conduct — fabrication or
          ethics breach, for instance — the matter is referred to the
          author&rsquo;s institution, which is the body able to investigate it.
          The journal does not attempt to run that investigation itself.
        </li>
        <li>
          <strong>Outcome.</strong> A decision is taken, recorded, and
          communicated to the author and to the person who raised the concern.
        </li>
      </ol>
      <p>
        Where an article is under investigation and the concern is serious, the
        journal may publish an expression of concern while the matter is
        resolved, so that readers are not misled in the meantime.
      </p>

      <h2 id="sanctions">Outcomes and sanctions</h2>
      <p>
        The response is proportionate to what is established. Depending on
        severity, the journal may:
      </p>
      <ul>
        <li>Take no action, where the concern is not substantiated;</li>
        <li>Ask the author to correct the manuscript before publication;</li>
        <li>
          Publish a correction, an expression of concern, or a retraction under
          the{" "}
          <Link href="/policies/retraction-correction">
            retraction and correction policy
          </Link>
          ;
        </li>
        <li>Reject the manuscript under consideration;</li>
        <li>Inform the author&rsquo;s institution and any funder;</li>
        <li>
          Decline further submissions from the author for a stated period, where
          misconduct was deliberate and serious.
        </li>
      </ul>
      <p>
        An author may appeal any of these outcomes through the{" "}
        <Link href="/policies/complaints-appeals">
          complaints and appeals policy
        </Link>
        .
      </p>

      <h2 id="raising">Raising a concern</h2>
      <p>
        Concerns about a published article or a manuscript under consideration
        should be sent to the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        . Include the article title or manuscript ID, what specifically is
        alleged, and any evidence — a comparison of passages, a source, or a
        figure.
      </p>
      <p>
        Concerns are acknowledged within five working days. Everyone involved is
        treated as acting in good faith until the evidence shows otherwise, and
        the confidentiality of both parties is maintained throughout.
      </p>
    </PolicyPage>
  );
}
