'use client';

import { Suspense } from 'react';
import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobSearchBar } from '@/features/jobs/components/JobSearchBar';
import { JobFilter } from '@/features/jobs/components/JobFilter';
import { JobList } from '@/features/jobs/components/JobList';
import { useJobsStore } from '@/features/jobs/hooks/useJobs';
import { useFavoritesStore } from '@/features/jobs/hooks/useFavorites';

function JobsContent() {
  const searchParams = useSearchParams();
  const {
    jobs,
    totalJobs,
    loading,
    loadingMore,
    filterParams,
    sortBy,
    hasMore,
    searchParams: storeSearchParams,
    setSearchParams,
    setFilterParams,
    setSortBy,
    searchJobs,
    loadMore,
    resetFilters,
  } = useJobsStore();

  // Only show results count when user has actively searched or filtered
  const isSearchActive =
    !!storeSearchParams.keyword?.trim() ||
    (!!storeSearchParams.location?.trim() && storeSearchParams.location !== 'Tất cả địa điểm') ||
    (filterParams.workType && filterParams.workType.length > 0) ||
    (filterParams.experience && filterParams.experience.length > 0) ||
    (filterParams.skills && filterParams.skills.length > 0);

  const { favoriteIds, toggleFavorite, fetchFavorites } = useFavoritesStore();

  // Track whether initial search has been done
  const initialSearchDone = useRef(false);

  // Initialize from URL params on mount
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

  // Auto-search when sortBy or filterParams change
  useEffect(() => {
    searchJobs();
    initialSearchDone.current = true;
  }, [searchJobs, filterParams, sortBy]);

  const handleSearch = useCallback(
    (params: { keyword: string; location: string; salaryMin: number; salaryMax: number }) => {
      setSearchParams({
        keyword: params.keyword,
        location: params.location,
        salaryMin: params.salaryMin,
        salaryMax: params.salaryMax,
      });
      // Need to call searchJobs after setting params
      // Small delay to let zustand update
      setTimeout(() => {
        useJobsStore.getState().searchJobs();
      }, 0);
    },
    [setSearchParams]
  );

  const handleFilterChange = useCallback(
    (params: Parameters<typeof setFilterParams>[0]) => {
      setFilterParams(params);
      // searchJobs will be auto-triggered by the useEffect watching filterParams
    },
    [setFilterParams]
  );

  const handleReset = useCallback(() => {
    resetFilters();
    setTimeout(() => {
      useJobsStore.getState().searchJobs();
    }, 0);
  }, [resetFilters]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      {/* Search Bar */}
      <div className="mb-6">
        <JobSearchBar onSearch={handleSearch} variant="compact" />
      </div>

      {/* Results header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isSearchActive ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Kết quả cho</span>
            {storeSearchParams.keyword?.trim() && (
              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                &ldquo;{storeSearchParams.keyword.trim()}&rdquo;
              </span>
            )}
            {storeSearchParams.location?.trim() && storeSearchParams.location !== 'Tất cả địa điểm' && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                📍 {storeSearchParams.location}
              </span>
            )}
            {filterParams.workType && filterParams.workType.length > 0 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                {filterParams.workType.join(', ')}
              </span>
            )}
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              Đang hiển thị <span className="font-semibold text-slate-700">{jobs.length}</span> việc làm
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Đang hiển thị <span className="font-semibold text-slate-700">{jobs.length}</span> việc làm
          </p>
        )}
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

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    Tải thêm việc làm
                  </>
                )}
              </button>
            </div>
          )}

          {/* No more results message */}
          {!hasMore && jobs.length > 0 && !loading && (
            <p className="mt-6 text-center text-sm text-slate-400">
              Đã hiển thị tất cả kết quả
            </p>
          )}
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
