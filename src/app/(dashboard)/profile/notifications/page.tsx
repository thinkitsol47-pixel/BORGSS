import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { ProfileTabs } from "@/components/portal/profile-tabs";
import { NotificationsForm } from "@/components/portal/notifications-form";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Notifications" };

export default async function Page() {
  await requireUser();

  return (
    <PortalPage
      title="Notifications"
      lead="Which emails the journal sends you. Everything here is off by default until you save."
    >
      <ProfileTabs active="notifications" />

      <div className="mt-8">
        <Alert tone="warning" title="Nothing is sent yet">
          No mail provider is connected, so the journal cannot send email at
          all. These preferences show what will be configurable; saving them
          validates the form and stores nothing.
        </Alert>

        <div className="mt-6">
          <NotificationsForm />
        </div>
      </div>
    </PortalPage>
  );
}
