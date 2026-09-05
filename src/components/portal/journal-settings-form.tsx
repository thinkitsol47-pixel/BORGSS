"use client";

import { useState } from "react";
import { Button, Field, Input, Select } from "@/components/ui";
import { COUNTRIES } from "@/config/countries";

/**
 * The journal's identity, as an editable form.
 *
 * UI ONLY. Nothing is saved — these values live in `src/config/site.config.ts`
 * and a deployed app cannot write its own source. The form is the interface the
 * backend will attach to; until then Save says so rather than pretending.
 *
 * The three identifiers get their own section and lead the form, because they
 * are the fields that block a DOAJ application and the only reason to open
 * this screen with intent.
 */
export function JournalSettingsForm({
  values,
}: {
  values: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    publisher: string;
    countryOfPublication: string;
    frequency: string;
    language: string;
    accessModel: string;
    issn: string;
    eIssn: string;
    doiPrefix: string;
    editorialOffice: string;
    submissions: string;
    support: string;
    charges: string;
    address: string;
    phone: string;
    x: string;
    linkedin: string;
    facebook: string;
  };
}) {
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --------------------------------------------------- identifiers */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Identifiers</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The three fields a DOAJ application asks for. Leave one empty rather
          than filling it with a number that has not been assigned — an invented
          ISSN is published as fact on the journal information page.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="ISSN (print)"
            htmlFor="issn"
            optional
            hint="Applied for through the national ISSN centre."
          >
            <Input
              id="issn"
              name="issn"
              defaultValue={values.issn}
              placeholder="2789-1234"
            />
          </Field>

          <Field
            label="e-ISSN"
            htmlFor="eIssn"
            optional
            hint="The one that matters for an online-only journal, and for DOAJ."
          >
            <Input
              id="eIssn"
              name="eIssn"
              defaultValue={values.eIssn}
              placeholder="2789-5678"
            />
          </Field>

          <Field
            label="Crossref DOI prefix"
            htmlFor="doiPrefix"
            hint="No registry issues 10.xxxxx — that is the placeholder standing in for a real prefix."
            className="sm:col-span-2"
          >
            <Input
              id="doiPrefix"
              name="doiPrefix"
              defaultValue={values.doiPrefix}
              placeholder="10.12345"
            />
          </Field>
        </div>
      </section>

      {/* ------------------------------------------------------- identity */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Identity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Full title" htmlFor="name" className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={values.name} />
          </Field>

          <Field
            label="Short title"
            htmlFor="shortName"
            hint="Used where the full title will not fit."
          >
            <Input
              id="shortName"
              name="shortName"
              defaultValue={values.shortName}
            />
          </Field>

          <Field label="Tagline" htmlFor="tagline">
            <Input id="tagline" name="tagline" defaultValue={values.tagline} />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            hint="Used in page metadata and social cards."
            className="sm:col-span-2"
          >
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={values.description}
              className="w-full rounded-lg border border-brand-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </Field>
        </div>
      </section>

      {/* ----------------------------------------------------- publishing */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Publishing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Publisher" htmlFor="publisher" className="sm:col-span-2">
            <Input
              id="publisher"
              name="publisher"
              defaultValue={values.publisher}
            />
          </Field>

          {/* Free text with a datalist, matching every other country field on
              the site: nobody is blocked by a name the list gets wrong, but
              typing completes to the canonical spelling. */}
          <Field label="Country of publication" htmlFor="countryOfPublication">
            <Input
              id="countryOfPublication"
              name="countryOfPublication"
              defaultValue={values.countryOfPublication}
              list="journal-country-options"
            />
            <datalist id="journal-country-options">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Frequency" htmlFor="frequency">
            <Input
              id="frequency"
              name="frequency"
              defaultValue={values.frequency}
            />
          </Field>

          <Field
            label="Language"
            htmlFor="language"
            hint="The ISO code, as page metadata and JSON-LD read it."
          >
            <Input
              id="language"
              name="language"
              defaultValue={values.language}
            />
          </Field>

          <Field label="Access model" htmlFor="accessModel">
            <Select
              id="accessModel"
              name="accessModel"
              defaultValue={values.accessModel}
            >
              <option value="Open Access">Open Access</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Subscription">Subscription</option>
            </Select>
          </Field>
        </div>
      </section>

      {/* -------------------------------------------------------- contact */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Contact addresses</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These appear on the contact page, in every policy&rsquo;s editorial
          office panel, and in the notice on every portal screen that cannot yet
          do its job — so they are the addresses real correspondence arrives at
          today.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Editorial office" htmlFor="editorialOffice">
            <Input
              id="editorialOffice"
              name="editorialOffice"
              type="email"
              defaultValue={values.editorialOffice}
            />
          </Field>

          <Field label="Submissions" htmlFor="submissions">
            <Input
              id="submissions"
              name="submissions"
              type="email"
              defaultValue={values.submissions}
            />
          </Field>

          <Field label="Support" htmlFor="support">
            <Input
              id="support"
              name="support"
              type="email"
              defaultValue={values.support}
            />
          </Field>

          <Field label="Article charges" htmlFor="charges">
            <Input
              id="charges"
              name="charges"
              type="email"
              defaultValue={values.charges}
            />
          </Field>

          <Field
            label="Postal address"
            htmlFor="address"
            hint="A literal [city] is still in this value."
            className="sm:col-span-2"
          >
            <Input id="address" name="address" defaultValue={values.address} />
          </Field>

          <Field label="Telephone" htmlFor="phone" optional>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={values.phone}
              placeholder="+92 21 1234567"
            />
          </Field>
        </div>
      </section>

      {/* -------------------------------------------------------- socials */}
      <section>
        <h2 className="font-serif text-lg font-semibold">Social accounts</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The footer renders no social links while these are empty, rather than
          showing icons that lead nowhere.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="X" htmlFor="x" optional>
            <Input
              id="x"
              name="x"
              defaultValue={values.x}
              placeholder="https://x.com/…"
            />
          </Field>

          <Field label="LinkedIn" htmlFor="linkedin" optional>
            <Input
              id="linkedin"
              name="linkedin"
              defaultValue={values.linkedin}
              placeholder="https://linkedin.com/company/…"
            />
          </Field>

          <Field label="Facebook" htmlFor="facebook" optional>
            <Input
              id="facebook"
              name="facebook"
              defaultValue={values.facebook}
              placeholder="https://facebook.com/…"
            />
          </Field>
        </div>
      </section>

      {/* -------------------------------------------------------- actions */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit">Save settings</Button>
        <Button href="/dashboard" variant="outline">
          Cancel
        </Button>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {saved
            ? "Nothing was saved — these values live in site.config.ts and there is no database yet."
            : "Nothing is saved yet — there is no database."}
        </p>
      </div>
    </form>
  );
}
