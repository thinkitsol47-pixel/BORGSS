import type { DoiRecord, EditorialIssue } from "@/types";

/**
 * SCAFFOLD MOCK DATA — issues as the editorial side sees them.
 *
 * `mockIssues` in `mock-data.ts` is the public archive: two published issues
 * with settled article lists. These are the same two plus the one being
 * assembled, which the public archive cannot show because it does not exist
 * yet. The published pair carry the same volume/number/year as their public
 * counterparts and link to them by `slug`, so the editorial screen can send an
 * editor to the live page rather than describing it.
 *
 * `s5` is the one submission in `mock-submissions.ts` sitting at
 * `in-production`; it is placed in the planned issue so that screen has a real
 * row rather than an invented one. The planned issue is deliberately far from
 * full — five articles planned, one placed — because an issue in preparation
 * normally is, and the screen has to read well in that state.
 */

export const mockEditorialIssues: EditorialIssue[] = [
  /* ---------------------------------------------- being assembled now */
  {
    id: "ei3",
    volume: 2,
    number: 1,
    year: 2027,
    title: "Credit, Care and Communication",
    state: "planned",
    targetDate: "2027-06-30",
    plannedArticles: 5,
    items: [{ submissionId: "s5", position: 1 }],
  },

  /* --------------------------------------------------------- published */
  {
    id: "ei2",
    volume: 1,
    number: 2,
    year: 2026,
    title: "Institutions, Labour and Learning",
    state: "published",
    targetDate: "2026-12-31",
    publishedAt: "2026-12-31",
    slug: "v1i2",
    items: [],
  },
  {
    id: "ei1",
    volume: 1,
    number: 1,
    year: 2026,
    title: "Inaugural Issue",
    state: "published",
    targetDate: "2026-06-30",
    publishedAt: "2026-06-30",
    slug: "v1i1",
    items: [],
  },
];

/**
 * SCAFFOLD MOCK DATA — the Crossref deposit log.
 *
 * Every DOI here begins `10.xxxxx`, matching `mock-data.ts`, because **the
 * journal has not been assigned a Crossref prefix**. That is not a placeholder
 * to be tidied away — it is the true state, and the DOI screen says so on
 * screen rather than showing a register of DOIs that would not resolve.
 *
 * The seven rows are the seven published articles, and every one is
 * `not-deposited`. Inventing a mix of registered and failed deposits was
 * considered and rejected: an editor reading "Registered" beside an article
 * would believe its DOI resolves, and it does not. The other three states
 * exist in `DepositState` for when the register is real; the screen renders
 * all four, but the data does not claim any of them yet.
 */

export const mockDoiRecords: DoiRecord[] = [
  {
    id: "doi1",
    doi: "10.xxxxx/borjss.2026.1.1.001",
    articleId: "a1",
    articleSlug: "financial-inclusion-sme-growth-pakistan",
    articleTitle:
      "Financial Inclusion and SME Growth in Pakistan: Evidence from Firm-Level Data",
    issueLabel: "Vol. 1, No. 1 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
  {
    id: "doi2",
    doi: "10.xxxxx/borjss.2026.1.1.002",
    articleId: "a2",
    articleSlug: "female-labour-force-participation-punjab",
    articleTitle:
      "Female Labour Force Participation in Punjab: Barriers and Determinants",
    issueLabel: "Vol. 1, No. 1 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
  {
    id: "doi3",
    doi: "10.xxxxx/borjss.2026.1.1.003",
    articleId: "a3",
    articleSlug: "digital-learning-outcomes-secondary-schools",
    articleTitle:
      "Digital Learning and Outcomes in Secondary Schools: A Quasi-Experimental Study",
    issueLabel: "Vol. 1, No. 1 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
  {
    id: "doi4",
    doi: "10.xxxxx/borjss.2026.1.1.004",
    articleId: "a4",
    articleSlug: "urban-migration-informal-settlements-karachi",
    articleTitle:
      "Urban Migration and Informal Settlements in Karachi",
    issueLabel: "Vol. 1, No. 1 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
  {
    id: "doi5",
    doi: "10.xxxxx/borjss.2026.1.2.001",
    articleId: "a5",
    articleSlug: "social-capital-microfinance-repayment",
    articleTitle: "Social Capital and Microfinance Repayment",
    issueLabel: "Vol. 1, No. 2 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
  {
    id: "doi6",
    doi: "10.xxxxx/borjss.2026.1.2.002",
    articleId: "a6",
    articleSlug: "climate-adaptation-smallholder-farmers",
    articleTitle: "Climate Adaptation Among Smallholder Farmers",
    issueLabel: "Vol. 1, No. 2 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
  {
    id: "doi7",
    doi: "10.xxxxx/borjss.2026.1.2.003",
    articleId: "a7",
    articleSlug: "measuring-research-impact-global-south",
    articleTitle: "Measuring Research Impact in the Global South",
    issueLabel: "Vol. 1, No. 2 (2026)",
    state: "not-deposited",
    attempts: 0,
  },
];
