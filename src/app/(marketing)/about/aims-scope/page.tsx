import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { DocPage, DocAside } from "@/components/layout/doc-page";

export const metadata: Metadata = {
  title: "Aims & Scope",
  description:
    "The subject areas BORJSS covers, the types of manuscript it accepts, and what falls outside its scope.",
};

const SUBJECTS = [
  ["Economics & Development", "Development finance, labour, poverty, inequality, trade"],
  ["Sociology & Anthropology", "Social structure, family, community, migration, identity"],
  ["Political Science & Governance", "Institutions, public policy, governance, political behaviour"],
  ["Education", "Policy, pedagogy, access, assessment, educational technology"],
  ["Public Administration", "Service delivery, bureaucratic reform, local government"],
  ["Psychology & Behavioural Science", "Social and applied psychology, behavioural interventions"],
  ["Media & Communication", "Journalism, digital media, public discourse"],
  ["Gender & Development", "Women's participation, gendered outcomes, household dynamics"],
  ["Urban & Regional Studies", "Urbanisation, housing, planning, regional disparity"],
  ["Environment & Society", "Climate adaptation, resource governance, environmental justice"],
];

const TYPES = [
  {
    name: "Research Articles",
    words: "6,000–9,000 words",
    body: "Original empirical or theoretical work presenting new findings, with a clear methodology and contribution to the literature.",
  },
  {
    name: "Review Articles",
    words: "7,000–10,000 words",
    body: "Systematic or critical reviews that synthesise an existing body of scholarship and identify gaps worth pursuing.",
  },
  {
    name: "Conceptual Papers",
    words: "5,000–8,000 words",
    body: "Theoretical or framework-building contributions that advance how a problem is understood, without new primary data.",
  },
  {
    name: "Case Studies",
    words: "4,000–7,000 words",
    body: "In-depth examination of a specific context, programme or institution, with explicit lessons for theory or practice.",
  },
  {
    name: "Book Reviews",
    words: "1,000–2,000 words",
    body: "Critical assessment of a recent scholarly book relevant to the journal's scope.",
  },
];

const TOC = [
  { id: "aims", label: "Aims" },
  { id: "scope", label: "Subject coverage" },
  { id: "types", label: "Manuscript types" },
  { id: "out-of-scope", label: "Out of scope" },
  { id: "audience", label: "Readership" },
];

export default function AimsScopePage() {
  return (
    <DocPage
      eyebrow="About the Journal"
      title="Aims & Scope"
      lead={`What ${siteConfig.shortName} publishes, the subjects it covers, and the kinds of manuscript it accepts.`}
      breadcrumb={[
        { label: "About", href: "/about" },
        { label: "Aims & Scope" },
      ]}
      toc={TOC}
      updated="2026-01-15"
      aside={
        <DocAside title="Before you submit">
          <p className="text-muted-foreground">
            Check that your manuscript fits the scope above, then read the
            preparation requirements.
          </p>
          <Link
            href="/for-authors/guidelines"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Author guidelines →
          </Link>
          <Link
            href="/for-authors/submission-process"
            className="block font-medium text-primary hover:text-brand-dark"
          >
            Submission process →
          </Link>
        </DocAside>
      }
    >
      <h2 id="aims">Aims</h2>
      <p>
        The <strong>{siteConfig.name}</strong> ({siteConfig.shortName}) publishes
        peer-reviewed research across the social sciences. The journal exists to
        give scholars — particularly those working in and on the Global South —
        a rigorous, openly accessible venue for work that speaks beyond a single
        discipline.
      </p>
      <p>We aim to:</p>
      <ul>
        <li>
          Publish methodologically sound research that advances understanding of
          social, economic and institutional questions.
        </li>
        <li>
          Provide a fair, timely and transparent double-blind review process,
          with a median time to first decision of around six weeks.
        </li>
        <li>
          Make every published article free to read and reuse under a Creative
          Commons licence, with no charge to readers.
        </li>
        <li>
          Encourage work that connects rigorous analysis to policy and practice,
          including research addressed to regional and local audiences.
        </li>
      </ul>

      <h2 id="scope">Subject coverage</h2>
      <p>
        The journal welcomes empirical, theoretical and methodologically
        innovative work in the following areas. This list is indicative rather
        than exhaustive; interdisciplinary submissions that span two or more of
        these areas are particularly welcome.
      </p>

      <div className="not-prose mt-6 grid gap-3 sm:grid-cols-2">
        {SUBJECTS.map(([name, detail]) => (
          <div
            key={name}
            className="rounded-lg border border-brand-border bg-card p-4"
          >
            <p className="font-serif text-[15px] font-semibold">{name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {detail}
            </p>
          </div>
        ))}
      </div>

      <h2 id="types">Manuscript types</h2>
      <p>
        Word counts are indicative and exclude references, tables and appendices.
        Manuscripts substantially outside these ranges should be discussed with
        the editorial office before submission.
      </p>

      <div className="not-prose mt-6 space-y-3">
        {TYPES.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border border-brand-border bg-card p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-[15px] font-semibold">{t.name}</p>
              <p className="text-xs font-medium text-brand-dark">{t.words}</p>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t.body}
            </p>
          </div>
        ))}
      </div>

      <h2 id="out-of-scope">Out of scope</h2>
      <p>
        To set expectations clearly, the following are normally declined at desk
        review:
      </p>
      <ul>
        <li>
          Work in the natural sciences, engineering or clinical medicine with no
          substantive social-science component.
        </li>
        <li>
          Purely descriptive reports with no analytical framing or engagement
          with existing literature.
        </li>
        <li>
          Manuscripts under simultaneous consideration elsewhere, or substantially
          overlapping with the authors&rsquo; already-published work.
        </li>
        <li>
          Opinion pieces, advocacy documents and commercial or promotional
          content.
        </li>
      </ul>

      <h2 id="audience">Readership</h2>
      <p>
        {siteConfig.shortName} is read by academic researchers, postgraduate
        students, policy analysts and practitioners in government and the
        development sector. Authors should write for an informed but
        cross-disciplinary audience: define specialist terminology, and state
        the significance of findings in plain language.
      </p>
      <p>
        For questions about whether a specific manuscript falls within scope,
        contact the editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        .
      </p>
    </DocPage>
  );
}
