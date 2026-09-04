/**
 * Checks the contact form's validation rules — the logic the server action
 * relies on to reject bad input and spam.
 *
 * Run: npx tsc src/lib/validation/schemas.ts --outDir <dir> --module commonjs
 *      --target es2020 --moduleResolution node --skipLibCheck
 *      && node scripts/contact-schema.test.mjs <dir>/schemas.js
 */
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const compiled = resolve(process.argv[2] ?? "");

if (!compiled) {
  console.error("usage: node contact-schema.test.mjs <compiled schemas.js>");
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
  name: "Ayesha Khan",
  email: "a@example.org",
  topic: "submission",
  message: "I would like to ask about the review timeline for my manuscript.",
};

const ok = (o) => S.contactSchema.safeParse({ ...base, ...o }).success;
const errOf = (o, field) => {
  const r = S.contactSchema.safeParse({ ...base, ...o });
  return r.success
    ? null
    : (r.error.issues.find((i) => i.path[0] === field)?.message ?? null);
};

t("valid submission accepted", ok({}), true);
t("short name rejected", ok({ name: "A" }), false);
t("name error message", errOf({ name: "A" }, "name"), "Please enter your full name.");
t("malformed email rejected", ok({ email: "not-an-email" }), false);
t(
  "email error message",
  errOf({ email: "nope" }, "email"),
  "Please enter a valid email address.",
);
t("unknown topic rejected", ok({ topic: "spam" }), false);
t("topic error message", errOf({ topic: "spam" }, "topic"), "Please choose a subject.");
t("short message rejected", ok({ message: "too short" }), false);
t("4000-char message accepted", ok({ message: "x".repeat(4000) }), true);
t("4001-char message rejected", ok({ message: "x".repeat(4001) }), false);
t("affiliation is optional", ok({ affiliation: undefined }), true);
t("manuscript id is optional", ok({ manuscriptId: undefined }), true);
t("whitespace-only name rejected", ok({ name: "   " }), false);
t("whitespace-only message rejected", ok({ message: "   " }), false);
t("empty honeypot passes", ok({ website: "" }), true);
t("filled honeypot rejected", ok({ website: "http://spam.example" }), false);
t(
  "values are trimmed",
  S.contactSchema.safeParse({ ...base, name: "  Ayesha Khan  " }).data.name,
  "Ayesha Khan",
);
t("every listed topic is valid", S.CONTACT_TOPICS.every((tp) => ok({ topic: tp })), true);
t("topic list length", S.CONTACT_TOPICS.length, 7);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
