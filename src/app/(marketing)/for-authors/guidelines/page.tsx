import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { DocPage, DocAside } from "@/components/layout/doc-page";
import { Alert, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Author Guidelines",
  description:
    "How to prepare a manuscript for BORJSS: structure, formatting, references, figures, anonymity and file requirements.",
};

const TOC = [
  { id: "before", label: "Before you submit" },
  { id: "types", label: "Manuscript types" },
  { id: "structure", label: "Structure" },
  { id: "formatting", label: "Formatting" },
  { id: "anonymity", label: "Preparing for blind review" },
  { id: "references", label: "References" },
  { id: "figures", label: "Figures & tables" },
  { id: "declarations", label: "Required declarations" },
  { id: "files", label: "Files to upload" },
  { id: "checklist", label: "Submission checklist" },
];

const CHECKLIST = [
  "The manuscript is original and is not under consideration at another journal.",
  "The submission falls within the journal's aims and scope.",
  "The main file is anonymised: no author names, affiliations or acknowledgements.",
  "A separate title page includes all author details and ORCID iDs.",
  "The abstract is 250–300 words and needs no reference to be understood.",
  "Between three and eight keywords are supplied.",
  "References follow APA 7th edition and every in-text citation appears in the list.",
  "DOIs are included for all references that have one.",
  "Figures and tables are numbered, captioned and cited in the text.",
  "Ethics approval is stated where human participants were involved.",
  "All named authors meet the authorship criteria and have approved the submission.",
  "Any use of AI tools is disclosed as required by the AI policy.",
];

