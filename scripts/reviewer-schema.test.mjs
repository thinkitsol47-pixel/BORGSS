/**
 * Checks the reviewer application's validation rules.
 *
 * Run: npx tsc src/lib/validation/schemas.ts --outDir .tmp-test --module commonjs
 *      --target es2020 --moduleResolution node --skipLibCheck
 *      && node scripts/reviewer-schema.test.mjs .tmp-test/schemas.js
 */
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const compiled = resolve(process.argv[2] ?? "");

if (!compiled) {
  console.error("usage: node reviewer-schema.test.mjs <compiled schemas.js>");
  process.exit(2);
}

const S = require(compiled);

let pass = 0;
let fail = 0;

function t(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}` +
      (ok ? "" : `\n   got  ${JSON.stringify(got)}\n   want ${JSON.stringify(want)}`),
  );
}

const base = {
  name: "Fatima Siddiqui",
  email: "f@example.edu.pk",
  institution: "Lahore University of Management Sciences",
  position: "Assistant Professor",
  country: "Pakistan",
  degree: "phd",
  subjects: ["Economics & Development"],
  methods: [],
  keywords: "microfinance, rural credit",
  capacity: "3-4",
  agreeEthics: "on",
};

const ok = (o) => S.reviewerApplicationSchema.safeParse({ ...base, ...o }).success;
const errOf = (o, field) => {
  const r = S.reviewerApplicationSchema.safeParse({ ...base, ...o });
  return r.success
    ? null
    : (r.error.issues.find((i) => i.path[0] === field)?.message ?? null);
};

t("valid application accepted", ok({}), true);

// identity
t("short name rejected", ok({ name: "F" }), false);
t("bad email rejected", ok({ email: "nope" }), false);
t("missing institution rejected", ok({ institution: "" }), false);
t("missing position rejected", ok({ position: "" }), false);
t("missing country rejected", ok({ country: "" }), false);
t("unknown degree rejected", ok({ degree: "diploma" }), false);
t(
  "degree error message",
  errOf({ degree: "diploma" }, "degree"),
  "Please select your highest qualification.",
);

// optional identifiers
t("orcid omitted is fine", ok({ orcid: undefined }), true);
t("orcid empty string is fine", ok({ orcid: "" }), true);
t("valid orcid accepted", ok({ orcid: "0000-0002-1825-0097" }), true);
// A real X-checksum iD. The previous value here was 0000-0002-1825-009X —
// 0000-0002-1825-0097 with its last digit swapped for an X — which passed only
// while the schema checked the shape alone. It now verifies the check digit.
t("orcid with X checksum accepted", ok({ orcid: "0000-0002-1694-233X" }), true);
t("malformed orcid rejected", ok({ orcid: "1234" }), false);
t("orcid with wrong check digit rejected", ok({ orcid: "0000-0002-1825-0098" }), false);
t("orcid with transposed digits rejected", ok({ orcid: "0000-0002-1852-0097" }), false);
t("profile url must be absolute", ok({ scholarUrl: "example.com" }), false);
t("valid profile url accepted", ok({ scholarUrl: "https://example.com/me" }), true);
t("profile url empty is fine", ok({ scholarUrl: "" }), true);

// expertise
t("no subjects rejected", ok({ subjects: [] }), false);
t(
  "subjects error message",
  errOf({ subjects: [] }, "subjects"),
  "Choose at least one subject area.",
);
t("five subjects accepted", ok({ subjects: S.REVIEWER_SUBJECTS.slice(0, 5) }), true);
t("six subjects rejected", ok({ subjects: S.REVIEWER_SUBJECTS.slice(0, 6) }), false);
t("unknown subject rejected", ok({ subjects: ["Astrophysics"] }), false);
t("every listed subject is valid", S.REVIEWER_SUBJECTS.every((s) => ok({ subjects: [s] })), true);
t("every listed method is valid", S.REVIEWER_METHODS.every((m) => ok({ methods: [m] })), true);
t("methods default to empty", S.reviewerApplicationSchema.safeParse({ ...base, methods: undefined }).success, true);
t("short keywords rejected", ok({ keywords: "ab" }), false);
t("long experience rejected", ok({ experience: "x".repeat(1501) }), false);
t("1500-char experience accepted", ok({ experience: "x".repeat(1500) }), true);
t("unknown capacity rejected", ok({ capacity: "loads" }), false);

// ethics + spam
t("unchecked ethics rejected", ok({ agreeEthics: undefined }), false);
t(
  "ethics error message",
  errOf({ agreeEthics: undefined }, "agreeEthics"),
  "You must agree to the reviewer ethics policy.",
);
t("empty honeypot passes", ok({ website: "" }), true);
t("filled honeypot rejected", ok({ website: "http://spam.example" }), false);

t(
  "values are trimmed",
  S.reviewerApplicationSchema.safeParse({ ...base, name: "  Fatima Siddiqui  " }).data
    .name,
  "Fatima Siddiqui",
);
t("subject list length", S.REVIEWER_SUBJECTS.length, 10);
t("method list length", S.REVIEWER_METHODS.length, 6);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
