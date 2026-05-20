import { cn } from "@/lib/utils";

interface Props { className?: string; count?: number; }

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-3 animate-fade-up">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="p-4 border-b border-border flex gap-4">
        {[40, 25, 20, 15].map((w, i) => (
          <Skeleton key={i} className={`h-4`} style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-border last:border-0 flex gap-4">
          {[40, 25, 20, 15].map((w, j) => (
            <Skeleton key={j} className="h-3" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
