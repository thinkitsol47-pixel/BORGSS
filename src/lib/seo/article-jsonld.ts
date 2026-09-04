import type { Article } from "@/types";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl } from "@/lib/utils";

/** schema.org ScholarlyArticle JSON-LD for the article landing page. */
export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    name: article.title,
    abstract: article.abstract,
    inLanguage: "en",
    datePublished: article.publishedAt,
    ...(article.doi
      ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: article.doi } }
      : {}),
    ...(article.doi ? { sameAs: `https://doi.org/${article.doi}` } : {}),
    url: absoluteUrl(`/articles/${article.slug}`),
    keywords: article.keywords.join(", "),
    author: article.contributors.map((c) => ({
      "@type": "Person",
      givenName: c.givenName,
      familyName: c.familyName,
      ...(c.orcid ? { identifier: `https://orcid.org/${c.orcid}` } : {}),
      affiliation: c.affiliations.map((a) => ({
        "@type": "Organization",
        name: a.name,
      })),
    })),
    publisher: { "@type": "Organization", name: siteConfig.publisher },
    isPartOf: {
      "@type": "PublicationIssue",
      issueNumber: article.issue,
      isPartOf: {
        "@type": "PublicationVolume",
        volumeNumber: article.volume,
        isPartOf: {
          "@type": "Periodical",
          name: siteConfig.name,
          ...(siteConfig.eIssn ? { issn: siteConfig.eIssn } : {}),
        },
      },
    },
    license: article.license,
  };
}
