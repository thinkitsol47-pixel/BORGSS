import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Hero } from "@/components/marketing/hero";
import { StatStrip } from "@/components/marketing/stat-strip";
import { SectionHeading } from "@/components/marketing/section-heading";
import {
  ArticleCard,
  ArticleListItem,
} from "@/components/marketing/article-card";
import { CtaBand } from "@/components/marketing/cta-band";
import { PostRow } from "@/components/marketing/post-list";
import { Button, Card } from "@/components/ui";
import {
  getCurrentIssue,
  getArticlesForIssue,
  getPublishedArticles,
  getLatestAnnouncements,
} from "@/lib/api/articles";
import { formatDate } from "@/lib/utils";

// ISR — revalidate on publish via /api/revalidate
export const revalidate = 3600;

const PATHWAYS: {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
}[] = [
  {
    icon: FileText,
    title: "For Authors",
    body: "Preparation guidelines, manuscript templates, and a transparent submission process from first upload to publication.",
    href: "/for-authors/guidelines",
    cta: "Author guidelines",
  },
  {
    icon: ClipboardCheck,
    title: "For Reviewers",
    body: "Join our reviewer panel and help uphold the scholarly standard of every manuscript we publish.",
    href: "/for-reviewers/become-a-reviewer",
    cta: "Become a reviewer",
  },
  {
    icon: ScrollText,
    title: "Editorial Policies",
    body: "Peer review, publication ethics, authorship, plagiarism, open access, and licensing — set out in full.",
    href: "/policies/peer-review",
    cta: "Read the policies",
  },
];

export default async function HomePage() {
  const issue = await getCurrentIssue();
  const issueArticles = issue ? await getArticlesForIssue(issue) : [];
  const published = await getPublishedArticles();
  const recent = published.slice(0, 4);
  const announcements = await getLatestAnnouncements(3);

  return (
    <>
      <Hero />

      {/* Only what the journal can stand behind. "Median to first decision"
          used to sit here at a flat "6 wks", which no query produced and no
          manuscript had yet tested — a figure a prospective author weighs a
          submission against. It returns when there are decisions to measure. */}
      <StatStrip
        stats={[
          { value: `${published.length}`, label: "Articles published" },
          { value: "Vol. 1", label: "Current volume", hint: "Since 2026" },
          { value: "Double-blind", label: "Peer review" },
          { value: "100%", label: "Open access", hint: "No reader fees" },
        ]}
      />

      {/* ------------------------------------------------- current issue */}
      <section className="container py-14">
        <SectionHeading
          eyebrow="Table of Contents"
          title="Current Issue"
          lead={
            issue
              ? `Volume ${issue.volume}, Number ${issue.number} (${issue.year}) · Published ${formatDate(issue.publishedAt)}`
              : undefined
          }
          action={{ label: "Full table of contents", href: "/issues/current" }}
        />

        {issueArticles.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted-foreground">
              The first issue is in production. Accepted articles will appear
              here on publication.
            </p>
          </Card>
        ) : (
          <>
            <ul className="grid gap-4">
              {issueArticles.map((a) => (
                <ArticleListItem key={a.id} article={a} />
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <Button href="/issues/current" variant="outline" size="lg">
                View the full issue
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </>
        )}
      </section>

      {/* ---------------------------------------------------- pathways */}
      <section className="border-t">
        <div className="container py-14">
          <SectionHeading
            eyebrow="Get Involved"
            title="Publish with BORJSS"
            lead="Everything you need to submit, review, or understand how this journal operates."
            align="center"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {PATHWAYS.map(({ icon: Icon, title, body, href, cta }) => (
              <Card key={title} interactive className="group relative p-7">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand-dark transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
                <Link
                  href={href}
                  className="mt-5 inline-block text-sm font-medium text-primary after:absolute after:inset-0 group-hover:text-brand-dark"
                >
                  {cta} →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ recent articles */}
      {recent.length > 0 && (
        <section className="border-t">
          <div className="container py-14">
            <SectionHeading
              eyebrow="Latest Research"
              title="Recently Published"
              action={{ label: "Browse all articles", href: "/articles" }}
            />
            <div className="grid gap-6 md:grid-cols-2">
              {recent.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button href="/articles" variant="outline" size="lg">
                Browse all articles
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------- announcements */}
      {announcements.length > 0 && (
        <section className="border-t">
          <div className="container py-14">
            <SectionHeading
              eyebrow="Journal Updates"
              title="Announcements"
              action={{ label: "All announcements", href: "/announcements" }}
            />
            <Card className="px-5">
              <ul>
                {announcements.map((p) => (
                  <PostRow key={p.id} post={p} />
                ))}
              </ul>
            </Card>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ aims/scope */}
      <section className="border-t">
        <div className="container grid gap-10 py-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Aims & Scope"
              title="Research that connects disciplines"
              className="mb-5"
            />
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {siteConfig.shortName} publishes original research, review
              articles, conceptual papers, and case studies across the social
              sciences. We welcome empirical, theoretical, and
              methodologically innovative work that speaks beyond a single
              discipline.
            </p>
            <Link
              href="/about/aims-scope"
              className="mt-5 inline-block text-sm font-medium text-primary hover:text-brand-dark"
            >
              Read the full aims &amp; scope →
            </Link>
          </div>

          <div className="lg:col-span-5">
            <Card className="h-full p-7">
              <p className="font-serif text-lg font-semibold">
                Journal at a glance
              </p>
              <dl className="mt-5 space-y-3.5 text-sm">
                {[
                  ["Publisher", siteConfig.publisher],
                  ["Frequency", siteConfig.frequency],
                  ["Access model", siteConfig.accessModel],
                  ["Peer review", "Double-blind"],
                  ["Language", "English"],
                  ["Country", siteConfig.countryOfPublication],
                ].map(([term, value]) => (
                  <div
                    key={term}
                    className="flex justify-between gap-6 border-b border-border/70 pb-3.5 last:border-0 last:pb-0"
                  >
                    <dt className="shrink-0 text-muted-foreground">{term}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to submit your research?"
        lead="Open access, rigorous double-blind peer review, and a clear editorial process from submission to publication."
        primary={{ label: "Start a submission", href: "/for-authors/how-to-submit" }}
        secondary={{
          label: "Read author guidelines",
          href: "/for-authors/guidelines",
        }}
      />
    </>
  );
}
