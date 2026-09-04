import { z } from "zod";

/** Shared Zod schemas — reuse on both client forms and the backend. */

/* ------------------------------------------------------------------ orcid *
 * Shared by the schemas below and by `OrcidField`, the same way
 * `passwordStrength` is shared — so the live indicator in the form and the
 * rule that actually rejects can never disagree.                            */

/**
 * ORCID check digit — ISO/IEC 7064 MOD 11-2 over the first 15 digits.
 * The shape regex alone accepts a transposed pair or a mistyped last digit;
 * this catches both, which matters because a wrong ORCID is only discovered
 * much later, when Crossref rejects the deposit.
 */
export function isValidOrcid(value: string): boolean {
  const chars = value.replace(/-/g, "").toUpperCase();
  if (!/^\d{15}[\dX]$/.test(chars)) return false;

  let total = 0;
  for (let i = 0; i < 15; i++) {
    total = (total + Number(chars[i])) * 2;
  }
  const expected = (12 - (total % 11)) % 11;
  const actual = chars[15] === "X" ? 10 : Number(chars[15]);
  return expected === actual;
}

/** Shape + check digit. Reused everywhere an ORCID is accepted. */
export const orcidSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
    "ORCID must look like 0000-0002-1825-0097",
  )
  .refine(isValidOrcid, "That ORCID iD's check digit is wrong — please re-check it.");


export const contributorSchema = z.object({
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  email: z.string().email().optional(),
  orcid: orcidSchema.optional(),
  affiliation: z.string().min(1),
  isCorresponding: z.boolean().default(false),
});

export const submissionMetadataSchema = z.object({
  title: z.string().min(10),
  abstract: z.string().min(100).max(3500),
  keywords: z.array(z.string()).min(3).max(8),
  articleType: z.enum([
    "research",
    "review",
    "case-study",
    "conceptual",
    "editorial",
    "book-review",
  ]),
  sectionId: z.string(),
  funding: z.string().optional(),
  conflictOfInterest: z.string().optional(),
});

export const declarationsSchema = z.object({
  originalWork: z.literal(true),
  notUnderReviewElsewhere: z.literal(true),
  ethicalCompliance: z.literal(true),
  allAuthorsApprove: z.literal(true),
  agreeCopyright: z.literal(true),
});

/* ------------------------------------------------------------------ auth *
 * Step 11. Forms and validation only — there is no auth backend, so the
 * Server Actions using these validate and return without authenticating.
 * Password rules live in one place so register and reset stay in step.      */

/** Minimum length. Length beats character-class rules for real-world strength. */
export const PASSWORD_MIN = 10;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(200, "That password is too long.");

/**
 * Scores a password 0–4 for the strength meter. Deliberately simple and
 * shared by the form and the schema so the meter cannot disagree with
 * validation. Length carries the most weight.
 */
