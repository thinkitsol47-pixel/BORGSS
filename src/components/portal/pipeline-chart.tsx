import Link from "next/link";
import { statusLabel } from "./status-badge";
import type { Submission, SubmissionStatus } from "@/types";

/**
 * Where the author's manuscripts sit in the process.
 *
 * A horizontal bar chart, one row per stage, deliberately in a **single hue**
 * with magnitude carried by bar length alone.
 *
 * Colour was tried first and rejected. The house rule is one hue (199°) with
 * only lightness varying, and running the palette validator over three steps
 * of that hue fails: pushed far enough apart to clear the normal-vision
 * separation floor, the dark step drops out of the usable lightness band and
 * reads grey. Since length already encodes the quantity, hue would have been
 * decoration carrying no information — so every bar is the same blue and the
 * count is printed on each row. Nothing here is colour-only.
 *
 * Stages an author has nothing in are still listed, greyed: "no manuscripts
 * under review" is information, and a chart whose rows appear and disappear
 * cannot be compared with last month's.
 */

/** The author's journey, in order. Terminal states are summarised below. */
const STAGES: { status: SubmissionStatus; href: string }[] = [
  { status: "submitted", href: "/submissions?status=submitted" },
  { status: "desk-review", href: "/submissions?status=desk-review" },
  { status: "under-review", href: "/submissions?status=under-review" },
  { status: "revision-requested", href: "/submissions?status=revision-requested" },
  { status: "accepted", href: "/submissions?status=accepted" },
  { status: "in-production", href: "/submissions?status=in-production" },
  { status: "published", href: "/submissions?status=published" },
];

export function PipelineChart({ submissions }: { submissions: Submission[] }) {
  const rows = STAGES.map((stage) => ({
    ...stage,
    label: statusLabel(stage.status),
    count: submissions.filter((s) => s.status === stage.status).length,
  }));

  const max = Math.max(1, ...rows.map((r) => r.count));
  const active = rows.reduce((sum, r) => sum + r.count, 0);

  const closed = submissions.filter((s) =>
    (["rejected", "desk-rejected", "withdrawn"] as SubmissionStatus[]).includes(
      s.status,
    ),
  ).length;

  return (
    <figure className="rounded-xl border p-5">
      <figcaption>
        <h3 className="font-serif text-base font-semibold">
          Where your manuscripts are
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {active} in progress
          {closed > 0 && ` · ${closed} closed`}
        </p>
      </figcaption>

      {active === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Nothing is currently in the process.
        </p>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {rows.map((row) => (
            <li key={row.status}>
              <Link
                href={row.href}
                aria-label={`${row.label}: ${row.count} ${row.count === 1 ? "manuscript" : "manuscripts"}`}
                className="group grid grid-cols-[6rem_1fr_1.5rem] items-center gap-3 rounded-md py-0.5 transition-colors hover:bg-brand-tint/30 xs:grid-cols-[8.5rem_1fr_1.5rem]"
              >
                <span
                  className={
                    row.count > 0
                      ? "truncate text-xs font-medium"
                      : "truncate text-xs text-muted-foreground"
                  }
                >
                  {row.label}
                </span>

                {/* Track plus bar. The 4px radius on the data end and the
                    baseline anchor at the left are the standard mark spec. */}
                <span
                  aria-hidden
                  className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className="block h-full rounded-r bg-brand transition-[width]"
                    style={{
                      width: row.count > 0 ? `${(row.count / max) * 100}%` : 0,
                    }}
                  />
                </span>

                <span
                  className={
                    row.count > 0
                      ? "text-right text-xs font-semibold tabular-nums"
                      : "text-right text-xs tabular-nums text-muted-foreground"
                  }
                >
                  {row.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
