"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Article } from "@/types";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui";

/**
 * "How to cite" block. Renders the APA string and offers copy-to-clipboard
 * plus BibTeX and RIS downloads, which is what reference managers expect.
 */
export function CitationBox({ article }: { article: Article }) {
  const [copied, setCopied] = useState<string | null>(null);

  const year = new Date(article.publishedAt).getFullYear();
  const authors = article.contributors
    .map((c) => `${c.familyName}, ${c.givenName.charAt(0)}.`)
    .join(", ");

  const apa =
    `${authors} (${year}). ${article.title}. ` +
    `${siteConfig.shortName}, ${article.volume}(${article.issue})` +
    `${article.pages ? `, ${article.pages}` : ""}.` +
    `${article.doi ? ` https://doi.org/${article.doi}` : ""}`;

  const bibtex = [
    `@article{${article.contributors[0]?.familyName.toLowerCase() ?? "borjss"}${year},`,
    `  title   = {${article.title}},`,
    `  author  = {${article.contributors.map((c) => `${c.givenName} ${c.familyName}`).join(" and ")}},`,
    `  journal = {${siteConfig.name}},`,
    `  volume  = {${article.volume}},`,
    `  number  = {${article.issue}},`,
    article.pages ? `  pages   = {${article.pages}},` : null,
    `  year    = {${year}},`,
    article.doi ? `  doi     = {${article.doi}},` : null,
    `}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ris = [
    "TY  - JOUR",
    ...article.contributors.map(
      (c) => `AU  - ${c.familyName}, ${c.givenName}`,
    ),
    `TI  - ${article.title}`,
    `JO  - ${siteConfig.name}`,
    `VL  - ${article.volume}`,
    `IS  - ${article.issue}`,
    article.pages ? `SP  - ${article.pages}` : null,
    `PY  - ${year}`,
    article.doi ? `DO  - ${article.doi}` : null,
    "ER  - ",
  ]
    .filter(Boolean)
    .join("\n");

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission); the
      // citation text is on screen either way, so fail quietly.
    }
  }

  return (
    <section aria-labelledby="cite" className="mt-10">
      <h2 id="cite" className="font-serif text-xl font-bold">
        How to cite
      </h2>

      <div className="mt-3 rounded-lg border border-brand-border bg-brand-tint/30 p-5">
        <p className="font-serif text-[15px] leading-relaxed">{apa}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => copy(apa, "apa")}
          >
            {copied === "apa" ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied === "apa" ? "Copied" : "Copy citation"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => copy(bibtex, "bibtex")}
          >
            {copied === "bibtex" ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
            BibTeX
          </Button>

          <Button size="sm" variant="outline" onClick={() => copy(ris, "ris")}>
            {copied === "ris" ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
            RIS
          </Button>
        </div>

        <p aria-live="polite" className="sr-only">
          {copied ? "Citation copied to clipboard" : ""}
        </p>
      </div>
    </section>
  );
}
