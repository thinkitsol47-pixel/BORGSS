import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Download,
  ExternalLink,
  Mail,
  Scale,
} from "lucide-react";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/api/articles";
import { scholarMetaTags } from "@/lib/seo/scholar-meta";
import { articleJsonLd } from "@/lib/seo/article-jsonld";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { CitationBox } from "@/components/article/citation-box";
import { Badge, Breadcrumb, Button, Card } from "@/components/ui";

export const revalidate = 3600;

const TYPE_LABEL: Record<string, string> = {
  research: "Research Article",
  review: "Review Article",
  "case-study": "Case Study",
  editorial: "Editorial",
  conceptual: "Conceptual Paper",
  "book-review": "Book Review",
};

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  const url = absoluteUrl(`/articles/${article.slug}`);
  return {
    title: article.title,
    description: article.abstract.slice(0, 200),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.abstract.slice(0, 200),
      url,
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const pdf = article.galleys.find((g) => g.label === "PDF");
  const corresponding = article.contributors.find((c) => c.isCorresponding);
  const typeLabel = TYPE_LABEL[article.type] ?? article.type;

  // Affiliations are numbered once and referenced by superscript, as in print.
  const affiliations = Array.from(
    new Map(
      article.contributors
        .flatMap((c) => c.affiliations)
        .map((a) => [a.id, a] as const),
    ).values(),
  );
  const affIndex = new Map(affiliations.map((a, i) => [a.id, i + 1]));

  return (
    <article className="container py-8 md:py-10">
      {/* Google Scholar citation_* tags — repeatable, so rendered directly */}
      {scholarMetaTags(article).map((t, i) => (
        <meta key={i} name={t.name} content={t.content} />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article)),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Articles", href: "/articles" },
          { label: article.title },
        ]}
      />

      {/* ------------------------------------------------------------ head */}
      <header className="mt-4 border-b pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="solid">{typeLabel}</Badge>
          <Badge variant="outline">Open Access</Badge>
          <Badge variant="outline">Peer Reviewed</Badge>
        </div>

        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight md:text-4xl">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="mt-3 max-w-3xl font-serif text-xl text-muted-foreground">
            {article.subtitle}
          </p>
        )}

        {/* authors */}
        <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          {article.contributors.map((c) => (
            <li key={c.id} className="text-[15px]">
              <span className="font-medium">
                {c.givenName} {c.familyName}
              </span>
              {c.affiliations.map((a) => (
                <sup key={a.id} className="ml-0.5 text-xs text-brand-dark">
                  {affIndex.get(a.id)}
                </sup>
              ))}
              {c.isCorresponding && (
                <sup className="ml-0.5 text-xs text-brand-dark">*</sup>
              )}
              {c.orcid && (
                <a
                  href={`https://orcid.org/${c.orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 inline-flex items-center align-middle text-success"
                  aria-label={`ORCID record for ${c.givenName} ${c.familyName}`}
                  title={`ORCID: ${c.orcid}`}
                >
                  <svg viewBox="0 0 256 256" className="size-3.5" aria-hidden>
                    <circle cx="128" cy="128" r="128" fill="currentColor" />
                    <path
                      fill="#fff"
                      d="M86 186h-18V95h18v91zm-9-104a11 11 0 1 1 0-22 11 11 0 0 1 0 22zm35 13h35c33 0 48 24 48 46 0 24-19 45-48 45h-35V95zm18 75h16c23 0 31-17 31-29 0-20-13-30-32-30h-15v59z"
                    />
                  </svg>
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* affiliations */}
        <ol className="mt-3 space-y-0.5 text-sm text-muted-foreground">
          {affiliations.map((a, i) => (
            <li key={a.id}>
              <sup className="mr-1 text-brand-dark">{i + 1}</sup>
              {a.name}
              {a.city ? `, ${a.city}` : ""}
              {a.country ? `, ${a.country}` : ""}
            </li>
          ))}
          {corresponding?.email && (
            <li>
              <sup className="mr-1 text-brand-dark">*</sup>
              Corresponding author:{" "}
              <a href={`mailto:${corresponding.email}`} className="text-primary hover:underline">
                {corresponding.email}
              </a>
            </li>
          )}
        </ol>

        {/* publication line */}
        <p className="mt-5 text-sm text-muted-foreground">
          <Link
            href="/issues/current"
            className="font-medium text-primary hover:underline"
          >
            Vol. {article.volume}, No. {article.issue}
          </Link>
          {article.pages && ` · pp. ${article.pages}`}
          {" · Published "}
          {formatDate(article.publishedAt)}
        </p>

        {article.doi && (
          <p className="mt-1.5 break-all text-sm">
            <span className="text-muted-foreground">DOI: </span>
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              https://doi.org/{article.doi}
            </a>
          </p>
        )}
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[1fr_17rem]">
        {/* ---------------------------------------------------------- body */}
        <div className="min-w-0">
          <section aria-labelledby="abstract">
            <h2 id="abstract" className="font-serif text-xl font-bold">
              Abstract
            </h2>
            <p className="prose mt-3">{article.abstract}</p>
          </section>

          {article.keywords.length > 0 && (
            <section aria-labelledby="keywords" className="mt-8">
              <h2 id="keywords" className="font-serif text-xl font-bold">
                Keywords
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {article.keywords.map((k) => (
                  <li key={k}>
                    <Link
                      href={`/articles?q=${encodeURIComponent(k)}`}
                      className="inline-flex rounded-full border border-brand-border bg-brand-tint/50 px-3 py-1 text-xs font-medium text-brand-darker transition-colors hover:border-brand hover:bg-brand-tint"
                    >
                      {k}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CitationBox article={article} />

          {article.references.length > 0 && (
            <section aria-labelledby="references" className="mt-10">
              <h2 id="references" className="font-serif text-xl font-bold">
                References
              </h2>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                {article.references.map((r, i) => (
                  <li key={r.id} className="flex gap-3">
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {i + 1}.
                    </span>
                    <span className="min-w-0">
                      {r.raw}
                      {r.doi && (
                        <>
                          {" "}
                          <a
                            href={`https://doi.org/${r.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-primary hover:underline"
                          >
                            https://doi.org/{r.doi}
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="info" className="mt-10">
            <h2 id="info" className="font-serif text-xl font-bold">
              Article information
            </h2>
            <dl className="mt-3 divide-y divide-border rounded-lg border border-brand-border">
              {[
                article.receivedAt && ["Received", formatDate(article.receivedAt)],
                article.acceptedAt && ["Accepted", formatDate(article.acceptedAt)],
                ["Published", formatDate(article.publishedAt)],
                ["Licence", article.license],
                article.funding && ["Funding", article.funding],
                article.conflictOfInterest && [
                  "Competing interests",
                  article.conflictOfInterest,
                ],
                article.ethicsStatement && ["Ethics", article.ethicsStatement],
                article.dataAvailability && [
                  "Data availability",
                  article.dataAvailability,
                ],
              ]
                .filter((row): row is [string, string] => Boolean(row))
                .map(([term, value]) => (
                  <div
                    key={term}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4"
                  >
                    <dt className="text-sm font-medium text-muted-foreground">
                      {term}
                    </dt>
                    <dd className="min-w-0 break-words text-sm">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </div>

        {/* ---------------------------------------------------------- rail */}
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          {pdf && (
            <Button href={pdf.url} className="w-full">
              <Download className="size-4" />
              Download PDF
              {pdf.sizeBytes && (
                <span className="text-xs opacity-80">
                  ({Math.round(pdf.sizeBytes / 1024)} KB)
                </span>
              )}
            </Button>
          )}

          {article.metrics && (
            <Card>
              <div className="border-b border-brand-border px-4 py-2.5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
                  <BarChart3 className="size-3.5" aria-hidden />
                  Metrics
                </p>
              </div>
              <dl className="divide-y divide-border">
                {[
                  ["Views", article.metrics.views],
                  ["Downloads", article.metrics.downloads],
                  article.metrics.citations != null
                    ? ["Citations", article.metrics.citations]
                    : null,
                ]
                  .filter((r): r is [string, number] => Boolean(r))
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between px-4 py-2.5"
                    >
                      <dt className="text-sm text-muted-foreground">{label}</dt>
                      <dd className="font-serif text-lg font-bold text-brand-dark tabular-nums">
                        {value.toLocaleString()}
                      </dd>
                    </div>
                  ))}
              </dl>
            </Card>
          )}

          <Card>
            <div className="border-b border-brand-border px-4 py-2.5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
                <BookOpen className="size-3.5" aria-hidden />
                Published in
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="font-serif font-semibold">
                Volume {article.volume}, Issue {article.issue}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {new Date(article.publishedAt).getFullYear()}
              </p>
              <Link
                href="/issues/current"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-dark"
              >
                View table of contents
                <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            </div>
          </Card>

          <Card>
            <div className="border-b border-brand-border px-4 py-2.5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-darker">
                <Scale className="size-3.5" aria-hidden />
                Licence
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-medium">{article.license}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                You are free to share and adapt this work, provided the original
                authors and source are credited.
              </p>
              <Link
                href="/policies/licensing"
                className="mt-2 inline-block text-sm font-medium text-primary hover:text-brand-dark"
              >
                Licensing policy →
              </Link>
            </div>
          </Card>

          <Card className="bg-brand-tint/30">
            <div className="px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="size-4 text-brand" aria-hidden />
                Submit your research
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {siteConfig.shortName} welcomes original work across the social
                sciences.
              </p>
              <Button
                href="/for-authors/how-to-submit"
                size="sm"
                variant="outline"
                className="mt-3 w-full"
              >
                Start a submission
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}
