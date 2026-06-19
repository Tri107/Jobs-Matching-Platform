/**
 * Mock API service for Jobs feature
 * All functions simulate API calls with setTimeout
 * TODO: Replace with AWS API Gateway endpoints
 */

import type { Job, JobSearchParams, JobFilterParams } from '@/types/job';
import type { PaginatedResponse } from '@/types/common';
import { mockJobs } from '@/mock/jobs';
import { PAGINATION } from '@/lib/constants';

const MOCK_DELAY = 500;

function delay<T>(data: T, ms: number = MOCK_DELAY): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

/**
 * Get paginated list of jobs
 * TODO: Replace with AWS API Gateway endpoint GET /jobs
 */
export async function getJobs(
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax' = 'matchScore'
): Promise<PaginatedResponse<Job>> {
  const sorted = [...mockJobs].sort((a, b) => {
    if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
    if (sortBy === 'salaryMax') return b.salaryMax - a.salaryMax;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const start = (page - 1) * limit;
  const end = start + limit;
  const data = sorted.slice(start, end);

  return delay({
    data,
    total: mockJobs.length,
    page,
    limit,
    totalPages: Math.ceil(mockJobs.length / limit),
  });
}

/**
 * Get single job by ID
 * TODO: Replace with AWS API Gateway endpoint GET /jobs/:id
 */
export async function getJobById(id: string): Promise<Job | null> {
  const job = mockJobs.find((j) => j.id === id) ?? null;
  return delay(job);
}

/**
 * Search and filter jobs
 * TODO: Replace with AWS API Gateway endpoint GET /jobs/search
 */
export async function searchJobs(
  searchParams: JobSearchParams,
  filterParams: JobFilterParams,
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax' = 'matchScore'
): Promise<PaginatedResponse<Job>> {
  let filtered = [...mockJobs];

  // Apply search
  if (searchParams.keyword) {
    const kw = searchParams.keyword.toLowerCase();
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(kw) ||
        job.company.toLowerCase().includes(kw) ||
        job.skills.some((s) => s.toLowerCase().includes(kw))
    );
  }

  if (searchParams.location && searchParams.location !== 'Tất cả địa điểm') {
    filtered = filtered.filter((job) => job.location === searchParams.location);
  }

  if (searchParams.salaryMin !== undefined) {
    filtered = filtered.filter((job) => job.salaryMax >= (searchParams.salaryMin ?? 0));
  }

  if (searchParams.salaryMax !== undefined && searchParams.salaryMax !== Infinity) {
    filtered = filtered.filter((job) => job.salaryMin <= (searchParams.salaryMax ?? Infinity));
  }

  // Apply filters
  if (filterParams.experience && filterParams.experience.length > 0) {
    filtered = filtered.filter((job) =>
      filterParams.experience!.includes(job.experience)
    );
  }

  if (filterParams.skills && filterParams.skills.length > 0) {
    filtered = filtered.filter((job) =>
      job.skills.some((s) => filterParams.skills!.includes(s))
    );
  }

  if (filterParams.workType && filterParams.workType.length > 0) {
    filtered = filtered.filter((job) =>
      filterParams.workType!.includes(job.workType)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
    if (sortBy === 'salaryMax') return b.salaryMax - a.salaryMax;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const page = searchParams.page ?? PAGINATION.DEFAULT_PAGE;
  const limit = searchParams.limit ?? PAGINATION.DEFAULT_LIMIT;
  const start = (page - 1) * limit;
  const end = start + limit;

  return delay({
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  });
}

/**
 * Save a job to favorites
 * TODO: Replace with AWS API Gateway endpoint POST /favorites
 */
export async function saveJob(jobId: string): Promise<{ success: boolean }> {
  const job = mockJobs.find((j) => j.id === jobId);
  if (job) job.saved = true;
  return delay({ success: true });
}

/**
 * Remove a job from favorites
 * TODO: Replace with AWS API Gateway endpoint DELETE /favorites/:id
 */
export async function removeSavedJob(jobId: string): Promise<{ success: boolean }> {
  const job = mockJobs.find((j) => j.id === jobId);
  if (job) job.saved = false;
  return delay({ success: true });
}

/**
 * Get all saved/favorite jobs
 * TODO: Replace with AWS API Gateway endpoint GET /favorites
 */
export async function getFavoriteJobs(): Promise<Job[]> {
  const favorites = mockJobs.filter((j) => j.saved);
  return delay(favorites);
}

/**
 * Get AI-matched jobs (sorted by matchScore desc)
 * TODO: Replace with AWS API Gateway endpoint GET /matching/jobs
 */
export async function getMatchingJobs(): Promise<Job[]> {
  const matched = [...mockJobs]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);
  return delay(matched);
}
