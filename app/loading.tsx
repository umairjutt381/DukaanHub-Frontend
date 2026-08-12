import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-12 md:py-16" aria-label="Loading page" aria-live="polite">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-6 h-14 max-w-2xl" />
      <Skeleton className="mt-4 h-5 max-w-xl" />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[4/5]" />
            <Skeleton className="mt-4 h-3 w-20" />
            <Skeleton className="mt-3 h-5 w-4/5" />
            <Skeleton className="mt-4 h-6 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
