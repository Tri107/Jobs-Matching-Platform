'use client';

import { Suspense } from 'react';
import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobSearchBar } from '@/features/jobs/components/JobSearchBar';
import { JobFilter } from '@/features/jobs/components/JobFilter';
import { JobList } from '@/features/jobs/components/JobList';
import { Pagination } from '@/components/Pagination';
import { useJobsStore } from '@/features/jobs/hooks/useJobs';
import { useFavoritesStore } from '@/features/jobs/hooks/useFavorites';

function JobsContent() {
  const searchParams = useSearchParams();
  const {
    jobs,
    totalJobs,
    currentPage,
    totalPages,
    loading,
    filterParams,
    sortBy,
    setSearchParams,
    setFilterParams,
    setSortBy,
    setPage,
    searchJobs,
    resetFilters,
  } = useJobsStore();

  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();

  // Initialize from URL params
  useEffect(() => {
    const keyword = searchParams.get('keyword') ?? '';
    const location = searchParams.get('location') ?? '';
    if (keyword || location) {
      setSearchParams({ keyword, location });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    searchJobs();
  }, [searchJobs, currentPage, filterParams, sortBy]);

  const handleSearch = useCallback(
    (params: { keyword: string; location: string; salaryMin: number; salaryMax: number }) => {
      setSearchParams({
        keyword: params.keyword,
        location: params.location,
        salaryMin: params.salaryMin,
        salaryMax: params.salaryMax,
        page: 1,
      });
      searchJobs();
    },
    [setSearchParams, searchJobs]
  );

  const handleFilterChange = useCallback(
    (params: Parameters<typeof setFilterParams>[0]) => {
      setFilterParams(params);
    },
    [setFilterParams]
  );

  const handleReset = useCallback(() => {
    resetFilters();
    searchJobs();
  }, [resetFilters, searchJobs]);

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPage]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      {/* Search Bar */}
      <div className="mb-6">
        <JobSearchBar onSearch={handleSearch} variant="compact" />
      </div>

      {/* Results header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Tìm thấy{' '}
          <span className="font-bold text-blue-600">{totalJobs}</span> việc làm
          phù hợp
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 outline-none"
          >
            <option value="matchScore">Gợi ý từ AI</option>
            <option value="postedAt">Mới nhất</option>
            <option value="salaryMax">Lương cao nhất</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filter Sidebar */}
        <JobFilter
          filters={filterParams}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Job List */}
        <div className="min-w-0 flex-1">
          <JobList
            jobs={jobs}
            loading={loading}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            variant="list"
          />

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalJobs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-14 rounded-2xl bg-slate-100" />
            <div className="flex gap-6">
              <div className="hidden h-96 w-72 rounded-2xl bg-slate-100 lg:block" />
              <div className="flex-1 space-y-4">
                <div className="h-32 rounded-2xl bg-slate-100" />
                <div className="h-32 rounded-2xl bg-slate-100" />
                <div className="h-32 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
