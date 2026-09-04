import Link from "next/link";
import { DocPage, DocAside, type TocEntry } from "@/components/layout/doc-page";
import { siteConfig } from "@/config/site.config";

/**
 * Wrapper for the seventeen editorial policy pages.
 *
 * They share a breadcrumb, an "On this page" rail, a last-updated date and a
 * related-policies panel, so each page file carries only its own prose.
 */

/** Every policy, in the order they appear in the nav. */
export const POLICIES = [
  { slug: "peer-review", title: "Peer Review" },
  { slug: "publication-ethics", title: "Publication Ethics" },
  { slug: "research-ethics", title: "Research Ethics" },
  { slug: "research-integrity", title: "Research Integrity" },
  { slug: "authorship", title: "Authorship" },
  { slug: "conflict-of-interest", title: "Conflict of Interest" },
  { slug: "reviewer-ethics", title: "Peer Reviewer Ethics" },
  { slug: "editorial-independence", title: "Editorial Independence" },
  { slug: "plagiarism", title: "Plagiarism" },
  { slug: "open-access", title: "Open Access" },
  { slug: "copyright", title: "Copyright" },
  { slug: "licensing", title: "Licensing" },
  { slug: "ai-policy", title: "AI-Assisted Writing" },
  { slug: "retraction-correction", title: "Retraction & Correction" },
  { slug: "complaints-appeals", title: "Complaints & Appeals" },
  { slug: "data-availability", title: "Data Availability" },
  { slug: "privacy", title: "Privacy" },
] as const;

export type PolicySlug = (typeof POLICIES)[number]["slug"];

export function PolicyPage({
  slug,
  title,
  lead,
  toc,
  updated,
  related,
  children,
}: {
  slug: PolicySlug;
  title: string;
  lead: string;
  toc: TocEntry[];
  updated: string;
  /** Slugs of policies a reader of this one is likely to want next. */
  related?: PolicySlug[];
  children: React.ReactNode;
}) {
  const relatedPolicies = (related ?? [])
    .map((s) => POLICIES.find((p) => p.slug === s))
    .filter((p): p is (typeof POLICIES)[number] => Boolean(p));

  return (
    <DocPage
      eyebrow="Editorial Policy"
      title={title}
      lead={lead}
      breadcrumb={[
        { label: "Policies", href: "/policies/peer-review" },
        { label: title },
      ]}
      toc={toc}
      updated={updated}
      aside={
        <>
          {relatedPolicies.length > 0 && (
            <DocAside title="Related policies">
              {relatedPolicies.map((p) => (
                <Link
                  key={p.slug}
                  href={`/policies/${p.slug}`}
                  className="block font-medium text-primary hover:text-brand-dark"
                >
                  {p.title} →
                </Link>
              ))}
            </DocAside>
          )}

          <DocAside title="Questions?">
            <p className="text-muted-foreground">
              Write to the editorial office if anything here is unclear or you
              need to raise a concern.
            </p>
            <a
              href={`mailto:${siteConfig.contact.editorialOffice}`}
              className="block break-all font-medium text-primary hover:text-brand-dark"
            >
              {siteConfig.contact.editorialOffice}
            </a>
          </DocAside>
        </>
      }
    >
      {children}

      {/* every policy closes with the same standards statement */}
      <div className="not-prose mt-10 rounded-lg border border-brand-border bg-brand-tint/30 p-5">
        <p className="text-sm font-semibold">Standards this policy follows</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {siteConfig.shortName} editorial policies are modelled on the
          Committee on Publication Ethics (COPE) Core Practices and the
          principles of transparency required by the Directory of Open Access
          Journals. Where this policy is silent on a question, COPE guidance
          applies.
        </p>
        <Link
          href="/policies/publication-ethics"
          className="mt-2.5 inline-block text-sm font-medium text-primary hover:text-brand-dark"
        >
          Publication ethics policy →
        </Link>
      </div>
    </DocPage>
  );
}
