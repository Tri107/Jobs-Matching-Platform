'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { JobList } from '@/features/jobs/components/JobList';
import { JobSearchBar } from '@/features/jobs/components/JobSearchBar';
import { useFavoritesStore } from '@/features/jobs/hooks/useFavorites';
import { getJobs } from '@/features/jobs/services/jobApi';
import type { Job } from '@/types/job';
import { HiArrowRight } from 'react-icons/hi2';

export function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const result = await getJobs(1, 50, 'postedAt');
    
    // Sort on client side to show latest jobs first
    const getJobTime = (job: Job): number => {
      const dateStr = job.postedAt;
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    
    const sorted = [...result.data].sort((a, b) => getJobTime(b) - getJobTime(a));
    setFeaturedJobs(sorted.slice(0, 12));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleSearch = (params: { keyword: string; location: string; salaryMin: number; salaryMax: number }) => {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.location && params.location !== 'Tất cả địa điểm') searchParams.set('location', params.location);
    window.location.href = `/jobs?${searchParams.toString()}`;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#111e2e] via-[#24354a] to-[#7e8e9f] px-4 py-20 text-white lg:py-24">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            Tìm việc làm, Tuyển dụng hiệu quả
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-sm text-slate-300 sm:text-base font-medium">
            Hệ thống AI phân tích hồ sơ và đề xuất cơ hội khớp nhất với bạn dựa trên kỹ năng và kinh nghiệm thực tế.
          </p>

          <div className="mt-10">
            <JobSearchBar onSearch={handleSearch} variant="hero" />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Việc làm mới nhất
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Các cơ hội nghề nghiệp mới nhất được cập nhật liên tục từ hệ thống
            </p>
          </div>
          <div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
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
      </section>
    </>
  );
}
