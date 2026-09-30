import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth/require-role";
import { getPostBySlug } from "@/lib/api/articles";
import { PortalPage } from "@/components/layout/portal-page";
import { PostForm } from "@/components/portal/post-form";
import { PostDangerZone } from "@/components/portal/post-danger-zone";
import type { PostKind } from "@/types";

export const metadata: Metadata = { title: "Edit post" };

const KINDS: PostKind[] = ["announcement", "news", "event"];

export default async function Page({
  params,
}: {
  params: { kind: string; slug: string };
}) {
  await requireGroup("adminOnly");

  if (!KINDS.includes(params.kind as PostKind)) notFound();
  const post = await getPostBySlug(params.kind as PostKind, params.slug);
  if (!post) notFound();

  return (
    <PortalPage
      title={`Edit: ${post.title}`}
      lead="Change what this post says, when it publishes, and when it expires. Saving updates the public page at once — and changing the web address, or the list it belongs to, breaks every link already pointing at the old one."
      breadcrumb={[{ title: "Announcements", href: "/admin/announcements" }]}
    >
      <div className="mt-2">
        <PostForm post={post} />
      </div>

      <div className="mt-10">
        <PostDangerZone
          id={post.id}
          title={post.title}
          kind={post.kind}
          slug={post.slug}
        />
      </div>
    </PortalPage>
  );
}
