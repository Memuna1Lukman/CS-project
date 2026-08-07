function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-[var(--surface-2)] ${className}`} />;
}

export function CourseGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading courses" role="status">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl bg-[var(--surface)] p-4 shadow-[0_1px_3px_var(--shadow)]">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="mt-5 h-5 w-4/5" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-6 h-7 w-24" />
        </div>
      ))}
      <span className="sr-only">Loading courses</span>
    </div>
  );
}

export function ResourceListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" aria-label="Loading resources" role="status">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl bg-[var(--surface)] px-3.5 py-3 shadow-[0_1px_3px_var(--shadow)]">
          <Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
          <div className="flex-1"><Skeleton className="h-4 w-2/5" /><Skeleton className="mt-2 h-3 w-1/4" /></div>
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading resources</span>
    </div>
  );
}

export function AdminCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Loading admin overview" role="status">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-2xl bg-[var(--surface)] p-4 shadow-[0_1px_3px_var(--shadow)]">
          <Skeleton className="h-3 w-2/3" /><Skeleton className="mt-3 h-7 w-1/2" />
        </div>
      ))}
      <span className="sr-only">Loading admin overview</span>
    </div>
  );
}