export function passwordStrength(value: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  if (!value) return { score: 0, label: "Enter a password" };

  let score = 0;
  if (value.length >= PASSWORD_MIN) score++;
  if (value.length >= 14) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) || /[^\w\s]/.test(value)) score++;

  // A long passphrase should not be marked weak for lacking a digit.
  if (value.length >= 20) score = Math.max(score, 3);

  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"] as const;
  const s = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  return { score: s, label: labels[s] };
}

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Please enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.union([z.literal("on"), z.literal("")]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const REGISTER_ROLES = ["author", "reviewer", "both"] as const;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Please enter a valid email address."),
    institution: z
      .string()
      .trim()
      .min(2, "Please name your institution or organisation."),
    country: z.string().trim().min(2, "Please enter your country."),
    orcid: orcidSchema.optional().or(z.literal("")),
    intendedRole: z.enum(REGISTER_ROLES, {
      errorMap: () => ({ message: "Tell us how you expect to use the journal." }),
    }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    agreeTerms: z.literal("on", {
      errorMap: () => ({
        message: "Please confirm you accept the privacy and ethics policies.",
      }),
    }),
    website: z.string().max(0).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Please enter a valid email address."),
  website: z.string().max(0).optional(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is missing its token."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const CONTACT_TOPICS = [
  "submission",
  "review",
  "editorial",
  "technical",
  "charges",
  "permissions",
  "other",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  affiliation: z.string().trim().optional(),
  topic: z.enum(CONTACT_TOPICS, {
    errorMap: () => ({ message: "Please choose a subject." }),
  }),
  manuscriptId: z.string().trim().optional(),
  message: z
    .string()
    .trim()
    .min(20, "Please give us a little more detail (at least 20 characters).")
    .max(4000, "Please keep your message under 4,000 characters."),
  /**
   * Honeypot: a field hidden from people but filled in by naive bots. Any
   * value here means the submission is discarded.
   */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const REVIEWER_SUBJECTS = [
  "Economics & Development",
  "Sociology & Anthropology",
  "Political Science & Governance",
  "Education",
  "Public Administration",
  "Psychology & Behavioural Science",
  "Media & Communication",
  "Gender & Development",
  "Urban & Regional Studies",
  "Environment & Society",
] as const;

export const REVIEWER_METHODS = [
  "Quantitative / econometric",
  "Qualitative / ethnographic",
  "Mixed methods",
  "Survey design",
  "Systematic review",
  "Case study",
] as const;

export const reviewerApplicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  institution: z
    .string()
    .trim()
    .min(2, "Please name your institution or organisation."),
  position: z.string().trim().min(2, "Please state your current position."),
  country: z.string().trim().min(2, "Please enter your country."),
  degree: z.enum(["phd", "doctoral-candidate", "masters", "other"], {
    errorMap: () => ({ message: "Please select your highest qualification." }),
  }),
  orcid: orcidSchema.optional().or(z.literal("")),
  scholarUrl: z
    .string()
    .trim()
    .url("Please enter a full URL, including https://")
    .optional()
    .or(z.literal("")),
  /**
   * Checkbox groups arrive from FormData as repeated keys; the page collects
   * them with getAll() and passes an array.
   */
  subjects: z
    .array(z.enum(REVIEWER_SUBJECTS))
    .min(1, "Choose at least one subject area.")
    .max(5, "Please choose no more than five, so we match you accurately."),
  methods: z.array(z.enum(REVIEWER_METHODS)).default([]),
  keywords: z
    .string()
    .trim()
    .min(3, "List a few specific topics you can review.")
    .max(300),
  experience: z
    .string()
    .trim()
    .max(1500, "Please keep this under 1,500 characters.")
    .optional(),
  capacity: z.enum(["1-2", "3-4", "5-6", "more"], {
    errorMap: () => ({ message: "Please tell us your reviewing capacity." }),
  }),
  agreeEthics: z.literal("on", {
    errorMap: () => ({
      message: "You must agree to the reviewer ethics policy.",
    }),
  }),
  website: z.string().max(0).optional(),
});

export type ReviewerApplicationInput = z.infer<typeof reviewerApplicationSchema>;

/* ------------------------------------------------------ submission wizard *
 * Step 1 of the wizard. `submissionMetadataSchema` above covers the metadata
 * step; this is the narrower set the first screen collects, kept separate so
 * each step can validate on its own without demanding fields the author has
 * not reached yet.                                                          */

export const ARTICLE_TYPES = [
  {
    value: "research",
    label: "Research article",
    hint: "Original empirical work with data and analysis.",
  },
  {
    value: "review",
    label: "Review article",
    hint: "A synthesis of existing literature on a defined question.",
  },
  {
    value: "case-study",
    label: "Case study",
    hint: "In-depth examination of a single case or small set of cases.",
  },
  {
    value: "conceptual",
    label: "Conceptual / theoretical paper",
    hint: "Advances theory or a framework without new empirical data.",
  },
  {
    value: "book-review",
    label: "Book review",
    hint: "A critical review of a recent scholarly book.",
  },
] as const;

export const submissionStartSchema = z.object({
  articleType: z.enum(
    ARTICLE_TYPES.map((t) => t.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Choose the type of article." }) },
  ),
  section: z
    .string()
    .trim()
    .min(1, "Choose the section your manuscript belongs to."),
  title: z
    .string()
    .trim()
    .min(10, "Please give the full working title (at least 10 characters).")
    .max(300, "Titles are limited to 300 characters."),
  /**
   * Asked here rather than at the declarations step because a "yes" means the
   * submission cannot proceed at all — better to find out on screen one.
   */
  underReviewElsewhere: z.literal("no", {
    errorMap: () => ({
      message:
        "A manuscript under consideration elsewhere cannot be submitted. See the publication ethics policy.",
    }),
  }),
  confirmAnonymised: z.literal("on", {
    errorMap: () => ({
      message: "Please confirm the manuscript file carries no author names.",
    }),
  }),
});

export type SubmissionStartInput = z.infer<typeof submissionStartSchema>;

/* ------------------------------------------------------------- review form *
 * Phase 14. The reviewer's report.                                          */

export const REVIEW_CRITERIA = [
  {
    id: "originality",
    label: "Originality",
    hint: "Does it add something not already established in the literature?",
  },
  {
    id: "methodology",
    label: "Methodology",
    hint: "Are the methods appropriate, and applied and reported soundly?",
  },
  {
    id: "literature",
    label: "Engagement with literature",
    hint: "Is relevant prior work cited and fairly represented?",
  },
  {
    id: "argument",
    label: "Argument and evidence",
    hint: "Do the conclusions follow from what is actually shown?",
  },
  {
    id: "significance",
    label: "Significance",
    hint: "Does it matter to the field, to policy, or to practice?",
  },
  {
    id: "presentation",
    label: "Presentation",
    hint: "Structure, clarity, tables and figures, English.",
  },
] as const;

export const REVIEW_SCALE = [
  { value: "1", label: "1", hint: "Poor" },
  { value: "2", label: "2", hint: "Weak" },
  { value: "3", label: "3", hint: "Adequate" },
  { value: "4", label: "4", hint: "Good" },
  { value: "5", label: "5", hint: "Excellent" },
] as const;

export const REVIEW_RECOMMENDATIONS = [
  {
    value: "accept",
    label: "Accept as it stands",
    hint: "Publishable without changes. Rare on a first submission.",
  },
  {
    value: "minor-revision",
    label: "Accept after minor revision",
    hint: "Sound work needing small corrections. Would not need re-review.",
  },
  {
    value: "major-revision",
    label: "Major revision required",
    hint: "Substantial work needed, but the paper is worth pursuing. Normally returns to you.",
  },
  {
    value: "reject",
    label: "Reject",
    hint: "The problems cannot be fixed by revision, or the work is out of scope.",
  },
] as const;

const scoreField = z
  .enum(["1", "2", "3", "4", "5"], {
    errorMap: () => ({ message: "Please score this criterion." }),
  });

export const reviewFormSchema = z.object({
  originality: scoreField,
  methodology: scoreField,
  literature: scoreField,
  argument: scoreField,
  significance: scoreField,
  presentation: scoreField,
  recommendation: z.enum(
    REVIEW_RECOMMENDATIONS.map((r) => r.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Please give an overall recommendation." }) },
  ),
  /**
   * The substance of the review. The floor is deliberately high: a two-line
   * report helps neither the author nor the editor, and the reviewer ethics
   * policy asks for specific, actionable comments.
   */
  commentsToAuthor: z
    .string()
    .trim()
    .min(
      200,
      "Please give the author enough to act on — at least a few specific paragraphs.",
    )
    .max(20_000, "That is longer than the form accepts."),
  commentsToEditor: z
    .string()
    .trim()
    .max(10_000, "That is longer than the form accepts.")
    .optional()
    .or(z.literal("")),
  concernsRaised: z
    .string()
    .trim()
    .max(4_000)
    .optional()
    .or(z.literal("")),
  /** The reviewer confirms they have no competing interest. */
  confirmNoConflict: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm you have no competing interest, or contact the editor instead.",
    }),
  }),
  /** Reviewer ethics policy forbids running the manuscript through an AI tool. */
  confirmNoAi: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm the manuscript was not uploaded to a generative AI tool.",
    }),
  }),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;

