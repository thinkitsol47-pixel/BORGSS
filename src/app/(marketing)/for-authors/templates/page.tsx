import type { Metadata } from "next";
import Link from "next/link";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileType2,
  Quote,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Alert, Breadcrumb, Button, Card, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Download the BORJSS manuscript template, title page, cover letter and declarations forms.",
};

const TEMPLATES: {
  icon: LucideIcon;
  name: string;
  format: string;
  size: string;
  required: boolean;
  body: string;
  href: string;
}[] = [
  {
    icon: FileText,
    name: "Manuscript template",
    format: "DOCX",
    size: "48 KB",
    required: true,
    body: "The main file, pre-formatted to journal style: A4, double-spaced, numbered headings, line numbering and APA reference styling already applied. Write directly into it.",
    href: "#",
  },
  {
    icon: FileType2,
    name: "Title page",
    format: "DOCX",
    size: "22 KB",
    required: true,
    body: "Uploaded separately so the main file stays anonymous. Carries all author names, affiliations, ORCID iDs, corresponding author details, acknowledgements and funding.",
    href: "#",
  },
  {
    icon: Quote,
    name: "Cover letter",
    format: "DOCX",
    size: "18 KB",
    required: false,
    body: "A short letter to the editor explaining why the manuscript suits this journal, and listing any reviewers you wish to suggest or exclude, with reasons.",
    href: "#",
  },
  {
    icon: ShieldCheck,
    name: "Declarations form",
    format: "DOCX",
    size: "26 KB",
    required: false,
    body: "Funding, competing interests, ethics approval, data availability, AI use and CRediT author contributions, in the wording the journal expects.",
    href: "#",
  },
  {
    icon: FileSpreadsheet,
    name: "Tables & figures guide",
    format: "PDF",
    size: "310 KB",
    required: false,
    body: "Worked examples of correctly formatted tables and figures, with resolution and accessibility requirements explained.",
    href: "#",
  },
  {
    icon: FileText,
    name: "LaTeX class",
    format: "ZIP",
    size: "94 KB",
    required: false,
    body: "For authors who prefer LaTeX. Includes the class file, a bibliography style matching APA 7, and a worked example. Submit the compiled PDF alongside the source.",
    href: "#",
  },
];

export default function TemplatesPage() {
  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[
          { label: "For Authors", href: "/for-authors/guidelines" },
          { label: "Templates" },
        ]}
      />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>For Authors</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Templates</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Writing into the journal template applies most formatting
          requirements automatically, which is the quickest way to avoid a
          return at desk check.
        </p>
      </header>

      <div className="mt-8">
        <Alert tone="info" title="These files are being prepared">
          Template downloads will be enabled shortly. In the meantime, the{" "}
          <Link href="/for-authors/guidelines" className="font-medium underline">
            author guidelines
          </Link>{" "}
          set out every formatting requirement in full, and manuscripts prepared
          from them are accepted.
        </Alert>
      </div>

      {/* --------------------------------------------------------- files */}
      <section aria-labelledby="downloads" className="mt-10">
        <h2 id="downloads" className="font-serif text-xl font-bold">
          Available templates
        </h2>

        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {TEMPLATES.map(
            ({ icon: Icon, name, format, size, required, body, href }) => (
              <li key={name}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand-dark">
                      <Icon className="size-5" aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-serif text-base font-semibold">
                          {name}
                        </p>
                        {required && (
                          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-foreground">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {format} · {size}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>

                  <Button
                    href={href}
                    variant="outline"
                    size="sm"
                    className="mt-4 self-start"
                  >
                    <Download className="size-4" aria-hidden />
                    Download {format}
                  </Button>
                </Card>
              </li>
            ),
          )}
        </ul>
      </section>

      {/* ------------------------------------------------------ reference */}
      <section aria-labelledby="citation" className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 id="citation" className="font-serif text-lg font-bold">
            Reference style files
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The journal uses <strong>APA 7th edition</strong>. Rather than
            formatting references by hand, install the style in your reference
            manager — it is the single biggest saving in copy-editing time.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["Zotero", "APA 7th edition is included by default."],
              ["Mendeley", "Select American Psychological Association 7th edition."],
              ["EndNote", "Download the APA 7th style from the EndNote output styles library."],
            ].map(([tool, note]) => (
              <li key={tool} className="flex gap-2">
                <span className="shrink-0 font-medium">{tool}</span>
                <span className="text-muted-foreground">— {note}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-serif text-lg font-bold">Using the templates</h2>
          <ol className="mt-3 space-y-2.5 text-sm">
            {[
              "Write your manuscript directly into the template rather than pasting into it — pasting carries over your document's own styles.",
              "Keep the built-in heading styles; the typesetter relies on them.",
              "Leave line numbering switched on. Reviewers cite line numbers.",
              "Fill in the title page separately and upload it as its own file.",
              "Before uploading, run Word's Document Inspector to strip personal information from file properties.",
            ].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span
                  aria-hidden
                  className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-tint text-[11px] font-bold text-brand-darker"
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed text-muted-foreground">
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* ------------------------------------------------------------ cta */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              Manuscript ready?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Run through the submission checklist in the author guidelines, then
              start your submission.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/for-authors/how-to-submit">Start a submission</Button>
            <Button href="/for-authors/guidelines" variant="outline">
              Author guidelines
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Trouble with a template file? Write to{" "}
          <a
            href={`mailto:${siteConfig.contact.support}`}
            className="text-primary hover:underline"
          >
            {siteConfig.contact.support}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
