import { z } from "zod";
import { ROLES } from "@/config/roles";

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
 * Uploading a revision.
 *
 * The **round is deliberately absent**: it is `Submission.round`, read on the
 * server. A client that could name its own round could file a revision against
 * a round the editor has already closed, or overwrite round 1 from a stale tab.
 *
 * The files themselves are not validated here — a `File` is not a string — so
 * the bytes are checked in the action against `MAX_FILE_BYTES`. What this
 * covers is the text: which submission, and the covering note.
 *
 * The response to reviewers is **required**, unlike the cover letter on a new
 * submission. A revision with no point-by-point reply is the single most common
 * reason an editor sends one straight back, and asking for it here costs the
 * author less than a round trip.
 */
export const revisionUploadSchema = z.object({
  submissionId: z.string().uuid("That manuscript link is not valid."),
  responseToReviewers: z
    .string()
    .trim()
    .min(
      100,
      "Please describe how you responded to the reviewers — at least a short paragraph.",
    )
    .max(20_000, "This is longer than 20,000 characters."),
});

/* ------------------------------------------------------------ production *
 * Phase 4/5. The stage, galley and correction writes behind `/production/*`. */

/** Who raised a proof correction. Matches the `CorrectionRaisedBy` enum. */
export const CORRECTION_RAISED_BY = [
  "author",
  "proofreader",
  "copyeditor",
] as const;

/**
 * Adding a proof correction.
 *
 * `location` and `description` are separate fields, not one string — they are
 * separate columns as of `20260914120000_proof_correction_fields`, for exactly
 * the reason a form makes obvious: a description containing ": " would
 * round-trip wrong through the packed format they used to share.
 */
export const correctionAddSchema = z.object({
  submissionId: z.string().uuid("That manuscript link is not valid."),
  location: z
    .string()
    .trim()
    .min(1, "Say where in the galley — a page, a table, or a figure.")
    .max(200, "Keep the location short — a page or element reference."),
  description: z
    .string()
    .trim()
    .min(5, "Say what needs changing.")
    .max(4_000, "This is longer than 4,000 characters."),
  raisedBy: z.enum(CORRECTION_RAISED_BY, {
    errorMap: () => ({ message: "Say who raised this." }),
  }),
});

/**
 * Declining a correction.
 *
 * The reason is **required and has a floor**, deliberately. A refusal with no
 * stated reason is the one an author appeals, and asking for it afterwards
 * means it never gets written — so the form will not submit without it.
 */
export const correctionDeclineSchema = z.object({
  submissionId: z.string().uuid("That manuscript link is not valid."),
  correctionId: z.string().uuid("That correction link is not valid."),
  reason: z
    .string()
    .trim()
    .min(
      20,
      "Give the author a real reason — this is what they see if they query it.",
    )
    .max(2_000, "This is longer than 2,000 characters."),
});

/** What a typesetter can hand over. EPUB is not produced by this journal. */
export const GALLEY_FILE_TYPES = ".pdf,.xml,.html,.htm,.epub";

/**
 * Uploading a galley.
 *
 * The **version is deliberately absent**: it is derived server-side as one
 * higher than the highest existing version, under the `@@unique([jobId,
 * format, version])` constraint. Accepting it from the form is how two files
 * end up claiming to be version 2.
 *
 * `file` is not validated here either — a `File` is not a string, so the bytes
 * are checked in the action against `MAX_FILE_BYTES`. This schema covers the
 * text fields that decide *where the row goes*.
 */
export const galleyUploadSchema = z.object({
  submissionId: z.string().uuid("That manuscript link is not valid."),
  format: z.enum(["pdf", "xml", "html", "epub"], {
    errorMap: () => ({ message: "Choose a galley format." }),
  }),
});

/**
 * Assigning a production stage.
 *
 * The assignee is an account id, not a typed name: a stage held by a person
 * who has no account is a stage nobody can open. The action re-checks that the
 * id belongs to someone who actually does production work.
 */
export const stageAssignSchema = z.object({
  submissionId: z.string().uuid("That manuscript link is not valid."),
  stage: z.enum(["copyedit", "galleys", "proofread"], {
    errorMap: () => ({ message: "Unknown production stage." }),
  }),
  assignedToId: z.string().uuid("Choose someone from the production team."),
  /** Optional throughout: a stage with no deadline is normal, not an error. */
  dueAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), {
      message: "That is not a date.",
    }),
});

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

