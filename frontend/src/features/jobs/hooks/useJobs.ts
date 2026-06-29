'use client';

import { create } from 'zustand';
import type { Job, JobSearchParams, JobFilterParams } from '@/types/job';
import * as jobApi from '@/features/jobs/services/jobApi';
import { PAGINATION } from '@/lib/constants';

interface JobsStore {
  // State
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  searchParams: JobSearchParams;
  filterParams: JobFilterParams;
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax';
  nextToken: string | undefined;
  hasMore: boolean;

  // Actions
  fetchJobs: () => Promise<void>;
  searchJobs: () => Promise<void>;
  loadMore: () => Promise<void>;
  setSearchParams: (params: Partial<JobSearchParams>) => void;
  setFilterParams: (params: Partial<JobFilterParams>) => void;
  setSortBy: (sortBy: 'matchScore' | 'postedAt' | 'salaryMax') => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  // Initial state
  jobs: [],
  totalJobs: 0,
  currentPage: 1,
  totalPages: 0,
  loading: false,
  loadingMore: false,
  error: null,
  searchParams: {},
  filterParams: {},
  sortBy: 'matchScore',
  nextToken: undefined,
  hasMore: false,

  // Fetch jobs with current params (initial load)
  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const { currentPage, sortBy } = get();
      const result = await jobApi.getJobs(currentPage, PAGINATION.DEFAULT_LIMIT, sortBy);
      set({
        jobs: result.data,
        totalJobs: result.total,
        totalPages: result.totalPages,
        loading: false,
      });
    } catch {
      set({ error: 'Không thể tải danh sách việc làm', loading: false });
    }
  },

  // Search with current search + filter params using /jobs/search
  searchJobs: async () => {
    set({ loading: true, error: null, nextToken: undefined, hasMore: false });
    try {
      const { searchParams, filterParams, sortBy } = get();
      const result = await jobApi.searchJobs(
        { ...searchParams, nextToken: undefined },
        filterParams,
        sortBy
      );
      set({
        jobs: result.jobs,
        totalJobs: result.total,
        currentPage: 1,
        totalPages: 1,
        loading: false,
        nextToken: result.nextToken,
        hasMore: !!result.nextToken,
      });
    } catch {
      set({ error: 'Không thể tìm kiếm việc làm', loading: false });
    }
  },

  // Load more results using nextToken (cursor pagination)
  loadMore: async () => {
    const { nextToken, loadingMore, searchParams, filterParams, sortBy } = get();
    if (!nextToken || loadingMore) return;

    set({ loadingMore: true, error: null });
    try {
      const result = await jobApi.searchJobs(
        { ...searchParams, nextToken },
        filterParams,
        sortBy
      );
      set((state) => ({
        jobs: [...state.jobs, ...result.jobs],
        loadingMore: false,
        nextToken: result.nextToken,
        hasMore: !!result.nextToken,
      }));
    } catch {
      set({ error: 'Không thể tải thêm việc làm', loadingMore: false });
    }
  },

  setSearchParams: (params) => {
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
      currentPage: 1,
    }));
  },

  setFilterParams: (params) => {
    set((state) => ({
      filterParams: { ...state.filterParams, ...params },
      currentPage: 1,
    }));
  },

  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
  },

  setPage: (page) => {
    set((state) => ({
      currentPage: page,
      searchParams: { ...state.searchParams, page },
    }));
  },

  resetFilters: () => {
    set({
      searchParams: {},
      filterParams: {},
      sortBy: 'matchScore',
      currentPage: 1,
      nextToken: undefined,
      hasMore: false,
    });
  },
}));
