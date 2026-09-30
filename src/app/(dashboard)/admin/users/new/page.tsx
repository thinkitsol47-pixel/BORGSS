import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { PortalPage } from "@/components/layout/portal-page";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "New account" };

/**
 * Creating an account from the portal waits on email, not on the database.
 *
 * The form that used to sit here collected a name, an address and a set of
 * roles and then saved nothing. Now that roles and status *do* save, leaving a
 * form that does not would be the worse failure of the two: everything around
 * it works, so a reader would reasonably assume this does too.
 *
 * An invited account is only useful if the invitation arrives. The journal owns
 * no domain, so Resend delivers to one address and refuses every other with a
 * 403 — an account created here would sit `invited` forever with nobody able to
 * set its password. So the screen says what does work today instead.
 */
export default async function Page() {
  await requireGroup("adminOnly");

  return (
    <PortalPage
      title="New account"
      lead="An account cannot be created from here: it would have to be invited by email to set its password, and with no domain the invitation is refused — the account would sit as Invited forever with nobody able to sign in. Here is what works instead."
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
            . They choose author, reviewer, or both — those are the only roles
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

      <section aria-labelledby="unblocks-heading" className="mt-10 border-t pt-8">
        <h2 id="unblocks-heading" className="font-serif text-lg font-semibold">
          What unblocks this
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Buying the journal&rsquo;s domain and verifying it with the mail
          provider. It is a purchase, not a code change — once mail reaches
          arbitrary addresses, this screen becomes the create-and-invite form it
          was written to be.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3 border-t pt-6">
        <Button href="/admin/users" variant="outline">
          Back to users
        </Button>
      </div>
    </PortalPage>
  );
}
