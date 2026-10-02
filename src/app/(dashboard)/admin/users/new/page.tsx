import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "New account" };

/**
 * Creating an account from the portal is not built — and since 2026-10-01 that
 * is the whole reason.
 *
 * The form that used to sit here collected a name, an address and a set of
 * roles and then saved nothing. Now that roles and status *do* save, leaving a
 * form that does not would be the worse failure of the two: everything around
 * it works, so a reader would reasonably assume this does too.
 *
 * It used to say email was the blocker. That is no longer true: the domain is
 * verified and mail reaches any address. What is missing is code — creating
 * the auth account, writing the profile, and sending `accountInviteEmail` (it
 * exists in templates.ts with no caller) with a set-your-password link.
 */
export default async function Page() {
  await requireGroup("adminOnly");

  return (
    <PortalPage
      title="New account"
      lead="Creating and inviting an account from here is not built yet. Here is what works instead."
      breadcrumb={[{ title: "Users", href: "/admin/users" }]}
    >
      <section aria-labelledby="today-heading" className="mt-2">
        <h2 id="today-heading" className="font-serif text-lg font-semibold">
          What works today
        </h2>
        <ol className="mt-3 max-w-2xl list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            The person registers themselves at{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              /register
            </Link>
            {" "}and confirms their address from the email they receive. They
            choose author, reviewer, or both — those are the only roles
            registration grants.
          </li>
          <li>
            You find them in{" "}
            <Link href="/admin/users" className="font-medium text-primary hover:underline">
              the user directory
            </Link>{" "}
            and open their account.
          </li>
          <li>
            You grant the roles they actually need — section editor, copyeditor,
            managing editor. That change saves, and is written to the audit log
            with your name against it.
          </li>
        </ol>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 border-t pt-6">
        <Button href="/admin/users" variant="outline">
          Back to users
        </Button>
      </div>
    </PortalPage>
  );
}
