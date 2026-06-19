interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'detail' | 'table';
  count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg bg-white p-4">
            <div className="h-4 w-20 rounded bg-slate-100" />
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-4 flex-1 rounded bg-slate-100" />
            <div className="h-8 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="animate-pulse space-y-6">
        <div className="rounded-2xl bg-white p-6 border border-slate-100">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-2/3 rounded bg-slate-100" />
              <div className="h-5 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-4/6 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-slate-100" />
              <div className="h-4 w-1/4 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-slate-100" />
                <div className="h-6 w-20 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
