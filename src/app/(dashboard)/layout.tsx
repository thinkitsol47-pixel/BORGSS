import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/require-role";
import { getDashboardNav } from "@/config/nav.config";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

/**
 * Nothing in the portal belongs in a search index.
 *
 * The root layout sets `index: true` for the public site; this overrides it for
 * all 43 portal screens. `robots.ts` disallows the same paths, but the two do
 * different jobs: robots.txt asks a crawler not to *fetch*, this tag asks it
 * not to *index* a page it reached some other way — a shared link, a referrer.
 *
 * Neither is access control — `middleware.ts` and `requireUser()` below are.
 * These only keep a portal URL out of search results if one leaks.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const sections = getDashboardNav(user.roles);

  return (
    <div className="min-h-dvh">
      <a
        href="#portal-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-card-hover"
      >
        Skip to content
      </a>
      <DashboardTopbar user={user} />
      {/* The sidebar renders its own mobile bar, so it sits outside the row:
          below md the row is a single column and the drawer trigger stacks
          under the topbar instead of squeezing the content. */}
      <div className="md:flex">
        <DashboardSidebar sections={sections} />
        <main id="portal-content" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
