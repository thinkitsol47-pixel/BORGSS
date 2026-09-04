import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { statusLabel } from "./status-badge";
import { WAITING_ON_LABEL, type WaitingOn } from "@/lib/api/editorial";
import type { SubmissionStatus } from "@/types";

/**
 * Filter bar for the editorial queue.
 *
 * A plain GET form, like the author's — the result is a shareable URL and it
 * works without JavaScript. Two filters the author's bar does not have:
 * section, because a section editor works one section at a time, and
 * "waiting on", which is the question this queue exists to answer.
 */

/** Statuses an editor filters by. Drafts are not visible to editors at all. */
const QUEUE_STATUSES: SubmissionStatus[] = [
  "submitted",
  "desk-review",
  "under-review",
  "awaiting-decision",
  "revision-requested",
  "revision-submitted",
  "accepted",
  "in-production",
  "published",
  "desk-rejected",
  "rejected",
  "withdrawn",
];

const WAITING_OPTIONS: WaitingOn[] = [
  "editor",
  "reviewers",
  "author",
  "production",
];

export function QueueFilters({
  q,
  status,
  section,
  waiting,
  sort,
  sections,
}: {
  q?: string;
  status?: SubmissionStatus;
  section?: string;
  waiting?: WaitingOn;
  sort?: string;
  sections: string[];
}) {
  const hasFilters = Boolean(q || status || section || waiting);

  return (
    <form
      action="/editorial/queue"
      method="get"
      className="rounded-xl border border-brand-border bg-brand-tint/20 p-3 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="q"
            className="block text-xs font-medium text-muted-foreground"
          >
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Reference, title, author or keyword"
            icon={<Search />}
            className="mt-1.5"
          />
        </div>

        <div className="sm:w-44">
          <label
            htmlFor="waitingOn"
            className="block text-xs font-medium text-muted-foreground"
          >
            Waiting on
          </label>
          <Select
            id="waitingOn"
            name="waitingOn"
            defaultValue={waiting ?? ""}
            className="mt-1.5"
          >
            <option value="">Anyone</option>
            {WAITING_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {WAITING_ON_LABEL[w]}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:w-48">
          <label
            htmlFor="status"
            className="block text-xs font-medium text-muted-foreground"
          >
            Status
          </label>
          <Select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="mt-1.5"
          >
            <option value="">Any status</option>
            {QUEUE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label
            htmlFor="section"
            className="block text-xs font-medium text-muted-foreground"
          >
            Section
          </label>
          <Select
            id="section"
            name="section"
            defaultValue={section ?? ""}
            className="mt-1.5"
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:w-48">
          <label
            htmlFor="sort"
            className="block text-xs font-medium text-muted-foreground"
          >
            Sort by
          </label>
          <Select
            id="sort"
            name="sort"
            defaultValue={sort ?? "waiting"}
            className="mt-1.5"
          >
            <option value="waiting">Waiting longest</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            Apply
          </Button>
          {hasFilters && (
            <Button
              href="/editorial/queue"
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
