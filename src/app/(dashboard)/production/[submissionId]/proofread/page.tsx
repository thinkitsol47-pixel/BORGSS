import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCheck, ListChecks } from "lucide-react";
import { requireGroup } from "@/lib/auth/require-role";
import {
  currentStage,
  getProductionContext,
  stageRecord,
} from "@/lib/api/production";
import { ProductionHeader } from "@/components/portal/production-header";
import { StagePanel } from "@/components/portal/stage-panel";
import {
  AddCorrectionButton,
  CorrectionActions,
  StageActions,
} from "@/components/portal/production-actions";
import { Alert, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProofCorrection } from "@/types";

export const metadata: Metadata = { title: "Proofreading" };

const RAISED_BY_LABEL: Record<ProofCorrection["raisedBy"], string> = {
  author: "Author",
  proofreader: "Proofreader",
  copyeditor: "Copyeditor",
};

const STATE_TONE: Record<
  ProofCorrection["state"],
  { label: string; className: string }
> = {
  open: { label: "Open", className: "border-warning/40 bg-warning/10 text-warning" },
  applied: {
    label: "Applied",
    className: "border-success/30 bg-success/10 text-success",
  },
  rejected: {
    label: "Not applied",
    className: "border-border-strong bg-background text-muted-foreground",
  },
};

/**
 * The last production stage, and the one that needs a real record.
 *
 * Corrections are tracked individually rather than as a "proofs returned"
 * flag, because the question at the end of proofreading is never "is it done"
 * but "which of these were actually applied". An author who reported five and
 * sees three fixed will write to the editorial office; the answer has to exist
 * somewhere, and a rejected correction without a stated reason is the failure
 * this screen is shaped around.
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
  const record = stageRecord(job, "proofread");
  const galleysStage = stageRecord(job, "galleys");

  const open = job.corrections.filter((c) => c.state === "open");
  const applied = job.corrections.filter((c) => c.state === "applied");
  const rejected = job.corrections.filter((c) => c.state === "rejected");

  // Open first: they are the ones stopping this manuscript being finished.
  const ordered = [...open, ...applied, ...rejected];

  const allStagesDone = currentStage(job) === null;

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <ProductionHeader
        job={job}
        submission={submission}
        issue={issue}
        active="proofread"
      />

      <div className="mt-8 max-w-4xl space-y-10">
        {galleysStage.state !== "done" && (
          <Alert tone="info" title="There is no final galley yet">
            Proofreading checks the typeset galley against the accepted
            manuscript, so it normally waits for typesetting to finish.{" "}
            <Link
              href={`/production/${submission.id}/galleys`}
              className="font-medium underline"
            >
              Go to typesetting
            </Link>
            .
          </Alert>
        )}

        <StagePanel
          record={record}
          notStartedHint="Proofreading has not started. It begins once there is a galley to check against the accepted manuscript."
        />

        <StageActions
          stage="proofread"
          state={record.state}
          reference={job.reference}
        />

        {/* The finish line is stated only when it is true — and even then it
            says what remains, because "ready to publish" is a claim. */}
        {allStagesDone && open.length === 0 && (
          <Alert tone="success" title="All three stages are complete">
            Every correction has been resolved and no stage is outstanding. The
            manuscript is ready to be published into its issue. Publishing
            itself is not built — see the issue screen for what is scheduled.
          </Alert>
        )}

        {open.length > 0 && (
          <Alert
            tone="warning"
            title={`${open.length} correction${open.length === 1 ? "" : "s"} still open`}
          >
            An open correction is a change nobody has decided about yet. The
            manuscript cannot be published until each one is either applied or
            declined with a reason.
          </Alert>
        )}

        {/* --------------------------------------------------- corrections */}
        <section aria-labelledby="corrections-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2
              id="corrections-heading"
              className="font-serif text-lg font-semibold"
            >
              Proof corrections
            </h2>
            {job.corrections.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {applied.length} applied · {rejected.length} not applied ·{" "}
                <span
                  className={open.length > 0 ? "font-medium text-warning" : ""}
                >
                  {open.length} open
                </span>
              </p>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every correction raised on the proof, whoever raised it, and what
            became of it. Declined corrections stay on the list with their
            reason — a correction that simply disappears is what an author
            chases the editorial office about.
          </p>

          <div className="mt-4">
            <AddCorrectionButton />
          </div>

          {job.corrections.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                icon={ListChecks}
                title="No corrections raised"
                description="Nothing has been reported on this proof. That is normal before the galley has gone to the author."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {ordered.map((c) => (
                <li key={c.id}>
                  <CorrectionRow correction={c} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ----------------------------------------------------- checklist */}
        <section aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="font-serif text-lg font-semibold">
            What proofreading checks
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Proofreading compares the galley against the accepted manuscript. It
            is not a second copyedit and it is not an opportunity to revise: a
            change that alters what the reviewers accepted belongs in a
            correction notice after publication, not on a proof.
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

        <Alert tone="warning" title="Proofreading is not built yet">
          The controls are built, but nothing they do is saved — there is no
          database and no file storage. Proofs are circulated by email in the
          meantime, quoting{" "}
          <span className="font-medium">{job.reference}</span>.
        </Alert>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function CorrectionRow({ correction: c }: { correction: ProofCorrection }) {
  const tone = STATE_TONE[c.state];

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        c.state === "open" && "border-warning/40 bg-warning/5",
        c.state === "rejected" && "border-dashed bg-muted/20",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{c.location}</p>
          <p className="mt-1 text-sm leading-relaxed">{c.description}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            tone.className,
          )}
        >
          {tone.label}
        </span>
      </div>

      <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
        Raised by {RAISED_BY_LABEL[c.raisedBy]} on {formatDate(c.raisedAt)}
      </p>

      {c.state === "open" && <CorrectionActions location={c.id} />}

      {/* A refusal always carries its reason. Where one is missing, the gap is
          named rather than rendering an empty block — the missing reason is
          itself the thing to fix. */}
      {c.state === "rejected" && (
        <div className="mt-3 rounded-lg border p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why it was not applied
          </h3>
          {c.resolution ? (
            <p className="mt-1.5 text-sm leading-relaxed">{c.resolution}</p>
          ) : (
            <p className="mt-1.5 text-sm font-medium text-warning">
              No reason was recorded. One is required before publication.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const CHECKLIST = [
  {
    title: "Galley against accepted manuscript",
    detail:
      "Word for word in the abstract, all headings, every number in the tables, and the reference list. Typesetting can drop a line without any visible sign.",
  },
  {
    title: "Figures and tables",
    detail:
      "Present, in order, right way up, legible at print resolution, and matching their captions and the text that refers to them.",
  },
  {
    title: "Front and back matter",
    detail:
      "Author names, affiliations, ORCIDs, corresponding address, funding, competing interests, data availability and licence statement.",
  },
  {
    title: "Identifiers",
    detail:
      "DOI, volume, issue and page range. The journal has no Crossref prefix yet, so the DOI shown is a placeholder — check it against the register rather than assuming it resolves.",
  },
  {
    title: "Not a revision",
    detail:
      "New claims, added citations and rewritten passages are refused at this stage and offered as a post-publication correction instead. Say so to the author with the reason.",
  },
];
