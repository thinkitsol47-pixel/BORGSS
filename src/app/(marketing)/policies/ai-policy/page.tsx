import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "AI-Assisted Writing Policy",
  description:
    "How BORJSS treats generative AI: tools cannot be authors, use must be disclosed, reviewers may not upload manuscripts, and authors remain fully accountable.",
};

const TOC = [
  { id: "position", label: "The journal's position" },
  { id: "not-authors", label: "AI tools cannot be authors" },
  { id: "permitted", label: "Use that must be disclosed" },
  { id: "no-disclosure", label: "Use that needs no disclosure" },
  { id: "prohibited", label: "Use that is not permitted" },
  { id: "how", label: "How to disclose" },
  { id: "accountability", label: "Accountability" },
  { id: "reviewers", label: "Reviewers" },
  { id: "editors", label: "Editors" },
  { id: "detection", label: "Detection" },
  { id: "breaches", label: "Undisclosed use" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="ai-policy"
      title="AI-Assisted Writing Policy"
      lead="Generative AI may assist in preparing a manuscript, within limits and with disclosure. It cannot be an author, it cannot be given a manuscript to review, and it cannot carry responsibility for anything it produces."
      toc={TOC}
      related={["authorship", "research-integrity", "reviewer-ethics"]}
    >
      <h2 id="position">The journal&rsquo;s position</h2>
      <p>
        Generative AI tools are in ordinary use, and a policy that pretended
        otherwise would only make disclosure less honest. {siteConfig.shortName}{" "}
        neither bans these tools nor treats their use as unremarkable. Three
        principles govern how the journal handles them.
      </p>
      <ol>
        <li>
          <strong>Accountability cannot be delegated.</strong> A tool cannot
          take responsibility for what it produces, so the responsibility
          remains entirely with the human authors.
        </li>
        <li>
          <strong>Substantive use must be visible.</strong> Readers and
          reviewers are entitled to know how a manuscript was produced where
          that bears on how they should read it.
        </li>
        <li>
          <strong>Confidentiality is absolute.</strong> Nobody may put another
          person&rsquo;s unpublished work into a third-party service.
        </li>
      </ol>
      <p>
        &ldquo;Generative AI&rdquo; here means any tool that produces text,
        images, code, data or analysis from a prompt — large language model
        assistants, AI writing and paraphrasing tools, and image generators.
      </p>

      <h2 id="not-authors">AI tools cannot be authors</h2>
      <p>
        No AI tool may be listed as an author or co-author, and none may be
        named in the acknowledgements as a contributor.
      </p>
      <p>
        The reason is not symbolic. Authorship under the{" "}
        <Link href="/policies/authorship">authorship policy</Link> requires
        approving the final version and being accountable for the integrity of
        the work — including answering for it after publication. A tool can do
        neither. Nor can it hold copyright, declare a competing interest,
        consent to publication, or respond to a query about its own output.
      </p>

      <h2 id="permitted">Use that must be disclosed</h2>
      <p>
        The following uses are permitted, and must be declared in the manuscript.
        Declaring them has no bearing on the editorial decision.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Drafting assistance",
              "Generating any passage of text that appears, in edited or unedited form, in the manuscript.",
            ],
            [
              "Substantial rewriting",
              "Restructuring or rewriting sections of your own draft, beyond sentence-level correction.",
            ],
            [
              "Translation",
              "Translating your own text into English for submission.",
            ],
            [
              "Summarising sources",
              "Producing summaries of literature that informed the review or discussion.",
            ],
            [
              "Analysis and code",
              "Generating analysis scripts, statistical code, or code used to process data.",
            ],
            [
              "Data handling",
              "Coding qualitative material, classifying responses, or extracting data from documents.",
            ],
            [
              "Images and figures",
              "Any generated image or figure element. Generated images are not accepted as research data or evidence in any circumstances.",
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
        Where AI was used as part of the research method itself — for coding
        interview transcripts, say, or classifying a corpus — disclosure in the
        declaration is not enough. It belongs in the methods section, with the
        tool, the version, the prompts or classification criteria, and how the
        output was validated against human judgement, as any other instrument
        would be reported under the{" "}
        <Link href="/policies/research-integrity">
          research integrity policy
        </Link>
        .
      </p>

      <h2 id="no-disclosure">Use that needs no disclosure</h2>
      <p>
        Routine assistive tools that correct rather than generate need not be
        declared:
      </p>
      <ul>
        <li>Spelling and grammar checkers;</li>
        <li>Reference managers and citation formatters;</li>
        <li>Sentence-level suggestions of the kind a word processor offers;</li>
        <li>Search tools used to find literature, where you then read it;</li>
        <li>Statistical software used in the ordinary way.</li>
      </ul>
      <p>
        The line is between correcting text you wrote and generating text you
        did not. If you are unsure which side a use falls on, declare it —
        over-disclosure costs nothing.
      </p>

      <h2 id="prohibited">Use that is not permitted</h2>
      <ul>
        <li>
          <strong>Fabricating data or results.</strong> Generated data presented
          as observed, or generated images presented as evidence, is
          fabrication, and is treated as such under the{" "}
          <Link href="/policies/publication-ethics">
            publication ethics policy
          </Link>
          .
        </li>
        <li>
          <strong>Generating references.</strong> AI tools invent plausible
          citations. Every reference must be one the authors have located and
          read. Fabricated references are the most common way undisclosed AI use
          surfaces, and they are treated as a serious integrity failure whether
          or not the tool was declared.
        </li>
        <li>
          <strong>Generating the analysis or the argument.</strong> The
          interpretation, the claims and the conclusions must be the
          authors&rsquo; own reasoning.
        </li>
        <li>
          <strong>Paraphrasing to evade similarity screening.</strong> Running
          another&rsquo;s text through a paraphrasing tool is plagiarism, and is
          handled under the{" "}
          <Link href="/policies/plagiarism">plagiarism policy</Link>.
        </li>
        <li>
          <strong>Entering confidential material into a tool.</strong> Applies
          to unpublished data belonging to others, participant data, and any
          manuscript you are reviewing.
        </li>
      </ul>

      <h2 id="how">How to disclose</h2>
      <p>
        Disclosure goes in a short statement near the end of the manuscript,
        before the references, headed &ldquo;Use of AI tools&rdquo;. It is
        published with the article. It should name the tool and version, say
        what it was used for, and state that the authors reviewed and take
        responsibility for the output. For example:
      </p>
      <div className="not-prose my-5 rounded-lg border border-brand-border bg-brand-tint/30 p-4">
        <p className="text-sm leading-relaxed">
          The authors used [tool and version] to [improve the readability of the
          discussion section]. The authors reviewed and edited the output and
          take full responsibility for the content of this article.
        </p>
      </div>
      <p>
        Where no generative AI was used, say so: &ldquo;No generative AI tools
        were used in the preparation of this manuscript.&rdquo; A missing
        statement is not read as an absence of use, and the manuscript is
        returned for one — as with the competing-interests statement under the{" "}
        <Link href="/policies/conflict-of-interest">
          conflict of interest policy
        </Link>
        .
      </p>

      <h2 id="accountability">Accountability</h2>
      <p>
        Authors are fully responsible for every part of a manuscript, whatever
        produced it. &ldquo;The tool generated it&rdquo; is not a defence to a
        fabricated reference, an inaccurate summary, an unattributed passage or
        a false claim.
      </p>
      <p>
        Before submitting, authors should have verified that every reference
        exists and says what it is cited for; that every factual claim is
        supported by a source they have read; that no passage reproduces
        someone else&rsquo;s text without attribution; and that the argument is
        one they can defend in their own words.
      </p>

      <h2 id="reviewers">Reviewers</h2>
      <p>
        <strong>
          Reviewers must not enter any part of a manuscript, or their report on
          it, into a generative AI tool.
        </strong>{" "}
        A manuscript under review is confidential unpublished work, and
        uploading it transmits it to a third party outside the authors&rsquo;
        control.
      </p>
      <p>
        This holds regardless of a tool&rsquo;s claims about data retention, and
        regardless of the reviewer&rsquo;s intent. It applies to summarisers and
        translation services as much as to chat assistants. A review must also
        be the reviewer&rsquo;s own specialist judgement; a generated report is
        of no use to an editor. See the{" "}
        <Link href="/policies/reviewer-ethics">
          peer reviewer ethics policy
        </Link>
        .
      </p>

      <h2 id="editors">Editors</h2>
      <p>
        The same confidentiality rule binds editors: no part of a submitted
        manuscript may be entered into a generative AI service at any stage of
        handling.
      </p>
      <p>
        Editorial decisions are made by people. AI tools are not used to screen,
        assess, rank or decide on submissions, and no decision is taken on the
        output of an automated system.
      </p>

      <h2 id="detection">Detection</h2>
      <p>
        The journal does not use AI-detection software, and does not accept
        detector output as evidence. These tools produce false positives at
        rates that make them unusable, and they flag the writing of
        second-language authors disproportionately — which in this
        journal&rsquo;s author community would be an unfair instrument.
      </p>
      <p>
        Concerns are instead pursued through what can be checked: whether the
        references exist and support what they are cited for, whether the
        described method could have produced the reported results, and whether
        the authors can explain their own analysis when asked. Those checks
        establish something; a detector score does not.
      </p>

      <h2 id="breaches">Undisclosed use</h2>
      <p>
        Where undisclosed use comes to light, the authors are shown the specific
        concern and given a fair opportunity to respond, following the procedure
        in the{" "}
        <Link href="/policies/publication-ethics">
          publication ethics policy
        </Link>
        . The response is proportionate:
      </p>
      <ul>
        <li>
          <strong>Undisclosed but otherwise legitimate use</strong> — the
          statement is added, before publication or by correction afterwards.
          The journal treats a first instance of this as a reporting failure
          rather than misconduct.
        </li>
        <li>
          <strong>Fabricated references or content</strong> — the manuscript is
          rejected, or, if published, corrected where confined to specific
          references and retracted where the substance is affected.
        </li>
        <li>
          <strong>Generated data or images presented as real</strong> — treated
          as fabrication: rejection or retraction, and the author&rsquo;s
          institution informed.
        </li>
      </ul>
      <p>
        This policy will be revised as these tools and the norms around them
        change. Questions about a specific use are welcome at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        before submission — asking is never held against an author.
      </p>
    </PolicyPage>
  );
}
