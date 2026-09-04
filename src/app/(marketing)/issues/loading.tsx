import { Skeleton, SkeletonText } from "@/components/ui";

export default function Loading() {
  return (
    <div className="container py-8 md:py-10">
      <Skeleton className="h-3 w-32" />

      <div className="mt-4 border-b pb-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-9 w-48" />
        <SkeletonText lines={2} className="mt-4 max-w-2xl" />
        <div className="mt-6 flex gap-10">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Skeleton className="h-6 w-40" />
        <ul className="mt-5 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <li
              key={i}
              className="flex overflow-hidden rounded-lg border border-brand-border"
            >
              <Skeleton className="w-28 shrink-0 rounded-none sm:w-36" />
              <div className="flex-1 p-5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="mt-3 h-5 w-3/4" />
                <Skeleton className="mt-2 h-3.5 w-1/2" />
                <SkeletonText lines={3} className="mt-4" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
