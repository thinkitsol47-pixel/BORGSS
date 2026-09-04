"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Menu, X } from "lucide-react";
import type { DashboardNavSection } from "@/config/nav.config";
import { cn } from "@/lib/utils";

/**
 * The portal's role-aware navigation. One list, two presentations: a fixed
 * rail from `md` up, and a drawer below it. The drawer is not optional —
 * with 12 roles, a phone user whose only entry point is the dashboard would
 * otherwise have no way to reach their own queue.
 */
export function DashboardSidebar({
  sections,
}: {
  sections: DashboardNavSection[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ------------------------------------------------------ desktop rail */}
      <aside className="hidden w-64 shrink-0 border-r md:block">
        <nav
          aria-label="Portal"
          className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 py-5"
        >
          <NavSections sections={sections} pathname={pathname} />
        </nav>
      </aside>

      {/* ------------------------------------------------- mobile trigger bar */}
      <div className="sticky top-16 z-30 flex items-center gap-2 border-b bg-background px-4 py-2 md:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-brand-tint/60"
          aria-label="Open portal menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
          Menu
        </button>
        <span className="truncate text-sm text-muted-foreground">
          {currentTitle(sections, pathname)}
        </span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close portal menu"
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="font-serif text-lg font-bold">Portal</span>
              <button
                type="button"
                aria-label="Close portal menu"
                className="rounded-lg p-2 hover:bg-brand-tint/60"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <nav
              aria-label="Portal"
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              <NavSections sections={sections} pathname={pathname} />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Shared list — identical markup in the rail and the drawer, so the two
 * can never drift apart as sections are added.
 * ------------------------------------------------------------------ */

function NavSections({
  sections,
  pathname,
}: {
  sections: DashboardNavSection[];
  pathname: string;
}) {
  // Resolved once for the whole list, so exactly one item can be active.
  const current = activeHref(sections, pathname);

  return (
    <>
      {sections.map((section) => (
        <div key={section.heading} className="mb-6 last:mb-0">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.heading}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon =
                (item.icon &&
                  (Icons[item.icon as keyof typeof Icons] as React.ElementType)) ||
                Icons.Circle;
              const active = item.href === current;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-tint text-brand-darker"
                        : "text-muted-foreground hover:bg-brand-tint/50 hover:text-brand-darker",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-brand-dark" : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

/**
 * Whether a nav item's route contains the current page.
 *
 * True for both `/submissions` and `/submissions/new` when the user is on
 * `/submissions/new` — which is why callers must not use this alone. Use
 * `activeHref` to pick the single item that should light up.
 */
function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * The one nav item to mark active: the deepest route that contains the
 * current page.
 *
 * `/submissions` and `/submissions/new` are separate nav items, and a plain
 * prefix test lights up both whenever the user is on the child — two blue
 * rows, neither of which is where you are. Taking the longest match means the
 * child wins on its own page, and the parent still wins on
 * `/submissions/[id]`, which has no nav item of its own.
 */
function activeHref(sections: DashboardNavSection[], pathname: string) {
  return sections
    .flatMap((s) => s.items)
    .map((i) => i.href)
    .filter((href) => matchesRoute(pathname, href))
    .sort((a, b) => b.length - a.length)[0];
}

/** Label for the mobile bar — the same item the rail marks active. */
function currentTitle(sections: DashboardNavSection[], pathname: string) {
  const current = activeHref(sections, pathname);
  const match = sections
    .flatMap((s) => s.items)
    .find((i) => i.href === current);
  return match?.title ?? "Portal";
}
