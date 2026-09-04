import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import {
  PRODUCTION_WAITING_LABEL,
  STAGE_LABEL,
  STAGE_ORDER,
  type ProductionWaitingOn,
} from "@/lib/api/production";
import type { ProductionStage } from "@/types";

/**
 * Filter bar for the production queue.
 *
 * A plain GET form, matching the editorial and author queues — shareable URLs
 * that work without JavaScript. The filters differ because the questions do:
 * production filters by *stage* rather than status, and searches by assignee,
 * which is what a production editor actually asks a queue.
 */

const WAITING_OPTIONS: ProductionWaitingOn[] = [
  "production",
  "author",
  "unassigned",
  "none",
];

export function ProductionFilters({
  q,
  stage,
  waiting,
  sort,
}: {
  q?: string;
  stage?: ProductionStage;
  waiting?: ProductionWaitingOn;
  sort?: string;
}) {
  const hasFilters = Boolean(q || stage || waiting);

  return (
    <form
      action="/production"
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
            placeholder="Reference, title or who is holding it"
            icon={<Search />}
            className="mt-1.5"
          />
        </div>

        <div className="sm:w-44">
          <label
            htmlFor="stage"
            className="block text-xs font-medium text-muted-foreground"
          >
            Stage
          </label>
          <Select
            id="stage"
            name="stage"
            defaultValue={stage ?? ""}
            className="mt-1.5"
          >
            <option value="">Any stage</option>
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s]}
              </option>
            ))}
          </Select>
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
                {PRODUCTION_WAITING_LABEL[w]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
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
            defaultValue={sort ?? "stalled"}
            className="mt-1.5"
          >
            <option value="stalled">Waiting longest</option>
            <option value="target">Target date</option>
            <option value="entered">Entered production</option>
            <option value="title">Title A–Z</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            Apply
          </Button>
          {hasFilters && (
            <Button
              href="/production"
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
