/**
 * Single source of truth for journal identity.
 * Values that appear across the site (header, footer, metadata, JSON-LD).
 */
export const siteConfig = {
  name: "Blue Ocean Research Journal for Social Sciences",
  shortName: "BORJSS",
  tagline: "Advancing Research. Connecting Knowledge.",
  description:
    "A peer-reviewed scholarly journal dedicated to advancing research and knowledge in the Social Sciences.",
  // `??` only falls back on undefined, so an environment variable that exists
  // but is empty — which is what a blank field in a hosting dashboard
  // produces — would leave this as "". `new URL("")` then throws
  // ERR_INVALID_URL and takes the whole build down. Treat empty as unset.
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",

  publisher: "Blue Ocean Educational Services (Pvt.) Ltd.",
  countryOfPublication: "Pakistan",
  frequency: "Biannual (January–June, July–December)",
  language: "en",
  accessModel: "Open Access",

  // Display only once officially assigned — keep empty until then.
  issn: "",
  eIssn: "",

  // Same trap as `url` above: an empty value here would read as a real prefix
  // and stop `hasCrossrefPrefix()` reporting that the journal has none.
  doiPrefix: process.env.CROSSREF_DOI_PREFIX?.trim() || "10.xxxxx",

  /**
   * Contact addresses, shown across the public site and the portal.
   *
   * **These are the journal's real, working addresses — deliberately so.**
   * They used to read `editorial@blueoceanresearchjournal.org` and three
   * siblings on the same domain, written in anticipation of buying it. The
   * domain was never bought, so every one of those addresses bounced: the
   * Messages tab, the contact page, all seventeen policies and the author
   * guidelines each invited people to write to a mailbox that does not exist.
   * An address that bounces is worse than no address, because the sender
   * believes they have been in touch.
   *
   * **Keep them on this Gmail — the owner's decision (2026-10-01).** The
   * journal now owns `borjss.online`, and mail is *sent* from an address on it
   * (`EMAIL_FROM`), but that domain has no inbox. Every address a person might
   * write to or reply to stays here, so one mailbox the owner reads receives
   * everything. Do not "point these at the domain" without a real mailbox
   * behind it; that is exactly the bounce described above.
   */
  contact: {
    editorialOffice: "ceoborjss@gmail.com",
    submissions: "ceoborjss@gmail.com",
    support: "ceoborjss@gmail.com",
    charges: "ceoborjss@gmail.com",
    address: "Editorial Office, BORJSS, Pakistan",
    phone: "",
  },

  socials: {
    // fill when created
    x: "",
    linkedin: "",
    facebook: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
