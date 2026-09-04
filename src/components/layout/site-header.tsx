import Link from "next/link";
import { ShieldCheck, Unlock } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/button";
import { MainNav } from "./main-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/* utility bar — the one thin strip of solid brand colour */}
      <div className="bg-brand-gradient text-brand-foreground">
        <div className="container flex h-9 items-center gap-4 text-xs">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Unlock className="size-3.5" aria-hidden />
              {siteConfig.accessModel}
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <ShieldCheck className="size-3.5" aria-hidden />
              Double-Blind Peer Reviewed
            </span>
            {siteConfig.eIssn && (
              <span className="hidden md:inline">e-ISSN {siteConfig.eIssn}</span>
            )}
          </div>
        </div>
      </div>

      {/* masthead */}
      <div className="border-b bg-background">
        <div className="container flex items-center justify-between gap-6 py-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3.5">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-gradient font-serif text-xl font-bold text-brand-foreground transition-transform group-hover:scale-105"
            >
              B
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-serif text-xl font-bold tracking-tight md:text-2xl">
                {siteConfig.shortName}
              </span>
              <span className="hidden truncate text-[13px] text-muted-foreground sm:block">
                {siteConfig.name}
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 shrink items-center gap-2">
            <form action="/search" className="hidden min-w-0 flex-1 lg:block">
              <label htmlFor="site-search" className="sr-only">
                Search articles
              </label>
              <div className="relative">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  id="site-search"
                  name="q"
                  type="search"
                  placeholder="Search articles, authors, DOI…"
                  className="h-10 w-full min-w-0 rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/40 lg:max-w-[15rem] xl:max-w-[17rem]"
                />
              </div>
            </form>
            <Button
              href="/login"
              variant="ghost"
              className="hidden shrink-0 sm:inline-flex"
            >
              Login
            </Button>
            <Button
              href="/for-authors/how-to-submit"
              className="hidden shrink-0 px-3 sm:inline-flex lg:px-4.5"
            >
              {/* full label only where there is room for it */}
              <span className="hidden lg:inline">Submit Manuscript</span>
              <span className="lg:hidden">Submit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* nav bar */}
      <div className="border-b bg-background shadow-card">
        <div className="container">
          <MainNav />
        </div>
      </div>
    </header>
  );
}