/* ------------------------------------------------------------ posts *
 * Phase 4. Announcements, news and events — one shape and one form for
 * all three, because `Post` is one type and three near-identical forms
 * would drift apart the first time one of them was edited.             */

export const POST_KINDS = ["announcement", "news", "event"] as const;

export const POST_CATEGORIES = [
  "call-for-papers",
  "policy-update",
  "issue-release",
  "general",
] as const;

/**
 * A slug is the post's public URL, so it is validated rather than generated:
 * an editor who can see and edit it can keep a link stable when a title is
 * reworded, which is the whole reason a slug is a separate field.
 */
const slugField = z
  .string()
  .trim()
  .min(3, "The web address needs at least three characters.")
  .max(120, "That web address is too long.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lower-case letters, numbers and single hyphens — no spaces or punctuation.",
  );

/** An empty date field posts "", which is not a date and must not become one. */
const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date.")
  .optional()
  .or(z.literal(""));

export const postSchema = z
  .object({
    kind: z.enum(POST_KINDS, {
      errorMap: () => ({ message: "Choose which list this appears on." }),
    }),
    slug: slugField,
    title: z
      .string()
      .trim()
      .min(4, "Please give the post a title.")
      .max(200, "Titles are limited to 200 characters."),
    summary: z
      .string()
      .trim()
      .min(20, "A one-sentence summary is what the listing shows — please write one.")
      .max(400, "Please keep the summary under 400 characters."),
    body: z
      .string()
      .trim()
      .min(40, "Please write the post itself, not just a summary.")
      .max(20_000, "That is longer than the form accepts."),
    publishedAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a publication date."),
    category: z.enum(POST_CATEGORIES).optional().or(z.literal("")),
    expiresAt: optionalDate,
    /* Events only. Required-ness is conditional, checked below. */
    startsAt: optionalDate,
    endsAt: optionalDate,
    location: z.string().trim().max(200).optional().or(z.literal("")),
    deadline: optionalDate,
    registerUrl: z
      .string()
      .trim()
      .url("Enter a full URL, including https://")
      .optional()
      .or(z.literal("")),
  })
  /* An event with no date or place is not an event. The kind selector decides
     which fields the form shows, so the schema has to agree with it rather
     than demanding event fields of an announcement. */
  .refine((d) => d.kind !== "event" || Boolean(d.startsAt), {
    message: "An event needs a start date.",
    path: ["startsAt"],
  })
  .refine((d) => d.kind !== "event" || Boolean(d.location), {
    message: "An event needs a location — write “Online” if it has no venue.",
    path: ["location"],
  })
  /* A category belongs to announcements. Silently storing one on a news item
     would put a "Call for papers" badge somewhere it cannot be filtered. */
  .refine((d) => d.kind !== "announcement" || Boolean(d.category), {
    message: "Choose a category for this announcement.",
    path: ["category"],
  })
  /* Dates that contradict each other are the commonest way a listing goes
     wrong, and each is worth its own message. */
  .refine((d) => !d.endsAt || !d.startsAt || d.endsAt >= d.startsAt, {
    message: "The end date cannot be before the start date.",
    path: ["endsAt"],
  })
  .refine((d) => !d.expiresAt || d.expiresAt >= d.publishedAt, {
    message: "A post cannot expire before it is published.",
    path: ["expiresAt"],
  })
  .refine((d) => !d.deadline || !d.startsAt || d.deadline <= d.startsAt, {
    message: "A registration deadline after the event has started helps nobody.",
    path: ["deadline"],
  });

export type PostInput = z.infer<typeof postSchema>;

/* ------------------------------------------------------- journal settings *
 * Twelve fields, not the twenty-one the form renders. The rest — the
 * journal's name, its licence, its access model — are decisions rather than
 * settings: changing one changes the journal, not its configuration, and
 * belongs in a reviewed commit. They render read-only.                      */

