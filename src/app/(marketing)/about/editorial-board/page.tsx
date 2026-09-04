import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Globe2, Mail } from "lucide-react";
import type { BoardMember } from "@/types";
import { getBoardMembers } from "@/lib/api/articles";
import { siteConfig } from "@/config/site.config";
import { Badge, Breadcrumb, Button, Eyebrow } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Editorial Board",
  description:
    "The Editor-in-Chief, associate and section editors, and international advisory board of BORJSS.",
};

const GROUPS: {
  category: BoardMember["category"];
  heading: string;
  blurb?: string;
}[] = [
  {
    category: "editor-in-chief",
    heading: "Editor-in-Chief",
    blurb:
      "Holds final responsibility for editorial decisions and the scholarly direction of the journal.",
  },
  {
    category: "managing-editor",
    heading: "Managing Editor",
    blurb:
      "Oversees the day-to-day operation of the review process and the editorial office.",
  },
  {
    category: "associate-editor",
    heading: "Associate Editors",
    blurb:
      "Handle manuscripts within their subject areas and recommend decisions to the Editor-in-Chief.",
  },
  {
    category: "section-editor",
    heading: "Section Editors",
    blurb: "Manage peer review for manuscripts in their specialist sections.",
  },
  {
    category: "editorial-board",
    heading: "Editorial Board",
    blurb:
      "Advise on scope and standards, and review manuscripts within their expertise.",
  },
  {
    category: "advisory-board",
    heading: "International Advisory Board",
    blurb:
      "Senior scholars who advise on the journal's long-term development and international standing.",
  },
];

export default async function EditorialBoardPage() {
  const board = await getBoardMembers();

  const groups = GROUPS.map((g) => ({
    ...g,
    members: board.filter((m) => m.category === g.category),
  })).filter((g) => g.members.length > 0);

  const countries = Array.from(new Set(board.map((m) => m.country)));
  const institutions = Array.from(new Set(board.map((m) => m.institution)));

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumb
        items={[{ label: "About", href: "/about" }, { label: "Editorial Board" }]}
      />

      <header className="mt-4 border-b pb-8">
        <Eyebrow>About the Journal</Eyebrow>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Editorial Board</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Editorial decisions at {siteConfig.shortName} are made by working
          scholars in the fields the journal covers. Board members serve in a
          personal academic capacity and act independently of the publisher.
        </p>

        <dl className="mt-6 grid max-w-lg grid-cols-1 gap-px sm:grid-cols-3 overflow-hidden rounded-lg border border-brand-border bg-border">
          {[
            ["Members", board.length],
            ["Institutions", institutions.length],
            ["Countries", countries.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-card px-4 py-3 text-center">
              <dd className="font-serif text-2xl font-bold text-brand-dark tabular-nums">
                {value}
              </dd>
              <dt className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <section key={group.category} aria-labelledby={group.category}>
            <div className="flex items-center gap-3">
              <h2
                id={group.category}
                className="font-serif text-xl font-bold"
              >
                {group.heading}
              </h2>
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="shrink-0 text-xs text-muted-foreground">
                {group.members.length}
              </span>
            </div>

            {group.blurb && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {group.blurb}
              </p>
            )}

            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* join the board */}
      <section className="mt-12 rounded-lg border border-brand-border bg-brand-tint/30 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-serif text-xl font-bold">
              Interested in joining the board?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We welcome expressions of interest from researchers with a
              doctorate and a record of publication in the social sciences.
              Reviewing for the journal is often the first step.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/for-reviewers/become-a-reviewer">
              Become a reviewer
            </Button>
            <Button href="/contact" variant="outline">
              <Mail className="size-4" aria-hidden />
              Contact the office
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MemberCard({ member }: { member: BoardMember }) {
  const initials = member.name
    .replace(/^(Prof\.|Dr\.)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <li className="flex gap-4 rounded-lg border border-brand bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <span
        aria-hidden
        className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-tint font-serif text-base font-bold text-brand-darker"
      >
        {initials}
      </span>

      <div className="min-w-0">
        <p className="font-serif text-[15px] font-semibold leading-snug">
          {member.name}
        </p>
        <p className="mt-0.5 text-xs font-medium text-primary">{member.role}</p>

        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Building2 className="mt-0.5 size-3 shrink-0" aria-hidden />
          {member.institution}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe2 className="size-3 shrink-0" aria-hidden />
          {member.country}
        </p>

        {member.orcid && (
          <a
            href={`https://orcid.org/${member.orcid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success hover:underline"
          >
            <svg viewBox="0 0 256 256" className="size-3.5" aria-hidden>
              <circle cx="128" cy="128" r="128" fill="currentColor" />
              <path
                fill="#fff"
                d="M86 186h-18V95h18v91zm-9-104a11 11 0 1 1 0-22 11 11 0 0 1 0 22zm35 13h35c33 0 48 24 48 46 0 24-19 45-48 45h-35V95zm18 75h16c23 0 31-17 31-29 0-20-13-30-32-30h-15v59z"
              />
            </svg>
            ORCID
          </a>
        )}
      </div>
    </li>
  );
}
