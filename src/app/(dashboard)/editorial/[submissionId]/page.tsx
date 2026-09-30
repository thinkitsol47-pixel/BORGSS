import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, UserCheck } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  getEditorialSubmissionById,
  roundProgress,
  waitingOn,
} from "@/lib/api/editorial";
import { EditorialHeader } from "@/components/portal/editorial-header";
import { FileLink } from "@/components/portal/file-link";
import { Alert, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Contributor, Submission, SubmissionFile } from "@/types";

export const metadata: Metadata = { title: "Manuscript" };

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireGroup("editorial");

  const submission = await getEditorialSubmissionById(params.submissionId);
  if (!submission) notFound();

  const waiting = waitingOn(submission);
  const { completed, total, overdue } = roundProgress(submission);

  // Not `PortalPage`: the header below *is* this page's title block, carrying
  // the reference, status and tabs. The author's detail page does the same.
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <EditorialHeader
        submission={submission}
        active="overview"
        waiting={waiting}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-8">
          {waiting === "editor" && (
            <Alert tone="warning" title="This is with you">
              {nextStep(submission)}
            </Alert>
          )}

          <section aria-labelledby="abstract-heading">
            <h2
              id="abstract-heading"
              className="font-serif text-lg font-semibold"
            >
              Abstract
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {submission.abstract}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {submission.keywords.map((k) => (
                <li
                  key={k}
                  className="rounded-full border border-brand-border bg-brand-tint px-2.5 py-0.5 text-xs font-medium text-brand-darker"
                >
                  {k}
                </li>
              ))}
            </ul>
          </section>

          {/* The editor is the one role that sees the author list on a
              manuscript in review. Reviewers never reach this screen. */}
          <section aria-labelledby="authors-heading">
            <h2
              id="authors-heading"
              className="font-serif text-lg font-semibold"
            >
              Authors
            </h2>
            <ol className="mt-3 divide-y rounded-xl border">
              {submission.contributors.map((c, i) => (
                <li key={c.id} className="p-4">
                  <AuthorRow contributor={c} position={i + 1} />
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="files-heading">
            <h2 id="files-heading" className="font-serif text-lg font-semibold">
              Files
            </h2>
            <ul className="mt-3 divide-y rounded-xl border">
              {submission.files.map((f) => (
                <FileLink
                  key={f.id}
                  id={f.id}
                  filename={f.filename}
                  stored={f.stored}
                  detail={`${fileKindLabel(f)} · ${formatSize(f.sizeBytes)} · ${formatDate(f.uploadedAt)}${
                    f.round > 0 ? ` · revision ${f.round}` : ""
                  }`}
                />
              ))}
            </ul>
            {submission.files.some((f) => !f.stored) && (
              <p className="mt-3 text-sm text-muted-foreground">
                Files without a download link were recorded before the journal
                had file storage; the editorial office holds those by email.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar: the numbers and the actions, in that order. */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border p-4">
            <h2 className="font-serif text-base font-semibold">Review round</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Round</dt>
                <dd className="font-medium">{submission.round}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Reports in</dt>
                <dd className="font-medium">
                  {total === 0 ? "No reviewers yet" : `${completed} of ${total}`}
                </dd>
              </div>
              {overdue > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Overdue</dt>
                  <dd className="font-medium text-warning">{overdue}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Decisions</dt>
                <dd className="font-medium">{submission.decisions.length}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <Button
              href={`/editorial/${submission.id}/reviewers`}
              className="w-full"
            >
              <UserCheck className="size-4" aria-hidden />
              Manage reviewers
            </Button>
            <Button
              href={`/editorial/${submission.id}/decision`}
              variant="outline"
              className="w-full"
            >
              Record a decision
            </Button>
          </div>

          <div className="rounded-xl border border-brand-border bg-brand-tint p-4">
            <h2 className="flex items-center gap-2 font-serif text-base font-semibold">
              <Mail className="size-4" aria-hidden />
              Contacting the author
            </h2>
            {/* "Messaging is not built yet" was only half the reason. The
                portal has no reply box, but even with one nothing could be
                sent: the journal owns no domain, so no mail can leave the
                platform at all. Stating only the smaller reason made the
                bigger one look solved. */}
            <p className="mt-2 text-sm leading-relaxed text-brand-darker">
              The portal cannot send mail yet — the journal owns no domain — so
              write to the corresponding author from your own mailbox, quoting{" "}
              <span className="font-medium">{submission.reference}</span>.
            </p>
            {correspondingEmail(submission) && (
              <p className="mt-2 break-all text-sm">
                <Link
                  href={`mailto:${correspondingEmail(submission)}?subject=${encodeURIComponent(submission.reference)}`}
                  className="font-medium text-primary hover:text-brand-dark hover:underline"
                >
                  {correspondingEmail(submission)}
                </Link>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function AuthorRow({
  contributor: c,
  position,
}: {
  contributor: Contributor;
  position: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-xs text-muted-foreground">{position}.</span>
        <span className="text-sm font-medium">
          {c.givenName} {c.familyName}
        </span>
        {c.isCorresponding && (
          <span className="rounded-full border border-brand-border bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand-darker">
            Corresponding
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {c.affiliations.map((a) => a.name).join("; ") || "No affiliation given"}
      </p>
      {c.orcid && (
        <p className="mt-1 text-xs text-muted-foreground">
          ORCID{" "}
          <Link
            href={`https://orcid.org/${c.orcid}`}
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline"
          >
            {c.orcid}
          </Link>
        </p>
      )}
      {c.email && (
        <p className="mt-1 break-all text-xs text-muted-foreground">
          {c.email}
        </p>
      )}
    </div>
  );
}

/** What the editor's next move is, stated plainly rather than implied. */
function nextStep(s: Submission) {
  const { completed, total } = roundProgress(s);
  switch (s.status) {
    case "submitted":
      return "Nobody has looked at this yet. Check it is in scope and complete, then either invite reviewers or desk-reject it.";
    case "desk-review":
      return "Desk assessment is in progress. Invite reviewers if it passes, or record a desk rejection.";
    case "revision-submitted":
      return "The author has returned a revision. Decide whether it goes back to the original reviewers or straight to a decision.";
    case "awaiting-decision":
      return "Every report is in. A decision is owed to the author.";
    case "under-review":
      return total > 0 && completed >= total
        ? "Every report for this round is in. A decision is owed to the author."
        : "Reviewers are still working.";
    default:
      return "This manuscript is waiting on you.";
  }
}

function correspondingEmail(s: Submission) {
  const c =
    s.contributors.find((x) => x.isCorresponding) ?? s.contributors[0];
  return c?.email;
}

function fileKindLabel(f: SubmissionFile) {
  const labels: Record<SubmissionFile["kind"], string> = {
    manuscript: "Anonymised manuscript",
    "title-page": "Title page",
    "cover-letter": "Cover letter",
    figure: "Figure",
    table: "Table",
    supplementary: "Supplementary",
    "response-to-reviewers": "Response to reviewers",
  };
  return labels[f.kind];
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
