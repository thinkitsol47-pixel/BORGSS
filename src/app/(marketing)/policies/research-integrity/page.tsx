import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Research Integrity Policy",
  description:
    "The standards BORJSS expects in how research is designed, analysed and reported: reproducibility, reporting of methods, image and data integrity, and correcting the record.",
};

const TOC = [
  { id: "principles", label: "Principles" },
  { id: "reporting", label: "Reporting the method" },
  { id: "analysis", label: "Analysis and inference" },
  { id: "data-images", label: "Data and image integrity" },
  { id: "reuse", label: "Reuse of one's own work" },
  { id: "screening", label: "What the journal screens for" },
  { id: "correcting", label: "Correcting the record" },
  { id: "responsibility", label: "Who is responsible" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="research-integrity"
      title="Research Integrity Policy"
      lead="Research ethics concerns how participants are treated. Research integrity concerns whether the account given of the work is accurate and complete enough for someone else to rely on."
      toc={TOC}
      updated="2026-01-15"
      related={["publication-ethics", "data-availability", "retraction-correction"]}
    >
      <h2 id="principles">Principles</h2>
      <p>
        The journal expects research to be conducted and reported honestly,
        rigorously and transparently. In practice that reduces to four
        commitments an author makes about their manuscript.
      </p>
      <ul>
        <li>
          <strong>It describes what was actually done</strong> — not a tidier
          study designed after the results were known.
        </li>
        <li>
          <strong>It reports what was actually found</strong> — including
          results that do not support the argument.
        </li>
        <li>
          <strong>It claims no more than the evidence carries</strong> — the
          conclusions match the design, sample and analysis.
        </li>
        <li>
          <strong>It gives another researcher enough to check it</strong> —
          method, instruments, and data or a stated reason why data cannot be
          shared.
        </li>
      </ul>

      <h2 id="reporting">Reporting the method</h2>
      <p>
        A method section is adequate when a competent researcher in the field
        could repeat the study from it. For empirical social science that
        normally requires:
      </p>
      <ul>
        <li>
          <strong>Design and rationale</strong> — what approach was taken, and
          why it suits the question;
        </li>
        <li>
          <strong>Sampling</strong> — the population, how participants were
          recruited and selected, sample size and how it was determined,
          refusals and attrition;
        </li>
        <li>
          <strong>Instruments</strong> — questionnaires, scales, interview
          guides or coding frames, with sources for adapted instruments and
          reliability where applicable;
        </li>
        <li>
          <strong>Procedure</strong> — when and where data were collected, by
          whom, in what language, and how translation was handled;
        </li>
        <li>
          <strong>Analysis</strong> — the techniques used, the software and
          version, how missing data were treated, and any transformations or
          exclusions;
        </li>
        <li>
          <strong>Limitations</strong> — what the design cannot establish,
          stated by the authors rather than left for the reader to notice.
        </li>
      </ul>
      <p>
        Qualitative work is held to the same standard in its own terms:
        sampling logic, the analytic approach, how themes were derived, and how
        the researcher&rsquo;s position bears on the interpretation.
      </p>

      <h2 id="analysis">Analysis and inference</h2>
      <p>
        Several common practices distort the record without amounting to
        fabrication. The journal treats them as integrity failures and asks for
        correction at review.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Selective reporting",
              "Presenting only the outcomes, subgroups or models that produced a favourable result.",
            ],
            [
              "Post-hoc hypotheses",
              "Presenting a hypothesis formed after seeing the data as though it had been specified in advance.",
            ],
            [
              "Undisclosed exclusions",
              "Dropping cases, items or observations without saying so and giving the criterion.",
            ],
            [
              "Causal overreach",
              "Drawing causal conclusions from a design that supports only association.",
            ],
            [
              "Overgeneralisation",
              "Extending findings from one sample or setting to a population it does not represent.",
            ],
            [
              "Significance framing",
              "Treating a p-value threshold as the finding, or describing a null result as inconclusive when the design was adequately powered.",
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
        Exploratory analysis is legitimate and valuable. What the journal
        requires is that it be labelled as exploratory rather than presented as
        confirmatory. A study reported honestly as exploratory is publishable; a
        study reported as though it had tested a hypothesis it did not is not.
      </p>
      <p>
        A well-conducted study that found nothing is a contribution.
        Manuscripts are not declined for reporting a null result.
      </p>

      <h2 id="data-images">Data and image integrity</h2>
      <p>
        Figures must represent the underlying data faithfully. Adjustments to
        brightness, contrast or colour balance are acceptable only where applied
        to the whole image and where they do not obscure or emphasise any
        feature. Splicing, selective erasure, and duplication of a panel across
        figures are not acceptable.
      </p>
      <p>
        Charts must not mislead through presentation: truncated axes, uneven
        scales and inconsistent baselines are corrected at review.
      </p>
      <p>
        Editors may ask for the underlying data, analysis scripts, or original
        instrument responses at any point during review or after publication.
        Authors should therefore retain them — the journal expects retention for{" "}
        <strong>at least five years</strong> after publication. Where data
        cannot be shared for ethical or legal reasons, that reason belongs in
        the manuscript under the{" "}
        <Link href="/policies/data-availability">data availability policy</Link>
        , and the material should still be retained.
      </p>

      <h2 id="reuse">Reuse of one&rsquo;s own work</h2>
      <p>
        Reusing material from one&rsquo;s own earlier publication without
        disclosure misleads readers about how much evidence exists. Authors
        must:
      </p>
      <ul>
        <li>
          Cite their own prior work where the manuscript draws on it, including
          theses, working papers and conference proceedings;
        </li>
        <li>
          Declare at submission where the dataset has been used in another
          publication, and state what is new here;
        </li>
        <li>
          Avoid dividing a single study across several papers where the parts
          share a question, dataset and method and would be better read
          together.
        </li>
      </ul>
      <p>
        A paper developing a genuinely distinct question from a shared dataset
        is acceptable when the relationship is declared. The problem is the
        concealment, not the reuse. Verbatim reuse of one&rsquo;s own prose is
        addressed in the{" "}
        <Link href="/policies/plagiarism">plagiarism policy</Link>.
      </p>

      <h2 id="screening">What the journal screens for</h2>
      <p>
        Every submission passes through similarity screening at desk check.
        Beyond that, integrity checks happen through peer review rather than by
        automated means: reviewers are asked specifically whether the method
        supports the conclusions, and whether anything in the reporting appears
        incomplete.
      </p>
      <p>
        The journal does not currently run automated image-forensics or
        statistical-consistency tools. Where a reviewer or reader raises a
        specific concern, the editor obtains the underlying material and, where
        needed, independent expert advice.
      </p>

      <h2 id="correcting">Correcting the record</h2>
      <p>
        An author who discovers an error in their published work should contact
        the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        promptly, whatever its source and however long ago the article appeared.
      </p>
      <p>
        The journal publishes corrections for errors that affect the reader&rsquo;s
        understanding, and retracts where the findings are no longer reliable.
        The distinction, and the procedure, are set out in the{" "}
        <Link href="/policies/retraction-correction">
          retraction and correction policy
        </Link>
        . Reporting an error in good faith is treated as the responsible act it
        is, not as an admission of misconduct.
      </p>

      <h2 id="responsibility">Who is responsible</h2>
      <p>
        All listed authors are jointly accountable for the integrity of the
        published work. An author who contributed only one part remains
        responsible for satisfying themselves that the whole is sound before
        agreeing to be listed — see the{" "}
        <Link href="/policies/authorship">authorship policy</Link>.
      </p>
      <p>
        The corresponding author additionally undertakes to respond to queries
        about the work after publication, to hold or be able to obtain the
        underlying data, and to act on any concern raised.
      </p>
    </PolicyPage>
  );
}
