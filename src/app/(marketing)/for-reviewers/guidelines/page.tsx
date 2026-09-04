import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { DocPage, DocAside } from "@/components/layout/doc-page";
import { Alert, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Reviewer Guidelines",
  description:
    "How to review for BORJSS: what to assess, how to write a useful report, the recommendation options, and the ethics expected of reviewers.",
};

const TOC = [
  { id: "role", label: "The reviewer's role" },
  { id: "accepting", label: "Accepting or declining" },
  { id: "assess", label: "What to assess" },
  { id: "report", label: "Writing the report" },
  { id: "recommendation", label: "Recommendations" },
  { id: "ethics", label: "Reviewer ethics" },
  { id: "timeline", label: "Timeline" },
  { id: "recognition", label: "Recognition" },
];

const ASSESS = [
  {
    heading: "Originality and contribution",
    points: [
      "Does the manuscript add something not already established in the literature?",
      "Is the contribution stated clearly, and does the evidence support the claim?",
      "Would a specialist in this area find it worth reading?",
    ],
  },
  {
    heading: "Methodology",
    points: [
      "Is the design appropriate to the research question?",
      "Are sampling, instruments and analysis described in enough detail to be repeated?",
      "Are the analytical choices defensible, and are alternatives acknowledged?",
      "Do the limitations section and the conclusions match what the method can support?",
    ],
  },
  {
    heading: "Results and interpretation",
    points: [
      "Are the findings presented clearly, with uncertainty reported rather than significance alone?",
      "Do the tables and figures add to the argument, or merely repeat the text?",
      "Does the discussion over-reach — claiming causation from correlation, or generalising beyond the sample?",
    ],
  },
  {
    heading: "Literature and framing",
    points: [
      "Is the relevant scholarship engaged with, including work that complicates the argument?",
      "Are there significant omissions? Name specific references rather than saying the review is thin.",
      "Is the theoretical framing coherent and actually used in the analysis?",
    ],
  },
  {
    heading: "Presentation",
    points: [
      "Is the structure logical and the argument easy to follow?",
      "Is the writing clear enough that language does not obscure the substance?",
      "Are references complete and consistently formatted?",
    ],
  },
  {
    heading: "Ethics and integrity",
    points: [
      "Is ethics approval stated where human participants were involved?",
      "Are competing interests, funding and data availability declared?",
      "Is there anything that suggests plagiarism, duplicate publication or manipulated data?",
    ],
  },
];

const RECOMMENDATIONS = [
  {
    label: "Accept as is",
    tone: "The manuscript is publishable without change. This is rare at first review.",
  },
  {
    label: "Minor revision",
    tone: "Sound work needing small corrections — clarifications, additional detail, tightened writing. Not normally re-reviewed.",
  },
  {
    label: "Major revision",
    tone: "The core contribution is worth pursuing, but substantive work is needed on method, analysis or argument. Usually returns to you.",
  },
  {
    label: "Reject",
    tone: "The work cannot reach publishable standard through revision, or falls outside the journal's scope. Explain why in terms the authors can learn from.",
  },
];

