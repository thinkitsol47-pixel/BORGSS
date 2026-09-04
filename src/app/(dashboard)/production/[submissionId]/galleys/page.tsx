import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileType2, Lock } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import { getProductionContext, stageRecord } from "@/lib/api/production";
import { ProductionHeader } from "@/components/portal/production-header";
import { StagePanel } from "@/components/portal/stage-panel";
import {
  MarkFinalButton,
  StageActions,
  UploadGalleyButton,
} from "@/components/portal/production-actions";
import { Alert, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GalleyFormat, ProductionGalley } from "@/types";

export const metadata: Metadata = { title: "Typesetting" };

const FORMAT_LABEL: Record<GalleyFormat, string> = {
  pdf: "PDF",
  xml: "JATS XML",
  html: "HTML",
  epub: "EPUB",
};

/**
 * The typesetting stage: the galleys produced from the copyedited manuscript.
 *
 * Galleys are versioned rather than replaced, and every version is listed. A
 * proof correction produces a new version, and the question at the end of
 * production is always "which one did the author actually approve?" — which a
 * single overwritten file cannot answer.
 */
export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireGroup("production");

  const ctx = await getProductionContext(params.submissionId);
  if (!ctx) notFound();

  const { job, submission, issue } = ctx;
  const record = stageRecord(job, "galleys");
  const copyedit = stageRecord(job, "copyedit");

  // Newest version first: the current galley is the one anyone opening this
  // screen is looking for.
  const galleys = [...job.galleys].sort(
    (a, b) => b.version - a.version || a.format.localeCompare(b.format),
  );
  const latestVersion = galleys[0]?.version;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <ProductionHeader
        job={job}
        submission={submission}
        issue={issue}
        active="galleys"
      />

      <div className="mt-8 max-w-4xl space-y-10">
        {/* Typesetting before copyediting is finished produces a galley that
            has to be thrown away. Said plainly rather than merely implied by
            an empty list. */}
        {copyedit.state !== "done" && (
          <Alert tone="info" title="Copyediting is not finished">
            Typesetting normally waits for the copyedited manuscript to be
            approved by the author. Laying out text that is still changing means
            laying it out twice.{" "}
            <Link
              href={`/production/${submission.id}/copyedit`}
              className="font-medium underline"
            >
              Go to copyediting
            </Link>
            .
          </Alert>
        )}

        <StagePanel
          record={record}
          notStartedHint="Typesetting has not started. No galley has been produced for this manuscript."
        />

        <StageActions
          stage="galleys"
          state={record.state}
          reference={job.reference}
        />

        {/* ------------------------------------------------------- galleys */}
        <section aria-labelledby="galleys-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="galleys-heading" className="font-serif text-lg font-semibold">
              Galleys
            </h2>
            {galleys.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {galleys.length} {galleys.length === 1 ? "file" : "files"} ·
                latest version {latestVersion}
              </p>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every version is kept, not replaced. A proof correction produces a
            new version, and knowing which one the author approved is the whole
            point of keeping the older ones.
          </p>

          <div className="mt-4">
            <UploadGalleyButton nextVersion={(latestVersion ?? 0) + 1} />
          </div>

          {galleys.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={FileType2}
                title="No galleys yet"
                description="Nothing has been typeset for this manuscript. The copyedited manuscript is the source file."
                action={{
                  label: "Go to copyediting",
                  href: `/production/${submission.id}/copyedit`,
                }}
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {galleys.map((g) => (
                <li key={g.id}>
                  <GalleyRow galley={g} isLatest={g.version === latestVersion} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* --------------------------------------------------- what is due */}
        <section aria-labelledby="formats-heading">
          <h2 id="formats-heading" className="font-serif text-lg font-semibold">
            What the journal publishes
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            PDF is the published article. JATS XML is what indexing services and
            preservation archives read, and its absence is the usual reason a
            journal fails an indexing application — so it is listed as required
            rather than optional, even though none has been deposited yet.
          </p>
          <ul className="mt-3 divide-y rounded-xl border text-sm">
            {FORMATS.map((f) => {
              const present = galleys.some(
                (g) => g.format === f.id && g.version === latestVersion,
              );
              return (
                <li
                  key={f.id}
                  className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{FORMAT_LABEL[f.id]}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {f.detail}
                    </p>
                  </div>
                  {/* The word carries the meaning; the colour only repeats it. */}
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      present
                        ? "text-success"
                        : f.required
                          ? "text-warning"
                          : "text-muted-foreground",
                    )}
                  >
                    {present
                      ? "Produced"
                      : f.required
                        ? "Required — missing"
                        : "Optional"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <Alert tone="warning" title="Typesetting is not built yet">
          The upload and mark-final controls are built, but there is no file
          storage, so nothing is stored and no file listed can be opened.
          Typesetting is done outside the system and coordinated by email,
          quoting <span className="font-medium">{job.reference}</span>.
        </Alert>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const FORMATS: { id: GalleyFormat; detail: string; required: boolean }[] = [
  {
    id: "pdf",
    detail:
      "The version of record readers download. Laid out to the journal template, with the DOI and licence on the first page.",
    required: true,
  },
  {
    id: "xml",
    detail:
      "Full text and metadata in JATS. Required by indexing services and by the preservation archive; produced from the same source as the PDF.",
    required: true,
  },
  {
    id: "html",
    detail:
      "Full text rendered on the article page. Not produced yet — the public article pages show the abstract and link to the PDF.",
    required: false,
  },
  {
    id: "epub",
    detail: "Not produced by this journal.",
    required: false,
  },
];

function GalleyRow({ galley: g, isLatest }: { galley: ProductionGalley; isLatest: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        !isLatest && "border-dashed bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{g.filename}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {FORMAT_LABEL[g.format]} · version {g.version} · created{" "}
            {formatDate(g.createdAt)} ·{" "}
            {Math.round(g.sizeBytes / 1024).toLocaleString()} KB
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {g.isFinal && (
            <Badge variant="success" size="sm">
              Final
            </Badge>
          )}
          {isLatest ? (
            <Badge variant="brand" size="sm">
              Latest
            </Badge>
          ) : (
            <Badge variant="outline" size="sm">
              Superseded
            </Badge>
          )}
        </div>
      </div>

      {/* A dead download link is worse than none: it looks like the file is
          there. So the absence is stated instead. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          No file storage yet — this galley cannot be opened.
        </p>
        {isLatest && !g.isFinal && <MarkFinalButton filename={g.filename} />}
      </div>
    </div>
  );
}
