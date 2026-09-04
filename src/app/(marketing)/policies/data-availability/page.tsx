import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Data Availability Policy",
  description:
    "Every BORJSS article carries a data availability statement. This policy explains what counts as data, the acceptable statements, when data may be withheld, and how to share qualitative material safely.",
};

const TOC = [
  { id: "requirement", label: "The requirement" },
  { id: "what-counts", label: "What counts as data" },
  { id: "statements", label: "Acceptable statements" },
  { id: "withholding", label: "When data may be withheld" },
  { id: "qualitative", label: "Qualitative and sensitive data" },
  { id: "where", label: "Where to deposit" },
  { id: "citing", label: "Citing and licensing data" },
  { id: "code", label: "Code and analysis scripts" },
  { id: "retention", label: "Retention and requests" },
  { id: "enforcement", label: "What the journal does" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="data-availability"
      title="Data Availability Policy"
      lead="Every article carries a statement saying where its data are and how to get them. The journal encourages open data but does not require it — what it requires is that readers be told the truth about what is available."
      toc={TOC}
      updated="2026-01-15"
      related={["research-integrity", "research-ethics", "licensing"]}
    >
      <h2 id="requirement">The requirement</h2>
      <p>
        Every research article published in {siteConfig.shortName} must include
        a <strong>data availability statement</strong>. It appears before the
        references and is published with the article. A manuscript submitted
        without one is returned for it at desk check.
      </p>
      <p>
        The journal <strong>encourages</strong> authors to deposit their data
        openly, and <strong>requires</strong> that they say accurately where the
        data are and on what terms they can be obtained. Those are different
        obligations, and the distinction matters: social science data frequently
        cannot be shared, and a policy that demanded it would either exclude
        legitimate research or produce statements that are not true.
      </p>
      <p>
        &ldquo;Data are available on request&rdquo; is accepted only where the
        authors mean it — see{" "}
        <a href="#retention">retention and requests</a> below.
      </p>

      <h2 id="what-counts">What counts as data</h2>
      <p>
        Data here means the material a reader would need to verify the
        findings — not only a spreadsheet of numbers.
      </p>
      <ul>
        <li>Survey responses, in raw and cleaned form;</li>
        <li>
          Interview and focus group transcripts, and field notes;
        </li>
        <li>Coding frames, codebooks and coded outputs;</li>
        <li>Questionnaires, instruments and interview schedules;</li>
        <li>Observational records and administrative extracts;</li>
        <li>Analysis scripts, syntax files and model specifications;</li>
        <li>
          Any variable definitions and transformations applied between raw
          collection and reported results.
        </li>
      </ul>
      <p>
        Instruments deserve particular mention: publishing the questionnaire or
        interview guide is usually possible even where the responses are not,
        and it is often the single most useful thing an author can share.
      </p>

      <h2 id="statements">Acceptable statements</h2>
      <p>
        Use whichever of these fits, adapted to the specifics. Where more than
        one applies — an open instrument with restricted responses — say so.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Openly available",
              "Name the repository, give the DOI or accession number, and state the licence.",
            ],
            [
              "Available on request",
              "Name who holds the data, give a contact route, and state the conditions and the criteria that would be applied.",
            ],
            [
              "Available under restriction",
              "State the access process — an application, an ethics approval, a data use agreement — and who administers it.",
            ],
            [
              "Third-party data",
              "The data belong to someone else. Name the source and how others may obtain them; do not redistribute them yourself.",
            ],
            [
              "Not available",
              "State the specific reason — consent terms, participant identifiability, legal restriction — not merely that it is unavailable.",
            ],
            [
              "In the article",
              "All data supporting the findings are contained in the article and its supplementary files.",
            ],
            [
              "No data",
              "For theoretical, conceptual or review articles: no new data were created or analysed.",
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
        A statement that says nothing checkable — &ldquo;data are available from
        the authors&rdquo; with no contact, or &ldquo;data are confidential&rdquo;
        with no reason — is returned for revision.
      </p>

      <h2 id="withholding">When data may be withheld</h2>
      <p>
        These are legitimate reasons not to share, and the journal expects to
        see them regularly in social science research:
      </p>
      <ul>
        <li>
          <strong>Participants did not consent to sharing.</strong> Consent
          obtained for one study does not authorise redistribution. Sharing
          beyond those terms would breach the{" "}
          <Link href="/policies/research-ethics">research ethics policy</Link>.
        </li>
        <li>
          <strong>Anonymisation is not achievable.</strong> In a small
          community, a named institution or a specialised professional group,
          removing names does not prevent identification.
        </li>
        <li>
          <strong>Sharing would put participants at risk</strong> — research on
          contested political or religious questions, on illegal activity, or in
          conflict-affected settings.
        </li>
        <li>
          <strong>The data belong to someone else</strong> — a government
          department, a company, or a repository whose licence forbids
          redistribution.
        </li>
        <li>
          <strong>Legal or contractual restriction</strong>, including data
          protection obligations.
        </li>
      </ul>
      <p>
        Commercial sensitivity and an intention to publish further papers from
        the dataset are weaker reasons. The journal accepts a stated embargo
        period for the latter, but not indefinite withholding.
      </p>

      <h2 id="qualitative">Qualitative and sensitive data</h2>
      <p>
        Qualitative material carries identifying detail in a way survey data
        usually does not: a transcript reveals a person through their
        circumstances, their turns of phrase and the events they describe, long
        after their name has been removed.
      </p>
      <p>
        Full transcripts should therefore not be deposited openly unless
        participants specifically consented to that and the material genuinely
        cannot identify them. Better options, in rough order of preference:
      </p>
      <ul>
        <li>
          Deposit the <strong>instruments</strong> — interview guide, topic
          list, coding frame — which are almost always shareable;
        </li>
        <li>
          Deposit an <strong>anonymised subset</strong> or a set of redacted
          excerpts sufficient to show how codes were derived;
        </li>
        <li>
          Deposit under <strong>controlled access</strong>, where a repository
          releases material to named researchers under an agreement;
        </li>
        <li>
          Where none is possible, explain precisely why in the statement.
        </li>
      </ul>
      <p>
        Consent forms should ask about future sharing at the point of
        collection. Asking then makes sharing possible later; not asking closes
        the option permanently.
      </p>

      <h2 id="where">Where to deposit</h2>
      <p>
        Use a recognised repository that issues a persistent identifier rather
        than a personal website, a cloud drive or a departmental page — those
        disappear. A suitable repository provides a DOI or accession number,
        long-term preservation, and a stated licence.
      </p>
      <p>
        Discipline-specific and institutional repositories are preferred where
        available; general repositories such as{" "}
        <a href="https://zenodo.org" target="_blank" rel="noreferrer">
          Zenodo
        </a>{" "}
        or the{" "}
        <a href="https://dataverse.org" target="_blank" rel="noreferrer">
          Dataverse
        </a>{" "}
        network are acceptable, and both support controlled access where open
        deposit is not appropriate.
      </p>
      <p>
        Small supporting files — a questionnaire, an appendix table — may
        instead be published as supplementary material with the article, where
        they are covered by the article&rsquo;s{" "}
        <Link href="/policies/licensing">CC BY licence</Link>.
      </p>

      <h2 id="citing">Citing and licensing data</h2>
      <p>
        A deposited dataset is a research output and should be cited as one, in
        the reference list, with its authors, title, repository, year and DOI —
        both in your own article and by anyone reusing it. Citing data is how
        the effort of producing it becomes visible.
      </p>
      <p>
        For the data themselves the journal recommends{" "}
        <a
          href="https://creativecommons.org/publicdomain/zero/1.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC0
        </a>
        , because attribution requirements stack awkwardly when datasets are
        combined; the norm of citation does the work that a licence condition
        otherwise would. CC BY is also acceptable. State whichever applies in
        the availability statement.
      </p>

      <h2 id="code">Code and analysis scripts</h2>
      <p>
        Where analysis was performed in software that produces a script or
        syntax file, depositing it is strongly encouraged even when the data
        cannot be shared. Code often reveals more about how results were
        produced than a prose method section can, and it is rarely confidential.
      </p>
      <p>
        Deposit code in a repository that issues a DOI, state the software and
        version, and license it under a recognised open source licence. Where AI
        tools were used to generate analysis code, that is disclosed under the{" "}
        <Link href="/policies/ai-policy">AI-assisted writing policy</Link>.
      </p>

      <h2 id="retention">Retention and requests</h2>
      <p>
        Authors must retain the data underlying a published article for at least{" "}
        <strong>five years</strong> after publication, as the{" "}
        <Link href="/policies/research-integrity">
          research integrity policy
        </Link>{" "}
        requires — including where the statement says the data are not publicly
        available.
      </p>
      <p>
        Where the statement says data are available on request, the journal
        expects the authors to respond to reasonable requests from other
        researchers within a reasonable period, and to apply the criteria they
        stated. An unanswered request is a failure to meet a published
        commitment, and readers may report it to the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        .
      </p>
      <p>
        Editors may request the underlying data at any point during review, or
        after publication where a concern is raised. Refusal to supply data to
        the editor in the course of an investigation is itself treated as a
        serious matter under the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        .
      </p>

      <h2 id="enforcement">What the journal does</h2>
      <ul>
        <li>
          <strong>At desk check</strong> — a manuscript without a statement is
          returned for one.
        </li>
        <li>
          <strong>At review</strong> — reviewers are asked whether the statement
          is consistent with the method described, and whether anything claimed
          to be unshareable plausibly is.
        </li>
        <li>
          <strong>At publication</strong> — the statement is published with the
          article, so the commitment is on the public record.
        </li>
        <li>
          <strong>After publication</strong> — where a statement turns out to be
          inaccurate, the journal publishes a correction amending it under the{" "}
          <Link href="/policies/retraction-correction">
            retraction and correction policy
          </Link>
          .
        </li>
      </ul>
      <p>
        The journal does not decline manuscripts because the data cannot be
        shared. It declines to publish statements that are not true.
      </p>
    </PolicyPage>
  );
}
