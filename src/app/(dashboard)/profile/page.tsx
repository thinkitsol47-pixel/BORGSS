import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { ROLE_LABELS } from "@/config/roles";
import { PortalPage } from "@/components/layout/portal-page";
import { ProfileTabs } from "@/components/portal/profile-tabs";
import { ProfileForm } from "@/components/portal/profile-form";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Profile" };

export default async function Page() {
  const user = await requireUser();

  return (
    <PortalPage
      title="Your profile"
      lead="Your details as the journal holds them. Editors see your institution and biography when choosing reviewers; authors never do."
    >
      <ProfileTabs active="details" />

      <section aria-labelledby="roles" className="mt-6">
        <h2 id="roles" className="text-sm font-medium">
          Your roles
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {user.roles.map((r) => (
            <li key={r}>
              <Badge variant="brand" size="sm">
                {ROLE_LABELS[r]}
              </Badge>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Roles are granted by the editorial office and cannot be changed here.
          They decide what appears in your sidebar.
        </p>
      </section>

      <div className="mt-8">
        <ProfileForm user={user} />
      </div>
    </PortalPage>
  );
}
