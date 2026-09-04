"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { mainNav, type NavItem } from "@/config/nav.config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Long child lists (Policies has 17) become a multi-column panel. */
const COLUMN_THRESHOLD = 8;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MainNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav aria-label="Main">
      {/* ---------------------------------------------------------- desktop */}
      <ul className="hidden items-center lg:flex">
        {mainNav.map((item) => (
          <TopItem key={item.href} item={item} pathname={pathname} />
        ))}
      </ul>

      {/* ----------------------------------------------------------- mobile */}
      <div className="flex items-center justify-between py-2 lg:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-brand-tint/60"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
          Menu
        </button>
        <Link
          href="/search"
          aria-label="Search"
          className="rounded-lg p-2 hover:bg-brand-tint/60"
        >
          <Search className="size-5" />
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-fade-in flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <span className="font-serif text-lg font-bold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-lg p-2 hover:bg-brand-tint/60"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto px-3 py-3">
              {mainNav.map((item) => (
                <MobileItem key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>

            {/* The header's Login and Submit buttons are hidden below sm, so
                the sheet has to carry both. */}
            <div className="space-y-2 border-t p-4">
              <Button href="/for-authors/how-to-submit" className="w-full">
                Submit Manuscript
              </Button>
              <Button href="/login" variant="outline" className="w-full">
                Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ *
 * Desktop item + hover panel
 * ------------------------------------------------------------------ */

function TopItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const wide = (item.children?.length ?? 0) > COLUMN_THRESHOLD;

  return (
    <li className="group relative">
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-1 px-3.5 py-3.5 text-[15px] font-medium transition-colors hover:text-brand-dark",
          active ? "text-brand-dark" : "text-foreground",
        )}
      >
        {item.title}
        {item.children && (
          <ChevronDown className="size-3.5 opacity-50 transition-transform group-hover:rotate-180" />
        )}
        {/* sky underline on active / hover */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand transition-transform duration-200",
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
          )}
        />
      </Link>

      {item.children && (
        <div
          className={cn(
            // pointer-events-none is what keeps the closed panel from sitting
            // invisibly over the hero and turning the cursor into a pointer
            "invisible pointer-events-none absolute left-0 top-full z-50 translate-y-1 rounded-xl border bg-background p-2 opacity-0 shadow-card-hover transition-[opacity,transform] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
            wide ? "w-[42rem]" : "w-64",
          )}
        >
          <ul className={cn(wide && "grid grid-cols-3 gap-x-1")}>
            {item.children.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-brand-tint hover:text-brand-darker",
                    isActive(pathname, c.href) &&
                      "bg-brand-tint/60 font-medium text-brand-darker",
                  )}
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Mobile accordion item
 * ------------------------------------------------------------------ */

function MobileItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const [expanded, setExpanded] = useState(active);

  return (
    <li className="border-b border-border/60 last:border-0">
      <div className="flex items-center">
        <Link
          href={item.href}
          className={cn(
            "flex-1 rounded-lg px-3 py-3 text-[15px] font-medium",
            active ? "text-brand-dark" : "text-foreground",
          )}
        >
          {item.title}
        </Link>
        {item.children && (
          <button
            type="button"
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.title}`}
            aria-expanded={expanded}
            className="rounded-lg p-2.5 text-muted-foreground hover:bg-brand-tint/60"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {item.children && expanded && (
        <ul className="mb-2 ml-3 space-y-0.5 border-l-2 border-brand/25 pl-3">
          {item.children.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm text-muted-foreground",
                  isActive(pathname, c.href) &&
                    "font-medium text-brand-dark",
                )}
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
