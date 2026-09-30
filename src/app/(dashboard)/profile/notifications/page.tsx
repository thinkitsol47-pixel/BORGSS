import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { ProfileTabs } from "@/components/portal/profile-tabs";
import { NotificationsForm } from "@/components/portal/notifications-form";

export const metadata: Metadata = { title: "Notifications" };

export default async function Page() {
  const user = await requireUser();

  return (
    <PortalPage
      title="Notifications"
      lead="Which emails the journal sends you. Anything tied to a deadline starts switched on; anything promotional starts off. Your choices save, but none of them will reach you until the journal owns a domain — its mail provider currently refuses every address but its own."
    >
      <ProfileTabs active="notifications" />

      <div className="mt-8">
        {/* The standing box is gone; the fact it carried is in the lead, where
            it is read before the switches rather than above them. */}
        <NotificationsForm saved={user.notifications} />
      </div>
    </PortalPage>
  );
}
