import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { ROLE_LABELS, ROLES, type Role } from "@/config/roles";
import type { AccountStatus } from "@/types";

/**
 * Filter bar for the account directory.
 *
 * A plain GET form, matching every other list in the portal — shareable URLs
 * that work without JavaScript.
 *
 * The role filter lists **all twelve roles**, including the two this
 * administrator may not grant. Filtering by a role and granting it are
 * different powers: an admin who cannot promote anyone to `superAdmin` still
 * needs to see who holds it.
 */

const STATUSES: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "suspended", label: "Suspended" },
];

export function UserFilters({
  q,
  role,
  status,
  sort,
}: {
  q?: string;
  role?: Role;
  status?: AccountStatus;
  sort?: string;
}) {
  const hasFilters = Boolean(q || role || status);

  return (
    <form
      action="/admin/users"
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
            placeholder="Name, email or institution"
            icon={<Search />}
            className="mt-1.5"
          />
        </div>

        <div className="sm:w-52">
          <label
            htmlFor="role"
            className="block text-xs font-medium text-muted-foreground"
          >
            Role
          </label>
          <Select
            id="role"
            name="role"
            defaultValue={role ?? ""}
            className="mt-1.5"
          >
            <option value="">Any role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-44">
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
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
            defaultValue={sort ?? "name"}
            className="mt-1.5"
          >
            <option value="name">Name A–Z</option>
            <option value="recent">Recently active</option>
            <option value="created">Newest account</option>
            <option value="roles">Most roles</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-none">
            Apply
          </Button>
          {hasFilters && (
            <Button
              href="/admin/users"
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
