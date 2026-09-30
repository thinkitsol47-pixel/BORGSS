"use client";

import { useFormState } from "react-dom";
import { Alert, Button, Field, Input, Select } from "@/components/ui";
import { COUNTRIES } from "@/config/countries";
import {
  saveJournalIdentity,
  type SettingsState,
} from "@/app/(dashboard)/admin/settings/actions";

/**
 * The journal's identity.
 *
 * **Twelve fields save; nine are shown read-only.** The editable ones are the
 * facts a journal *acquires* — an ISSN when it is issued, a Crossref prefix
 * when membership starts, an office address once there is one — and an
 * administrator should not need a deploy to record any of them.
 *
 * The rest are decisions, not settings: the journal's name, its licence, its
 * access model. Changing one changes the journal rather than its
 * configuration, and belongs in a commit someone reviewed alongside the pages
 * that would have to change with it. They are rendered so this screen still
 * shows the whole identity, and disabled so it cannot imply otherwise.
 *
 * The three identifiers lead the form because they are what blocks a DOAJ
 * application, and the only reason to open this screen with intent.
 */

const initialState: SettingsState = { status: "idle" };
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
  const [state, formAction] = useFormState(saveJournalIdentity, initialState);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.status === "error" && state.message && (
        <Alert tone="danger" title="Could not save">
          {state.message}
        </Alert>
      )}
      {state.status === "success" && state.message && (
        <Alert tone="success" title="Saved">
          {state.message}
        </Alert>
      )}

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
            error={state.errors?.issn}
          >
            <Input
              id="issn"
              name="issn"
              defaultValue={v.issn ?? values.issn}
              placeholder="2789-1234"
            />
          </Field>

          <Field
            label="e-ISSN"
            htmlFor="eIssn"
            optional
            hint="The one that matters for an online-only journal, and for DOAJ."
            error={state.errors?.eIssn}
          >
            <Input
              id="eIssn"
              name="eIssn"
              defaultValue={v.eIssn ?? values.eIssn}
              placeholder="2789-5678"
            />
          </Field>

          <Field
            label="Crossref DOI prefix"
            htmlFor="doiPrefix"
            hint="No registry issues 10.xxxxx — that is the placeholder standing in for a real prefix."
            className="sm:col-span-2"
            error={state.errors?.doiPrefix}
          >
            <Input
              id="doiPrefix"
              name="doiPrefix"
              defaultValue={v.doiPrefix ?? values.doiPrefix}
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
              disabled
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
              disabled
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
              disabled
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
              disabled
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
              disabled
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
              disabled
              name="language"
              defaultValue={values.language}
            />
          </Field>

          <Field label="Access model" htmlFor="accessModel">
            <Select
              id="accessModel"
              disabled
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
          <Field label="Editorial office" htmlFor="editorialOffice"
            error={state.errors?.editorialOffice}>
            <Input
              id="editorialOffice"
              name="editorialOffice"
              type="email"
              defaultValue={v.editorialOffice ?? values.editorialOffice}
            />
          </Field>

          <Field label="Submissions" htmlFor="submissions"
            error={state.errors?.submissions}>
            <Input
              id="submissions"
              name="submissions"
              type="email"
              defaultValue={v.submissions ?? values.submissions}
            />
          </Field>

          <Field label="Support" htmlFor="support"
            error={state.errors?.support}>
            <Input
              id="support"
              name="support"
              type="email"
              defaultValue={v.support ?? values.support}
            />
          </Field>

          <Field label="Article charges" htmlFor="charges"
            error={state.errors?.charges}>
            <Input
              id="charges"
              name="charges"
              type="email"
              defaultValue={v.charges ?? values.charges}
            />
          </Field>

          <Field
            label="Postal address"
            htmlFor="address"
            hint="A literal [city] is still in this value."
            className="sm:col-span-2"
            error={state.errors?.address}
          >
            <Input id="address" name="address" defaultValue={v.address ?? values.address} />
          </Field>

          <Field label="Telephone" htmlFor="phone" optional
            error={state.errors?.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={v.phone ?? values.phone}
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
          <Field label="X" htmlFor="x" optional
            error={state.errors?.x}>
            <Input
              id="x"
              name="x"
              defaultValue={v.x ?? values.x}
              placeholder="https://x.com/…"
            />
          </Field>

          <Field label="LinkedIn" htmlFor="linkedin" optional
            error={state.errors?.linkedin}>
            <Input
              id="linkedin"
              name="linkedin"
              defaultValue={v.linkedin ?? values.linkedin}
              placeholder="https://linkedin.com/company/…"
            />
          </Field>

          <Field label="Facebook" htmlFor="facebook" optional
            error={state.errors?.facebook}>
            <Input
              id="facebook"
              name="facebook"
              defaultValue={v.facebook ?? values.facebook}
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
        <p className="text-xs text-muted-foreground">
          The identifiers, contact addresses and social links are saved. The
          greyed fields above are set in{" "}
          <code className="font-mono text-[0.95em]">src/config/site.config.ts</code>.
        </p>
      </div>
    </form>
  );
}
