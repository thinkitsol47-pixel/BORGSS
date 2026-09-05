import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { JournalSettingsForm } from "@/components/portal/journal-settings-form";
import { siteConfig } from "@/config/site.config";
import { hasCrossrefPrefix } from "@/lib/api/editorial";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Journal Settings" };

/**
 * The journal's own identity.
 *
 * Rendered as a form, seeded from `siteConfig`. Saving does nothing — these
 * values are in a source file and a deployed app cannot write its own source —
 * so the form is the interface a settings table will attach to.
 *
 * What makes this screen worth having rather than a link to the file is the
 * **unset** values, called out above the form: no ISSN, no phone, no
 * socials, a placeholder DOI prefix and an address with a literal `[city]` in
 * it. Those are the fields that block an indexing application, and they are
 * invisible in a config file until someone goes looking.
 */
export default async function Page() {
  await requireGroup("adminOnly");

  const c = siteConfig;
  const crossref = hasCrossrefPrefix();

  // Counted rather than listed by hand, so this cannot say "3 outstanding"
  // while showing four.
  const unset = [
    !c.issn && "ISSN (print)",
    !c.eIssn && "e-ISSN",
    !crossref && "Crossref DOI prefix",
    c.contact.address.includes("[") && "Editorial office address",
    !c.contact.phone && "Telephone",
    !c.socials.x && !c.socials.linkedin && !c.socials.facebook && "Social accounts",
  ].filter(Boolean) as string[];

  return (
    <SettingsPage
      active="journal"
      title="Journal settings"
      lead="The journal's identity, as every page of the site and every metadata record reads it."
    >
      {/* The gaps come first. They are the reason to open this screen. */}
      {unset.length > 0 && (
        <Alert
          tone="warning"
          title={`${unset.length} ${unset.length === 1 ? "field is" : "fields are"} not set`}
        >
          <p>
            <span className="font-medium">{unset.join(", ")}</span>. Each is
            left deliberately empty rather than filled with a placeholder that
            would be published as fact — an invented ISSN on a journal
            information page is a false statement to readers and to indexing
            services.
          </p>
          <p className="mt-2">
            The first three block a DOAJ application. The fields for them are
            below, but saving does not store anything yet — until it does, set
            them in{" "}
            <code className="font-mono text-[0.9em]">src/config/site.config.ts</code>{" "}
            and the whole site picks them up.
          </p>
        </Alert>
      )}

      <div className="mt-8">
        <JournalSettingsForm
          values={{
            name: c.name,
            shortName: c.shortName,
            tagline: c.tagline,
            description: c.description,
            publisher: c.publisher,
            countryOfPublication: c.countryOfPublication,
            frequency: c.frequency,
            language: c.language,
            accessModel: c.accessModel,
            issn: c.issn,
            eIssn: c.eIssn,
            doiPrefix: c.doiPrefix,
            editorialOffice: c.contact.editorialOffice,
            submissions: c.contact.submissions,
            support: c.contact.support,
            charges: c.contact.charges,
            address: c.contact.address,
            phone: c.contact.phone,
            x: c.socials.x,
            linkedin: c.socials.linkedin,
            facebook: c.socials.facebook,
          }}
        />
      </div>

      {!crossref && (
        <p className="mt-6 text-sm">
          <Link
            href="/admin/doi"
            className="font-medium text-primary hover:text-brand-dark hover:underline"
          >
            See the DOI register
          </Link>
        </p>
      )}

      <SourceNote file="src/config/site.config.ts">
        Every value on this page is read from that one file, which is also what
        the public header, footer, page metadata and JSON-LD read. Editing it
        and deploying changes all of them at once — which is why it is a single
        source of truth rather than a settings table. The form above is the
        interface a settings table will attach to; until there is one, Save
        stores nothing.
      </SourceNote>
    </SettingsPage>
  );
}
