'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Job } from '@/types/job';
import { getJobById } from '@/features/jobs/services/jobApi';
import { formatSalaryRange } from '@/features/jobs/utils/formatSalary';
import { MatchBadge } from './MatchBadge';
import { useFavoritesStore } from '@/features/jobs/hooks/useFavorites';
import {
  HiOutlineMapPin,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineHeart,
  HiHeart,
  HiArrowLeft,
  HiOutlineDocumentArrowUp,
  HiOutlineFaceFrown,
} from 'react-icons/hi2';

interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();
  const isFavorite = favoriteIds.has(jobId);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    setLoading(true);
    getJobById(jobId).then((data) => {
      setJob(data);
      setLoading(false);
    });
  }, [jobId]);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <HiOutlineFaceFrown className="h-10 w-10 text-slate-400" />
        </div>
        <p className="mt-4 text-lg font-semibold text-slate-700">
          Không tìm thấy công việc này
        </p>
        <Link
          href="/jobs"
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <HiArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <HiOutlineBriefcase className="h-4 w-4" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineMapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {job.workType === 'Fulltime' ? 'Full-time' : job.workType}
              </span>
              {job.workType === 'Hybrid' && (
                <span className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  Hybrid
                </span>
              )}
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <HiOutlineClock className="mr-1 inline h-3.5 w-3.5" />
                {job.experience === 'under-1'
                  ? 'Dưới 1 năm'
                  : job.experience === '5+'
                    ? '5+ năm kinh nghiệm'
                    : `${job.experience} năm kinh nghiệm`}
              </span>
              <MatchBadge score={job.matchScore} size="md" />
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-900">Mô tả công việc</h2>
              <p className="mt-3 leading-7 text-slate-600 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-bold text-slate-900">Yêu cầu công việc</h2>
                <ul className="mt-3 space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span className="leading-6">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-bold text-slate-900">Quyền lợi</h2>
                <ul className="mt-3 space-y-2">
                  {job.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span className="leading-6">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-bold text-slate-900">Kỹ năng yêu cầu</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full shrink-0 space-y-4 lg:w-72">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
            >
              Ứng tuyển ngay ▶
            </button>

            <button
              type="button"
              onClick={() => job && toggleFavorite(job)}
              className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all ${isFavorite
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-600'
                }`}
            >
              {isFavorite ? (
                <HiHeart className="h-5 w-5" />
              ) : (
                <HiOutlineHeart className="h-5 w-5" />
              )}
              {isFavorite ? 'Đã lưu tin' : 'Lưu tin tuyển dụng'}
            </button>

            <Link
              href="/upload-cv"
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
            >
              <HiOutlineDocumentArrowUp className="h-5 w-5" />
              Đánh giá CV theo công việc
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-6 h-4 w-32 rounded bg-slate-100" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-2/3 rounded bg-slate-100" />
              <div className="h-5 w-1/3 rounded bg-slate-100" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-5 w-1/4 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-5 w-1/4 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
          </div>
        </div>
        <div className="w-full shrink-0 lg:w-72">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
