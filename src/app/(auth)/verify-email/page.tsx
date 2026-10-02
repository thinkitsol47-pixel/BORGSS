import type { Metadata } from "next";
import Link from "next/link";
import { Link2Off, MailCheck, MailOpen } from "lucide-react";
import { Button } from "@/components/ui";
import { AuthResult } from "@/components/auth/auth-result";
import { ResendVerification } from "@/components/auth/resend-verification";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your email address to finish setting up your account.",
  robots: { index: false, follow: false },
};

/**
 * Four states, chosen by the query string:
 *
 *   ?token_hash=…        the emailed link was followed — offer the confirm button
 *   ?error=invalid|missing  the button was pressed and the token was refused
 *   ?email=…             registration just finished — check the inbox
 *   (none)               landed here directly
 *
 * **The link does not confirm on arrival.** Mail filters open links to scan
 * them, and the token is single-use, so confirming on GET would let a scanner
 * spend it before the person clicked. The button posts to `/auth/confirm`.
 */
export default function Page({
  searchParams,
}: {
  searchParams?: { token_hash?: string; email?: string; error?: string };
}) {
  const tokenHash = searchParams?.token_hash?.trim();
  const email = searchParams?.email?.trim();
  const error = searchParams?.error;

  if (tokenHash) {
    return (
      <AuthResult
        icon={MailCheck}
        title="Confirm your email address"
        actions={
          <form action="/auth/confirm" method="post">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <Button type="submit" className="w-full" size="lg">
              Confirm and sign in
            </Button>
          </form>
        }
      >
        <p>
          One step left. Confirming the address finishes setting up your account
          and signs you in.
        </p>
      </AuthResult>
    );
  }

  if (error) {
    return (
      <AuthResult
        icon={Link2Off}
        tone="warning"
        title="This link has expired"
        actions={
          <>
            <Button href="/login" className="w-full" size="lg">
              Go to sign in
            </Button>
            <p className="text-sm text-muted-foreground">
              Sign in with your email and password — if the address still needs
              confirming, the sign-in page will offer to send a new link.
            </p>
          </>
        }
      >
        <p>
          Confirmation links work once. This one has already been used or is too
          old. If you have already confirmed your address, you can simply sign
          in.
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
          We have sent a confirmation link to{" "}
          <span className="break-all font-medium text-foreground">{email}</span>
          . Open it to confirm the address — you can sign in once it is
          confirmed.
        </p>
        <p className="mt-3 text-xs leading-relaxed">
          If it has not arrived within a few minutes, check the spam folder
          first — confirmation mail is a common casualty of institutional
          filters.
        </p>
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
        This page confirms an email address when you follow a confirmation link.
        Open the link from your inbox, or copy the whole address into your
        browser if your email client split it across lines.
      </p>
    </AuthResult>
  );
}
