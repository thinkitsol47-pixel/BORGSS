import { Skeleton, SkeletonText } from "@/components/ui";

export default function Loading() {
  return (
    <div className="container py-8 md:py-10">
      <Skeleton className="h-3 w-40" />

      <div className="mt-4 border-b pb-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-9 w-56" />
        <SkeletonText lines={2} className="mt-4 max-w-2xl" />
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg border border-brand-border p-5"
            >
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-5 w-4/5" />
              <Skeleton className="mt-2 h-3.5 w-40" />
              <SkeletonText lines={2} className="mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
