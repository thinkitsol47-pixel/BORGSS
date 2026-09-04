import type { Article, Issue, BoardMember, Post } from "@/types";

/**
 * SCAFFOLD MOCK DATA — replace `src/lib/api/*` with real backend calls (tRPC).
 * Keeps the marketing pages renderable during frontend development.
 */

export const mockArticles: Article[] = [
  {
    id: "a1",
    slug: "financial-inclusion-sme-growth-pakistan",
    doi: "10.xxxxx/borjss.2026.1.1.001",
    type: "research",
    title:
      "Financial Inclusion and SME Growth: Evidence from Small Firms in Pakistan",
    abstract:
      "This study examines the relationship between access to formal financial services and the growth of small and medium enterprises. Using firm-level survey data, it finds a positive and significant association between account ownership, credit access, and employment growth.",
    keywords: ["financial inclusion", "SME", "development finance", "Pakistan"],
    contributors: [
      {
        id: "c1",
        givenName: "Ayesha",
        familyName: "Khan",
        orcid: "0000-0002-1825-0097",
        isCorresponding: true,
        affiliations: [
          { id: "af1", name: "Institute of Business Administration", city: "Karachi", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r1", raw: "Beck, T., & Demirgüç-Kunt, A. (2006). Small and medium-size enterprises. Journal of Banking & Finance, 30(11).", doi: "10.1016/j.jbankfin.2006.05.009" },
    ],
    galleys: [
      { id: "g1", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 480000 },
    ],
    volume: 1,
    issue: 1,
    pages: "1–24",
    receivedAt: "2026-01-15",
    acceptedAt: "2026-04-02",
    publishedAt: "2026-06-30",
    license: "CC BY 4.0",
    conflictOfInterest: "The author declares no competing interests.",
    ethicsStatement: "Approved by the institutional review board.",
    dataAvailability: "Data available from the author on reasonable request.",
    metrics: { views: 312, downloads: 88, citations: 1 },
  },
  {
    id: "a2",
    slug: "female-labour-force-participation-punjab",
    doi: "10.xxxxx/borjss.2026.1.1.002",
    type: "research",
    title:
      "Female Labour Force Participation and Household Bargaining Power in Rural Punjab",
    abstract:
      "Drawing on a household survey of 1,240 rural families, this paper examines how paid work outside the home shifts women's influence over spending, schooling and healthcare decisions. Participation is associated with measurable gains in decision-making authority, though the effect is attenuated where household income remains below the poverty line.",
    keywords: ["labour economics", "gender", "household bargaining", "rural development"],
    contributors: [
      {
        id: "c2",
        givenName: "Fatima",
        familyName: "Siddiqui",
        orcid: "0000-0001-5109-3700",
        isCorresponding: true,
        affiliations: [
          { id: "af2", name: "Lahore University of Management Sciences", city: "Lahore", country: "Pakistan" },
        ],
      },
      {
        id: "c3",
        givenName: "Imran",
        familyName: "Yousaf",
        affiliations: [
          { id: "af3", name: "Punjab Institute of Social Research", city: "Lahore", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r2", raw: "Duflo, E. (2012). Women empowerment and economic development. Journal of Economic Literature, 50(4), 1051–1079.", doi: "10.1257/jel.50.4.1051" },
      { id: "r3", raw: "Kabeer, N. (1999). Resources, agency, achievements. Development and Change, 30(3), 435–464." },
    ],
    galleys: [
      { id: "g2", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 512000 },
    ],
    volume: 1,
    issue: 1,
    pages: "25–52",
    receivedAt: "2026-01-28",
    acceptedAt: "2026-04-18",
    publishedAt: "2026-06-30",
    license: "CC BY 4.0",
    conflictOfInterest: "The authors declare no competing interests.",
    dataAvailability: "Survey data are archived with the Punjab Institute of Social Research.",
    metrics: { views: 486, downloads: 141, citations: 3 },
  },
  {
    id: "a3",
    slug: "digital-learning-outcomes-secondary-schools",
    doi: "10.xxxxx/borjss.2026.1.1.003",
    type: "review",
    title:
      "Digital Learning and Secondary School Outcomes: A Systematic Review of Evidence from South Asia",
    abstract:
      "This systematic review synthesises 68 studies published between 2010 and 2025 on technology-assisted instruction in South Asian secondary schools. Effects on measured learning are modest overall and vary sharply with teacher training, suggesting that hardware provision alone is a weak lever for attainment.",
    keywords: ["education policy", "systematic review", "educational technology", "South Asia"],
    contributors: [
      {
        id: "c4",
        givenName: "Nadia",
        familyName: "Rehman",
        orcid: "0000-0003-4832-1188",
        isCorresponding: true,
        affiliations: [
          { id: "af4", name: "Aga Khan University Institute for Educational Development", city: "Karachi", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r4", raw: "Escueta, M., et al. (2020). Upgrading education with technology. Journal of Economic Literature, 58(4), 897–996.", doi: "10.1257/jel.20191507" },
    ],
    galleys: [
      { id: "g3", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 604000 },
    ],
    volume: 1,
    issue: 1,
    pages: "53–89",
    receivedAt: "2026-02-05",
    acceptedAt: "2026-04-25",
    publishedAt: "2026-06-30",
    license: "CC BY 4.0",
    conflictOfInterest: "The author declares no competing interests.",
    metrics: { views: 731, downloads: 264, citations: 6 },
  },
  {
    id: "a4",
    slug: "urban-migration-informal-settlements-karachi",
    doi: "10.xxxxx/borjss.2026.1.1.004",
    type: "case-study",
    title:
      "Urban Migration and Informal Settlement Growth: A Case Study of Peri-Urban Karachi",
    abstract:
      "Through interviews with 92 recently arrived households, this case study traces how migrants secure housing, water and work in unplanned settlements on the city's edge, and how informal tenure arrangements shape their willingness to invest in their dwellings.",
    keywords: ["urban studies", "migration", "informal settlements", "housing"],
    contributors: [
      {
        id: "c5",
        givenName: "Bilal",
        familyName: "Ahmed",
        isCorresponding: true,
        affiliations: [
          { id: "af5", name: "NED University of Engineering and Technology", city: "Karachi", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r5", raw: "Hasan, A. (2015). Land contestation in Karachi. Environment and Urbanization, 27(1), 217–230." },
    ],
    galleys: [
      { id: "g4", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 448000 },
    ],
    volume: 1,
    issue: 1,
    pages: "90–118",
    receivedAt: "2026-02-11",
    acceptedAt: "2026-05-02",
    publishedAt: "2026-06-30",
    license: "CC BY 4.0",
    conflictOfInterest: "The author declares no competing interests.",
    metrics: { views: 254, downloads: 73 },
  },
  {
    id: "a5",
    slug: "social-capital-microfinance-repayment",
    doi: "10.xxxxx/borjss.2026.1.2.001",
    type: "research",
    title:
      "Social Capital and Repayment Discipline in Group Microfinance Lending",
    abstract:
      "Using repayment records from 214 borrowing groups, this study tests whether pre-existing social ties predict default. Groups formed from established community networks repay more reliably, but the advantage disappears once loan sizes exceed roughly twice median household income.",
    keywords: ["microfinance", "social capital", "development finance", "group lending"],
    contributors: [
      {
        id: "c6",
        givenName: "Sana",
        familyName: "Malik",
        orcid: "0000-0002-9981-4420",
        isCorresponding: true,
        affiliations: [
          { id: "af6", name: "Institute of Business Administration", city: "Karachi", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r6", raw: "Ghatak, M. (1999). Group lending, local information and peer selection. Journal of Development Economics, 60(1), 27–50." },
    ],
    galleys: [
      { id: "g5", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 496000 },
    ],
    volume: 1,
    issue: 2,
    pages: "1–29",
    receivedAt: "2026-07-09",
    acceptedAt: "2026-10-14",
    publishedAt: "2026-12-31",
    license: "CC BY 4.0",
    conflictOfInterest: "The author declares no competing interests.",
    metrics: { views: 168, downloads: 52 },
  },
  {
    id: "a6",
    slug: "climate-adaptation-smallholder-farmers",
    doi: "10.xxxxx/borjss.2026.1.2.002",
    type: "research",
    title:
      "Climate Adaptation Strategies Among Smallholder Farmers in Sindh",
    abstract:
      "This paper documents how smallholders adjust crop choice, planting dates and water use in response to shifting monsoon patterns. Adaptation is widespread but shallow: most measures are reversible and low-cost, and few farmers make the capital investments that would deliver durable resilience.",
    keywords: ["climate adaptation", "agriculture", "rural livelihoods", "Sindh"],
    contributors: [
      {
        id: "c7",
        givenName: "Hassan",
        familyName: "Shah",
        isCorresponding: true,
        affiliations: [
          { id: "af7", name: "Sindh Agriculture University", city: "Tandojam", country: "Pakistan" },
        ],
      },
      {
        id: "c8",
        givenName: "Maria",
        familyName: "Jamil",
        orcid: "0000-0001-7742-9903",
        affiliations: [
          { id: "af8", name: "University of Karachi", city: "Karachi", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r7", raw: "Di Falco, S., et al. (2011). Does adaptation to climate change provide food security? American Journal of Agricultural Economics, 93(3), 829–846." },
    ],
    galleys: [
      { id: "g6", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 538000 },
    ],
    volume: 1,
    issue: 2,
    pages: "30–61",
    receivedAt: "2026-07-22",
    acceptedAt: "2026-10-30",
    publishedAt: "2026-12-31",
    license: "CC BY 4.0",
    conflictOfInterest: "The authors declare no competing interests.",
    dataAvailability: "Interview transcripts are available on request, subject to anonymity safeguards.",
    metrics: { views: 203, downloads: 67, citations: 1 },
  },
  {
    id: "a7",
    slug: "measuring-research-impact-global-south",
    doi: "10.xxxxx/borjss.2026.1.2.003",
    type: "conceptual",
    title:
      "Beyond Citation Counts: Rethinking Research Impact in the Global South",
    abstract:
      "Conventional bibliometric measures reward publication in a narrow set of indexed journals and undervalue scholarship addressed to local policy audiences. This paper proposes an alternative framework for assessing impact that gives weight to practitioner uptake and to work published in regional languages.",
    keywords: ["research policy", "bibliometrics", "scholarly communication", "open access"],
    contributors: [
      {
        id: "c9",
        givenName: "Zainab",
        familyName: "Farooq",
        orcid: "0000-0003-2216-5507",
        isCorresponding: true,
        affiliations: [
          { id: "af9", name: "Quaid-i-Azam University", city: "Islamabad", country: "Pakistan" },
        ],
      },
    ],
    references: [
      { id: "r8", raw: "Hicks, D., et al. (2015). The Leiden Manifesto for research metrics. Nature, 520, 429–431.", doi: "10.1038/520429a" },
    ],
    galleys: [
      { id: "g7", label: "PDF", url: "#", mimeType: "application/pdf", sizeBytes: 412000 },
    ],
    volume: 1,
    issue: 2,
    pages: "62–84",
    receivedAt: "2026-08-03",
    acceptedAt: "2026-11-08",
    publishedAt: "2026-12-31",
    license: "CC BY 4.0",
    conflictOfInterest: "The author declares no competing interests.",
    metrics: { views: 397, downloads: 128, citations: 2 },
  },
];

export const mockIssues: Issue[] = [
  {
    id: "i2",
    slug: "v1i2",
    volume: 1,
    number: 2,
    year: 2026,
    title: "Institutions, Labour and Learning",
    publishedAt: "2026-12-31",
    articleIds: ["a5", "a6", "a7"],
  },
  {
    id: "i1",
    slug: "v1i1",
    volume: 1,
    number: 1,
    year: 2026,
    title: "Inaugural Issue",
    publishedAt: "2026-06-30",
    articleIds: ["a1", "a2", "a3", "a4"],
  },
];

export const mockBoard: BoardMember[] = [
  {
    id: "b1",
    name: "Dr. Mubashir Quddus",
    role: "Editor-in-Chief",
    institution: "Blue Ocean Educational Services (Pvt.) Ltd.",
    country: "Pakistan",
    category: "editor-in-chief",
  },
  {
    id: "b2",
    name: "Dr. Ayesha Khan",
    role: "Managing Editor",
    institution: "Institute of Business Administration, Karachi",
    country: "Pakistan",
    orcid: "0000-0002-1825-0097",
    category: "managing-editor",
  },
  {
    id: "b3",
    name: "Dr. Fatima Siddiqui",
    role: "Associate Editor — Economics & Development",
    institution: "Lahore University of Management Sciences",
    country: "Pakistan",
    orcid: "0000-0001-5109-3700",
    category: "associate-editor",
  },
  {
    id: "b4",
    name: "Dr. Nadia Rehman",
    role: "Associate Editor — Education & Policy",
    institution: "Aga Khan University, Karachi",
    country: "Pakistan",
    orcid: "0000-0003-4832-1188",
    category: "associate-editor",
  },
  {
    id: "b5",
    name: "Dr. Bilal Ahmed",
    role: "Section Editor — Urban & Regional Studies",
    institution: "NED University of Engineering and Technology",
    country: "Pakistan",
    category: "section-editor",
  },
  {
    id: "b6",
    name: "Dr. Zainab Farooq",
    role: "Section Editor — Research Policy",
    institution: "Quaid-i-Azam University, Islamabad",
    country: "Pakistan",
    orcid: "0000-0003-2216-5507",
    category: "section-editor",
  },
  {
    id: "b7",
    name: "Prof. Rashid Mahmood",
    role: "Advisory Board Member",
    institution: "University of Manchester",
    country: "United Kingdom",
    category: "advisory-board",
  },
  {
    id: "b8",
    name: "Prof. Meera Krishnan",
    role: "Advisory Board Member",
    institution: "Jawaharlal Nehru University",
    country: "India",
    category: "advisory-board",
  },
  {
    id: "b9",
    name: "Prof. Ahmed Al-Rashid",
    role: "Advisory Board Member",
    institution: "Qatar University",
    country: "Qatar",
    category: "advisory-board",
  },
  {
    id: "b10",
    name: "Dr. Sana Malik",
    role: "Editorial Board Member",
    institution: "Institute of Business Administration, Karachi",
    country: "Pakistan",
    orcid: "0000-0002-9981-4420",
    category: "editorial-board",
  },
  {
    id: "b11",
    name: "Dr. Hassan Shah",
    role: "Editorial Board Member",
    institution: "Sindh Agriculture University, Tandojam",
    country: "Pakistan",
    category: "editorial-board",
  },
  {
    id: "b12",
    name: "Dr. Maria Jamil",
    role: "Editorial Board Member",
    institution: "University of Karachi",
    country: "Pakistan",
    orcid: "0000-0001-7742-9903",
    category: "editorial-board",
  },
];

export const mockPosts: Post[] = [
  /* ------------------------------------------------------ announcements */
  {
    id: "p1",
    kind: "announcement",
    slug: "call-for-papers-volume-2",
    category: "call-for-papers",
    title: "Call for Papers — Volume 2, Issue 1 (2027)",
    summary:
      "Submissions are open for the first issue of Volume 2. We particularly welcome work on labour, education and climate adaptation in the Global South.",
    publishedAt: "2027-01-10",
    expiresAt: "2027-04-30",
    body: [
      "The Blue Ocean Research Journal for Social Sciences invites submissions for Volume 2, Issue 1, to be published in June 2027. We accept research articles, review articles, conceptual papers and case studies across the social sciences.",
      "While submissions on any topic within our scope are welcome, the editorial board has identified three areas where good work is under-represented in the regional literature: informal labour markets and worker protection; the measurement of learning outcomes beyond enrolment statistics; and household-level adaptation to climate variability.",
      "Manuscripts should be prepared according to the author guidelines and submitted through the online portal. There is no submission fee, and article processing charges are waived on request for authors without institutional funding.",
      "The deadline for consideration in this issue is 30 April 2027. Manuscripts received after that date will be considered for the following issue.",
    ],
    action: { label: "Start a submission", href: "/for-authors/how-to-submit" },
  },
  {
    id: "p2",
    kind: "announcement",
    slug: "ai-policy-adopted",
    category: "policy-update",
    title: "AI-assisted writing policy adopted",
    summary:
      "The journal has published a formal policy on the use of generative AI in manuscript preparation and peer review.",
    publishedAt: "2026-11-18",
    body: [
      "The editorial board has adopted a policy governing the use of generative artificial intelligence in work submitted to and reviewed for the journal. It takes effect immediately and applies to all manuscripts under consideration.",
      "In summary: AI tools may assist with language and readability, and such use must be disclosed. AI systems cannot be listed as authors, because authorship carries accountability that software cannot hold. Authors remain fully responsible for everything in their manuscript, including any text an AI tool helped produce.",
      "For reviewers the position is stricter. Manuscripts under review must never be entered into a generative AI service. Doing so uploads confidential unpublished work to a third party and is treated as a breach of confidentiality.",
    ],
    action: { label: "Read the AI policy", href: "/policies/ai-policy" },
  },
  {
    id: "p3",
    kind: "announcement",
    slug: "volume-1-issue-2-published",
    category: "issue-release",
    title: "Volume 1, Issue 2 is now published",
    summary:
      "Three peer-reviewed articles on microfinance, climate adaptation and research assessment are now available, open access.",
    publishedAt: "2026-12-31",
    body: [
      "The second issue of Volume 1 is now published and freely available. It carries three peer-reviewed articles: a study of social capital and repayment discipline in group microfinance lending; an examination of climate adaptation strategies among smallholder farmers in Sindh; and a conceptual paper rethinking how research impact is measured in the Global South.",
      "As with all our content, these articles are open access under a CC BY 4.0 licence, carry registered DOIs, and are free to read, download and share.",
    ],
    action: { label: "Read the issue", href: "/issues/current" },
  },

  /* --------------------------------------------------------------- news */
  {
    id: "p4",
    kind: "news",
    slug: "crossref-membership-confirmed",
    title: "Crossref membership confirmed",
    summary:
      "All published articles now carry registered DOIs, making them permanently citable and their citations trackable.",
    publishedAt: "2026-10-05",
    body: [
      "The journal has completed Crossref membership and begun depositing metadata for every published article. Each article now carries a registered digital object identifier, along with its full bibliographic metadata and reference list.",
      "In practical terms this means three things for authors. Citations to your work resolve permanently, regardless of any future change to this website's addresses. Your references are linked to their own DOIs where they exist. And citation counts for your article can be tracked by services that read Crossref data.",
      "DOIs have been assigned retrospectively to all articles in Volume 1, so nothing published before membership is disadvantaged.",
    ],
  },
  {
    id: "p5",
    kind: "news",
    slug: "editorial-board-expanded",
    title: "Editorial board expanded with international members",
    summary:
      "Three senior scholars from the United Kingdom, India and Qatar have joined the international advisory board.",
    publishedAt: "2026-09-14",
    body: [
      "The journal has appointed three additional members to its international advisory board, broadening the range of scholarly traditions represented in its editorial oversight.",
      "The advisory board does not handle individual manuscripts. Its role is to advise on the journal's scope, standards and long-term development, and to help ensure that editorial practice here matches international expectations.",
      "The full board, with institutions and countries, is listed on the editorial board page.",
    ],
    action: { label: "View the editorial board", href: "/about/editorial-board" },
  },
  {
    id: "p6",
    kind: "news",
    slug: "inaugural-issue-published",
    title: "Inaugural issue published",
    summary:
      "Volume 1, Issue 1 marks the launch of the journal, with four peer-reviewed articles across development finance, labour, education and urban studies.",
    publishedAt: "2026-06-30",
    body: [
      "The first issue of the Blue Ocean Research Journal for Social Sciences is now published. It carries four peer-reviewed research articles spanning financial inclusion and SME growth, female labour force participation, digital learning outcomes, and urban migration.",
      "Reaching this point took eighteen months: assembling an editorial board, adopting a full set of editorial policies modelled on COPE guidance, building the submission and review infrastructure, and putting the first manuscripts through double-blind review.",
      "Our thanks go to the authors who trusted a new journal with their work, and to the reviewers who gave their time without compensation. Submissions for future issues are open on a rolling basis.",
    ],
    action: { label: "Read the issue", href: "/issues/v1i1" },
  },

  /* ------------------------------------------------------------- events */
  {
    id: "p7",
    kind: "event",
    slug: "writing-for-publication-workshop-2027",
    title: "Workshop: Writing for Publication in the Social Sciences",
    summary:
      "A free half-day online workshop for early-career researchers on preparing a manuscript that survives desk check and peer review.",
    publishedAt: "2027-01-20",
    event: {
      startsAt: "2027-03-14T09:00:00+05:00",
      endsAt: "2027-03-14T13:00:00+05:00",
      location: "Online (Zoom)",
      online: true,
      registerUrl: "#",
      deadline: "2027-03-07",
    },
    body: [
      "The editorial office is running a free half-day workshop for postgraduate students and early-career researchers preparing their first journal submissions.",
      "The session covers what editors look for at desk check, how to structure a methods section that reviewers can assess, the most common reasons manuscripts are returned before review, and how to respond constructively to reviewer reports.",
      "The workshop is led by members of the editorial board and is open to researchers at any institution. Places are limited to keep discussion useful, and registration closes a week beforehand.",
    ],
  },
  {
    id: "p8",
    kind: "event",
    slug: "reviewer-training-session-2027",
    title: "Reviewer training session",
    summary:
      "An introduction to peer review for researchers joining our reviewer panel, covering assessment criteria and report writing.",
    publishedAt: "2027-02-02",
    event: {
      startsAt: "2027-04-18T14:00:00+05:00",
      endsAt: "2027-04-18T16:30:00+05:00",
      location: "Online (Zoom)",
      online: true,
      registerUrl: "#",
      deadline: "2027-04-11",
    },
    body: [
      "A practical session for researchers who have joined, or are considering joining, the journal's reviewer panel. No prior reviewing experience is assumed.",
      "We cover what a handling editor needs from a report, how to assess methodology outside your exact specialism, how to write criticism that authors can act on, and the ethical obligations that come with seeing unpublished work.",
      "Participants who complete the session are paired with an experienced reviewer for their first assignment.",
    ],
    action: { label: "Become a reviewer", href: "/for-reviewers/become-a-reviewer" },
  },
  {
    id: "p10",
    kind: "event",
    slug: "launch-seminar-2026",
    title: "Launch seminar: Open access publishing in Pakistan",
    summary:
      "A seminar marking the journal's launch, on the case for open-access scholarly publishing in the region.",
    publishedAt: "2026-05-02",
    event: {
      startsAt: "2026-06-25T10:00:00+05:00",
      endsAt: "2026-06-25T13:00:00+05:00",
      location: "Karachi, Pakistan",
    },
    body: [
      "Ahead of the inaugural issue, the editorial office held a seminar on the state of open-access publishing in Pakistan and the practical barriers facing researchers without institutional funding.",
      "Speakers from four universities discussed article processing charges, the weight given to indexed publications in faculty assessment, and what a credible regional journal would need to offer to be worth submitting to.",
      "Much of what was said in that room shaped the policies this journal adopted — in particular the commitment that no manuscript would be held back because an author could not pay.",
    ],
    action: { label: "Read the open access policy", href: "/policies/open-access" },
  },
  {
    id: "p9",
    kind: "event",
    slug: "social-sciences-colloquium-2026",
    title: "Blue Ocean Social Sciences Colloquium 2026",
    summary:
      "The inaugural colloquium brought together researchers from twelve institutions to discuss regional social-science scholarship.",
    publishedAt: "2026-08-01",
    event: {
      startsAt: "2026-11-22T09:00:00+05:00",
      endsAt: "2026-11-22T17:00:00+05:00",
      location: "Karachi, Pakistan",
    },
    body: [
      "The first Blue Ocean Social Sciences Colloquium was held in Karachi in November 2026, bringing together researchers from twelve institutions across Pakistan.",
      "Sessions covered the state of social-science publishing in the region, the practical barriers facing researchers without institutional funding, and how regional journals can meet international standards without simply importing them.",
      "Selected papers presented at the colloquium are being developed for submission to the journal. A second colloquium is planned for late 2027.",
    ],
  },
];
