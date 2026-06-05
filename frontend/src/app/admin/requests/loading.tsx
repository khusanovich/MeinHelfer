import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />

      {/* Filter bar */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 border-t px-4 py-3">
            {[...Array(7)].map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
