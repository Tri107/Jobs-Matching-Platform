/**
 * Jobs feature-specific types for state management
 */

import type { Job, JobSearchParams, JobFilterParams } from '@/types/job';

export interface JobsState {
  jobs: Job[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  searchParams: JobSearchParams;
  filterParams: JobFilterParams;
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax';
}

export interface JobDetailState {
  job: Job | null;
  loading: boolean;
  error: string | null;
}

export interface FavoritesState {
  favoriteIds: Set<string>;
  favoriteJobs: Job[];
  loading: boolean;
}
