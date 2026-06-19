'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { JobList } from '@/features/jobs/components/JobList';
import { JobSearchBar } from '@/features/jobs/components/JobSearchBar';
import { Pagination } from '@/components/Pagination';
import { useFavoritesStore } from '@/features/jobs/hooks/useFavorites';
import { getJobs } from '@/features/jobs/services/jobApi';
import type { Job } from '@/types/job';
import { PAGINATION } from '@/lib/constants';
import { HiChevronLeft, HiChevronRight, HiArrowRight } from 'react-icons/hi2';

export function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const loadJobs = useCallback(async (page: number) => {
    setLoading(true);
    const result = await getJobs(page, PAGINATION.HOME_LIMIT, 'matchScore');
    setFeaturedJobs(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs(currentPage);
  }, [currentPage, loadJobs]);

  const handleSearch = (params: { keyword: string; location: string; salaryMin: number; salaryMax: number }) => {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.location && params.location !== 'Tất cả địa điểm') searchParams.set('location', params.location);
    window.location.href = `/jobs?${searchParams.toString()}`;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 py-16 text-white lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_40%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            AI Match - Tìm việc làm, Tuyển dụng{' '}
            <span className="text-blue-200">hiệu quả</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
            Hệ thống AI phân tích hồ sơ và đề xuất cơ hội khớp nhất với bạn dựa
            trên kỹ năng và kinh nghiệm thực tế.
          </p>

          <div className="mt-8">
            <JobSearchBar onSearch={handleSearch} variant="hero" />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Việc làm tốt nhất dành cho bạn
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Gợi ý thông minh dựa trên hồ sơ và kỹ năng của bạn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <HiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <HiChevronRight className="h-4 w-4" />
            </button>
            <Link
              href="/jobs"
              className="ml-4 hidden items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 sm:flex"
            >
              Xem tất cả
              <HiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <JobList
            jobs={featuredJobs}
            loading={loading}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            variant="grid"
          />
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </>
  );
}
