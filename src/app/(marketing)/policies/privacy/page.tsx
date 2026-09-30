import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { PolicyPage } from "@/components/layout/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data BORJSS collects, why, who can see it, how long it is kept, and the rights you have over it — including what the site does and does not do today.",
};

const TOC = [
  { id: "who", label: "Who is responsible" },
  { id: "current-state", label: "What this site does today" },
  { id: "what-we-collect", label: "What data is collected" },
  { id: "why", label: "Why it is collected" },
  { id: "cookies", label: "Cookies and analytics" },
  { id: "who-sees", label: "Who can see your data" },
  { id: "peer-review", label: "Privacy in peer review" },
  { id: "published", label: "What becomes public" },
  { id: "retention", label: "How long data is kept" },
  { id: "your-rights", label: "Your rights" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contacting us" },
];

export default function Page() {
  return (
    <PolicyPage
      slug="privacy"
      title="Privacy Policy"
      lead="This policy explains what personal data the journal collects, what it does with it, and what rights you have over it. It describes the site as it actually works today, not as it may work later."
      toc={TOC}
      related={["complaints-appeals", "research-ethics", "data-availability"]}
    >
      <h2 id="who">Who is responsible</h2>
      <p>
        {siteConfig.name} ({siteConfig.shortName}) is published by{" "}
        {siteConfig.publisher}, which is the controller of the personal data
        described here. Enquiries about this policy go to the editorial office
        at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        .
      </p>

      <h2 id="current-state">What this site does today</h2>
      <p>
        The journal is newly launched and the site is still being built out. It
        is worth being specific about the present position rather than
        describing a system that does not yet exist:
      </p>
      <ul>
        <li>
          <strong>There are no reader accounts.</strong> You do not need to
          register, log in, or give an email address to read anything.
        </li>
        <li>
          <strong>There is no analytics or tracking.</strong> The site runs no
          analytics service, no advertising network and no third-party tracking
          scripts.
        </li>
        <li>
          <strong>There are no tracking cookies.</strong> Reading the site sets
          no cookie of any kind.
        </li>
        <li>
          <strong>The forms save, but do not yet notify anyone.</strong> The
          contact and reviewer-application forms record what you submit so the
          editorial office can act on it, but no email is sent — to you or to
          the office — because the mail provider has not been connected. If you
          need a prompt reply, use the email addresses on the{" "}
          <Link href="/contact">contact page</Link> as well.
        </li>
        <li>
          <strong>Manuscripts are still sent by email.</strong> The portal is
          built and accounts, submissions and peer review all work inside it,
          but it is not yet open to authors — email notification is not
          connected, so nobody would be told what happened to their manuscript.
          Until it opens, submissions reach the editorial office by email.
        </li>
      </ul>
      <p>
        The sections below describe both what happens now and what will happen
        once those systems are in operation. This policy will be updated, with a
        new date, before any of them begins processing real personal data.
      </p>

      <h2 id="what-we-collect">What data is collected</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            [
              "Reading the site",
              "Nothing that identifies you. The hosting infrastructure keeps standard server logs, which include IP addresses, for security and reliability.",
            ],
            [
              "Contact form",
              "Your name, email address, subject and message. Stored for the editorial office to respond to; not forwarded anywhere else, and no email is sent yet.",
            ],
            [
              "Reviewer application",
              "Your name, email, affiliation, position, areas of expertise and any ORCID iD you supply. Stored as a pending application for an editor to review; not forwarded anywhere else.",
            ],
            [
              "Manuscript submission",
              "Author names, affiliations, email addresses, ORCID iDs, the manuscript and its files, and declarations.",
            ],
            [
              "Peer review",
              "Reviewer identity, expertise, review history, availability, and the content of reports.",
            ],
            [
              "Accounts",
              "Name, email, password (stored hashed, never in readable form), role and activity within the portal.",
            ],
            [
              "Charges (planned)",
              "Billing name, institution and invoice records. Card details are never seen or held by the journal.",
            ],
          ].map(([term, value]) => (
            <div
              key={term}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[16rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {term}
              </dt>
              <dd className="min-w-0 break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p>
        The journal does not ask for, and does not want, special category data —
        health, religion, political opinion, ethnicity — about the people who
        use it. Where research <em>participants&rsquo;</em> data appear in a
        manuscript, they are governed by the{" "}
        <Link href="/policies/research-ethics">research ethics policy</Link> and
        the{" "}
        <Link href="/policies/data-availability">
          data availability policy
        </Link>
        , not by this one.
      </p>

      <h2 id="why">Why it is collected</h2>
      <p>
        Each category is collected for a stated purpose and is not reused for
        anything else:
      </p>
      <ul>
        <li>
          <strong>To answer you</strong> — enquiries and reviewer applications
          are used to reply and, for reviewers, to match expertise to
          manuscripts;
        </li>
        <li>
          <strong>To operate peer review</strong> — running submission, review,
          decisions and production;
        </li>
        <li>
          <strong>To publish</strong> — author names and affiliations appear in
          the published article, which is the point of publishing it;
        </li>
        <li>
          <strong>To keep the record</strong> — maintaining the integrity of
          what has been published, including corrections and retractions;
        </li>
        <li>
          <strong>To meet obligations</strong> — invoicing, accounting, and
          responding to ethical or legal enquiries;
        </li>
        <li>
          <strong>To keep the site running</strong> — server logs used for
          security and diagnosis.
        </li>
      </ul>
      <p>
        Your data is never sold, rented or shared for marketing. The journal
        sends no marketing email. Where a table of contents alert is offered in
        future it will be opt-in, and unsubscribing will be a single click.
      </p>

      <h2 id="cookies">Cookies and analytics</h2>
      <p>
        Reading this site sets <strong>no cookies</strong>. There is no analytics
        service, no advertising, no social media pixel and no third-party
        tracking script anywhere on the public site. Nothing you read here is
        logged against you, and there is no cookie banner because there is
        nothing to consent to.
      </p>
      <p>
        Signing in to the portal sets a{" "}
        <strong>single strictly necessary cookie</strong> that keeps you signed
        in. It holds a session token only, does not track you across other
        sites, and cannot be disabled without making sign-in impossible. Signing
        out clears it. No consent banner is required for a cookie of that kind,
        and none will be added for tracking, because tracking is not planned.
      </p>
      <p>
        Should the journal ever add analytics, it will use a privacy-preserving
        service that does not profile individuals, and this policy will say so
        before it is switched on.
      </p>

      <h2 id="who-sees">Who can see your data</h2>
      <p>
        Access is limited to those who need it. Manuscripts and their associated
        data are seen only by the handling editor, the assigned reviewers, the
        editorial office and, where relevant, the production team.
      </p>
      <p>
        Some data is necessarily shared outside the journal, and only these:
      </p>
      <ul>
        <li>
          <strong>Hosting and infrastructure providers</strong>, which process
          data on the journal&rsquo;s instructions in order to run the site;
        </li>
        <li>
          <strong>Crossref</strong>, which receives the metadata of published
          articles — including author names, affiliations and ORCID iDs — so
          that DOIs resolve;
        </li>
        <li>
          <strong>Indexing services and preservation archives</strong>, which
          receive published article metadata and content;
        </li>
        <li>
          <strong>A payment provider</strong>, once charges are live, which
          handles card details directly so that the journal never receives them;
        </li>
        <li>
          <strong>An author&rsquo;s institution or a funder</strong>, where a
          misconduct investigation requires it under the{" "}
          <Link href="/policies/publication-ethics">
            publication ethics policy
          </Link>
          ;
        </li>
        <li>
          <strong>A court or regulator</strong>, where the journal is legally
          obliged to disclose.
        </li>
      </ul>
      <p>
        Some of these providers operate outside Pakistan, so data may be
        processed in other countries. The journal uses established providers
        that apply recognised data protection safeguards.
      </p>

      <h2 id="peer-review">Privacy in peer review</h2>
      <p>
        Review is double-blind, and the confidentiality that protects it is part
        of this policy as much as it is part of the{" "}
        <Link href="/policies/peer-review">peer review policy</Link>.
      </p>
      <ul>
        <li>
          <strong>Reviewer identities are never disclosed to authors</strong> —
          not during review, not after a decision, and not after publication;
        </li>
        <li>
          <strong>Author identities are withheld from reviewers</strong>, which
          is why the main file must be anonymised;
        </li>
        <li>
          <strong>Reports are confidential</strong> and are shared only with the
          authors, the handling editor and, where a manuscript is transferred,
          the receiving editor;
        </li>
        <li>
          <strong>Manuscripts must not be entered into AI services</strong> by
          reviewers or editors — doing so transmits confidential work to a third
          party, and is prohibited by the{" "}
          <Link href="/policies/ai-policy">AI-assisted writing policy</Link>;
        </li>
        <li>
          <strong>The identity of a person raising a concern</strong> under the
          ethics or{" "}
          <Link href="/policies/complaints-appeals">complaints</Link> policies is
          not disclosed to the person it concerns, wherever the investigation
          allows.
        </li>
      </ul>

      <h2 id="published">What becomes public</h2>
      <p>
        Publication is by its nature public and permanent. When an article is
        published, the following become part of the public record and cannot be
        withdrawn later: author names, affiliations, ORCID iDs, the
        corresponding author&rsquo;s email address, the contribution statement,
        and the funding, competing interests, ethics and data availability
        statements.
      </p>
      <p>
        This is a consequence of publishing under an open licence — the article
        is copied, indexed and archived elsewhere, beyond the journal&rsquo;s
        control. Authors should be sure they are content for the email address
        they give to remain published indefinitely. A factual error in a name or
        affiliation can be corrected under the{" "}
        <Link href="/policies/retraction-correction">
          retraction and correction policy
        </Link>
        ; a change of mind about being published cannot undo publication.
      </p>

      <h2 id="retention">How long data is kept</h2>
      <div className="not-prose">
        <dl className="divide-y divide-border rounded-lg border border-brand-border">
          {[
            ["Published articles and their metadata", "Permanently"],
            [
              "Editorial records for published articles",
              "10 years, so that later concerns can be investigated",
            ],
            ["Declined manuscripts and their reports", "5 years"],
            ["Reviewer records", "Until you ask to be removed"],
            ["Enquiries and correspondence", "2 years"],
            ["Invoices and financial records", "As long as the law requires"],
            ["Server logs", "A short operational period, then discarded"],
          ].map(([term, value]) => (
            <div
              key={term}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[16rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {term}
              </dt>
              <dd className="min-w-0 break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <h2 id="your-rights">Your rights</h2>
      <p>
        Whatever jurisdiction you are in, the journal will honour the following
        requests about your own personal data:
      </p>
      <ul>
        <li>
          <strong>Access</strong> — a copy of the personal data held about you;
        </li>
        <li>
          <strong>Correction</strong> — inaccurate details put right;
        </li>
        <li>
          <strong>Deletion</strong> — removal of your data, subject to the
          limits below;
        </li>
        <li>
          <strong>Restriction and objection</strong> — asking that processing
          stop while a dispute is resolved;
        </li>
        <li>
          <strong>Portability</strong> — your data in a machine-readable form;
        </li>
        <li>
          <strong>Withdrawal of consent</strong> — where processing rests on
          consent, such as remaining in the reviewer database.
        </li>
      </ul>
      <p>
        Two limits apply, and the journal states them rather than leaving them
        to be discovered. <strong>Published articles cannot be unpublished</strong>{" "}
        — the scholarly record depends on stability, and copies exist elsewhere.
        And <strong>editorial records are kept for the periods above</strong>{" "}
        even after an account is closed, so that a later question about a
        published article can still be investigated.
      </p>
      <p>
        To exercise any of these, write to the editorial office. Requests are
        answered within 30 days, and there is no charge.
      </p>

      <h2 id="security">Security</h2>
      <p>
        The site is served over HTTPS. When the portal launches, passwords will
        be stored only as salted hashes and never in readable form, access will
        be restricted by role, and manuscripts will be accessible only to those
        assigned to them.
      </p>
      <p>
        No system is perfectly secure. Where a breach affects personal data and
        presents a real risk, the journal will notify the people affected and
        the relevant authority without undue delay, and will say what happened
        rather than minimising it.
      </p>

      <h2 id="children">Children</h2>
      <p>
        The journal&rsquo;s services are intended for researchers and are not
        directed at children. It does not knowingly collect personal data from
        anyone under 16 through this site. Where research involves children as
        participants, the safeguards in the{" "}
        <Link href="/policies/research-ethics">research ethics policy</Link>{" "}
        apply.
      </p>

      <h2 id="changes">Changes to this policy</h2>
      <p>
        This policy will change as the submission portal, accounts and payment
        processing come into operation. The date at the top records when it was
        last revised, and any change that materially affects how personal data
        is handled will be described here before it takes effect — not
        retrospectively.
      </p>

      <h2 id="contact">Contacting us</h2>
      <p>
        Questions, requests and complaints about personal data go to the
        editorial office at{" "}
        <a href={`mailto:${siteConfig.contact.editorialOffice}`}>
          {siteConfig.contact.editorialOffice}
        </a>
        , or by post to {siteConfig.contact.address}.
      </p>
      <p>
        If you are not satisfied with the response, you may complain under the{" "}
        <Link href="/policies/complaints-appeals">
          complaints and appeals policy
        </Link>
        , and you may also raise the matter with the data protection authority
        in your own country.
      </p>
    </PolicyPage>
  );
}