export default function ReviewerGuidelinesPage() {
  return (
    <DocPage
      eyebrow="For Reviewers"
      title="Reviewer Guidelines"
      lead="What we ask of reviewers, how to write a report that genuinely helps, and the standards of conduct expected."
      breadcrumb={[
        { label: "For Reviewers", href: "/for-reviewers/guidelines" },
        { label: "Reviewer Guidelines" },
      ]}
      toc={TOC}
      updated="2026-01-15"
      aside={
        <DocAside title="Related">
          <Link
            href="/for-reviewers/become-a-reviewer"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Become a reviewer →
          </Link>
          <Link
            href="/policies/peer-review"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Peer review policy →
          </Link>
          <Link
            href="/policies/reviewer-ethics"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Reviewer ethics →
          </Link>
          <Link
            href="/policies/conflict-of-interest"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Conflict of interest →
          </Link>
        </DocAside>
      }
    >
      <h2 id="role">The reviewer&rsquo;s role</h2>
      <p>
        Peer review is what separates a scholarly journal from a website that
        publishes documents. As a reviewer for {siteConfig.shortName} you are
        asked to judge whether a manuscript is sound, and to help the authors
        improve it — whatever the eventual decision.
      </p>
      <p>
        You are <strong>not</strong> asked to decide whether the paper is
        published. That decision rests with the handling editor and the
        Editor-in-Chief, who weigh your report alongside at least one other. Your
        job is to give them an informed, reasoned assessment.
      </p>

      <div className="not-prose my-6">
        <Alert tone="info" title="Reviews are double-blind">
          You will not be told who the authors are, and they will not be told
          who reviewed their work. If you recognise the authors from the
          content, tell the handling editor rather than acting on it.
        </Alert>
      </div>

      <h2 id="accepting">Accepting or declining an invitation</h2>
      <p>
        Please respond to an invitation within <strong>five days</strong>, even
        if you decline. A prompt decline is far more useful than a slow
        acceptance — it lets the editor approach someone else without losing a
        fortnight.
      </p>
      <p>Decline if:</p>
      <ul>
        <li>
          The manuscript is outside your expertise. Reviewing something you
          cannot properly judge helps nobody.
        </li>
        <li>
          You cannot complete the review within three weeks.
        </li>
        <li>
          You have a competing interest — recent collaboration, institutional
          connection, a personal relationship, or a competing manuscript of your
          own on the same question. See the{" "}
          <Link href="/policies/conflict-of-interest">
            conflict of interest policy
          </Link>
          .
        </li>
      </ul>
      <p>
        When declining, suggesting an alternative reviewer is genuinely helpful
        and always appreciated.
      </p>

      <h2 id="assess">What to assess</h2>
      <p>
        The review form asks for a rating and comments against each of the
        following. You do not need to address every question, but a report that
        touches on all six areas is far more useful than one that dwells on a
        single concern.
      </p>

      <div className="not-prose space-y-4">
        {ASSESS.map((section) => (
          <div
            key={section.heading}
            className="rounded-lg border border-brand-border bg-card p-5"
          >
            <p className="font-serif text-[15px] font-semibold">
              {section.heading}
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {section.points.map((p) => (
                <li
                  key={p}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-brand"
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 id="report">Writing the report</h2>
      <p>
        The most valuable reports are specific, ordered by importance, and
        written in language the authors can act on. A structure that works well:
      </p>
      <ol>
        <li>
          <strong>Summary.</strong> Two or three sentences describing what the
          paper does, in your own words. This shows the authors how their work
          was understood — and occasionally reveals that it was not.
        </li>
        <li>
          <strong>Major issues.</strong> Numbered, in order of importance.
          Anything that must be addressed before publication. Say what is wrong
          and, where you can, what would fix it.
        </li>
        <li>
          <strong>Minor issues.</strong> Numbered, referencing page and line.
          Clarifications, missing detail, presentation.
        </li>
        <li>
          <strong>Confidential comments to the editor.</strong> Anything you
          would not put to the authors — suspicion of misconduct, or a candid
          note on how far the work is from publishable.
        </li>
      </ol>

      <p>Some practical points:</p>
      <ul>
        <li>
          <strong>Cite line numbers.</strong> &ldquo;The sampling strategy at
          lines 145&ndash;160 does not explain how non-responders were
          handled&rdquo; is actionable; &ldquo;the methodology is weak&rdquo; is
          not.
        </li>
        <li>
          <strong>Distinguish requirement from preference.</strong> Say clearly
          which comments must be addressed and which are suggestions the authors
          may reasonably decline.
        </li>
        <li>
          <strong>Do not demand citations to your own work</strong> unless it is
          genuinely essential to the argument. Coercive citation is a serious
          breach of reviewer ethics.
        </li>
        <li>
          <strong>Criticise the work, not the authors.</strong> Write as though
          the report will be read by a nervous doctoral student — because
          sometimes it is.
        </li>
        <li>
          <strong>Do not copy-edit.</strong> Flag that language needs attention;
          the journal handles copy-editing after acceptance.
        </li>
      </ul>

      <h2 id="recommendation">Recommendations</h2>
      <p>
        Choose the option closest to your judgement. If your written comments
        and your recommendation point in different directions, the editor will
        follow the comments — so make sure they agree.
      </p>

      <div className="not-prose space-y-3">
        {RECOMMENDATIONS.map((r) => (
          <div
            key={r.label}
            className="rounded-lg border border-brand-border bg-card p-4"
          >
            <p className="font-serif text-[15px] font-semibold">{r.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {r.tone}
            </p>
          </div>
        ))}
      </div>

      <h2 id="ethics">Reviewer ethics</h2>
      <p>
        Reviewing gives you early sight of unpublished work. That access carries
        obligations, set out in full in the{" "}
        <Link href="/policies/reviewer-ethics">reviewer ethics policy</Link>. In
        short:
      </p>
      <ul>
        <li>
          <strong>Confidentiality.</strong> The manuscript is a privileged
          document. Do not share it, discuss it, or cite it. Do not retain a copy
          after the review is submitted.
        </li>
        <li>
          <strong>No use of the material.</strong> You may not use ideas, data or
          findings from a manuscript under review to advance your own work.
        </li>
        <li>
          <strong>No AI tools.</strong> Do not paste any part of a manuscript
          into a generative AI service. Doing so uploads confidential
          unpublished work to a third party, and is treated as a breach of
          confidentiality.
        </li>
        <li>
          <strong>Declare competing interests</strong> as soon as you become
          aware of one, including partway through a review.
        </li>
        <li>
          <strong>Report suspected misconduct</strong> — plagiarism, duplicate
          submission, manipulated images or implausible data — to the editor
          privately rather than raising it with the authors.
        </li>
      </ul>

      <h2 id="timeline">Timeline</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            ["Respond to invitation", "Within 5 days"],
            ["Complete the review", "Within 3 weeks of accepting"],
            ["Re-review after major revision", "Within 2 weeks"],
            ["Extension on request", "Usually granted — just ask"],
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
        If circumstances change and you cannot finish, tell the editorial office
        as early as you can. An honest withdrawal is always better than a review
        that never arrives.
      </p>

      <h2 id="recognition">Recognition</h2>
      <p>
        Reviewing is unpaid academic service, but it is not invisible. Reviewers
        for {siteConfig.shortName} receive:
      </p>
      <ul>
        <li>A formal acknowledgement letter for institutional records.</li>
        <li>
          The option to have reviews recognised on your ORCID record, if you
          choose.
        </li>
        <li>
          Inclusion in the annual reviewer acknowledgement published with the
          final issue of each volume, unless you prefer not to be named.
        </li>
        <li>
          Consideration for the editorial board — most board members began as
          reviewers.
        </li>
      </ul>

      <div className="not-prose mt-8 rounded-lg border border-brand-border bg-brand-tint/30 p-6">
        <p className="font-serif text-lg font-bold">
          Willing to review for the journal?
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Register your areas of expertise and we will approach you when a
          matching manuscript arrives. You are free to decline any invitation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/for-reviewers/become-a-reviewer">
            Become a reviewer
          </Button>
          <Button href="/policies/peer-review" variant="outline">
            Peer review policy
          </Button>
        </div>
      </div>
    </DocPage>
  );
}
