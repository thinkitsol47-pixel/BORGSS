import Link from "next/link";
import { DocPage, DocAside, type TocEntry } from "@/components/layout/doc-page";
import { siteConfig } from "@/config/site.config";

/**
 * Wrapper for the seventeen editorial policy pages.
 *
 * They share a breadcrumb, an "On this page" rail, a last-updated date and a
 * related-policies panel, so each page file carries only its own prose.
 */

/**
 * Every policy, in the order they appear in the nav.
 *
 * `reviewedAt` is the single source of the review date. It used to live in two
 * places — each page passed its own `updated=` string and
 * `/admin/settings/policies` hard-coded one constant beside it — so a policy
 * revised in its own file left the settings screen quietly reporting the old
 * date. Each page now reads its date from here via `policyReviewedAt()`, and
 * the settings screen renders genuinely per-policy dates from the same array.
 *
 * Revising a policy therefore means changing the date on one line, here.
 */
export const POLICIES = [
  { slug: "peer-review", title: "Peer Review", reviewedAt: "2026-01-15" },
  { slug: "publication-ethics", title: "Publication Ethics", reviewedAt: "2026-01-15" },
  { slug: "research-ethics", title: "Research Ethics", reviewedAt: "2026-01-15" },
  { slug: "research-integrity", title: "Research Integrity", reviewedAt: "2026-01-15" },
  { slug: "authorship", title: "Authorship", reviewedAt: "2026-01-15" },
  { slug: "conflict-of-interest", title: "Conflict of Interest", reviewedAt: "2026-01-15" },
  { slug: "reviewer-ethics", title: "Peer Reviewer Ethics", reviewedAt: "2026-01-15" },
  { slug: "editorial-independence", title: "Editorial Independence", reviewedAt: "2026-01-15" },
  { slug: "plagiarism", title: "Plagiarism", reviewedAt: "2026-01-15" },
  { slug: "open-access", title: "Open Access", reviewedAt: "2026-01-15" },
  { slug: "copyright", title: "Copyright", reviewedAt: "2026-01-15" },
  { slug: "licensing", title: "Licensing", reviewedAt: "2026-01-15" },
  { slug: "ai-policy", title: "AI-Assisted Writing", reviewedAt: "2026-01-15" },
  { slug: "retraction-correction", title: "Retraction & Correction", reviewedAt: "2026-01-15" },
  { slug: "complaints-appeals", title: "Complaints & Appeals", reviewedAt: "2026-01-15" },
  { slug: "data-availability", title: "Data Availability", reviewedAt: "2026-01-15" },
  { slug: "privacy", title: "Privacy", reviewedAt: "2026-01-15" },
] as const;

export type PolicySlug = (typeof POLICIES)[number]["slug"];

/**
 * The review date for one policy.
 *
 * Throws rather than returning a fallback: a policy slug that is not in the
 * array is a typo, and a silent "unknown date" on a published policy page is
 * exactly the kind of quietly-wrong claim the project's notice rule exists to
 * prevent. `PolicySlug` makes this unreachable from typechecked callers.
 */
export function policyReviewedAt(slug: PolicySlug): string {
  const policy = POLICIES.find((p) => p.slug === slug);
  if (!policy) throw new Error(`Unknown policy slug: ${slug}`);
  return policy.reviewedAt;
}

export function PolicyPage({
  slug,
  title,
  lead,
  toc,
  related,
  children,
}: {
  slug: PolicySlug;
  title: string;
  lead: string;
  toc: TocEntry[];
  /** Slugs of policies a reader of this one is likely to want next. */
  related?: PolicySlug[];
  children: React.ReactNode;
}) {
  // Deliberately not a prop. The date is read from POLICIES so the page a
  // reader sees and the date /admin/settings/policies reports cannot drift —
  // they are now the same string. Removing the prop rather than defaulting it
  // is what makes the typechecker find any page still passing its own.
  const updated = policyReviewedAt(slug);

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