/* ------------------------------------------------------------------ profile *
 * Phase 14. The account's own details, and how it is contacted.              */

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Please enter a valid email address."),
  institution: z
    .string()
    .trim()
    .min(2, "Please name your institution or organisation."),
  department: z.string().trim().max(200).optional().or(z.literal("")),
  position: z.string().trim().max(200).optional().or(z.literal("")),
  country: z.string().trim().min(2, "Please enter your country."),
  /** Shown to editors choosing reviewers; never shown to authors. */
  bio: z
    .string()
    .trim()
    .max(1500, "Please keep this under 1,500 characters.")
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const orcidLinkSchema = z.object({
  orcid: orcidSchema.optional().or(z.literal("")),
});

/**
 * Notification preferences.
 *
 * Every field is optional because an unchecked checkbox sends nothing at all;
 * absence means off. Some notifications have no switch and are not listed
 * here — a decision letter and a reviewer invitation are sent regardless,
 * because an account that can silence them is an account that misses its own
 * deadlines.
 */
export const notificationsSchema = z.object({
  submissionStatus: z.literal("on").optional(),
  reviewReminders: z.literal("on").optional(),
  newInvitations: z.literal("on").optional(),
  editorialMessages: z.literal("on").optional(),
  issuePublished: z.literal("on").optional(),
  journalNews: z.literal("on").optional(),
});

