import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Peer Review Policy",
  description:
    "How BORJSS operates double-blind peer review: reviewer selection, what reviewers assess, decision-making, timelines and appeals.",
};

const TOC = [
  { id: "model", label: "Review model" },
  { id: "desk", label: "Desk assessment" },
  { id: "selection", label: "Reviewer selection" },
  { id: "criteria", label: "What reviewers assess" },
  { id: "decisions", label: "Decisions" },
  { id: "timelines", label: "Timelines" },
  { id: "disagreement", label: "Disagreement between reviewers" },
  { id: "confidentiality", label: "Confidentiality" },
  { id: "appeals", label: "Appeals" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="peer-review"
      title="Peer Review Policy"
      lead="Every manuscript published in this journal has passed double-blind review by at least two independent experts. This is how that process works."
      toc={TOC}
      updated="2026-01-15"
      related={["reviewer-ethics", "editorial-independence", "complaints-appeals"]}
    >
      <h2 id="model">Review model</h2>
      <p>
        {siteConfig.shortName} operates <strong>double-blind peer review</strong>.
        Authors are not told who reviewed their manuscript, and reviewers are not
        told who wrote it. Neither party learns the other&rsquo;s identity at any
        point, including after publication.
      </p>
      <p>
        This model is used because it reduces the influence of an author&rsquo;s
        seniority, institution or nationality on how their work is judged — a
        particular concern for a journal publishing research from institutions
        that are not internationally well known.
      </p>
      <p>
        It places one obligation on authors: the main manuscript file must be
        anonymised before submission. Files that identify their authors are
        returned at desk check. The{" "}
        <Link href="/for-authors/guidelines">author guidelines</Link> set out
        exactly what to remove.
      </p>

      <h2 id="desk">Desk assessment</h2>
      <p>
        Before review begins, the editorial office checks each submission
        against four criteria. A manuscript may be declined at this stage
        without external review, normally within five working days.
      </p>
      <ul>
        <li>
          <strong>Scope.</strong> Does the manuscript fall within the
          journal&rsquo;s <Link href="/about/aims-scope">aims and scope</Link>?
          Work outside it is declined regardless of quality.
        </li>
        <li>
          <strong>Anonymity.</strong> Is the main file free of author names,
          affiliations, acknowledgements and identifying document properties?
        </li>
        <li>
          <strong>Completeness.</strong> Are all required files and declarations
          present?
        </li>
        <li>
          <strong>Originality.</strong> Does the manuscript pass similarity
          screening? See the{" "}
          <Link href="/policies/plagiarism">plagiarism policy</Link>.
        </li>
      </ul>
      <p>
        A desk decline is not a judgement on the research. Where the reason is
        fit rather than quality, we say so, and suggest a more suitable venue
        where we can.
      </p>

      <h2 id="selection">Reviewer selection</h2>
      <p>
        A handling editor with expertise in the subject area is assigned to each
        manuscript that passes desk check. They select reviewers on the basis of
        published expertise in the specific question the manuscript addresses —
        not general seniority.
      </p>
      <p>
        Every manuscript receives <strong>at least two</strong> independent
        reviews. Reviewers must have no competing interest with the work, which
        excludes anyone who has:
      </p>
      <ul>
        <li>Co-authored with an author in the previous three years;</li>
        <li>Worked at the same institution in the previous three years;</li>
        <li>
          A personal, financial or supervisory relationship with an author;
        </li>
        <li>
          A competing manuscript of their own under consideration on the same
          question.
        </li>
      </ul>
      <p>
        Reviewers are asked to decline if any of these apply, or if they become
        aware of one partway through a review. Authors may name reviewers they
        would prefer be excluded, with reasons; such requests are honoured where
        the reason is legitimate.
      </p>

      <h2 id="criteria">What reviewers assess</h2>
      <p>
        Reviewers report against six areas, and are asked to state clearly which
        of their comments must be addressed and which are suggestions:
      </p>
      <ol>
        <li>
          <strong>Originality and contribution</strong> — does the manuscript
          add to what is already established?
        </li>
        <li>
          <strong>Methodology</strong> — is the design appropriate, and
          described in enough detail to be repeated?
        </li>
        <li>
          <strong>Results and interpretation</strong> — are the findings
          reported clearly, and do the conclusions stay within what the evidence
          supports?
        </li>
        <li>
          <strong>Literature and framing</strong> — is the relevant scholarship
          engaged with, including work that complicates the argument?
        </li>
        <li>
          <strong>Presentation</strong> — is the structure and language clear
          enough that the argument can be followed?
        </li>
        <li>
          <strong>Ethics and integrity</strong> — are ethics approval, funding,
          competing interests and data availability properly declared?
        </li>
      </ol>
      <p>
        Reviewers advise; they do not decide. Full guidance is set out in the{" "}
        <Link href="/for-reviewers/guidelines">reviewer guidelines</Link>.
      </p>

      <h2 id="decisions">Decisions</h2>
      <p>
        The handling editor weighs the reports and recommends one of four
        outcomes. The Editor-in-Chief confirms the decision. Authors receive the
        full reviewer comments whatever the outcome.
      </p>
      <ul>
        <li>
          <strong>Accept</strong> — publishable as submitted. Rare at first
          decision.
        </li>
        <li>
          <strong>Minor revision</strong> — small corrections needed; not
          normally re-reviewed externally.
        </li>
        <li>
          <strong>Major revision</strong> — substantive work needed on method,
          analysis or argument; normally returns to the original reviewers.
        </li>
        <li>
          <strong>Reject</strong> — the work cannot reach publishable standard
          through revision, or falls outside scope.
        </li>
      </ul>
      <p>
        An invitation to revise is not a guarantee of acceptance. A revised
        manuscript that does not address the substantive concerns may still be
        declined.
      </p>

      <h2 id="timelines">Timelines</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            ["Desk assessment", "3–5 working days"],
            ["Peer review", "4–6 weeks"],
            ["Decision after reports received", "Within 1 week"],
            ["Minor revision", "30 days for the author"],
            ["Major revision", "60 days for the author"],
            ["Median time to first decision", "Approximately 6 weeks"],
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
        These are targets, not guarantees. Where a stage runs materially longer
        — usually because a reviewer has withdrawn late — the editorial office
        tells the author rather than leaving them to wonder. Authors may request
        a status update at any time, quoting their manuscript ID.
      </p>

      <h2 id="disagreement">Disagreement between reviewers</h2>
      <p>
        Reviewers frequently disagree, and that disagreement is useful rather
        than a problem to be resolved by averaging. Where two reports point to
        materially different conclusions, the handling editor either:
      </p>
      <ul>
        <li>
          Seeks a third independent review, where the disagreement concerns a
          matter of fact or method that a further specialist can settle; or
        </li>
        <li>
          Makes a reasoned judgement between them, explaining to the author
          which concerns must be addressed and which they may respond to by
          argument rather than change.
        </li>
      </ul>
      <p>
        Authors are entitled to disagree with a reviewer. A revision response
        that explains, with reasons, why a suggested change has not been made is
        a legitimate response and is considered on its merits.
      </p>

      <h2 id="confidentiality">Confidentiality</h2>
      <p>
        A manuscript under review is a confidential document. Reviewers may not
        share it, discuss it with colleagues without the editor&rsquo;s
        permission, cite it, or use its findings to advance their own work. They
        must not retain a copy after submitting their report.
      </p>
      <p>
        Reviewers must not enter any part of a manuscript into a generative AI
        service. Doing so transmits confidential unpublished work to a third
        party and is treated as a breach of confidentiality. See the{" "}
        <Link href="/policies/ai-policy">AI-assisted writing policy</Link>.
      </p>

      <h2 id="appeals">Appeals</h2>
      <p>
        Authors may appeal a decision they believe rested on a factual error, a
        clear misunderstanding of the method, or a reviewer with an undisclosed
        competing interest. Appeals are considered by an editor who was not
        involved in the original decision.
      </p>
      <p>
        Disagreement with a reviewer&rsquo;s judgement is not itself grounds for
        appeal. The procedure, and what to include, is set out in the{" "}
        <Link href="/policies/complaints-appeals">
          complaints and appeals policy
        </Link>
        .
      </p>
    </PolicyPage>
  );
}
