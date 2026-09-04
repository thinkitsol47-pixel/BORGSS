import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Editorial Independence Policy",
  description:
    "How BORJSS separates editorial decisions from commercial, institutional and political influence, and what safeguards apply to fees, advertising and its own editorial team.",
};

const TOC = [
  { id: "statement", label: "Statement of independence" },
  { id: "publisher", label: "The publisher's role" },
  { id: "fees", label: "Fees and decisions" },
  { id: "institutional", label: "Institutional influence" },
  { id: "political", label: "Political and ideological pressure" },
  { id: "advertising", label: "Advertising and sponsorship" },
  { id: "own-team", label: "The editorial team's own work" },
  { id: "structure", label: "Who decides what" },
  { id: "reporting", label: "Transparency reporting" },
  { id: "raising", label: "Reporting pressure" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="editorial-independence"
      title="Editorial Independence Policy"
      lead="What the journal publishes is decided on scholarly merit by its editors. This policy sets out the separation between that judgement and every other interest the journal has."
      toc={TOC}
      updated="2026-01-15"
      related={["conflict-of-interest", "publication-ethics", "open-access"]}
    >
      <h2 id="statement">Statement of independence</h2>
      <p>
        Editorial decisions at {siteConfig.shortName} — to review, to revise, to
        accept, to reject, to correct or to retract — rest with the
        Editor-in-Chief and the handling editors, and are made on the scholarly
        merit of the work and its fit with the journal&rsquo;s{" "}
        <Link href="/about/aims-scope">aims and scope</Link>.
      </p>
      <p>
        No other party may direct those decisions. That includes the publisher,
        the journal&rsquo;s owners, funders, advertisers, institutions,
        government bodies and the editors&rsquo; own employers. The
        Editor-in-Chief has full authority over the content of the journal.
      </p>

      <h2 id="publisher">The publisher&rsquo;s role</h2>
      <p>
        The publisher is responsible for the infrastructure that lets the
        journal operate, and for maintaining the published record. It is not
        responsible for what gets published.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "The publisher does",
              "Fund and maintain the platform, appoint and remove the Editor-in-Chief, uphold these policies, preserve access to published articles, and handle legal matters.",
            ],
            [
              "The publisher does not",
              "Read manuscripts under review, select or veto reviewers, influence any decision on a specific submission, or require or block publication of any article.",
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
        Appointment and removal of the Editor-in-Chief is the publisher&rsquo;s
        decision, and is the one lever it holds. It may not be used in response
        to a specific editorial decision. Where an Editor-in-Chief is removed,
        the journal states that the change has occurred; decisions already taken
        stand, and manuscripts in progress continue under the same terms.
      </p>

      <h2 id="fees">Fees and decisions</h2>
      <p>
        The person handling a manuscript has no information about, and no
        interest in, whether a fee will be paid on it. Article processing
        charges are administered by the editorial office{" "}
        <strong>after</strong> a decision to accept has been taken and
        communicated.
      </p>
      <ul>
        <li>
          Ability to pay plays no part in any editorial decision, at any stage;
        </li>
        <li>
          A waiver request is handled by the editorial office and is not visible
          to the handling editor or to reviewers;
        </li>
        <li>
          A waiver, once granted, is not reconsidered on the basis of the
          decision reached;
        </li>
        <li>
          The journal does not offer paid fast-track review, paid placement, or
          any service that alters how a manuscript is assessed.
        </li>
      </ul>
      <p>
        Charges and the waiver policy are published in full on the{" "}
        <Link href="/apc">article processing charges</Link> page.
      </p>

      <h2 id="institutional">Institutional influence</h2>
      <p>
        The journal publishes research about institutions, including
        institutions connected to its own editors, its publisher and its
        authors. Such work is assessed on the same terms as any other.
      </p>
      <p>
        An editor whose institution is the subject of a manuscript, or who has
        any relationship with the organisation the work evaluates, transfers it
        to another editor under the{" "}
        <Link href="/policies/conflict-of-interest">
          conflict of interest policy
        </Link>
        . A request from an institution to withdraw, delay or soften an article
        is refused, and the fact that the request was made is recorded.
      </p>

      <h2 id="political">Political and ideological pressure</h2>
      <p>
        Social science research touches on questions that are politically
        contested. The journal assesses such work on its method and evidence,
        not on whether its conclusions are welcome.
      </p>
      <p>
        Manuscripts are not rejected because their findings are inconvenient to
        a government, a donor, an institution or a prevailing view, and they are
        not accepted because their findings are congenial. Where a published
        article attracts pressure to remove it, the journal removes an article
        only where the{" "}
        <Link href="/policies/retraction-correction">
          retraction and correction policy
        </Link>{" "}
        is satisfied on scholarly grounds, or where it is compelled by law — and
        in the latter case it says that this is what happened.
      </p>
      <p>
        The one limit is legal rather than editorial: the journal will not
        publish material that is unlawful in the jurisdiction in which it
        operates.
      </p>

      <h2 id="advertising">Advertising and sponsorship</h2>
      <p>
        The journal carries no advertising and accepts no sponsored content,
        supplements or sponsored special issues. There is accordingly no
        advertiser whose interests could bear on a decision.
      </p>
      <p>
        Should this change, advertising would be separated from editorial
        content, clearly labelled, never targeted to the content of an
        individual article, and never linked to any editorial decision — and
        this policy would be updated before any such arrangement began.
      </p>

      <h2 id="own-team">The editorial team&rsquo;s own work</h2>
      <p>
        Editors and board members may publish in the journal. Their submissions
        are handled by an editor with no reporting relationship to them, the
        author is excluded from every part of the record, and the published
        article states both the affiliation and the exclusion. The safeguards
        are set out in the{" "}
        <Link href="/policies/conflict-of-interest">
          conflict of interest policy
        </Link>
        .
      </p>
      <p>
        The journal monitors the share of published articles authored by its own
        editorial team and reports it annually. A journal that publishes largely
        its own editors is not independent, whatever its procedures say.
      </p>

      <h2 id="structure">Who decides what</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Handling editor",
              "Selects reviewers, weighs the reports, recommends the decision on a manuscript.",
            ],
            [
              "Editor-in-Chief",
              "Confirms decisions, resolves disagreement between editors, and holds final authority over journal content.",
            ],
            [
              "Editorial board",
              "Advises on scope and standards, reviews policy, and takes decisions where the Editor-in-Chief is conflicted.",
            ],
            [
              "Editorial office",
              "Administers submissions, checks, correspondence and fees. Takes no editorial decisions.",
            ],
            [
              "Publisher",
              "Provides and maintains the platform, appoints the Editor-in-Chief, preserves the record. Takes no editorial decisions.",
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
        The people currently holding these roles are listed on the{" "}
        <Link href="/about/editorial-board">editorial board</Link> page.
      </p>

      <h2 id="reporting">Transparency reporting</h2>
      <p>
        Independence is a claim that should be checkable. The journal publishes
        an annual editorial statement reporting the number of submissions
        received and articles published, the acceptance rate, median time to
        first decision, the share of articles authored by editorial team
        members, the number of waivers granted, and the number of corrections
        and retractions issued.
      </p>
      <p>
        The first such statement follows the completion of the journal&rsquo;s
        first full volume; figures published to date appear on the{" "}
        <Link href="/about/journal-information">journal information</Link> page.
      </p>

      <h2 id="raising">Reporting pressure</h2>
      <p>
        Any author, reviewer or editor who believes an editorial decision has
        been influenced by commercial, institutional or political pressure
        should report it to the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        , marked for the attention of the Editor-in-Chief. Where the concern
        involves the Editor-in-Chief, it is directed to the editorial board,
        which considers it without them.
      </p>
      <p>
        Such reports are handled under the{" "}
        <Link href="/policies/complaints-appeals">
          complaints and appeals policy
        </Link>
        , and the person raising the concern is not disadvantaged for having
        raised it.
      </p>
    </PolicyPage>
  );
}
