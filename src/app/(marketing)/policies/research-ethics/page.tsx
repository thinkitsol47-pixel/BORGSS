import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Research Ethics Policy",
  description:
    "What BORJSS requires of research involving human participants: ethics approval, informed consent, confidentiality, vulnerable groups, secondary data and fieldwork.",
};

const TOC = [
  { id: "scope", label: "What this policy covers" },
  { id: "approval", label: "Ethics approval" },
  { id: "no-committee", label: "Where no committee exists" },
  { id: "consent", label: "Informed consent" },
  { id: "vulnerable", label: "Vulnerable participants" },
  { id: "confidentiality", label: "Confidentiality and anonymity" },
  { id: "secondary", label: "Secondary and online data" },
  { id: "fieldwork", label: "Fieldwork and risk" },
  { id: "declaration", label: "What to submit" },
  { id: "breach", label: "If a concern is raised" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="research-ethics"
      title="Research Ethics Policy"
      lead="Social science research is conducted on people, with their data and about their lives. This policy sets out what the journal requires before it will publish such work."
      toc={TOC}
      updated="2026-01-15"
      related={["publication-ethics", "research-integrity", "data-availability"]}
    >
      <h2 id="scope">What this policy covers</h2>
      <p>
        This policy applies to any manuscript reporting research that involves
        human participants, identifiable human data, or human tissue. In the
        social sciences that includes a wider range of work than is sometimes
        assumed:
      </p>
      <ul>
        <li>Surveys, questionnaires and structured instruments;</li>
        <li>Interviews, focus groups and oral histories;</li>
        <li>Participant and non-participant observation, including ethnography;</li>
        <li>Experiments and intervention studies;</li>
        <li>
          Analysis of administrative, institutional or clinical records about
          identifiable people;
        </li>
        <li>
          Research using social media content or other online material about
          identifiable individuals.
        </li>
      </ul>
      <p>
        Work based entirely on published literature, aggregate published
        statistics, or documents in the public record about institutions rather
        than individuals falls outside it. Where an author is unsure, the
        editorial office will advise before submission.
      </p>

      <h2 id="approval">Ethics approval</h2>
      <p>
        Research within scope must have been approved by a research ethics
        committee, institutional review board, or equivalent body{" "}
        <strong>before data collection began</strong>. Retrospective approval
        obtained after the fact does not satisfy this requirement.
      </p>
      <p>The manuscript must state, in the methods section:</p>
      <ul>
        <li>The full name of the approving body;</li>
        <li>The approval or protocol reference number;</li>
        <li>The date of approval.</li>
      </ul>
      <p>
        Editors may ask to see the approval document. A manuscript whose authors
        cannot produce it when asked will not be published.
      </p>

      <h2 id="no-committee">Where no committee exists</h2>
      <p>
        Not every institution has a functioning ethics committee, and a
        blanket requirement would exclude legitimate research from exactly the
        institutions this journal exists to publish. Where formal review was
        genuinely unavailable, authors must instead provide a statement
        explaining:
      </p>
      <ul>
        <li>
          Why no committee was available — that the institution has none, rather
          than that approval was not sought;
        </li>
        <li>
          What ethical framework was followed instead, and who reviewed the
          study against it — a department head, a senior colleague, or a
          committee at a partner institution;
        </li>
        <li>
          How consent, confidentiality and withdrawal were handled in practice;
        </li>
        <li>What specific risks to participants were identified, and how they were mitigated.</li>
      </ul>
      <p>
        The handling editor assesses this statement on its substance. An honest
        account of a considered process is acceptable; an assertion that the
        research was harmless is not. Where the study involves vulnerable
        participants or more than minimal risk, the journal will not accept it
        without formal review.
      </p>

      <h2 id="consent">Informed consent</h2>
      <p>
        Participants must have agreed to take part knowing what they were
        agreeing to. Consent is informed when a participant understood, in a
        language and register they use:
      </p>
      <ul>
        <li>Who is conducting the research, and who is funding it;</li>
        <li>What participation involves, and how long it takes;</li>
        <li>What will be done with their data, and who will have access to it;</li>
        <li>
          That participation is voluntary, and that they may withdraw without
          giving a reason and without consequence;
        </li>
        <li>Whether and how they could be identified in what is published.</li>
      </ul>
      <p>
        Written consent is expected. Where written consent was inappropriate —
        low literacy, or a context where signing a document carries risk —
        documented oral consent is acceptable if the manuscript explains why and
        describes how it was recorded.
      </p>
      <p>
        Where the manuscript reproduces material that could identify an
        individual — a photograph, a detailed case description, a distinctive
        quotation — separate consent to publish is required, and the authors
        must confirm they hold it.
      </p>

      <h2 id="vulnerable">Vulnerable participants</h2>
      <p>
        Research involving children, people who cannot give consent for
        themselves, prisoners, refugees, patients, employees of the researcher,
        or anyone in a relationship of dependency on the research team requires
        additional safeguards, described in the manuscript.
      </p>
      <ul>
        <li>
          <strong>Children.</strong> Consent from a parent or legal guardian,
          together with the child&rsquo;s own assent in terms they understand.
          A child&rsquo;s refusal ends their participation regardless of
          guardian consent.
        </li>
        <li>
          <strong>Adults unable to consent.</strong> Consent from a legally
          authorised representative, and withdrawal at any sign of distress.
        </li>
        <li>
          <strong>Dependent relationships.</strong> Recruitment through someone
          other than the person holding authority over the participant, so that
          declining carries no cost.
        </li>
      </ul>

      <h2 id="confidentiality">Confidentiality and anonymity</h2>
      <p>
        Authors are responsible for ensuring that participants cannot be
        identified from what is published, unless they have consented to
        identification. Removing names is rarely sufficient on its own: a small
        community, a named institution, a specific role and an unusual
        biographical detail together can identify a person as clearly as a name.
      </p>
      <p>
        The manuscript should describe how identifying detail was handled —
        pseudonyms, altered non-essential particulars, aggregation of small
        categories, or withholding of location. Where anonymisation would
        destroy the analytical value of the material, the alternative is
        consent to publish, not publication without either.
      </p>
      <p>
        Data-handling arrangements — storage, access and retention — should also
        be stated, and must be consistent with the{" "}
        <Link href="/policies/data-availability">data availability policy</Link>
        . Data may not be shared in a form that breaches the consent under which
        it was collected.
      </p>

      <h2 id="secondary">Secondary and online data</h2>
      <p>
        Analysis of an existing dataset requires that the original consent
        covered reuse of the kind being made, or that the data are properly
        anonymised and the custodian has authorised the access. The manuscript
        should name the source and state the terms of access.
      </p>
      <p>
        Content posted online is not automatically fair to use as research
        material. Publicly visible is not the same as public: users of a support
        forum or a private-in-practice group did not post for study. Authors
        working with such material should state whether the setting was public,
        whether consent was sought, and how quotations were handled — verbatim
        quotation is traceable by search, and paraphrase is often the
        appropriate protection.
      </p>

      <h2 id="fieldwork">Fieldwork and risk</h2>
      <p>
        Where research was conducted in a setting carrying risk to participants
        or researchers — conflict-affected areas, work on sensitive political or
        religious questions, or research on illegal activity — the manuscript
        should describe how those risks were assessed and managed, including how
        material was kept secure and how participants were protected from
        consequences of having taken part.
      </p>
      <p>
        Research must comply with the law and applicable norms in the country
        where it was conducted, as well as with this policy. Where local
        requirements and this policy differ, the stricter applies.
      </p>

      <h2 id="declaration">What to submit</h2>
      <p>
        The methods section carries the substantive detail. In addition, the
        submission form requires a short ethics statement covering:
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            ["Approving body", "Full name of the committee or board"],
            ["Reference", "Protocol or approval number"],
            ["Date", "When approval was granted"],
            ["Consent", "How consent was obtained and recorded"],
            [
              "Consent to publish",
              "Confirmation where identifiable material appears",
            ],
            [
              "Exemption",
              "Where the study was exempt or no committee existed, the explanation required above",
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
        Manuscripts arriving without an ethics statement where one is required
        are returned at desk check under the{" "}
        <Link href="/policies/peer-review">peer review policy</Link> rather than
        sent for review.
      </p>

      <h2 id="breach">If a concern is raised</h2>
      <p>
        Where a concern about research ethics arises — before or after
        publication — the journal follows the procedure in the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        . Because a journal cannot investigate what happened in the field, such
        concerns are referred to the institution that granted or should have
        granted approval, and the journal acts on that institution&rsquo;s
        finding.
      </p>
      <p>
        Concerns may be sent to{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        .
      </p>
    </PolicyPage>
  );
}
