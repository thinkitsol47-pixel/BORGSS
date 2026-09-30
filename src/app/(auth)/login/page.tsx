import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to the BORJSS portal to manage submissions, reviews and editorial work.",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  // `next` is carried through so the visitor returns to the page they were
  // reaching for. Only in-app paths are accepted — an absolute URL here would
  // be an open-redirect.
  const raw = searchParams?.next;
  const next =
    raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;

  /**
   * Somebody who already has a session does not need this form.
   *
   * **This is a guard against a confusing failure, not a convenience.** While
   * the sign-in bug was being chased, a stale cookie in the browser produced a
   * screen indistinguishable from a broken login: the form reappeared with the
   * fields blanked and no error, whether the session was missing, stale, or
   * perfectly valid. Deciding it here — on the server, before any client
   * bundle runs — means a visitor who *is* signed in lands in the portal even
   * if their tab is holding old JavaScript, and "the form came back" now means
   * one thing only: there is genuinely no session.
   *
   * Redirecting here is safe in a way it is not inside the sign-in action:
   * this render sets no cookie, so there is nothing for the throw to discard.
   * See `AuthState.redirectTo` for why the action itself must not redirect.
   */
  const user = await getCurrentUser();
  if (user) redirect(next ?? "/dashboard");

  return <LoginForm next={next} />;
}
