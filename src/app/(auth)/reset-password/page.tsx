import type { Metadata } from "next";
import Link from "next/link";
import { Link2Off } from "lucide-react";
import { Button } from "@/components/ui";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { supabaseServer } from "@/lib/auth/supabase";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your BORJSS account.",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // **The session is the token.** `/auth/callback` exchanges the emailed code
  // for a recovery session before redirecting here, so what proves the link was
  // valid is that a user comes back from Supabase — not a query parameter. A
  // page that trusted `?token=` would show the form to anyone who typed one.
  const { data } = await supabaseServer().auth.getUser();

  if (!data.user) {
    const expired = searchParams?.error === "invalid";

    return (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-warning/10 text-warning">
          <Link2Off className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-serif text-xl font-bold">
          {expired ? "This link has expired" : "This link is incomplete"}
        </h1>
        <p className="mx-auto mt-2 text-sm leading-relaxed text-muted-foreground">
          {expired
            ? "Reset links can only be used once, and they expire after a short time. Request a new one and use it straight away."
            : "The reset link is missing part of its address. Email clients sometimes split a long link across lines — copying the whole address into your browser usually fixes it. Otherwise request a new link."}
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

  return <ResetPasswordForm token="session" />;
}
