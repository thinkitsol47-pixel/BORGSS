import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

/**
 * A sign-in form has no reason to be in a search index, and two of these five
 * pages carry single-use credentials in the query string —
 * `/reset-password?token=` and `/verify-email?token=`. An indexed URL with a
 * live token in it is the kind of thing that survives in caches long after the
 * token should have died.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Shell for the five auth pages.
 *
 * Two columns on a large screen: the form on the left, and a brand panel on
 * the right carrying the journal's identity and why an account is worth
 * having. Below `lg` the panel is dropped entirely rather than stacked — on a
 * phone someone signing in wants the form, not a scroll past marketing.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1fr_minmax(26rem,42%)]">
      {/* ------------------------------------------------------- form side */}
      <div className="flex min-h-dvh flex-col bg-background px-4 py-8 sm:px-6 lg:min-h-0 lg:px-10 lg:py-10">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <Link
            href="/"
            className="inline-flex items-center gap-3 self-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-gradient font-serif text-lg font-bold text-brand-foreground"
            >
              B
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-serif text-lg font-bold tracking-tight">
                {siteConfig.shortName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {siteConfig.tagline}
              </span>
            </span>
          </Link>

          {/* A landmark, so a screen-reader user can jump straight to the
              form rather than tabbing past the logo on every auth page. The
              marketing and portal layouts both have one; these five did not. */}
          <main id="content" className="flex flex-1 flex-col justify-center py-10">
            {children}
          </main>

          {/* The brand panel is dropped below lg, so the three facts most
              worth knowing before making an account are restated compactly
              here. Hidden from lg up, where the panel says it properly. */}
          <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t pt-5 text-xs text-muted-foreground lg:hidden">
            {["Double-blind peer review", "Open access, CC BY", "One account"].map(
              (fact) => (
                <li key={fact} className="flex items-center gap-1.5">
                  <Check className="size-3.5 shrink-0 text-brand" aria-hidden />
                  {fact}
                </li>
              ),
            )}
          </ul>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-brand-dark"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Back to the journal
            </Link>
            <span aria-hidden>·</span>
            <Link href="/policies/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------ brand side */}
      <AuthBrandPanel />
    </div>
  );
}
