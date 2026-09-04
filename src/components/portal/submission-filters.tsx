import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { AUTHOR_FILTER_STATUSES, statusLabel } from "./status-badge";
import type { SubmissionStatus } from "@/types";

/**
 * Filter bar for the author's submission list.
 *
 * A plain GET form, so the result is a shareable URL and the page works with
 * JavaScript disabled — the same convention the public search and article
 * filters already follow. Submitting drops the `page` parameter, because
 * staying on page 3 of a filter you just changed shows nothing.
 */
export function SubmissionFilters({
  q,
  status,
  sort,
  action,
}: {
  q?: string;
  status?: SubmissionStatus;
  sort?: string;
  /** Where the form posts — the current list route. */
  action: string;
}) {
  const hasFilters = Boolean(q || status);

  return (
    <form
      action={action}
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
            placeholder="Reference, title or keyword"
            icon={<Search />}
            className="mt-1.5"
          />
        </div>

        <div className="sm:w-52">
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
            {AUTHOR_FILTER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
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
            defaultValue={sort ?? "newest"}
            className="mt-1.5"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="updated">Recently updated</option>
            <option value="title">Title A–Z</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            Apply
          </Button>
          {hasFilters && (
            <Button href={action} variant="outline" className="flex-1 sm:flex-none">
              Clear
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
