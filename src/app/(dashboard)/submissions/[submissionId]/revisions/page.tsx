import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText, Upload } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { getSubmissionById } from "@/lib/api/submissions";
import { SubmissionHeader } from "@/components/portal/submission-header";
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
        {submission.status === "revision-requested" && (
          <Alert tone="warning" title="Upload is not available yet">
            <p>
              The portal cannot accept file uploads while it is being built.
              Email your revised manuscript and your point-by-point response to
              the editorial office, quoting{" "}
              <strong>{submission.reference}</strong>.
            </p>
          </Alert>
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
                        {/* Not a link: there is no file store yet, and a
                            download that 404s is worse than none. */}
                        <span
                          className="shrink-0 text-xs text-muted-foreground"
                          title="Downloads become available when the file store is connected"
                        >
                          <Download className="size-4" aria-hidden />
                          <span className="sr-only">
                            Download unavailable while the portal is in
                            development
                          </span>
                        </span>
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <section className="mt-10 rounded-xl border border-dashed border-brand-border p-6 text-center">
          <span
            aria-hidden
            className="mx-auto grid size-11 place-items-center rounded-xl bg-brand-tint text-brand-dark"
          >
            <Upload className="size-5" />
          </span>
          <p className="mt-3 font-serif text-base font-semibold">
            Uploading is not available yet
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            File upload arrives with the submission wizard. Until then, send
            files to the editorial office by email and they will be added here.
          </p>
        </section>
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