/**
 * An ISSN is eight digits with a hyphen, and its last character may be `X`.
 *
 * The check digit is validated because a wrong ISSN is not discovered until an
 * indexing service rejects the application, months later — the same reasoning
 * as the ORCID check digit above.
 */
export function isValidIssn(value: string): boolean {
  const chars = value.replace(/-/g, "").toUpperCase();
  if (!/^\d{7}[\dX]$/.test(chars)) return false;

  let total = 0;
  for (let i = 0; i < 7; i++) total += Number(chars[i]) * (8 - i);

  const remainder = total % 11;
  const expected = remainder === 0 ? 0 : 11 - remainder;
  const actual = chars[7] === "X" ? 10 : Number(chars[7]);
  return expected === actual;
}

const issnField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{3}[\dX]$/i, "An ISSN looks like 2789-1234.")
  .refine(isValidIssn, "That ISSN's check digit is wrong — please re-check it.")
  .optional()
  .or(z.literal(""));

const emailField = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .optional()
  .or(z.literal(""));

const urlField = z
  .string()
  .trim()
  .url("Enter the full address, including https://")
  .optional()
  .or(z.literal(""));

export const journalSettingsSchema = z.object({
  issn: issnField,
  eIssn: issnField,
  /**
   * A Crossref prefix is `10.` and four or five digits. The placeholder
   * `10.xxxxx` fails this, which is deliberate: it is what makes the "no
   * prefix" warnings on /admin/doi disappear only when a real one is entered.
   */
  doiPrefix: z
    .string()
    .trim()
    .regex(/^10\.\d{4,9}$/, "A Crossref prefix looks like 10.12345.")
    .optional()
    .or(z.literal("")),
  editorialOffice: emailField,
  submissions: emailField,
  support: emailField,
  charges: emailField,
  address: z.string().trim().max(300).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  x: urlField,
  linkedin: urlField,
  facebook: urlField,
});

export type JournalSettingsInput = z.infer<typeof journalSettingsSchema>;

/* -------------------------------------------------------------- sections */

export const sectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "A section name needs at least three characters.")
    .max(80, "That is too long for a section name.")
    // A section name appears in the queue filter, on the public aims & scope
    // page and in every manuscript's metadata. Punctuation beyond an ampersand
    // or a hyphen is almost always a paste artefact.
    .regex(
      /^[A-Za-z][A-Za-z0-9 &'’\-]*$/,
      "Use letters, numbers, spaces, & and hyphens.",
    ),
});

export type SectionInput = z.infer<typeof sectionSchema>;

/* ----------------------------------------------------------- user accounts */
/* Phase 4. The roles an account holds, and whether it can sign in.
 *
 * The role list is validated against `ROLES` here, but *which* of them the
 * acting administrator may grant is not a schema question — it depends on who
 * is asking. `assignableRoles()` answers that, and the Server Action applies
 * it after this parse. A schema that hard-coded the rule would have to be
 * re-parameterised per actor, and the check would then live in two places.  */

export const userRolesSchema = z.object({
  // A checkbox group posts one entry per box; `FormData.getAll` gives the
  // array. An account with no role can sign in and see nothing, which reads as
  // a broken account rather than a misconfigured one.
  roles: z
    .array(z.enum(ROLES))
    .min(1, "An account needs at least one role.")
    // Two identical values in a checkbox post means a forged request, not a
    // user action, and `UserRole` is keyed on (userId, role) so a duplicate
    // would fail at the database anyway.
    .refine((r) => new Set(r).size === r.length, "Roles must be distinct."),
});

export type UserRolesInput = z.infer<typeof userRolesSchema>;

export const userStatusSchema = z
  .object({
    status: z.enum(["active", "invited", "suspended"], {
      errorMap: () => ({ message: "Choose a status." }),
    }),
    suspendedReason: z.string().trim().max(500).optional().or(z.literal("")),
  })
  // A suspension nobody can explain later is not defensible against an appeal,
  // so the reason is required exactly when the status is `suspended` — and
  // cleared otherwise, so a stale reason cannot outlive the suspension.
  .refine((d) => d.status !== "suspended" || Boolean(d.suspendedReason), {
    message: "State why this account is suspended.",
    path: ["suspendedReason"],
  });

export type UserStatusInput = z.infer<typeof userStatusSchema>;

