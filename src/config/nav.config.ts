import type { Permission, Role } from "@/config/roles";
import { hasPermission } from "@/config/roles";

/* ------------------------------------------------------------------ *
 * PUBLIC NAVIGATION  (marketing site header)
 * ------------------------------------------------------------------ */

export type NavItem = {
  title: string;
  href: string;
  children?: NavItem[];
};

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  {
    title: "About",
    href: "/about",
    children: [
      { title: "About the Journal", href: "/about" },
      { title: "Aims & Scope", href: "/about/aims-scope" },
      { title: "Journal Information", href: "/about/journal-information" },
      { title: "Editorial Board", href: "/about/editorial-board" },
      { title: "History", href: "/about/history" },
    ],
  },
  {
    title: "Issues",
    href: "/issues",
    children: [
      { title: "Current Issue", href: "/issues/current" },
      { title: "Archives", href: "/issues" },
    ],
  },
  { title: "Articles", href: "/articles" },
  {
    title: "For Authors",
    href: "/for-authors/guidelines",
    children: [
      { title: "Author Guidelines", href: "/for-authors/guidelines" },
      { title: "Submission Process", href: "/for-authors/submission-process" },
      { title: "Templates", href: "/for-authors/templates" },
      { title: "Publication Charges (APC)", href: "/apc" },
    ],
  },
  {
    title: "For Reviewers",
    href: "/for-reviewers/guidelines",
    children: [
      { title: "Reviewer Guidelines", href: "/for-reviewers/guidelines" },
      { title: "Become a Reviewer", href: "/for-reviewers/become-a-reviewer" },
    ],
  },
  {
    title: "Policies",
    href: "/policies/peer-review",
    children: [
      { title: "Peer Review Policy", href: "/policies/peer-review" },
      { title: "Publication Ethics", href: "/policies/publication-ethics" },
      { title: "Research Ethics", href: "/policies/research-ethics" },
      { title: "Research Integrity", href: "/policies/research-integrity" },
      { title: "Authorship", href: "/policies/authorship" },
      { title: "Conflict of Interest", href: "/policies/conflict-of-interest" },
      { title: "Peer Reviewer Ethics", href: "/policies/reviewer-ethics" },
      { title: "Editorial Independence", href: "/policies/editorial-independence" },
      { title: "Plagiarism Policy", href: "/policies/plagiarism" },
      { title: "Open Access Policy", href: "/policies/open-access" },
      { title: "Copyright", href: "/policies/copyright" },
      { title: "Licensing", href: "/policies/licensing" },
      { title: "AI-Assisted Writing Policy", href: "/policies/ai-policy" },
      {
        title: "Retraction & Correction",
        href: "/policies/retraction-correction",
      },
      { title: "Complaints & Appeals", href: "/policies/complaints-appeals" },
      { title: "Data Availability", href: "/policies/data-availability" },
      { title: "Privacy", href: "/policies/privacy" },
    ],
  },
  {
    title: "News & Events",
    href: "/announcements",
    children: [
      { title: "Announcements", href: "/announcements" },
      { title: "News", href: "/news" },
      { title: "Events", href: "/events" },
    ],
  },
  { title: "Indexing", href: "/indexing" },
  { title: "Contact", href: "/contact" },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Journal",
    items: [
      { title: "About", href: "/about" },
      { title: "Aims & Scope", href: "/about/aims-scope" },
      { title: "Editorial Board", href: "/about/editorial-board" },
      { title: "Announcements", href: "/announcements" },
      { title: "News", href: "/news" },
      { title: "Events", href: "/events" },
    ],
  },
  {
    heading: "Authors & Reviewers",
    items: [
      { title: "Submit a Manuscript", href: "/for-authors/how-to-submit" },
      { title: "Author Guidelines", href: "/for-authors/guidelines" },
      { title: "Reviewer Guidelines", href: "/for-reviewers/guidelines" },
      { title: "Publication Charges", href: "/apc" },
    ],
  },
  {
    heading: "Policies",
    items: [
      { title: "Peer Review", href: "/policies/peer-review" },
      { title: "Publication Ethics", href: "/policies/publication-ethics" },
      { title: "Open Access", href: "/policies/open-access" },
      { title: "Copyright & Licensing", href: "/policies/copyright" },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * DASHBOARD NAVIGATION  (role-aware sidebar)
 * ------------------------------------------------------------------ */

export type DashboardNavItem = {
  title: string;
  href: string;
  icon?: string; // lucide-react icon name
  /** Item shows if the user holds ANY of these permissions. */
  permissions?: Permission[];
};

export type DashboardNavSection = {
  heading: string;
  items: DashboardNavItem[];
};

const DASHBOARD_NAV: DashboardNavSection[] = [
  {
    heading: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    heading: "Author",
    items: [
      {
        title: "My Submissions",
        href: "/submissions",
        icon: "FileText",
        permissions: ["submission.viewOwn"],
      },
      {
        // The portal's own entry point, which stays inside the sidebar. The
        // public "Submit Manuscript" button in the site header points at
        // /for-authors/how-to-submit instead — same task, different audience.
        title: "New Submission",
        href: "/submissions/new",
        icon: "FilePlus",
        permissions: ["submission.create"],
      },
    ],
  },
  {
    heading: "Reviewer",
    items: [
      {
        title: "My Reviews",
        href: "/reviews",
        icon: "ClipboardCheck",
        permissions: ["review.perform"],
      },
    ],
  },
  {
    heading: "Editorial",
    items: [
      {
        title: "Submission Queue",
        href: "/editorial/queue",
        icon: "Inbox",
        permissions: ["submission.viewAll"],
      },
      {
        title: "Reviewer Database",
        href: "/editorial/reviewers-db",
        icon: "Users",
        permissions: ["review.assign"],
      },
      {
        title: "Issues",
        href: "/editorial/issues",
        icon: "BookOpen",
        permissions: ["issue.manage"],
      },
    ],
  },
  {
    heading: "Production",
    items: [
      {
        title: "Production Queue",
        href: "/production",
        icon: "Wand2",
        permissions: ["production.work"],
      },
    ],
  },
  {
    heading: "Administration",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: "UserCog",
        permissions: ["users.manage"],
      },
      {
        title: "Settings",
        href: "/admin/settings/journal",
        icon: "Settings",
        permissions: ["settings.manage"],
      },
      {
        title: "DOI / Crossref",
        href: "/admin/doi",
        icon: "Link2",
        permissions: ["doi.manage"],
      },
      {
        title: "Statistics",
        href: "/admin/statistics",
        icon: "BarChart3",
        permissions: ["stats.viewAll"],
      },
      {
        title: "Announcements",
        href: "/admin/announcements",
        icon: "Megaphone",
        permissions: ["settings.manage"],
      },
    ],
  },
  {
    heading: "Platform",
    items: [
      {
        title: "Audit Log",
        href: "/admin/audit-log",
        icon: "ScrollText",
        permissions: ["audit.view"],
      },
      {
        title: "Integrations",
        href: "/admin/integrations",
        icon: "Plug",
        permissions: ["platform.manage"],
      },
    ],
  },
  {
    heading: "Account",
    items: [
      { title: "Profile", href: "/profile", icon: "User" },
      {
        title: "Notifications",
        href: "/profile/notifications",
        icon: "Bell",
      },
    ],
  },
];

/** Returns only the sections/items the given roles are allowed to see. */
export function getDashboardNav(roles: Role[]): DashboardNavSection[] {
  return DASHBOARD_NAV.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !item.permissions ||
        item.permissions.some((p) => hasPermission(roles, p)),
    ),
  })).filter((section) => section.items.length > 0);
}
