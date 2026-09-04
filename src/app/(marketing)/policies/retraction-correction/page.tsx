import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Retraction & Correction Policy",
  description:
    "How BORJSS corrects the published record: corrections, expressions of concern, retractions and removal, when each applies, and how the process works.",
};

const TOC = [
  { id: "principle", label: "The principle" },
  { id: "instruments", label: "The four instruments" },
  { id: "corrections", label: "Corrections" },
  { id: "concern", label: "Expressions of concern" },
  { id: "retraction", label: "Retractions" },
  { id: "what-retraction-is-not", label: "What a retraction is not" },
  { id: "removal", label: "Removal" },
  { id: "process", label: "How the process works" },
  { id: "notice", label: "What a notice contains" },
  { id: "record", label: "What happens to the article" },
  { id: "requesting", label: "Requesting a correction" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="retraction-correction"
      title="Retraction & Correction Policy"
      lead="The published record should say what is true. When something published here turns out to be wrong, the journal corrects it openly rather than quietly — and never by making the original disappear."
      toc={TOC}
      updated="2026-01-15"
      related={["publication-ethics", "research-integrity", "complaints-appeals"]}
    >
      <h2 id="principle">The principle</h2>
      <p>
        An article that has been published has been read, cited and relied on.
        Correcting it is therefore not a matter of editing the page: it means
        publishing a visible notice that tells anyone who encounters the
        article, now or in ten years, what changed and why.
      </p>
      <p>
        Three commitments follow, and the journal applies them regardless of who
        the authors are or how long ago the article appeared.
      </p>
      <ul>
        <li>
          <strong>Nothing is changed silently.</strong> Every substantive change
          after publication is accompanied by a citable, permanently linked
          notice.
        </li>
        <li>
          <strong>Nothing is deleted.</strong> A retracted article remains
          available, marked as retracted. Removing it would break the citations
          of everyone who relied on it and hide the fact that it existed.
        </li>
        <li>
          <strong>The reason is stated.</strong> Notices say what was wrong, not
          merely that something was.
        </li>
      </ul>

      <h2 id="instruments">The four instruments</h2>
      <p>
        The journal uses four instruments, following COPE&rsquo;s retraction
        guidelines. Which applies depends on how far the problem goes.
      </p>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Correction",
              "The findings stand; something in the article is wrong and is put right. The article remains valid.",
            ],
            [
              "Expression of concern",
              "A serious question has been raised but is not yet resolved. A temporary warning to readers, not a verdict.",
            ],
            [
              "Retraction",
              "The findings can no longer be relied on. The article stays online, marked retracted, and should not be cited as valid.",
            ],
            [
              "Removal",
              "The article is withdrawn from view entirely. Reserved for legal necessity or serious harm, and used very rarely.",
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

      <h2 id="corrections">Corrections</h2>
      <p>
        A correction is published where the article&rsquo;s conclusions remain
        sound but something in it is wrong in a way that affects how a reader
        understands or uses it. Typical grounds:
      </p>
      <ul>
        <li>An error in data, a table, a figure or a calculation;</li>
        <li>
          A mistake in the method description that would mislead someone
          repeating the study;
        </li>
        <li>
          An omitted or incorrect declaration — funding, competing interests,
          ethics approval;
        </li>
        <li>
          A change to the author list agreed under the{" "}
          <Link href="/policies/authorship">authorship policy</Link>;
        </li>
        <li>
          Missing attribution for a passage or figure, where the problem is
          confined to specific items;
        </li>
        <li>
          A production error introduced by the journal — in which case the
          notice says so, so that no fault attaches to the authors.
        </li>
      </ul>
      <p>
        Trivial errors that cannot mislead anyone — a misspelled word, a
        formatting fault — are fixed without a notice, and the article records
        the date it was updated. Anything touching data, meaning, attribution or
        a declaration gets a notice.
      </p>

      <h2 id="concern">Expressions of concern</h2>
      <p>
        An expression of concern is published while a serious question is being
        investigated, so readers are not misled in the meantime. It is used
        where:
      </p>
      <ul>
        <li>
          There is credible evidence of a problem, but the investigation is not
          complete;
        </li>
        <li>
          An institutional investigation is under way and will take time;
        </li>
        <li>
          The authors have not responded, or their response has not resolved the
          concern;
        </li>
        <li>
          The journal is satisfied a real question exists but cannot itself
          establish the facts.
        </li>
      </ul>
      <p>
        It is explicitly not a finding against the authors. When the matter
        concludes, the expression of concern is replaced by a retraction or
        withdrawn — and if withdrawn, the notice records that the concern was
        not upheld, so the authors are not left under a permanent shadow.
      </p>

      <h2 id="retraction">Retractions</h2>
      <p>
        An article is retracted where its findings can no longer be relied on,
        whether the cause was misconduct or honest error. Grounds include:
      </p>
      <ul>
        <li>
          <strong>Unreliable findings</strong> — from fabrication, falsification
          or a major error in method or analysis;
        </li>
        <li>
          <strong>Substantial plagiarism</strong>, under the{" "}
          <Link href="/policies/plagiarism">plagiarism policy</Link>;
        </li>
        <li>
          <strong>Redundant publication</strong> — the work has been published
          elsewhere without disclosure;
        </li>
        <li>
          <strong>Unethical research</strong> — conducted without required
          approval or consent, under the{" "}
          <Link href="/policies/research-ethics">research ethics policy</Link>;
        </li>
        <li>
          <strong>Compromised review</strong> — the peer review process was
          manipulated;
        </li>
        <li>
          <strong>Copyright infringement</strong> or another legal defect going
          to the substance of the article;
        </li>
        <li>
          <strong>An undisclosed competing interest</strong> serious enough that
          readers would have judged the work differently.
        </li>
      </ul>
      <p>
        <strong>Retraction is not a punishment.</strong> It is a statement about
        the reliability of the findings, and it applies equally to an honest
        error the authors themselves discovered. Where authors identify a fatal
        problem in their own work and ask for a retraction, the notice records
        that they initiated it — which is to their credit, and the journal says
        so.
      </p>
      <p>
        Where only part of an article is affected and the remainder stands
        independently, the journal issues a partial retraction identifying
        precisely what is withdrawn.
      </p>

      <h2 id="what-retraction-is-not">What a retraction is not</h2>
      <p>
        The journal does not retract an article because:
      </p>
      <ul>
        <li>
          Its conclusions are contested, or later work reaches a different
          finding — that is how research proceeds, and the answer is publication
          and debate, not retraction;
        </li>
        <li>
          Its findings are inconvenient to a government, institution, funder or
          donor — see{" "}
          <Link href="/policies/editorial-independence">
            editorial independence
          </Link>
          ;
        </li>
        <li>
          An author has since changed employer, fallen out with a co-author, or
          would prefer it were not on their record;
        </li>
        <li>Someone has complained about it without evidence of a defect.</li>
      </ul>

      <h2 id="removal">Removal</h2>
      <p>
        Removing an article defeats the purpose of the published record, and the
        journal treats it as a last resort. It is used only where:
      </p>
      <ul>
        <li>
          A court has ordered it, or the content is defamatory or otherwise
          unlawful;
        </li>
        <li>
          The article infringes a legal right in a way that cannot be cured by
          correction;
        </li>
        <li>
          Leaving it available would present a real risk to someone&rsquo;s
          safety, or would breach the privacy of a research participant.
        </li>
      </ul>
      <p>
        Even then, the article&rsquo;s metadata — title, authors, DOI, date —
        and a notice stating that it was removed and on what basis remain in
        place, so the citation continues to resolve and the removal is visible
        rather than silent. Where a court order forbids explaining the reason,
        the notice says that a legal restriction applies.
      </p>

      <h2 id="process">How the process works</h2>
      <ol>
        <li>
          <strong>A concern is raised</strong> — by a reader, a reviewer, an
          editor, an institution, or the authors themselves.
        </li>
        <li>
          <strong>Assessment.</strong> The editorial office establishes whether
          the concern is specific and credible enough to act on.
        </li>
        <li>
          <strong>The authors are told</strong> what has been raised, shown the
          evidence, and given a fair opportunity to respond — normally within 21
          days. Every author is copied, not only the corresponding author.
        </li>
        <li>
          <strong>Investigation</strong> by an editor with no involvement in the
          original decision, with independent expert advice where needed, under
          the{" "}
          <Link href="/policies/publication-ethics">
            publication ethics policy
          </Link>
          . Where the question concerns research conduct rather than publication
          conduct, it is referred to the authors&rsquo; institution.
        </li>
        <li>
          <strong>Decision</strong> by the Editor-in-Chief, taken on the
          reliability of the findings rather than on the authors&rsquo;
          cooperation.
        </li>
        <li>
          <strong>Publication of the notice</strong>, and notification of the
          authors, their institution where relevant, and the indexing services.
        </li>
      </ol>
      <p>
        Where the authors disagree with the outcome, they may appeal under the{" "}
        <Link href="/policies/complaints-appeals">
          complaints and appeals policy
        </Link>
        . An article is not left uncorrected while an appeal proceeds; where a
        retraction is later overturned, the journal publishes a further notice
        reinstating the article.
      </p>
      <p>
        A notice is published even where the authors do not agree with it, or
        cannot be reached. In that case it records that the authors did not
        agree, or could not be contacted, and which authors did agree.
      </p>

      <h2 id="notice">What a notice contains</h2>
      <p>
        Every notice is a citable item with its own DOI, freely available, and
        linked in both directions with the article it concerns. It states:
      </p>
      <ul>
        <li>The title, authors and DOI of the article concerned;</li>
        <li>Who initiated the action — authors, editors, or the institution;</li>
        <li>
          The reason, stated specifically enough that a reader can judge what it
          means for the findings;
        </li>
        <li>
          For a correction, exactly what changed, so the original and corrected
          text can be compared;
        </li>
        <li>
          For a retraction, whether the cause was misconduct or honest error;
        </li>
        <li>
          Which authors agree with the notice, where they do not all agree;
        </li>
        <li>The date it was published.</li>
      </ul>
      <p>
        Notices avoid language that alleges more than has been established.
        Where an institutional investigation reached a finding, the notice
        reports the finding rather than the journal&rsquo;s own inference from
        it.
      </p>

      <h2 id="record">What happens to the article</h2>
      <p>
        The original article always remains available. What changes is how it is
        presented:
      </p>
      <ul>
        <li>
          A watermark and a banner on the article page and the PDF identify it
          as corrected, subject to an expression of concern, or retracted;
        </li>
        <li>
          The notice is linked from the article, and the article from the
          notice;
        </li>
        <li>
          The article&rsquo;s Crossref metadata is updated so that reference
          managers, indexes and other services show its status;
        </li>
        <li>
          For a correction, the corrected version becomes the version of record,
          and the original remains accessible so the change can be verified;
        </li>
        <li>
          A retracted article remains in the issue in which it appeared. It is
          not removed from the archive or renumbered.
        </li>
      </ul>

      <h2 id="requesting">Requesting a correction</h2>
      <p>
        Authors who find an error in their own published work should write to
        the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>{" "}
        as soon as they become aware of it, giving the article title and DOI,
        the exact location of the error, what it should say, and whether the
        conclusions are affected.
      </p>
      <p>
        Readers may report a suspected error the same way, with the specific
        evidence. Reporting an error in one&rsquo;s own work in good faith is
        treated as the responsible act it is, and never as an admission of
        misconduct. The obligation to report such errors is set out in the{" "}
        <Link href="/policies/research-integrity">
          research integrity policy
        </Link>
        .
      </p>
    </PolicyPage>
  );
}
