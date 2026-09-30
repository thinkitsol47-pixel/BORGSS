import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Link2Off, MailOpen } from "lucide-react";
import { Button } from "@/components/ui";
import { ScaffoldNotice } from "@/components/auth/auth-parts";
import { AuthResult } from "@/components/auth/auth-result";
import { ResendVerification } from "@/components/auth/resend-verification";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your email address to finish setting up your account.",
  robots: { index: false, follow: false },
};

/**
 * Three states, chosen by the query string:
 *
 *   ?token=…             the link was followed — confirm the address
 *   ?email=…             registration just finished — tell them to check inbox
 *   (neither)            landed here directly
 *
 * SCAFFOLD: no token is actually verified. Once the backend exists this page
 * checks the token server-side and shows the real success or failure.
 */
export default function Page({
  searchParams,
}: {
  searchParams?: { token?: string; email?: string };
}) {
  const token = searchParams?.token?.trim();
  const email = searchParams?.email?.trim();

  if (token) {
    return (
      <AuthResult
        icon={CheckCircle2}
        title="Verification link received"
        actions={
          <Button href="/login" className="w-full" size="lg">
            Go to sign in
          </Button>
        }
      >
        <p>
          Email verification is not live yet, so this link has not been checked
          and no address has been confirmed. Once the account system is running,
          following a link like this one will verify your address and take you
          straight to the portal.
        </p>
      </AuthResult>
    );
  }

  if (email) {
    return (
      <AuthResult
        icon={MailOpen}
        title="Check your email"
        actions={
          <>
            <ResendVerification email={email} />
            <p className="text-sm text-muted-foreground">
              Wrong address?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-brand-dark"
              >
                Register again
              </Link>
            </p>
          </>
        }
      >
        <p>
          We would send a verification link to{" "}
          <span className="break-all font-medium text-foreground">{email}</span>
          . Follow it to confirm the address and finish setting up your account.
        </p>

        <div className="mt-5 text-left">
          <ScaffoldNotice title="Nothing is waiting on this" tone="info">
            No message has been sent — email delivery is still being set up.
            Your account works regardless, so you can sign in now.
          </ScaffoldNotice>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Links expire after 24 hours. If one does not arrive, check the spam
            folder first — verification mail is a common casualty of
            institutional filters.
          </p>
        </div>
      </AuthResult>
    );
  }

  return (
    <AuthResult
      icon={Link2Off}
      tone="warning"
      title="Nothing to verify here"
      actions={
        <>
          <Button href="/login" className="w-full" size="lg">
            Go to sign in
          </Button>
          <Button
            href="/register"
            variant="outline"
            className="w-full"
            size="lg"
          >
            Create an account
          </Button>
        </>
      }
    >
      <p>
        This page confirms an email address when you follow a verification link.
        Open the link from your inbox, or copy the whole address into your
        browser if your email client split it across lines.
      </p>
    </AuthResult>
  );
}
