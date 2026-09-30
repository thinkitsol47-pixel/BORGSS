import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import { SettingsPage, SourceNote } from "@/components/layout/settings-page";
import { JournalSettingsForm } from "@/components/portal/journal-settings-form";
import { siteConfig } from "@/config/site.config";
import { getJournalSettings, hasRealDoiPrefix } from "@/lib/api/journal-settings";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Journal Settings" };

/**
 * The journal's own identity.
 *
 * **Twelve fields save to `JournalSetting`; nine render read-only.** The
 * editable ones are the facts a journal acquires — an ISSN, a Crossref prefix,
 * an office address — which an administrator should be able to record without
 * a deploy. The rest are decisions rather than settings and stay in
 * `site.config.ts`; see the form component for the reasoning.
 *
 * The config file remains the default and a stored row is an override, so a
 * fresh database renders exactly as the file says.
 *
 * What makes this screen worth having rather than a link to the file is the
 * **unset** values, called out above the form. Those are the fields that block
 * an indexing application, and they are invisible in a config file until
 * someone goes looking.
 */
export default async function Page() {
  await requireGroup("adminOnly");

  const c = siteConfig;
  // The stored values, falling back to the config file for anything unset.
  const s = await getJournalSettings();
  const crossref = await hasRealDoiPrefix();

  // Counted rather than listed by hand, so this cannot say "3 outstanding"
  // while showing four.
  const unset = [
    !s.issn && "ISSN (print)",
    !s.eIssn && "e-ISSN",
    !crossref && "Crossref DOI prefix",
    s.address.includes("[") && "Editorial office address",
    !s.phone && "Telephone",
    !s.x && !s.linkedin && !s.facebook && "Social accounts",
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
            below, and saving stores them — the whole site picks them up.
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
            issn: s.issn,
            eIssn: s.eIssn,
            doiPrefix: s.doiPrefix,
            editorialOffice: s.editorialOffice,
            submissions: s.submissions,
            support: s.support,
            charges: s.charges,
            address: s.address,
            phone: s.phone,
            x: s.x,
            linkedin: s.linkedin,
            facebook: s.facebook,
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

      <SourceNote file="src/config/site.config.ts · JournalSetting">
        <p>
          The identifiers, contact addresses and social links save to the
          database and take effect across the site immediately. Everything else
          — the title, publisher, frequency, language and access model — stays
          in the config file, which is also what the public header, footer, page
          metadata and JSON-LD read.
        </p>
        <p className="mt-2">
          That split is deliberate: changing the journal&rsquo;s name or its
          access model changes the journal rather than its configuration, and
          belongs in a reviewed commit alongside the pages that would have to
          change with it. The config file stays the default for the twelve
          editable fields too — clearing one deletes its stored row and the
          file&rsquo;s value stands again.
        </p>
      </SourceNote>
    </SettingsPage>
  );
}
