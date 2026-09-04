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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  publisher: "Blue Ocean Educational Services (Pvt.) Ltd.",
  countryOfPublication: "Pakistan",
  frequency: "Biannual (January–June, July–December)",
  language: "en",
  accessModel: "Open Access",

  // Display only once officially assigned — keep empty until then.
  issn: "",
  eIssn: "",

  doiPrefix: process.env.CROSSREF_DOI_PREFIX ?? "10.xxxxx",

  contact: {
    editorialOffice: "editorial@blueoceanresearchjournal.org",
    submissions: "submissions@blueoceanresearchjournal.org",
    support: "support@blueoceanresearchjournal.org",
    charges: "apc@blueoceanresearchjournal.org",
    address: "Editorial Office, BORJSS, [city], Pakistan",
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
