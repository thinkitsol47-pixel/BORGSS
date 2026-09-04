import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { isDemoMode } from "@/lib/auth/demo-mode";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to the BORJSS portal to manage submissions, reviews and editorial work.",
  robots: { index: false, follow: false },
};

export default function Page({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  // `next` is carried through so that, once auth is wired, the middleware can
  // return the user to the page they were trying to reach. Only in-app paths
  // are accepted — an absolute URL here would be an open-redirect.
  const raw = searchParams?.next;
  const next =
    raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;

  // Decided on the server: the form is a client component and cannot read
  // VERCEL_ENV itself.
  return <LoginForm next={next} demoMode={isDemoMode()} />;
}
