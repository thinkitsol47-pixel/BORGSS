import type { MetadataRoute } from "next";
import { getAllArticleSlugs, getIssues, getPosts } from "@/lib/api/articles";
import { mainNav } from "@/config/nav.config";
import { POLICIES } from "@/components/layout/policy-page";
import { absoluteUrl } from "@/lib/utils";

/**
 * The sitemap.
 *
 * Built from the same sources the pages themselves read, so a new article,
 * issue, announcement or policy appears here without anyone remembering to add
 * it. Only public pages: the portal and the auth screens are disallowed in
 * `robots.ts` and have no business in a search index.
 *
 * An earlier version walked `mainNav` and the article and issue lists. That
 * missed every announcement, news item and event *detail* page — the nav only
 * carries the three listing pages — and `/search`, which is not in the nav at
 * all. Those are now included.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Everything reachable from the header, plus the pages that are linked from
  // within the site rather than from the nav.
  const staticPaths = new Set<string>(["/", "/search", "/for-authors/how-to-submit"]);
  for (const item of mainNav) {
    staticPaths.add(item.href);
    item.children?.forEach((c) => staticPaths.add(c.href));
  }

  const [slugs, issues, announcements, news, events] = await Promise.all([
    getAllArticleSlugs(),
    getIssues(),
    getPosts("announcement"),
    getPosts("news"),
    getPosts("event"),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...[...staticPaths].map((p) => ({
      url: absoluteUrl(p),
      changeFrequency: "monthly" as const,
      priority: p === "/" ? 1 : 0.6,
    })),

    // The seventeen policies. Every one is already in the nav's Policies menu,
    // so these are listed from `POLICIES` only so a new policy cannot be
    // missed if the nav lags behind. The dedupe below removes the overlap —
    // a URL appearing twice in a sitemap is a defect, not a hint.
    ...POLICIES.map((p) => ({
      url: absoluteUrl(`/policies/${p.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),

    ...issues.map((i) => ({
      url: absoluteUrl(`/issues/${i.slug}`),
      lastModified: i.publishedAt,
      priority: 0.7,
    })),

    // Articles carry the highest priority below the homepage: they are what
    // the journal exists to publish and what anyone is searching for.
    ...slugs.map((s) => ({
      url: absoluteUrl(`/articles/${s}`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),

    ...announcements.map((p) => ({
      url: absoluteUrl(`/announcements/${p.slug}`),
      lastModified: p.publishedAt,
      priority: 0.5,
    })),
    ...news.map((p) => ({
      url: absoluteUrl(`/news/${p.slug}`),
      lastModified: p.publishedAt,
      priority: 0.5,
    })),
    ...events.map((p) => ({
      url: absoluteUrl(`/events/${p.slug}`),
      lastModified: p.publishedAt,
      priority: 0.5,
    })),
  ];

  // First entry wins, so the richer nav entry keeps its priority over the
  // generic policy one. Built from several sources that legitimately overlap,
  // and a duplicate URL in a sitemap is a defect.
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