/**
 * Adding an account to the reviewer pool, or editing what it says.
 *
 * **The `reviewer` role and the reviewer pool are two different things**, and
 * conflating them is what made this screen necessary. Registration grants the
 * role — anyone may ask to review — but an editor's shortlist is built from
 * `ReviewerProfile`, and nothing put a row there except the seed. An account
 * could hold the role for months and never appear to a single editor.
 *
 * `expertise` is what the matcher actually reads: `getReviewerMatches`
 * compares each term against a manuscript's keywords in both directions
 * (substring either way), so "microfinance" matches a manuscript keyed
 * "microfinance access" and vice versa. Broad single words match too much and
 * narrow phrases match nothing, which is why the field is a list rather than
 * prose — each term is judged on its own.
 *
 * `sections` is **not** free text here even though the column is
 * `String[]`. The form posts checkboxes built from the `Section` table,
 * because `sectionMatch` is an exact `sections.includes(submission.section)`:
 * a section written by hand as "Psychology" against a registry reading
 * "Psychology & Behavioural Science" silently never matches, and the reviewer
 * is invisible for their own subject with nothing on screen to explain why.
 * The seeded rows carry exactly that bug. Validating against the live registry
 * is done in the action, which can read the table; the schema only enforces
 * the shape.
 */
export const reviewerPoolSchema = z.object({
  expertise: z
    .array(z.string().trim().min(2).max(80))
    .min(1, "Give at least one subject area, so the matcher has something to work with.")
    .max(25, "That is more subject areas than an editor can read.")
    .refine(
      (list) => new Set(list.map((e) => e.toLowerCase())).size === list.length,
      "Each subject area should appear once.",
    ),
  sections: z
    .array(z.string().trim().min(1))
    .max(20)
    // No minimum: a methodologist who reviews across every section is a real
    // case, and keyword matching still finds them. Requiring one would force
    // an arbitrary tick.
    .refine(
      (list) => new Set(list).size === list.length,
      "Each section should appear once.",
    ),
  note: z
    .string()
    .trim()
    .max(500, "Keep the note short — it is a reminder, not a record.")
    .optional()
    .or(z.literal("")),
});

export type ReviewerPoolInput = z.infer<typeof reviewerPoolSchema>;

/* --------------------------------------------------------- issue planning *
 * An issue being assembled, and the manuscripts placed into it.            */

/**
 * Creating or editing an issue.
 *
 * `published` is deliberately not a value here. Publishing an issue mints a
 * DOI for every article in it, and the journal has no Crossref prefix — an
 * issue marked published would carry `10.xxxxx` identifiers that resolve
 * nowhere. The form offers the two states that are real, and the screen says
 * why the third is missing.
 *
 * Volume, number and year are coerced: a number input posts a string.
 */
export const issueSchema = z.object({
  volume: z.coerce
    .number()
    .int("Volume is a whole number.")
    .min(1, "Volume starts at 1.")
    .max(200, "That volume number looks like a typo."),
  number: z.coerce
    .number()
    .int("Number is a whole number.")
    .min(1, "Issue numbers start at 1.")
    .max(50, "That issue number looks like a typo."),
  year: z.coerce
    .number()
    .int("Year is a whole number.")
    .min(2020, "The journal did not exist before 2020.")
    .max(2100, "That year looks like a typo."),
  title: z
    .string()
    .trim()
    .max(200, "An issue title should be a theme, not a paragraph.")
    .optional()
    .or(z.literal("")),
  targetDate: z
    .string()
    .trim()
    .min(1, "Give a target publication date.")
    .refine(
      (v) => !Number.isNaN(Date.parse(v)),
      "That date could not be read.",
    ),
  // No minimum of its own beyond 1: this is a planning target, never a cap on
  // what can be placed, so the form must not refuse an issue that outgrew it.
  plannedArticles: z.coerce
    .number()
    .int("Give a whole number of articles.")
    .min(1, "Plan for at least one article.")
    .max(100, "That is more articles than an issue carries.")
    .optional(),
  state: z.enum(["planned", "in-production"], {
    message: "Choose whether this issue is still open or its contents are fixed.",
  }),
});

export type IssueInput = z.infer<typeof issueSchema>;
