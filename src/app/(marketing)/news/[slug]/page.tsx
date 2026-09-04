import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, getPosts } from "@/lib/api/articles";
import { PostDetail } from "@/components/marketing/post-detail";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPostSlugs("news");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug("news", params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: absoluteUrl(`/news/${post.slug}`) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function NewsItemPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug("news", params.slug);
  if (!post) notFound();

  const related = (await getPosts("news"))
    .filter((p) => p.id !== post.id)
    .slice(0, 4);

  return <PostDetail post={post} related={related} />;
}