export type NotificationsInput = z.infer<typeof notificationsSchema>;

/* --------------------------------------------------- wizard steps 2 – 5 *
 * Phase 15. Each step validates only its own fields, so the author is never
 * asked for something they have not reached — and so a step can be revisited
 * and re-checked on its own.                                              */

export const MANUSCRIPT_FILE_TYPES = ".doc,.docx,.rtf,.odt,.pdf";
export const SUPPLEMENTARY_FILE_TYPES =
  ".doc,.docx,.pdf,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.tif,.tiff,.zip";

/** 20 MB, matching what the editorial office accepts by email today. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

/**
 * Step 2 — files.
 *
 * Only the two required files are validated here; figures and supplementary
 * material are optional and unlimited in number, so they are not named.
 * A real upload posts multipart data and is checked server-side; these fields
 * record that a file was chosen.
 */
export const submissionFilesSchema = z.object({
  manuscriptName: z
    .string()
    .trim()
    .min(1, "Attach the anonymised manuscript."),
  titlePageName: z
    .string()
    .trim()
    .min(1, "Attach the title page as a separate file."),
  coverLetter: z.string().trim().max(8000).optional().or(z.literal("")),
});

/**
 * Step 3 — metadata.
 *
 * Deliberately stricter than `submissionMetadataSchema` above, which is the
 * shape a stored submission has. This one carries the messages an author
 * reads while typing.
 */
export const ABSTRACT_MIN = 150;
export const ABSTRACT_MAX = 3500;
export const KEYWORDS_MIN = 3;
export const KEYWORDS_MAX = 8;

export const wizardMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Please give the full title.")
    .max(300, "Titles are limited to 300 characters."),
  abstract: z
    .string()
    .trim()
    .min(
      ABSTRACT_MIN,
      `An abstract needs at least ${ABSTRACT_MIN} characters — state the question, the method, and what you found.`,
    )
    .max(ABSTRACT_MAX, `Please keep the abstract under ${ABSTRACT_MAX} characters.`),
  keywords: z
    .string()
    .trim()
    .min(1, "Enter at least three keywords, separated by commas.")
    .refine(
      (v) => splitKeywords(v).length >= KEYWORDS_MIN,
      `Enter at least ${KEYWORDS_MIN} keywords, separated by commas.`,
    )
    .refine(
      (v) => splitKeywords(v).length <= KEYWORDS_MAX,
      `Please use no more than ${KEYWORDS_MAX} keywords.`,
    ),
  funding: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Free text rather than a yes/no: "none" is itself a declaration. */
  conflictOfInterest: z
    .string()
    .trim()
    .min(
      1,
      "State any competing interest, or write 'None' — the field cannot be left blank.",
    )
    .max(2000),
});

/** Splits a comma-separated keyword field, dropping blanks. */
export function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * Step 4 — one contributor row.
 *
 * The wizard posts an indexed set of these (`givenName-0`, `givenName-1`, …),
 * so the page validates each row itself rather than through a single schema.
 */
export const wizardContributorSchema = z.object({
  givenName: z.string().trim().min(1, "Given name is required."),
  familyName: z.string().trim().min(1, "Family name is required."),
  email: z
    .string()
    .trim()
    .min(1, "An email address is required for every author.")
    .email("Please enter a valid email address."),
  affiliation: z
    .string()
    .trim()
    .min(2, "Please give the institution for this author."),
  orcid: orcidSchema.optional().or(z.literal("")),
});

/**
 * Step 5 — declarations.
 *
 * Every one of these is a statement the corresponding author makes on behalf
 * of all authors, and each maps to a published policy. They are separate
 * checkboxes rather than one "I agree to everything" because a single tick
 * over five distinct claims is not a meaningful declaration.
 */
