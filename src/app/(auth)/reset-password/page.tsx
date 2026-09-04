import type { Metadata } from "next";
import Link from "next/link";
import { Link2Off } from "lucide-react";
import { Button } from "@/components/ui";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your BORJSS account.",
  robots: { index: false, follow: false },
};

export default function Page({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token?.trim();

  // Reaching this page without a token means the link was mistyped, truncated
  // by an email client, or opened directly. Showing the form would only lead
  // to a failure after the user has typed a password twice.
  if (!token) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-warning/10 text-warning">
          <Link2Off className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-serif text-xl font-bold">
          This link is incomplete
        </h1>
        <p className="mx-auto mt-2 text-sm leading-relaxed text-muted-foreground">
          The reset link is missing its token. Email clients sometimes split a
          long link across lines — copying the whole address into your browser
          usually fixes it. Otherwise request a new link.
        </p>
        <Button href="/forgot-password" className="mt-6 w-full" size="lg">
          Request a new link
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-brand-dark"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
