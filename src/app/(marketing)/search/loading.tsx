import { Skeleton, SkeletonText } from "@/components/ui";

export default function Loading() {
  return (
    <div className="container py-8 md:py-10">
      <Skeleton className="h-3 w-28" />

      <div className="mt-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-3 h-9 w-64" />
        <SkeletonText lines={2} className="mt-4 max-w-2xl" />
        <Skeleton className="mt-6 h-11 max-w-3xl" />
      </div>

      <div className="mt-8 grid gap-10 border-t pt-8 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-lg border border-brand-border p-5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-3 h-5 w-5/6" />
              <Skeleton className="mt-2 h-3.5 w-40" />
              <SkeletonText lines={2} className="mt-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
