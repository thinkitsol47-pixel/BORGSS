import { Skeleton, SkeletonText } from "@/components/ui";

/**
 * Shown the instant a portal link is clicked, inside the sidebar and topbar.
 *
 * Every portal page is rendered per request against the database, so a click
 * used to leave the old page on screen with no sign anything had happened
 * until the new one arrived. This boundary also lets Next prefetch each linked
 * page up to here, so the switch itself is immediate and only the data waits.
 */
export default function Loading() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <p role="status" className="sr-only">
        Loading…
      </p>
      <Skeleton className="h-8 w-56" />
      <SkeletonText lines={1} className="mt-3 max-w-md" />

      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-3 h-4 w-4/5" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
