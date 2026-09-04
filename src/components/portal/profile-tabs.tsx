import Link from "next/link";
import { cn } from "@/lib/utils";

/** Same construction as `SubmissionTabs`: real routes, active passed in. */
export type ProfileTab = "details" | "orcid" | "notifications";

const TABS: { id: ProfileTab; label: string; href: string }[] = [
  { id: "details", label: "Your details", href: "/profile" },
  { id: "orcid", label: "ORCID", href: "/profile/orcid" },
  {
    id: "notifications",
    label: "Notifications",
    href: "/profile/notifications",
  },
];

export function ProfileTabs({ active }: { active: ProfileTab }) {
  return (
    <nav aria-label="Profile sections" className="-mx-4 px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1 overflow-x-auto border-b pb-px">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <li key={tab.id} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand text-brand-darker"
                    : "border-transparent text-muted-foreground hover:border-brand-border hover:text-brand-darker",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
