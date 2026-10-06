import type { Article } from "@/types";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl } from "@/lib/utils";

/**
 * Google Scholar / Highwire Press citation meta tags.
 * Render the returned array into <meta> tags on the article landing page.
 * Ref: https://scholar.google.com/intl/en/scholar/inclusion.html
 */
export function scholarMetaTags(article: Article): { name: string; content: string }[] {
  const tags: { name: string; content: string }[] = [
    { name: "citation_title", content: article.title },
    { name: "citation_journal_title", content: siteConfig.name },
    { name: "citation_publisher", content: siteConfig.publisher },
    { name: "citation_publication_date", content: article.publishedAt },
    { name: "citation_volume", content: String(article.volume) },
    { name: "citation_issue", content: String(article.issue) },
    { name: "citation_language", content: "en" },
  ];

  if (siteConfig.eIssn) tags.push({ name: "citation_issn", content: siteConfig.eIssn });
  if (article.doi) tags.push({ name: "citation_doi", content: article.doi });
  if (article.pages) {
    const [first, last] = article.pages.split(/[–-]/);
    if (first) tags.push({ name: "citation_firstpage", content: first.trim() });
    if (last) tags.push({ name: "citation_lastpage", content: last.trim() });
  }

  for (const c of article.contributors) {
    tags.push({
      name: "citation_author",
      content: `${c.familyName}, ${c.givenName}`,
    });
    for (const af of c.affiliations) {
      tags.push({ name: "citation_author_institution", content: af.name });
    }
  }

  const pdf = article.galleys.find((g) => g.label === "PDF");
  if (pdf && pdf.url !== "#") {
    // Scholar needs an absolute URL; a galley published through the app is
    // stored as the site path `/files/article:<id>`.
    tags.push({
      name: "citation_pdf_url",
      content: pdf.url.startsWith("/") ? absoluteUrl(pdf.url) : pdf.url,
    });
  }
  tags.push({
    name: "citation_abstract_html_url",
    content: absoluteUrl(`/articles/${article.slug}`),
  });

  return tags;
}
