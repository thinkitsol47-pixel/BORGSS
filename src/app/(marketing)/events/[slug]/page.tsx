import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, getPosts } from "@/lib/api/articles";
import { PostDetail } from "@/components/marketing/post-detail";
import { isPastEvent } from "@/components/marketing/post-list";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPostSlugs("event");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug("event", params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: absoluteUrl(`/events/${post.slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug("event", params.slug);
  if (!post) notFound();

  // Prefer showing other upcoming events; fall back to recent past ones.
  const all = (await getPosts("event")).filter((p) => p.id !== post.id);
  const related = [
    ...all.filter((p) => !isPastEvent(p)),
    ...all.filter(isPastEvent),
  ].slice(0, 4);

  return <PostDetail post={post} related={related} />;
}
