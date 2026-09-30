import type { Metadata } from "next";
import { requireGroup } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { PostForm } from "@/components/portal/post-form";

export const metadata: Metadata = { title: "New post" };

export default async function Page() {
  await requireGroup("adminOnly");

  return (
    <PortalPage
      title="New post"
      lead="Publish an announcement, a news item or an event to the public site. There is no draft state: saving puts the post on its public list at once, unless you give it a publication date in the future. Nobody is emailed about it."
      breadcrumb={[{ title: "Announcements", href: "/admin/announcements" }]}
    >
      <div className="mt-2">
        <PostForm />
      </div>
    </PortalPage>
  );
}
