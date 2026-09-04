import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/auth/require-role";
import { getProductionContext, stageRecord } from "@/lib/api/production";
import { ProductionHeader } from "@/components/portal/production-header";
import { StagePanel } from "@/components/portal/stage-panel";
import { StageActions } from "@/components/portal/production-actions";
import { Alert } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Copyediting" };

/**
 * The first production stage.
 *
 * A copyediting screen in a system with no file storage cannot show tracked
 * changes, so it does not pretend to. What it can honestly show is the state
 * of the stage, the files there are to work from, and the copyeditor's own
 * notes — which is what someone picking this up mid-job actually needs.
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
  const record = stageRecord(job, "copyedit");

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <ProductionHeader
        job={job}
        submission={submission}
        issue={issue}
        active="copyedit"
      />

      <div className="mt-8 max-w-4xl space-y-10">
        <StagePanel
          record={record}
          notStartedHint="Copyediting has not started. The accepted manuscript is below and is ready to be picked up."
        />

        <StageActions
          stage="copyedit"
          state={record.state}
          reference={job.reference}
        />

        {/* The author holding the copyedits is the state worth naming, because
            it is production doing nothing while the clock runs. */}
        {record.state === "with-author" && record.sentToAuthorAt && (
          <Alert tone="warning" title="With the author for approval">
            The copyedited manuscript went to{" "}
            <span className="font-medium">
              {submission.contributors.find((c) => c.isCorresponding)
                ?.givenName ?? "the corresponding author"}
            </span>{" "}
            on {formatDate(record.sentToAuthorAt)}. Nothing moves until they
            reply. Authors are asked to approve or query within two weeks;
            chasing is done by email.
          </Alert>
        )}

        {/* --------------------------------------------------- source files */}
        <section aria-labelledby="files-heading">
          <h2 id="files-heading" className="font-serif text-lg font-semibold">
            Files to work from
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The accepted manuscript and everything submitted with it. There is
            no file storage yet, so none of these can be opened or downloaded.
          </p>

          <ul className="mt-3 divide-y rounded-xl border">
            {submission.files.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.filename}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {f.kind.replace(/-/g, " ")} · uploaded{" "}
                    {formatDate(f.uploadedAt)}
                    {f.round > 0 && ` · revision ${f.round}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {Math.round(f.sizeBytes / 1024).toLocaleString()} KB
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------------ checklist */}
        <section aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="font-serif text-lg font-semibold">
            What copyediting covers
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Written out rather than left to habit, so the same things are
            checked whoever holds the job. This is a reference, not a form —
            nothing here is recorded.
          </p>
          <ul className="mt-3 divide-y rounded-xl border text-sm">
            {CHECKLIST.map((item) => (
              <li key={item.title} className="p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <Alert tone="warning" title="Copyediting is not built yet">
          The controls above are built, but there is no file storage and no
          database, so nothing is saved and nothing reaches the author.
          Copyediting is done in the document and coordinated by email,
          quoting{" "}
          <span className="font-medium">{job.reference}</span>.
        </Alert>
      </div>
    </div>
  );
}

/**
 * The house checklist.
 *
 * Deliberately short and specific. A twenty-point list is read once and then
 * ignored; these are the six things that actually come back from proofreading
 * when they are missed.
 */
const CHECKLIST = [
  {
    title: "References against the text",
    detail:
      "Every in-text citation appears in the list and vice versa. DOIs added where they exist.",
  },
  {
    title: "House style",
    detail:
      "British spelling, serial comma, en dashes in number ranges, and the journal's reference format.",
  },
  {
    title: "Tables and figures",
    detail:
      "Numbered in order of first mention, each with a self-contained caption. Abbreviations defined in the caption, not only in the text.",
  },
  {
    title: "Numbers and units",
    detail:
      "Totals in tables add up, percentages agree with the text, and units are consistent throughout.",
  },
  {
    title: "Required statements",
    detail:
      "Funding, competing interests, data availability, ethics approval and any AI disclosure are present — these are policy requirements, not optional front matter.",
  },
  {
    title: "Author names and affiliations",
    detail:
      "Spelling, order and ORCIDs match the accepted submission. Author order is a claim about contribution and is never tidied.",
  },
];
