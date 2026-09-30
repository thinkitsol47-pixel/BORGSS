import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { getSubmissionById } from "@/lib/api/submissions";
import { SubmissionHeader } from "@/components/portal/submission-header";
import { RevisionUploadForm } from "@/components/portal/revision-upload-form";
import { Alert, Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { SubmissionFile, SubmissionFileKind } from "@/types";

export const metadata: Metadata = { title: "Files & revisions" };

const KIND_LABELS: Record<SubmissionFileKind, string> = {
  manuscript: "Main manuscript",
  "title-page": "Title page",
  "cover-letter": "Cover letter",
  figure: "Figure",
  table: "Table",
  supplementary: "Supplementary file",
  "response-to-reviewers": "Response to reviewers",
};

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireUser();
  const submission = await getSubmissionById(params.submissionId);
  if (!submission) notFound();

  // Grouped by round so the history reads as a sequence: what was originally
  // submitted, then what changed at each revision.
  const rounds = groupByRound(submission.files);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <SubmissionHeader submission={submission} active="revisions" />

      <div className="mt-8 max-w-3xl">
        {/* The form sits above the history, because an author who opened this
            tab from a revision request came here to upload, not to read. */}
        {submission.status === "revision-requested" && (
          <section aria-labelledby="upload-heading" className="mb-10">
            <h2
              id="upload-heading"
              className="font-serif text-lg font-semibold"
            >
              Upload revision {submission.round}
            </h2>
            {submission.revisionDueAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                Due {formatDate(submission.revisionDueAt)}.
              </p>
            )}
            <div className="mt-4">
              <RevisionUploadForm
                submissionId={submission.id}
                reference={submission.reference}
                round={submission.round}
              />
            </div>
          </section>
        )}

        {rounds.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No files have been uploaded for this submission.
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {rounds.map(({ round, files }) => (
              <section key={round} aria-labelledby={`round-${round}`}>
                <h2
                  id={`round-${round}`}
                  className="font-serif text-lg font-semibold"
                >
                  {round === 0 ? "Original submission" : `Revision ${round}`}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {files.length} {files.length === 1 ? "file" : "files"} ·
                  uploaded {formatDate(files[0].uploadedAt)}
                </p>

                <ul className="mt-3 space-y-2">
                  {files.map((f) => (
                    <li key={f.id}>
                      <Card className="flex items-center gap-3 p-3.5">
                        <span
                          aria-hidden
                          className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand-dark"
                        >
                          <FileText className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {f.filename}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {KIND_LABELS[f.kind]} · {formatSize(f.sizeBytes)}
                          </p>
                        </div>
                        {/* `/files/<id>` checks who is asking before minting a
                            ten-minute signed URL. A row with no stored file
                            stays plain text: a download that 404s reads as the
                            portal being broken. */}
                        {f.stored ? (
                          <a
                            href={`/files/${f.id}`}
                            className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-brand-tint"
                          >
                            <Download className="size-4" aria-hidden />
                            <span className="sr-only">
                              Download {f.filename}
                            </span>
                          </a>
                        ) : (
                          <span
                            className="shrink-0 text-xs text-muted-foreground"
                            title="Recorded before the journal had file storage"
                          >
                            <Download className="size-4" aria-hidden />
                            <span className="sr-only">
                              Not available for download
                            </span>
                          </span>
                        )}
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Only when there is nothing to upload. An author whose manuscript is
            not awaiting a revision would otherwise read a panel about a form
            they cannot use. */}
        {submission.status !== "revision-requested" && (
          <Alert tone="info" title="No revision is due" className="mt-10">
            Revisions are uploaded here when an editor asks for them. Nothing is
            outstanding on{" "}
            <span className="font-medium">{submission.reference}</span> right
            now — if you believe a revision was requested, write to the
            editorial office.
          </Alert>
        )}
      </div>
    </div>
  );
}

/** Oldest round first, so the list reads as a history. */
function groupByRound(files: SubmissionFile[]) {
  const map = new Map<number, SubmissionFile[]>();
  for (const f of files) {
    const list = map.get(f.round) ?? [];
    list.push(f);
    map.set(f.round, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, files]) => ({ round, files }));
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
