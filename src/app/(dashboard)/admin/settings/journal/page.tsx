import type { Metadata } from "next";
import Link from "next/link";
import { requireGroup } from "@/lib/auth/require-role";
import {
  SettingRow,
  SettingsPage,
  SourceNote,
} from "@/components/layout/settings-page";
import { siteConfig } from "@/config/site.config";
import { hasCrossrefPrefix } from "@/lib/api/editorial";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Journal Settings" };

/**
 * The journal's own identity.
 *
 * Read-only, from `siteConfig`. What makes this screen worth having rather
 * than a link to the file is the **unset** values: no ISSN, no phone, no
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
            The first three block a DOAJ application. Fill them in{" "}
            <code className="font-mono text-[0.9em]">src/config/site.config.ts</code>{" "}
            once they are officially assigned, and the whole site picks them up.
          </p>
        </Alert>
      )}

      {/* ------------------------------------------------------- identity */}
      <section aria-labelledby="identity-heading" className="mt-8">
        <h2 id="identity-heading" className="font-serif text-lg font-semibold">
          Identity
        </h2>
        <dl className="mt-3 divide-y rounded-xl border">
          <SettingRow label="Full title" value={c.name} />
          <SettingRow label="Short title" value={c.shortName} />
          <SettingRow label="Tagline" value={c.tagline} />
          <SettingRow
            label="Description"
            value={c.description}
            hint="Used in page metadata and social cards."
          />
          <SettingRow
            label="Site URL"
            value={c.url}
            hint="Read from NEXT_PUBLIC_SITE_URL; falls back to localhost in development."
          />
        </dl>
      </section>

      {/* ------------------------------------------------------ publishing */}
      <section aria-labelledby="publishing-heading" className="mt-8">
        <h2 id="publishing-heading" className="font-serif text-lg font-semibold">
          Publishing
        </h2>
        <dl className="mt-3 divide-y rounded-xl border">
          <SettingRow label="Publisher" value={c.publisher} />
          <SettingRow label="Country of publication" value={c.countryOfPublication} />
          <SettingRow label="Frequency" value={c.frequency} />
          <SettingRow label="Language" value={c.language} />
          <SettingRow label="Access model" value={c.accessModel} />
        </dl>
      </section>

      {/* ----------------------------------------------------- identifiers */}
      <section aria-labelledby="identifiers-heading" className="mt-8">
        <h2 id="identifiers-heading" className="font-serif text-lg font-semibold">
          Identifiers
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          None of the three has been assigned. The journal information page and
          the indexing page both describe them as pending rather than showing a
          number, and they must keep doing so until these are real.
        </p>
        <dl className="mt-3 divide-y rounded-xl border">
          <SettingRow
            label="ISSN (print)"
            value={c.issn}
            emptyNote="Not assigned yet"
            hint="Applied for through the national ISSN centre."
          />
          <SettingRow
            label="e-ISSN"
            value={c.eIssn}
            emptyNote="Not assigned yet"
            hint="The one that matters for an online-only journal, and for DOAJ."
          />
          <SettingRow
            label="Crossref DOI prefix"
            value={crossref ? c.doiPrefix : ""}
            emptyNote={`Placeholder — currently ${c.doiPrefix}`}
            hint="Read from CROSSREF_DOI_PREFIX. No registry issues 10.xxxxx."
          />
        </dl>
        {!crossref && (
          <p className="mt-3 text-sm">
            <Link
              href="/admin/doi"
              className="font-medium text-primary hover:text-brand-dark hover:underline"
            >
              See the DOI register
            </Link>
          </p>
        )}
      </section>

      {/* -------------------------------------------------------- contact */}
      <section aria-labelledby="contact-heading" className="mt-8">
        <h2 id="contact-heading" className="font-serif text-lg font-semibold">
          Contact addresses
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These appear on the contact page, in every policy&rsquo;s editorial
          office panel, and in the &ldquo;not built yet&rdquo; notice on every
          portal screen that cannot yet do its job — so they are the addresses
          real correspondence arrives at today.
        </p>
        <dl className="mt-3 divide-y rounded-xl border">
          <SettingRow label="Editorial office" value={c.contact.editorialOffice} />
          <SettingRow label="Submissions" value={c.contact.submissions} />
          <SettingRow label="Support" value={c.contact.support} />
          <SettingRow label="Article charges" value={c.contact.charges} />
          <SettingRow
            label="Postal address"
            value={c.contact.address.includes("[") ? "" : c.contact.address}
            emptyNote={`Incomplete — currently "${c.contact.address}"`}
            hint="A literal placeholder is still in this value."
          />
          <SettingRow
            label="Telephone"
            value={c.contact.phone}
            emptyNote="Not published"
          />
        </dl>
      </section>

      {/* -------------------------------------------------------- socials */}
      <section aria-labelledby="socials-heading" className="mt-8">
        <h2 id="socials-heading" className="font-serif text-lg font-semibold">
          Social accounts
        </h2>
        <dl className="mt-3 divide-y rounded-xl border">
          <SettingRow label="X" value={c.socials.x} emptyNote="No account" />
          <SettingRow
            label="LinkedIn"
            value={c.socials.linkedin}
            emptyNote="No account"
          />
          <SettingRow
            label="Facebook"
            value={c.socials.facebook}
            emptyNote="No account"
          />
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">
          The footer renders no social links while these are empty, rather than
          showing icons that lead nowhere.
        </p>
      </section>

      <SourceNote file="src/config/site.config.ts">
        Every value on this page is read from that one file, which is also what
        the public header, footer, page metadata and JSON-LD read. Editing it
        and deploying changes all of them at once — which is why it is a single
        source of truth rather than a settings table. Nothing here can be
        changed from this screen; there is no database.
      </SourceNote>
    </SettingsPage>
  );
}