export const wizardDeclarationsSchema = z.object({
  originalWork: z.literal("on", {
    errorMap: () => ({
      message: "Please confirm the work is original and properly attributed.",
    }),
  }),
  notUnderReviewElsewhere: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm the manuscript is not under consideration elsewhere.",
    }),
  }),
  ethicalCompliance: z.literal("on", {
    errorMap: () => ({
      message: "Please confirm the research ethics requirements were met.",
    }),
  }),
  allAuthorsApprove: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm every listed author has seen and approved this submission.",
    }),
  }),
  agreeCopyright: z.literal("on", {
    errorMap: () => ({
      message: "Please confirm you accept the licence and copyright terms.",
    }),
  }),
  /** Disclosure, not permission — AI use is allowed if declared. */
  aiDisclosure: z
    .string()
    .trim()
    .min(
      1,
      "State how generative AI was used, or write 'None' — the field cannot be left blank.",
    )
    .max(2000),
  dataAvailability: z
    .string()
    .trim()
    .min(1, "A data availability statement is required.")
    .max(2000),
});

/**
 * Wizard step 6 — the final check and submit.
 *
 * Only two confirmations, deliberately. Everything factual was asked and
 * validated on steps 1–5; repeating it here would invite the author to tick
 * past a summary they have stopped reading. What this step adds is what only
 * the final screen can ask: that the author has checked the summary, and that
 * they understand what happens next.
 */
export const wizardSubmitSchema = z.object({
  confirmAccurate: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm the summary above is accurate before submitting.",
    }),
  }),
  confirmUnderstands: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm you understand the manuscript goes to the editorial office.",
    }),
  }),
  /** Optional throughout — most submissions need to say nothing here. */
  editorNote: z.string().trim().max(2000).optional(),
});

/* ------------------------------------------------------- editorial decision *
 * Phase 17. The editor's verdict and the letter that carries it.             */

/**
 * The five decisions, with what each one commits the journal to.
 *
 * Held here rather than in the page because two screens render them — the
 * decision form and the queue's status filter — and a decision described
 * differently in two places is a decision the editor cannot be sure of.
 */
export const DECISION_TYPES = [
  {
    value: "accept",
    label: "Accept",
    hint: "Publishable as it stands. The manuscript moves to production.",
  },
  {
    value: "minor-revision",
    label: "Minor revision",
    hint: "Small corrections, checked by you rather than returned to reviewers.",
  },
  {
    value: "major-revision",
    label: "Major revision",
    hint: "Substantial work needed. Normally goes back to the same reviewers.",
  },
  {
    value: "reject",
    label: "Reject",
    hint: "Declined after review. The reviewers' comments go with the letter.",
  },
  {
    value: "desk-reject",
    label: "Desk reject",
    hint: "Declined without review — out of scope, or fails a formal check. Only before reviewers are involved.",
  },
] as const;

/**
 * Recording a decision.
 *
 * The letter has a floor because a decision letter is the only thing most
 * authors ever receive from the journal, and a one-line rejection is the
 * complaint the appeals policy spends a page on. The floor is lower than the
 * review form's 200 characters: an acceptance can legitimately be short, where
 * a review cannot.
 */
export const decisionSchema = z.object({
  decision: z.enum(
    DECISION_TYPES.map((d) => d.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Please choose a decision." }) },
  ),
  letter: z
    .string()
    .trim()
    .min(
      120,
      "Please give the author the reasoning behind this decision, not just the outcome.",
    )
    .max(20_000, "That is longer than the form accepts."),
  /** Internal; never sent to the author. */
  internalNote: z.string().trim().max(4_000).optional().or(z.literal("")),
  /**
   * Whether the reviewers' comments-to-author go out with the letter.
   * Optional, because an unchecked box sends nothing; the form defaults it on
   * and the screen says what unchecking means.
   */
  includeReports: z.literal("on").optional(),
  /**
   * The editor confirms they have read the reports. This is not ceremony: the
   * decision screen's whole purpose is to stop a decision being taken while a
   * reviewer's report is still outstanding.
   */
  confirmRead: z.literal("on", {
    errorMap: () => ({
      message:
        "Please confirm you have read the reports available for this round.",
    }),
  }),
});

export type DecisionInput = z.infer<typeof decisionSchema>;
