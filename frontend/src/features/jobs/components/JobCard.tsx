'use client';

import Link from 'next/link';
import type { Job } from '@/types/job';
import { formatSalaryRange } from '@/features/jobs/utils/formatSalary';
import { formatRelativeDate } from '@/features/jobs/utils/formatDate';
import { MatchBadge } from './MatchBadge';
import { HiOutlineHeart, HiHeart, HiOutlineMapPin, HiOutlineClock } from 'react-icons/hi2';

interface JobCardProps {
  job: Job;
  isFavorite: boolean;
  onToggleFavorite: (job: Job) => void;
  variant?: 'list' | 'grid';
}

export function JobCard({ job, isFavorite, onToggleFavorite, variant = 'list' }: JobCardProps) {
  if (variant === 'grid') {
    return <JobCardGrid job={job} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />;
  }

  return (
    <div className="group relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="block truncate text-base font-bold text-slate-900 transition-colors hover:text-blue-600"
            >
              {job.title}
            </Link>
            <p className="mt-0.5 text-sm text-slate-500">{formatSalaryRange(job.salaryMin, job.salaryMax)}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">{job.company}</p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              Ứng tuyển ngay
            </Link>
            <button
              type="button"
              onClick={() => onToggleFavorite(job)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${isFavorite
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'
                }`}
            >
              {isFavorite ? (
                <HiHeart className="h-4 w-4" />
              ) : (
                <HiOutlineHeart className="h-4 w-4" />
              )}
              Lưu
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <HiOutlineMapPin className="h-4 w-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <HiOutlineClock className="h-4 w-4" />
            {formatRelativeDate(job.postedAt)}
          </span>
          <MatchBadge score={job.matchScore} />
        </div>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid variant for homepage featured jobs
 */
function JobCardGrid({ job, isFavorite, onToggleFavorite }: Omit<JobCardProps, 'variant'>) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      {/* Match badge */}
      {job.matchScore >= 70 && (
        <div className="absolute right-3 top-3">
          <MatchBadge score={job.matchScore} size="sm" />
        </div>
      )}

      {/* Title */}
      <div className="flex items-start gap-3 w-full">
        <div className="min-w-0 flex-1">
          <Link
            href={`/jobs/${job.id}`}
            className="block truncate text-sm font-bold text-slate-900 transition-colors hover:text-blue-600"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-slate-500">{job.company}</p>
        </div>
      </div>



      {/* Location */}
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <HiOutlineMapPin className="h-3.5 w-3.5" />
        <span className="truncate">{job.location}</span>
      </div>

      {/* Favorite button */}
      <button
        type="button"
        onClick={() => onToggleFavorite(job)}
        className="absolute bottom-3 right-3 text-slate-300 transition-colors hover:text-red-400"
      >
        {isFavorite ? (
          <HiHeart className="h-5 w-5 text-red-500" />
        ) : (
          <HiOutlineHeart className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
