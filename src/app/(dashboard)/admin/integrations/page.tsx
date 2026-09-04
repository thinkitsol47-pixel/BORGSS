import type { Metadata } from "next";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { requireRoles } from "@/lib/auth/require-role";
import { hasCrossrefPrefix } from "@/lib/api/editorial";
import { PortalPage } from "@/components/layout/portal-page";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Integrations" };

/**
 * External services, and the danger zone.
 *
 * Every integration on this platform is unconnected, and the honest version of
 * this screen is a list of things that do not work with the consequence of
 * each stated. That is more useful than credential fields that save nowhere:
 * an administrator reading "Crossref — not connected, so no DOI resolves"
 * learns something; an empty API-key box teaches them nothing.
 *
 * No credential field is rendered at all. A form that looks like it stores a
 * secret and does not is the worst thing this screen could contain.
 */

type IntegrationState = "not-connected" | "connected";

const INTEGRATIONS: {
  name: string;
  purpose: string;
  consequence: string;
  state: IntegrationState;
  /** Where the effect of its absence is already visible in the app. */
  seeAlso?: { label: string; href: string };
}[] = [
  {
    name: "Crossref",
    purpose:
      "Registers a DOI for each published article and deposits its metadata.",
    consequence:
      "The journal has no Crossref membership and no prefix. Every DOI shown in the app begins 10.xxxxx, which is a placeholder, and none of them resolves.",
    state: "not-connected",
    seeAlso: { label: "DOI register", href: "/admin/doi" },
  },
  {
    name: "Mail provider",
    purpose:
      "Sends every message the platform produces: decision letters, reviewer invitations, password resets, contact-form mail.",
    consequence:
      "Nothing is sent by the application at all. Every form validates and stops — including the contact form, the reviewer application, and the decision screen. All correspondence goes out of the editorial office by hand.",
    state: "not-connected",
  },
  {
    name: "ORCID",
    purpose:
      "Lets an author sign in with their ORCID iD and confirms the iD belongs to them.",
    consequence:
      "An ORCID typed into a profile or a submission is a claim, not proof. The check digit is validated; the identity is not. The profile screen says so on the page.",
    state: "not-connected",
    seeAlso: { label: "ORCID on the profile", href: "/profile/orcid" },
  },
  {
    name: "Plagiarism screening",
    purpose:
      "Checks a submitted manuscript for text overlap with published work before it reaches an editor.",
    consequence:
      "No manuscript is screened. The plagiarism policy describes screening as part of the process, and until this is connected that step is done manually or not at all — worth resolving before the policy is read as a promise.",
    state: "not-connected",
    seeAlso: { label: "Plagiarism policy", href: "/policies/plagiarism" },
  },
  {
    name: "Analytics",
    purpose: "Article views, downloads, and where readers come from.",
    consequence:
      "There is no analytics script anywhere on the site, and no cookie is set. This is why the statistics screen reports no views or downloads — the numbers are not hidden, they were never collected. The privacy policy is written against this and must be updated if it changes.",
    state: "not-connected",
    seeAlso: { label: "Privacy policy", href: "/policies/privacy" },
  },
  {
    name: "Preservation archive",
    purpose:
      "Deposits published articles with a third party (CLOCKSS, Portico or PKP PN) so they survive the journal.",
    consequence:
      "Nothing is deposited. The indexing page describes preservation as being established rather than live, which is accurate — keep it that way until a deposit has actually been made.",
    state: "not-connected",
    seeAlso: { label: "Indexing & archiving", href: "/indexing" },
  },
];

export default async function Page() {
  // `platform.manage` is super-admin only: credentials and the danger zone.
  await requireRoles(["superAdmin"]);

  const connected = INTEGRATIONS.filter((i) => i.state === "connected").length;
  // Derived rather than asserted, so this page stops claiming "no prefix" on
  // its own the moment real DOIs are entered.
  const crossref = hasCrossrefPrefix();

  return (
    <PortalPage
      title="Integrations"
      lead="External services this platform depends on, and what does not work while each is unconnected."
    >
      <Alert
        tone="warning"
        title={
          connected === 0
            ? "Nothing is connected"
            : `${connected} of ${INTEGRATIONS.length} connected`
        }
      >
        {connected === 0 ? (
          <>
            Every integration below is unconnected, and none can be configured
            from this screen — there is no backend to hold a credential. This
            page lists them so the consequences are visible in one place rather
            than discovered one screen at a time.
          </>
        ) : (
          <>
            The remaining integrations are unconnected. Each entry states what
            does not work while that is true.
          </>
        )}
        {!crossref && (
          <p className="mt-2">
            The DOI register confirms this independently: no article has been
            deposited, because the journal holds no Crossref prefix.
          </p>
        )}
      </Alert>

      <ul className="mt-6 space-y-3">
        {INTEGRATIONS.map((i) => (
          <li key={i.name} className="rounded-xl border p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">{i.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {i.purpose}
                </p>
              </div>
              {/* The state is a word, not a coloured dot. */}
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  i.state === "connected"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border-strong bg-background text-muted-foreground",
                )}
              >
                {i.state === "connected" ? "Connected" : "Not connected"}
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-warning">
                What this means today
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed">{i.consequence}</p>
            </div>

            {i.seeAlso && (
              <p className="mt-3 text-sm">
                <Link
                  href={i.seeAlso.href}
                  className="font-medium text-primary hover:text-brand-dark hover:underline"
                >
                  {i.seeAlso.label}
                </Link>
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* ---------------------------------------------------- danger zone */}
      <section aria-labelledby="danger-heading" className="mt-10">
        <h2 id="danger-heading" className="font-serif text-lg font-semibold">
          Data export and erasure
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The privacy policy grants two rights that need a control here: a copy
          of the personal data held about someone, and its erasure. Both are
          listed because the policy already promises them, and neither is built.
        </p>

        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-danger">
            <AlertOctagon className="size-4 shrink-0" aria-hidden />
            Not built, and deliberately so
          </h3>
          <p className="mt-2 text-sm leading-relaxed">
            There is no database, so there is nothing to export or erase — but
            these are also the two operations that most need care before they
            exist. Erasure in particular cannot be a single button: a published
            article naming an author is part of the scholarly record and is not
            erasable, and the privacy policy already sets out those limits.
            Building the control before the boundary is settled is how a journal
            deletes something it was obliged to keep.
          </p>
          <p className="mt-3 text-sm">
            <Link
              href="/policies/privacy"
              className="font-medium text-primary hover:text-brand-dark hover:underline"
            >
              What the privacy policy commits to
            </Link>
          </p>
        </div>
      </section>

      <Alert tone="warning" title="No credentials are stored here" className="mt-10">
        This screen intentionally has no API-key or password fields. A form that
        appears to save a secret and does not is worse than no form: someone
        would paste a live Crossref credential into it. When the backend lands,
        credentials belong in environment configuration or a secret store, with
        this screen showing only whether each service answers — never the key
        itself.
      </Alert>
    </PortalPage>
  );
}
