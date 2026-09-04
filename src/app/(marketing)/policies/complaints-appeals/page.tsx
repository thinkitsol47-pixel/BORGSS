import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Complaints & Appeals Policy",
  description:
    "How to appeal an editorial decision at BORJSS, how to complain about process or conduct, what happens at each stage, and where to go if the journal's answer does not satisfy you.",
};

const TOC = [
  { id: "scope", label: "What this policy covers" },
  { id: "appeal-grounds", label: "Grounds for an appeal" },
  { id: "not-grounds", label: "What is not a ground" },
  { id: "how-appeal", label: "How to appeal" },
  { id: "appeal-process", label: "How an appeal is handled" },
  { id: "complaints", label: "Complaints" },
  { id: "how-complain", label: "How to complain" },
  { id: "complaint-process", label: "How a complaint is handled" },
  { id: "against-eic", label: "Complaints about the Editor-in-Chief" },
  { id: "timelines", label: "Timelines" },
  { id: "protection", label: "No disadvantage for complaining" },
  { id: "external", label: "If you remain dissatisfied" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="complaints-appeals"
      title="Complaints & Appeals Policy"
      lead="Editors make mistakes, and processes go wrong. This policy sets out how to challenge a decision, how to complain about how you were treated, and what the journal will do about it."
      toc={TOC}
      updated="2026-01-15"
      related={["peer-review", "publication-ethics", "editorial-independence"]}
    >
      <h2 id="scope">What this policy covers</h2>
      <p>
        The policy covers two different things, which are handled differently.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "An appeal",
              "A request to reconsider an editorial decision on a specific manuscript — a desk rejection, a rejection after review, or a retraction.",
            ],
            [
              "A complaint",
              "A concern about how the journal behaved: process failures, delays, conduct, discrimination, or a policy not being followed.",
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
        Allegations of misconduct <em>by an author</em> are not complaints under
        this policy; they are handled under the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        . Requests to correct a published article are handled under the{" "}
        <Link href="/policies/retraction-correction">
          retraction and correction policy
        </Link>
        .
      </p>

      <h2 id="appeal-grounds">Grounds for an appeal</h2>
      <p>
        An appeal must identify something that went wrong in reaching the
        decision, not simply disagree with it. The journal considers appeals on
        these grounds:
      </p>
      <ul>
        <li>
          <strong>Factual error.</strong> A reviewer or editor based their
          assessment on a statement of fact that is demonstrably wrong.
        </li>
        <li>
          <strong>Misunderstanding of the method.</strong> A criticism rests on
          a misreading of what was done — for example treating a deliberate
          design choice as an oversight.
        </li>
        <li>
          <strong>Missed expertise.</strong> No reviewer had the specific
          expertise the manuscript required, and the assessment suffered for it.
        </li>
        <li>
          <strong>Undisclosed competing interest.</strong> A reviewer or editor
          held an interest that should have led them to decline, under the{" "}
          <Link href="/policies/conflict-of-interest">
            conflict of interest policy
          </Link>
          .
        </li>
        <li>
          <strong>Procedural failure.</strong> The decision did not follow the{" "}
          <Link href="/policies/peer-review">peer review policy</Link> — fewer
          reviews than required, for instance.
        </li>
        <li>
          <strong>Bias.</strong> The decision appears to have turned on the
          authors&rsquo; identity, institution, nationality or command of
          English rather than on the work.
        </li>
      </ul>

      <h2 id="not-grounds">What is not a ground</h2>
      <p>
        Peer review is a matter of expert judgement, and disagreeing with that
        judgement is not itself grounds for appeal. The following are not
        considered:
      </p>
      <ul>
        <li>
          Believing the reviewers undervalued the work, or that a different
          reviewer would have been more favourable;
        </li>
        <li>
          Disagreeing that the manuscript falls outside the journal&rsquo;s{" "}
          <Link href="/about/aims-scope">aims and scope</Link>;
        </li>
        <li>Urgency — a deadline, a probation date, a funding round;</li>
        <li>
          Objection to the tone of a report, which is a complaint rather than an
          appeal, and is dealt with below;
        </li>
        <li>
          New data or a substantially revised manuscript, which should be
          submitted afresh rather than appealed. Say in the cover letter that it
          follows an earlier declined submission, and give the manuscript ID.
        </li>
      </ul>

      <h2 id="how-appeal">How to appeal</h2>
      <p>
        The corresponding author writes to{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        with &ldquo;Appeal&rdquo; and the manuscript ID in the subject line,
        within <strong>30 days</strong> of the decision. A later appeal is
        considered only where there is a good reason for the delay.
      </p>
      <p>The letter should contain:</p>
      <ul>
        <li>The manuscript ID, title and decision date;</li>
        <li>Which of the grounds above is being relied on;</li>
        <li>
          A point-by-point response to the specific reviewer or editor comments
          at issue, with the evidence for each;
        </li>
        <li>
          Where relevant, where in the manuscript the answer already appears.
        </li>
      </ul>
      <p>
        Address the argument rather than the reviewers. An appeal is assessed on
        what it demonstrates, and one that is specific and evidenced is far more
        likely to succeed than one that is emphatic.
      </p>
      <p>
        One appeal per decision. The outcome of an appeal is final, and the same
        manuscript is not reconsidered again.
      </p>

      <h2 id="appeal-process">How an appeal is handled</h2>
      <ol>
        <li>
          <strong>Acknowledgement</strong> within five working days, with the
          name of the person handling it.
        </li>
        <li>
          <strong>Assignment.</strong> The appeal goes to an editor who took no
          part in the original decision. Where the Editor-in-Chief took it, a
          member of the editorial board handles the appeal.
        </li>
        <li>
          <strong>Review.</strong> That editor reads the manuscript, the
          reports, the decision letter and the appeal. They may consult the
          original reviewers, seek a fresh independent review, or take advice
          from a board member.
        </li>
        <li>
          <strong>Outcome</strong>, communicated in writing with reasons. One of
          three: the appeal is upheld and the manuscript returns to review or to
          a revision decision; it is upheld in part, with a specified further
          step; or it is not upheld and the original decision stands.
        </li>
      </ol>
      <p>
        Appeals are decided on the merits of the manuscript, not on the vigour
        with which they are pressed. Most are not upheld — which is why the
        journal states its grounds openly, so that authors can judge before
        writing whether they have one.
      </p>

      <h2 id="complaints">Complaints</h2>
      <p>
        A complaint concerns how the journal acted rather than what it decided.
        The journal accepts complaints from authors, reviewers, readers and
        anyone else who has dealt with it, about:
      </p>
      <ul>
        <li>
          <strong>Process</strong> — a policy not followed, a stage skipped, a
          decision taken without the required reviews;
        </li>
        <li>
          <strong>Delay</strong> — a manuscript stalled well beyond the
          published timelines without explanation;
        </li>
        <li>
          <strong>Conduct</strong> — a discourteous, abusive or personal
          reviewer report, or unprofessional conduct by an editor or member of
          the editorial office;
        </li>
        <li>
          <strong>Discrimination</strong> — treatment turning on nationality,
          institution, gender, religion, seniority or language;
        </li>
        <li>
          <strong>Confidentiality</strong> — a breach of the confidentiality of
          a manuscript or of a reviewer&rsquo;s identity;
        </li>
        <li>
          <strong>Independence</strong> — a decision that appears to have been
          influenced by commercial, institutional or political pressure, under{" "}
          <Link href="/policies/editorial-independence">
            editorial independence
          </Link>
          ;
        </li>
        <li>
          <strong>Published content</strong> — an error, an ethical concern, or
          a copyright problem in an article;
        </li>
        <li>
          <strong>The website</strong> — accessibility barriers, broken
          functionality, or the handling of personal data under the{" "}
          <Link href="/policies/privacy">privacy policy</Link>.
        </li>
      </ul>

      <h2 id="how-complain">How to complain</h2>
      <p>
        Write to{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        with &ldquo;Complaint&rdquo; in the subject line, stating what happened,
        when, who was involved if known, any manuscript ID, and what outcome you
        are seeking — an apology, a correction, a change of process, or simply
        that it be recorded.
      </p>
      <p>
        Complaints are best raised within three months of what they concern,
        while the record is fresh, but a later complaint about something serious
        is still considered.
      </p>
      <p>
        Anonymous complaints are read and acted on where they contain enough
        specific detail to be checked independently. The journal cannot report
        an outcome to an anonymous complainant, and a complaint from a named
        person is easier to investigate — but a concern raised anonymously is
        not dismissed for that reason.
      </p>

      <h2 id="complaint-process">How a complaint is handled</h2>
      <ol>
        <li>
          <strong>Acknowledgement</strong> within five working days, naming the
          person responsible for it.
        </li>
        <li>
          <strong>Assignment</strong> to someone with no involvement in what is
          complained about. A complaint is never investigated by its subject.
        </li>
        <li>
          <strong>Investigation.</strong> The record is examined, and anyone the
          complaint concerns is told what has been said and given the
          opportunity to respond.
        </li>
        <li>
          <strong>Outcome</strong> in writing: what was found, whether the
          complaint is upheld in whole or in part, and what will be done about
          it.
        </li>
        <li>
          <strong>Review.</strong> A complainant who considers the outcome
          inadequate may ask for it to be reviewed once by the Editor-in-Chief,
          or where they were involved, by the editorial board.
        </li>
      </ol>
      <p>
        Where a complaint is upheld, the journal says so plainly, apologises
        where an apology is owed, and states what has changed. Where a reviewer
        report was discourteous, the journal will normally have removed the
        offending comments before the report reached the author; where it did
        not, that is a failure by the handling editor and is treated as such.
      </p>
      <p>
        Complaints and their outcomes are recorded, so that recurring problems
        become visible. Persistent failure by a reviewer or editor to meet these
        standards leads to their removal from the journal&rsquo;s roster.
      </p>

      <h2 id="against-eic">Complaints about the Editor-in-Chief</h2>
      <p>
        A complaint about the Editor-in-Chief, or about a decision they took
        personally, is directed to the editorial board, which considers it
        without them. Mark such correspondence &ldquo;For the editorial
        board&rdquo;; the editorial office passes it on unopened.
      </p>
      <p>
        Where a complaint concerns the conduct of the publisher — commercial
        pressure on editorial decisions, for instance — it is considered by the
        Editor-in-Chief together with the editorial board, and the outcome is
        reported to the complainant regardless of what it implies for the
        journal.
      </p>

      <h2 id="timelines">Timelines</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            ["Acknowledgement", "5 working days"],
            ["Appeal decision", "Within 6 weeks"],
            ["Appeal needing fresh review", "Within 10 weeks"],
            ["Complaint outcome", "Within 4 weeks"],
            ["Complaint needing investigation", "Within 8 weeks"],
            [
              "Referred to an institution",
              "As long as the institution takes; you are updated every 8 weeks",
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
        Where a case will take longer than these targets, the journal says so
        and explains why, rather than leaving the person waiting.
      </p>

      <h2 id="protection">No disadvantage for complaining</h2>
      <p>
        Raising an appeal or a complaint does not prejudice how you are treated
        afterwards. Future submissions from an author who has complained are
        assessed on the same terms as anyone else&rsquo;s, and the fact of a
        complaint is not disclosed to reviewers or handling editors of later
        manuscripts.
      </p>
      <p>
        The journal is aware that a junior researcher complaining about a senior
        figure takes a real risk. Where you ask for your identity to be withheld
        from the person concerned, the journal will do so wherever the
        investigation permits, and will tell you in advance if it cannot.
      </p>

      <h2 id="external">If you remain dissatisfied</h2>
      <p>
        Where the journal&rsquo;s own review has concluded and you are still not
        satisfied, you may refer the matter to{" "}
        <a href="https://publicationethics.org" target="_blank" rel="noreferrer">
          COPE
        </a>
        , whose Core Practices these policies follow. COPE does not investigate
        individual cases or overturn editorial decisions, but it does consider
        whether a journal&rsquo;s handling of a matter met the expected
        standards.
      </p>
      <p>
        Complaints about the handling of personal data may also be raised with
        the relevant data protection authority — see the{" "}
        <Link href="/policies/privacy">privacy policy</Link>.
      </p>
    </PolicyPage>
  );
}
