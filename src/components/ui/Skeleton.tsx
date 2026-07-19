import { cn } from '@/utils/cn';
export const Skeleton = ({ className }: { className?: string }) => <div className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)} />;
export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="flex gap-4">{Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-9 flex-1" />)}</div>)}</div>
);
export const CardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 space-y-3">
    <Skeleton className="h-4 w-1/3" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-3 w-1/2" />
  </div>
);
