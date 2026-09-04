"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ExternalLink, LogOut, User } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import type { CurrentUser } from "@/lib/auth/current-user";
import { ROLE_LABELS } from "@/config/roles";
import { cn } from "@/lib/utils";

export function DashboardTopbar({ user }: { user: CurrentUser }) {
  const roleLine = user.roles.map((r) => ROLE_LABELS[r]).join(" · ");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
      <Link
        href="/dashboard"
        className="flex min-w-0 items-center gap-2.5 rounded-lg"
      >
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-gradient font-serif text-lg font-bold text-brand-foreground"
        >
          B
        </span>
        <span className="truncate font-serif font-semibold">
          {siteConfig.shortName}
        </span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Portal
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {/* The portal is one destination among two; a reader who wandered in
            needs a way back to the journal itself. */}
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-tint/60 hover:text-brand-darker sm:inline-flex"
        >
          View site
          <ExternalLink className="size-3.5" />
        </Link>
        <Link
          href="/profile/notifications"
          aria-label="Notifications"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-brand-tint/60 hover:text-brand-darker"
        >
          <Bell className="size-5" />
        </Link>
        <AccountMenu user={user} roleLine={roleLine} />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * Account menu
 * ------------------------------------------------------------------ */

function AccountMenu({
  user,
  roleLine,
}: {
  user: CurrentUser;
  roleLine: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative ml-1 border-l pl-2">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-brand-tint/60"
      >
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-tint text-sm font-semibold text-brand-darker"
        >
          {user.name.charAt(0)}
        </span>
        <span className="hidden max-w-[12rem] text-left leading-tight lg:block">
          <span className="block truncate text-sm font-medium">
            {user.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {roleLine}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden size-4 text-muted-foreground transition-transform lg:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border bg-background p-2 shadow-card-hover"
        >
          {/* Below lg the trigger shows only the avatar, so the panel has to
              carry the name and roles itself. */}
          <div className="border-b px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-brand-darker">{roleLine}</p>
          </div>
          <MenuLink href="/profile" icon={User}>
            Profile
          </MenuLink>
          <MenuLink href="/profile/notifications" icon={Bell}>
            Notification settings
          </MenuLink>
          <MenuLink href="/" icon={ExternalLink} className="sm:hidden">
            View site
          </MenuLink>
          <div className="mt-1 border-t pt-1">
            {/* Clears the demo sign-in and returns to the login page. When
                real auth lands, `/logout` destroys the session too. */}
            <MenuLink href="/logout" icon={LogOut}>
              Sign out
            </MenuLink>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  className,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-brand-tint hover:text-brand-darker",
        className,
      )}
    >
      <Icon className="size-4 shrink-0" />
      {children}
    </Link>
  );
}
