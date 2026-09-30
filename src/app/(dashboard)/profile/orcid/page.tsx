import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { ProfileTabs } from "@/components/portal/profile-tabs";
import { OrcidForm } from "@/components/portal/orcid-form";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "ORCID" };

export default async function Page() {
  const user = await requireUser();

  return (
    <PortalPage
      title="ORCID iD"
      lead="A persistent identifier that keeps your published work attached to you, whatever happens to your name, email address or institution. This records the iD you type after checking it is well-formed; it does not verify that it is yours, which would need signing in at orcid.org."
    >
      <ProfileTabs active="orcid" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="min-w-0">
          {/* Claim-not-proof is stated in the lead. It matters — an ORCID
              wrongly attached to a published article is hard to correct once
              deposited with Crossref — which is exactly why it belongs where
              it is read, not in a box above the field. */}
          <div className="mt-6">
            <OrcidForm current={user.orcid} />
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-serif text-base font-semibold">
              Why it is worth having
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              <li>
                Distinguishes you from researchers with the same or a similar
                name.
              </li>
              <li>
                Survives a change of institution, surname or email address.
              </li>
              <li>
                Sent to Crossref with your article, so citations and indexing
                services attach the work to you automatically.
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="font-serif text-base font-semibold">
              You do not have one?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Registering is free and takes about a minute.
            </p>
            <Link
              href="https://orcid.org/register"
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-brand-dark hover:underline"
            >
              Register at orcid.org
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </Card>
        </aside>
      </div>
    </PortalPage>
  );
}
