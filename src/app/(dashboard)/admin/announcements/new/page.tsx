import type { Metadata } from "next";
import { requireGroup } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { PostForm } from "@/components/portal/post-form";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "New post" };

export default async function Page() {
  await requireGroup("adminOnly");

  return (
    <PortalPage
      title="New post"
      lead="Publish an announcement, a news item or an event to the public site."
      breadcrumb={[{ title: "Announcements", href: "/admin/announcements" }]}
    >
      <Alert tone="warning" title="This form does not save yet">
        Posts are fixtures in{" "}
        <code className="font-mono text-[0.9em]">src/lib/api/mock-data.ts</code>{" "}
        and there is no database behind them, so nothing here is stored. Adding
        a post today means editing that file and deploying.
      </Alert>

      <div className="mt-8">
        <PostForm />
      </div>
    </PortalPage>
  );
}
