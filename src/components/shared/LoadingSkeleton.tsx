import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700',
            className,
          )}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
      <LoadingSkeleton className="mb-2 h-4 w-24" />
      <LoadingSkeleton className="h-8 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
