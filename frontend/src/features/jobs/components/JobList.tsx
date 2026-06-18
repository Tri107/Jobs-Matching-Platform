'use client';

import type { Job } from '@/types/job';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  favoriteIds: Set<string>;
  onToggleFavorite: (job: Job) => void;
  variant?: 'list' | 'grid';
  emptyMessage?: string;
}

export function JobList({
  jobs,
  loading,
  favoriteIds,
  onToggleFavorite,
  variant = 'list',
  emptyMessage = 'Không tìm thấy việc làm nào.',
}: JobListProps) {
  if (loading) {
    return <JobListSkeleton variant={variant} />;
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
        <div className="text-5xl">🔍</div>
        <p className="mt-4 text-base font-semibold text-slate-700">{emptyMessage}</p>
        <p className="mt-1 text-sm text-slate-500">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isFavorite={favoriteIds.has(job.id)}
            onToggleFavorite={onToggleFavorite}
            variant="grid"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isFavorite={favoriteIds.has(job.id)}
          onToggleFavorite={onToggleFavorite}
          variant="list"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton loading state
 */
function JobListSkeleton({ variant }: { variant: 'list' | 'grid' }) {
  const count = variant === 'grid' ? 8 : 5;

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
            <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5"
        >
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 rounded bg-slate-100" />
              <div className="h-4 w-1/4 rounded bg-slate-100" />
              <div className="flex gap-2">
                <div className="h-3 w-20 rounded bg-slate-100" />
                <div className="h-3 w-16 rounded bg-slate-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-slate-100" />
                <div className="h-6 w-20 rounded bg-slate-100" />
                <div className="h-6 w-14 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