/** Definition row used by the formatting and file tables. */
function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[13rem_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{term}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

export default function GuidelinesPage() {
  return (
    <DocPage
      eyebrow="For Authors"
      title="Author Guidelines"
      lead="Everything your manuscript needs before you submit. Following these requirements prevents the most common reason for delay: a return at desk check."
      breadcrumb={[
        { label: "For Authors", href: "/for-authors/guidelines" },
        { label: "Author Guidelines" },
      ]}
      toc={TOC}
      updated="2026-01-15"
      aside={
        <DocAside title="Related">
          <Link
            href="/for-authors/templates"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Download templates →
          </Link>
          <Link
            href="/for-authors/submission-process"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            What happens next →
          </Link>
          <Link
            href="/about/aims-scope"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Aims &amp; scope →
          </Link>
          <Link
            href="/apc"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Publication charges →
          </Link>
        </DocAside>
      }
    >
      <h2 id="before">Before you submit</h2>
      <p>
        Two checks save the most time. First, confirm your manuscript falls
        within the journal&rsquo;s{" "}
        <Link href="/about/aims-scope">aims and scope</Link> — work outside it is
        declined at desk review regardless of quality. Second, download the{" "}
        <Link href="/for-authors/templates">manuscript template</Link> and write
        into it; most formatting requirements below are already applied there.
      </p>

      <div className="not-prose my-6">
        <Alert tone="info" title="Submissions are made online">
          Manuscripts are submitted through the journal&rsquo;s portal, not by
          email. You will need a free account, which also lets you track your
          manuscript through review.
        </Alert>
      </div>

      <h2 id="types">Manuscript types and length</h2>
      <p>
        Word counts exclude the abstract, references, tables and appendices.
        Discuss substantially longer manuscripts with the editorial office
        before submitting.
      </p>

      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          <Row term="Research Article">
            6,000–9,000 words. Original empirical or theoretical work.
          </Row>
          <Row term="Review Article">
            7,000–10,000 words. Systematic or critical synthesis of a literature.
          </Row>
          <Row term="Conceptual Paper">
            5,000–8,000 words. Theory or framework building, no new primary data.
          </Row>
          <Row term="Case Study">
            4,000–7,000 words. In-depth study of one context, programme or
            institution.
          </Row>
          <Row term="Book Review">
            1,000–2,000 words. Critical assessment of a recent scholarly book.
          </Row>
        </dl>
      </div>

      <h2 id="structure">Structure</h2>
      <p>
        Empirical manuscripts should follow the standard sequence below.
        Conceptual and review papers may depart from it where the argument
        requires, but must still open with an abstract and close with
        references.
      </p>
      <ol>
        <li>
          <strong>Title</strong> — informative and specific; avoid questions and
          declarative claims that the evidence cannot carry.
        </li>
        <li>
          <strong>Abstract</strong> — 250–300 words, unstructured, self-contained.
          State the problem, data and method, principal findings, and what
          follows from them. Do not cite references in the abstract.
        </li>
        <li>
          <strong>Keywords</strong> — three to eight, chosen for how a reader
          would search rather than to repeat the title.
        </li>
        <li>
          <strong>Introduction</strong> — the problem, why it matters, and the
          specific contribution of this paper.
        </li>
        <li>
          <strong>Literature review</strong> — positioned relative to existing
          work; identify the gap this paper addresses.
        </li>
        <li>
          <strong>Methodology</strong> — sufficient detail for another researcher
          to repeat the study. State the sampling strategy, instruments and
          analytical approach.
        </li>
        <li>
          <strong>Results</strong> — findings without interpretation. Report
          effect sizes and uncertainty, not significance alone.
        </li>
        <li>
          <strong>Discussion</strong> — what the findings mean, how they relate
          to prior work, and their limitations. Be explicit about what the study
          cannot establish.
        </li>
        <li>
          <strong>Conclusion</strong> — the contribution and its implications for
          research or policy.
        </li>
        <li>
          <strong>Declarations</strong> — funding, competing interests, ethics,
          data availability.
        </li>
        <li>
          <strong>References</strong> — APA 7th edition.
        </li>
      </ol>

      <h2 id="formatting">Formatting</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          <Row term="File format">
            Microsoft Word (.docx). LaTeX submissions must include the compiled
            PDF and source files.
          </Row>
          <Row term="Page size">A4, 2.5 cm margins on all sides.</Row>
          <Row term="Typeface">
            Times New Roman 12 pt, or an equivalent serif face.
          </Row>
          <Row term="Line spacing">
            Double-spaced throughout, including references and block quotations.
          </Row>
          <Row term="Alignment">Left-aligned; do not justify.</Row>
          <Row term="Numbering">
            Continuous page numbers and line numbers — reviewers cite them.
          </Row>
          <Row term="Headings">
            Maximum three levels, numbered (1, 1.1, 1.1.1).
          </Row>
          <Row term="Spelling">
            British or American English, applied consistently within a
            manuscript.
          </Row>
          <Row term="Language">
            English. Have the manuscript proofread before submission; language
            that obscures the argument is grounds for return.
          </Row>
        </dl>
      </div>

      <h2 id="anonymity">Preparing for blind review</h2>
      <p>
        {siteConfig.shortName} operates{" "}
        <Link href="/policies/peer-review">double-blind peer review</Link>.
        Reviewers must not be able to identify the authors, so the main
        manuscript file must be anonymised before upload.
      </p>

      <div className="not-prose my-6">
        <Alert tone="warning" title="A manuscript that identifies its authors will be returned">
          This is the single most common reason for a submission being sent back
          at desk check.
        </Alert>
      </div>

      <p>Remove from the main file:</p>
      <ul>
        <li>Author names, affiliations, email addresses and ORCID iDs.</li>
        <li>Acknowledgements and funding statements — these go on the title page.</li>
        <li>
          Self-citations phrased identifiably. Write &ldquo;Khan (2023)
          found&rdquo; rather than &ldquo;in our earlier work (Khan, 2023) we
          found&rdquo;.
        </li>
        <li>
          Institutional identifiers in ethics statements — write &ldquo;approved
          by the institutional review board&rdquo;, naming it only on the title
          page.
        </li>
        <li>
          Document properties. In Word: File → Info → Check for Issues → Inspect
          Document → remove Document Properties and Personal Information.
        </li>
      </ul>

      <h2 id="references">References</h2>
      <p>
        Use <strong>APA 7th edition</strong> for both in-text citations and the
        reference list. Every in-text citation must appear in the list, and every
        entry in the list must be cited in the text.
      </p>
      <ul>
        <li>
          Include a DOI for every reference that has one, formatted as{" "}
          <code>https://doi.org/10.xxxx/xxxxx</code>.
        </li>
        <li>
          Cite the published version rather than a preprint where one exists.
        </li>
        <li>
          Give a full retrieval date for web sources without a stable
          identifier.
        </li>
        <li>
          A reference manager (Zotero, Mendeley, EndNote) is strongly
          recommended; hand-formatted lists are the most common source of
          copy-editing delay.
        </li>
      </ul>

      <h2 id="figures">Figures and tables</h2>
      <ul>
        <li>
          Number figures and tables consecutively in the order they are first
          cited in the text.
        </li>
        <li>
          Every figure and table needs a caption that makes it intelligible
          without the surrounding text.
        </li>
        <li>
          Supply figures at a minimum of 300 dpi, as TIFF, PNG or vector PDF.
          Screenshots of charts are not accepted.
        </li>
        <li>
          Do not rely on colour alone to distinguish categories — use pattern,
          shape or direct labelling so the figure survives greyscale printing
          and colour-blind readers.
        </li>
        <li>
          Tables must be supplied as editable text, never as images. Do not use
          vertical rules.
        </li>
        <li>
          Reproduced material requires written permission from the copyright
          holder; supply it at submission and credit the source in the caption.
        </li>
      </ul>

      <h2 id="declarations">Required declarations</h2>
      <p>
        These appear before the reference list. State them explicitly, including
        where the answer is &ldquo;none&rdquo;.
      </p>
      <ul>
        <li>
          <strong>Funding</strong> — name each funder and the grant number, or
          state that the research received no external funding.
        </li>
        <li>
          <strong>Competing interests</strong> — financial or personal
          relationships that could be seen to influence the work. See the{" "}
          <Link href="/policies/conflict-of-interest">
            conflict of interest policy
          </Link>
          .
        </li>
        <li>
          <strong>Ethics approval</strong> — required for any research involving
          human participants, along with a statement on informed consent.
        </li>
        <li>
          <strong>Data availability</strong> — where the data underlying the
          findings can be obtained, or why they cannot be shared.
        </li>
        <li>
          <strong>AI use</strong> — disclose any generative AI used in preparing
          the manuscript, as set out in the{" "}
          <Link href="/policies/ai-policy">AI-assisted writing policy</Link>. AI
          tools cannot be listed as authors.
        </li>
        <li>
          <strong>Author contributions</strong> — describe each author&rsquo;s
          role using CRediT taxonomy terms.
        </li>
      </ul>

      <h2 id="files">Files to upload</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          <Row term="Anonymised manuscript">
            Required. .docx, with no identifying information anywhere in the file
            or its properties.
          </Row>
          <Row term="Title page">
            Required. Separate file: title, all authors with affiliations and
            ORCID iDs, the corresponding author&rsquo;s contact details,
            acknowledgements and funding.
          </Row>
          <Row term="Cover letter">
            Recommended. Why this manuscript suits this journal, and any
            reviewers you wish to suggest or exclude, with reasons.
          </Row>
          <Row term="Figures">
            Where applicable. One file per figure, 300 dpi minimum.
          </Row>
          <Row term="Supplementary material">
            Optional. Instruments, extended tables, code. Published alongside
            the article as supplied.
          </Row>
          <Row term="Permissions">
            Where third-party material is reproduced.
          </Row>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Maximum 20 MB per file. Contact{" "}
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="text-primary hover:underline"
          >
            technical support
          </a>{" "}
          if your files exceed this.
        </p>
      </div>

      <h2 id="checklist">Submission checklist</h2>
      <p>
        Confirm each item before you begin. The submission form asks you to
        declare most of them.
      </p>

      <ul className="not-prose mt-5 space-y-2.5">
        {CHECKLIST.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden
              className="mt-1 grid size-4 shrink-0 place-items-center rounded border-2 border-brand-border"
            />
            <span className="text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <div className="not-prose mt-8 rounded-lg border border-brand-border bg-brand-tint/30 p-6">
        <p className="font-serif text-lg font-bold">Ready to submit?</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          The submission form takes you through six steps and saves as you go,
          so you can return to a draft at any time.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/for-authors/how-to-submit">Start a submission</Button>
          <Button href="/for-authors/templates" variant="outline">
            Download templates
          </Button>
        </div>
      </div>
    </DocPage>
  );
}
