import "server-only";
import type { Article, BoardMember, Issue, Post, PostKind } from "@/types";
import { mockArticles, mockIssues, mockBoard, mockPosts } from "./mock-data";

/**
 * Server-side data access for public pages.
 * SCAFFOLD: returns mock data. Swap each function body for a real tRPC/DB call.
 */

export async function getPublishedArticles(): Promise<Article[]> {
  return mockArticles.filter((a) => a.publishedAt);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return mockArticles.find((a) => a.slug === slug) ?? null;
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return mockArticles.map((a) => a.slug);
}

export async function getIssues(): Promise<Issue[]> {
  return [...mockIssues].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export async function getCurrentIssue(): Promise<Issue | null> {
  const issues = await getIssues();
  return issues[0] ?? null;
}

export async function getIssueBySlug(slug: string): Promise<Issue | null> {
  return mockIssues.find((i) => i.slug === slug) ?? null;
}

export async function getArticlesForIssue(issue: Issue): Promise<Article[]> {
  return mockArticles.filter((a) => issue.articleIds.includes(a.id));
}

export async function getBoardMembers(): Promise<BoardMember[]> {
  return mockBoard;
}

/* ------------------------------------------------------------------ *
 * Dated posts — announcements, news, events
 * ------------------------------------------------------------------ */

/** Newest first. Events sort by when they happen, not when they were posted. */
export async function getPosts(kind: PostKind): Promise<Post[]> {
  return mockPosts
    .filter((p) => p.kind === kind)
    .sort((a, b) => {
      const at = a.event?.startsAt ?? a.publishedAt;
      const bt = b.event?.startsAt ?? b.publishedAt;
      return +new Date(bt) - +new Date(at);
    });
}

export async function getPostBySlug(
  kind: PostKind,
  slug: string,
): Promise<Post | null> {
  return mockPosts.find((p) => p.kind === kind && p.slug === slug) ?? null;
}

export async function getPostSlugs(kind: PostKind): Promise<string[]> {
  return mockPosts.filter((p) => p.kind === kind).map((p) => p.slug);
}

/** The few most recent announcements, for the home page. */
export async function getLatestAnnouncements(limit = 3): Promise<Post[]> {
  const now = Date.now();
  return (await getPosts("announcement"))
    .filter((p) => !p.expiresAt || +new Date(p.expiresAt) >= now)
    .slice(0, limit);
}
