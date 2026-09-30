import Link from "next/link";
import { PortalPage } from "./portal-page";
import { cn } from "@/lib/utils";

/**
 * Shell for the five journal-settings screens.
 *
 * The same reasoning as `policy-page.tsx` for the seventeen policies: five
 * sibling pages that share a heading, a lead and a navigation rail should be
 * built once, so that adding a sixth is a line in one array rather than a
 * sixth copy of the same layout drifting away from the other five.
 *
 * The rail is horizontal rather than a second sidebar. The portal already sits
 * inside one, and a nested vertical nav on a phone would be two columns of
 * links before any content.
 */

export const SETTINGS_TABS = [
  {
    slug: "journal",
    title: "Journal",
    href: "/admin/settings/journal",
  },
  {
    slug: "sections",
    title: "Sections",
    href: "/admin/settings/sections",
  },
  {
    slug: "review-forms",
    title: "Review forms",
    href: "/admin/settings/review-forms",
  },
  {
    slug: "email-templates",
    title: "Email templates",
    href: "/admin/settings/email-templates",
  },
  {
    slug: "policies",
    title: "Policy pages",
    href: "/admin/settings/policies",
  },
] as const;

export type SettingsSlug = (typeof SETTINGS_TABS)[number]["slug"];

export function SettingsPage({
  active,
  title,
  lead,
  children,
}: {
  active: SettingsSlug;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <PortalPage title={title} lead={lead}>
      <nav
        aria-label="Settings sections"
        className="-mx-4 mb-8 px-4 md:mx-0 md:px-0"
      >
        <ul className="flex gap-1 overflow-x-auto border-b pb-px">
          {SETTINGS_TABS.map((tab) => {
            const isActive = tab.slug === active;
            return (
              <li key={tab.slug} className="shrink-0">
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-brand text-brand-darker"
                      : "border-transparent text-muted-foreground hover:border-brand-border hover:text-brand-darker",
                  )}
                >
                  {tab.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="max-w-4xl">{children}</div>
    </PortalPage>
  );
}

/**
 * A read-only settings row: label, current value, and where it comes from.
 *
 * "Where it comes from" is the load-bearing part on every one of these five
 * screens. None of them can save anything, so the useful thing they can tell
 * an administrator is which file to edit — otherwise the screen is a form that
 * silently does nothing.
 */
export function SettingRow({
  label,
  value,
  hint,
  /** Shown when the value is empty, in place of a blank. */
  emptyNote,
}: {
  label: string;
  value?: string;
  hint?: string;
  emptyNote?: string;
}) {
  const isEmpty = !value || value.trim() === "";

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 p-4">
      <dt className="min-w-0 text-sm font-medium">
        {label}
        {hint && (
          <span className="mt-0.5 block text-xs font-normal leading-relaxed text-muted-foreground">
            {hint}
          </span>
        )}
      </dt>
      <dd
        className={cn(
          "min-w-0 max-w-md text-sm sm:text-right",
          // An unset value is stated, never left blank. A blank cell reads as
          // "not loaded"; "Not assigned yet" is a fact about the journal.
          isEmpty ? "italic text-muted-foreground" : "font-medium",
        )}
      >
        {isEmpty ? (emptyNote ?? "Not set") : value}
      </dd>
    </div>
  );
}

/**
 * Where a screen's values actually live — **development only**.
 *
 * This names source files and explains implementation decisions, which is
 * written for whoever maintains the platform, not for the journal's editorial
 * office. An administrator opening `/admin/settings/policies` has no use for
 * `src/components/layout/policy-page.tsx` or for the history of a field that
 * used to be duplicated; to them it reads as debugging output left on a page
 * they were told is finished.
 *
 * So it renders in development and disappears in production. Deleting it
 * outright was the alternative and is worse: the reasoning is genuinely useful
 * while working on these screens, and each note explains *why* a setting is
 * not editable — which is the question the next person will ask. Hiding it
 * keeps both audiences right.
 *
 * The guard is evaluated on the server at render time, so nothing reaches the
 * browser in production — the text is not merely hidden with CSS.
 */
export function SourceNote({
  file,
  children,
}: {
  file: string;
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mt-8 rounded-xl border border-brand-border bg-brand-tint/30 p-4">
      <h2 className="text-sm font-semibold text-brand-darker">
        Where these live
        {/* Named as what it is, so nobody mistakes it for guidance meant for
            the editorial office. */}
        <span className="ml-2 font-normal text-muted-foreground">
          · developer note, hidden in production
        </span>
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed">
        <code className="font-mono text-[0.9em]">{file}</code>
      </p>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
