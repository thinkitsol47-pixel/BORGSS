import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Peer Reviewer Ethics Policy",
  description:
    "The obligations BORJSS places on peer reviewers: accepting or declining, confidentiality, the AI prohibition, tone, suspected misconduct, and reviewer misconduct.",
};

const TOC = [
  { id: "role", label: "The reviewer's role" },
  { id: "accepting", label: "Accepting or declining" },
  { id: "confidentiality", label: "Confidentiality" },
  { id: "ai", label: "Generative AI" },
  { id: "conduct", label: "Conducting the review" },
  { id: "tone", label: "Tone and criticism" },
  { id: "anonymity", label: "Anonymity" },
  { id: "misconduct-found", label: "Suspected misconduct" },
  { id: "reviewer-misconduct", label: "Reviewer misconduct" },
  { id: "recognition", label: "Recognition" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="reviewer-ethics"
      title="Peer Reviewer Ethics Policy"
      lead="Reviewing gives you privileged access to someone else's unpublished work and real influence over whether it appears. This policy sets out the obligations that come with that."
      toc={TOC}
      updated="2026-01-15"
      related={["peer-review", "conflict-of-interest", "ai-policy"]}
    >
      <h2 id="role">The reviewer&rsquo;s role</h2>
      <p>
        A reviewer advises the handling editor. They assess whether the work is
        sound, whether the conclusions follow from the evidence, and what would
        need to change for the manuscript to be publishable. They do not decide
        the outcome — that rests with the editor under the{" "}
        <Link href="/policies/peer-review">peer review policy</Link>.
      </p>
      <p>
        The obligations below apply from the moment an invitation arrives, and
        continue indefinitely after the review is submitted. Accepting an
        invitation is acceptance of them.
      </p>

      <h2 id="accepting">Accepting or declining</h2>
      <p>
        Decline promptly rather than accepting and hoping. A declined invitation
        costs the author a day; an accepted one that goes unanswered costs them
        a month. Decline where:
      </p>
      <ul>
        <li>
          <strong>You lack the expertise.</strong> Reviewing outside your
          competence produces advice the editor cannot use. Where you can
          assess part of the manuscript — the method but not the theory — accept
          and say so, so the editor can find a second reviewer for the rest.
        </li>
        <li>
          <strong>You have a competing interest.</strong> Co-authorship, shared
          institution or supervision within three years, a personal or financial
          relationship, or a competing manuscript of your own on the same
          question. The full list is in the{" "}
          <Link href="/policies/conflict-of-interest">
            conflict of interest policy
          </Link>
          .
        </li>
        <li>
          <strong>You cannot meet the deadline.</strong> If you can review but
          need longer, say so at the invitation and the editor will decide.
        </li>
      </ul>
      <p>
        A reviewer who has agreed and then cannot complete the review must tell
        the editorial office as soon as they know, so the manuscript can be
        reassigned rather than sitting idle.
      </p>
      <p>
        Delegation is not permitted without the editor&rsquo;s prior agreement.
        Where you would like a graduate student or colleague to co-review as
        training, ask first; if agreed, name them in the report so their
        contribution is recorded and the same obligations bind them.
      </p>

      <h2 id="confidentiality">Confidentiality</h2>
      <p>
        A manuscript under review is a confidential document belonging to its
        authors. As a reviewer you may not:
      </p>
      <ul>
        <li>
          Show it to, or discuss it with, anyone other than the handling editor
          — including colleagues and students — without prior permission;
        </li>
        <li>
          Cite it, quote it, or refer to its findings in your own work or in
          conversation;
        </li>
        <li>
          Use anything you learn from it to advance your own research, secure
          funding, or gain any other benefit before it is published;
        </li>
        <li>
          Contact the authors about it, directly or indirectly, at any point;
        </li>
        <li>Retain a copy after submitting your report — delete the files.</li>
      </ul>
      <p>
        Confidentiality does not lapse when the review is submitted, when the
        manuscript is rejected, or with the passage of time. A manuscript
        rejected here may be under review elsewhere.
      </p>

      <h2 id="ai">Generative AI</h2>
      <p>
        <strong>
          Do not enter any part of a manuscript, or your report on it, into a
          generative AI service.
        </strong>{" "}
        This includes chat assistants, summarisers, translation services and
        writing tools that transmit text to a third party.
      </p>
      <p>
        Doing so uploads confidential unpublished work to an external company,
        outside the authors&rsquo; control and potentially into training data.
        The journal treats it as a breach of confidentiality regardless of
        intent, and regardless of whether the tool claims not to retain input.
      </p>
      <p>
        The judgement in a review must also be the reviewer&rsquo;s own. A
        report generated by an AI tool is worthless to the editor, who needs a
        specialist&rsquo;s assessment rather than plausible text. Where a review
        appears to have been produced this way, it is discarded and the reviewer
        is not invited again. The broader position is set out in the{" "}
        <Link href="/policies/ai-policy">AI-assisted writing policy</Link>.
      </p>

      <h2 id="conduct">Conducting the review</h2>
      <p>Reviewers are expected to:</p>
      <ul>
        <li>
          <strong>Assess what was written</strong>, not the paper you would have
          written. A study answering a question differently from how you would
          have answered it is not thereby flawed.
        </li>
        <li>
          <strong>Support every criticism with a reason</strong>, and where
          possible with a specific location in the text. &ldquo;The method is
          inadequate&rdquo; is not usable; naming what is missing is.
        </li>
        <li>
          <strong>Separate the essential from the optional.</strong> State
          clearly which comments must be addressed for publication and which are
          suggestions the author may take or leave. Authors and editors both
          rely on this distinction.
        </li>
        <li>
          <strong>Note strengths as well as weaknesses</strong>, so the editor
          can weigh the report rather than reading a list of faults.
        </li>
        <li>
          <strong>Recommend citations sparingly and honestly.</strong> Suggest a
          reference only where it is genuinely needed for the argument. Asking
          an author to cite your own work in order to raise your citation count
          is citation manipulation and is treated as misconduct.
        </li>
      </ul>

      <h2 id="tone">Tone and criticism</h2>
      <p>
        Criticise the work, never the author. Anonymity is not licence for
        remarks a reviewer would not sign their name to.
      </p>
      <p>
        Comments about an author&rsquo;s competence, nationality, institution,
        gender or command of English are removed by the handling editor before
        the report reaches the author. Where language genuinely obstructs
        understanding, say which passages are unclear and recommend language
        editing — that is a usable comment; a remark about the author&rsquo;s
        English is not.
      </p>
      <p>
        The journal publishes work from institutions with uneven access to
        research infrastructure. A reviewer who takes account of what was
        achievable in the setting, while holding the analysis to the same
        standard, is doing the job well.
      </p>

      <h2 id="anonymity">Anonymity</h2>
      <p>
        Review is double-blind. Reviewers must not attempt to identify the
        authors — by searching distinctive phrases, checking preprint servers,
        or examining file metadata — and must not sign their reports or include
        anything in them that reveals who they are.
      </p>
      <p>
        Where you recognise the authorship despite the anonymisation, tell the
        handling editor. If a competing interest follows from it, stop and
        withdraw. If none does, the editor will decide whether you should
        continue.
      </p>
      <p>
        Reviewers must not reveal their role to the authors after publication,
        and must not use it as leverage in any subsequent dealing with them.
      </p>

      <h2 id="misconduct-found">Suspected misconduct</h2>
      <p>
        A reviewer who suspects plagiarism, duplicate publication, fabricated
        data, manipulated images or an undisclosed ethics problem should report
        it to the handling editor with the specific evidence — the overlapping
        source, the inconsistent figure, the passage in question.
      </p>
      <p>
        Do not contact the authors, and do not investigate independently. The
        editor follows the procedure in the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        , which gives the authors a fair opportunity to respond. Raising a
        concern in good faith is protected; the reviewer&rsquo;s identity is not
        disclosed to the authors even where the concern is not upheld.
      </p>

      <h2 id="reviewer-misconduct">Reviewer misconduct</h2>
      <p>
        The journal treats the following as reviewer misconduct and acts on it
        under the publication ethics policy.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Breach of confidentiality",
              "Sharing, citing or retaining a manuscript, or entering it into an AI service.",
            ],
            [
              "Appropriation",
              "Using the ideas, data or method of a manuscript under review in one's own work.",
            ],
            [
              "Concealed competing interest",
              "Accepting a review while holding an interest that required declining.",
            ],
            [
              "Citation coercion",
              "Requiring citations to the reviewer's own work as a condition of a favourable report.",
            ],
            [
              "Strategic delay",
              "Prolonging a review to advantage the reviewer's own competing work.",
            ],
            [
              "Contacting the authors",
              "Approaching the authors about the manuscript at any stage.",
            ],
            [
              "Fabricated identity",
              "Reviewing under a false name or through an account created for the purpose.",
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
        Depending on severity, the journal discards the report and re-reviews
        the manuscript, removes the reviewer from its database, and where the
        conduct is serious informs their institution.
      </p>

      <h2 id="recognition">Recognition</h2>
      <p>
        Reviewing is unpaid work the scholarly record depends on. The journal
        acknowledges it by publishing an annual list of the reviewers who served
        during that year, with their consent and without linking any reviewer to
        any manuscript. Reviewers may also request a confirmation letter for
        their institution at any time.
      </p>
      <p>
        Questions about a review in progress should go to the handling editor
        through the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        . Practical guidance on writing the report itself is in the{" "}
        <Link href="/for-reviewers/guidelines">reviewer guidelines</Link>.
      </p>
    </PolicyPage>
  );
}
