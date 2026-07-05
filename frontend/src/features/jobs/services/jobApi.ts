/**
 * API service for Jobs feature integrated with AWS API Gateway & DynamoDB
 */

import type { Job, JobSearchParams, JobFilterParams, DynamoJobItem, ApiSortType, SearchApiResponse } from '@/types/job';
import type { PaginatedResponse } from '@/types/common';
import { PAGINATION } from '@/lib/constants';
import { getIdToken } from '@/features/auth/services/cognitoAuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function getRequiredIdToken(): Promise<SavedJobResult & { token?: string }> {
  try {
    const token = await getIdToken();
    return token ? { success: true, token } : { success: false, requiresAuth: true };
  } catch {
    return { success: false, requiresAuth: true };
  }
}

/** Map frontend sortBy to API sort enum */
function mapSortToApi(sortBy: string): ApiSortType {
  switch (sortBy) {
    case 'postedAt':
      return 'latest';
    case 'salaryMax':
      return 'posted_at_asc'; // closest available alternative
    default:
      return 'relevance';
  }
}

// Helper to map DynamoDB attributes to frontend Job interface
function mapDynamoJobToFrontendJob(item: DynamoJobItem): Job {
  const getWorkType = (): Job['workType'] => {
    const rawType = item.scheduleType;
    if (rawType === 'Toàn thời gian' || rawType === 'Fulltime') return 'Fulltime';
    if (rawType === 'Bán thời gian' || rawType === 'Part-time') return 'Part-time';
    if (rawType === 'Làm việc từ xa' || rawType === 'Remote') return 'Remote';
    if (rawType === 'Hybrid') return 'Hybrid';
    return 'Fulltime';
  };

  return {
    id: item.jobId || '',
    title: item.originalTitle || item.title || 'Unknown Title',
    company: item.companyName || 'Unknown Company',
    location: item.location || 'Việt Nam',
    salaryMin: 0,
    salaryMax: 0,
    experience: 'under-1',
    workType: getWorkType(),
    skills: [],
    description: item.description || '',
    requirements: [],
    benefits: [],
    matchScore: 0,
    postedAt: item.postedAt || item.originalPostedAt || item.createdAt || new Date().toISOString(),
    saved: false,
    logo: item.thumbnail || '💻',
    sourceLink: item.sourceLink,
  };
}

/**
 * Get paginated list of jobs from DynamoDB
 */
export async function getJobs(
  page: number = PAGINATION.DEFAULT_PAGE,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax' = 'matchScore'
): Promise<PaginatedResponse<Job>> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }
    const response = await fetch(`${API_BASE_URL}/jobs?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const items = (result.items || []).map(mapDynamoJobToFrontendJob);

    return {
      data: items,
      total: result.count || items.length,
      page,
      limit,
      totalPages: Math.ceil((result.count || items.length) / limit),
    };
  } catch (error) {
    console.error("Failed to fetch jobs from API", error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

/**
 * Get single job by ID from DynamoDB
 */
export async function getJobById(id: string): Promise<Job | null> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (response.ok) {
      const item: DynamoJobItem = await response.json();
      return mapDynamoJobToFrontendJob(item);
    }
  } catch (error) {
    console.error("Failed to fetch job detail from API", error);
  }

  return null;
}

/**
 * Search result that includes nextToken for cursor-based pagination
 */
export interface SearchJobsResult {
  jobs: Job[];
  total: number;
  nextToken?: string;
}

/**
 * Search and filter jobs using GET /jobs/search endpoint
 * Supports: keyword, location, scheduleType, postedAt, sort, limit, nextToken
 */
export async function searchJobs(
  searchParams: JobSearchParams,
  filterParams: JobFilterParams,
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax' = 'matchScore'
): Promise<SearchJobsResult> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const limit = searchParams.limit ?? PAGINATION.DEFAULT_LIMIT;
    const params = new URLSearchParams();
    params.set('limit', String(limit));

    // keyword search
    if (searchParams.keyword?.trim()) {
      params.set('keyword', searchParams.keyword.trim());
    }

    // location filter - skip if "all"
    if (searchParams.location?.trim() && searchParams.location !== 'Tất cả địa điểm') {
      params.set('location', searchParams.location.trim());
    }

    // scheduleType from filter sidebar (workType → scheduleType mapping)
    const scheduleType = searchParams.scheduleType || mapWorkTypeToScheduleType(filterParams.workType);
    if (scheduleType) {
      params.set('scheduleType', scheduleType);
    }

    // postedAt filter
    if (searchParams.postedAt) {
      params.set('postedAt', searchParams.postedAt);
    }

    // sort
    const apiSort = searchParams.sort || mapSortToApi(sortBy);
    params.set('sort', apiSort);

    // cursor pagination
    if (searchParams.nextToken) {
      params.set('nextToken', searchParams.nextToken);
    }

    const url = `${API_BASE_URL}/jobs/search?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SearchApiResponse = await response.json();
    let items = (result.items || []).map(mapDynamoJobToFrontendJob);

    // Client-side filters for params the API doesn't support
    items = applyClientSideFilters(items, filterParams);

    return {
      jobs: items,
      total: result.count || items.length,
      nextToken: result.nextToken,
    };
  } catch (error) {
    console.error("Failed to search jobs from API", error);
    return {
      jobs: [],
      total: 0,
    };
  }
}

/**
 * Map frontend workType array to API scheduleType param
 * API only accepts a single scheduleType value, so we pick the first selected
 */
function mapWorkTypeToScheduleType(workTypes?: string[]): string | undefined {
  if (!workTypes || workTypes.length === 0) return undefined;
  // Map frontend values to API-expected values
  const mapping: Record<string, string> = {
    'Fulltime': 'Full-time',
    'Part-time': 'Part-time',
    'Remote': 'Remote',
    'Hybrid': 'Hybrid',
  };
  return mapping[workTypes[0]] || workTypes[0];
}

/**
 * Apply client-side filters for params the API doesn't support
 * (experience, skills)
 */
function applyClientSideFilters(jobs: Job[], filterParams: JobFilterParams): Job[] {
  let filtered = jobs;

  // Filter by experience (client-side)
  if (filterParams.experience && filterParams.experience.length > 0) {
    filtered = filtered.filter(job =>
      filterParams.experience!.includes(job.experience)
    );
  }

  // Filter by skills (client-side - check if job description contains skill keywords)
  if (filterParams.skills && filterParams.skills.length > 0) {
    filtered = filtered.filter(job => {
      const text = `${job.title} ${job.description}`.toLowerCase();
      return filterParams.skills!.some(skill =>
        text.includes(skill.toLowerCase())
      );
    });
  }

  return filtered;
}

export type SavedJobResult = {
  success: boolean;
  requiresAuth?: boolean;
};

/**
 * Save a job to favorites via API
 */
export async function saveJob(jobId: string): Promise<SavedJobResult> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const auth = await getRequiredIdToken();
    if (!auth.success || !auth.token) {
      return auth;
    }

    const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, requiresAuth: true };
      }
      throw new Error(`Failed to save job: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save job via API", error);
    return { success: false };
  }
}

/**
 * Remove a job from favorites via API
 */
export async function removeSavedJob(jobId: string): Promise<SavedJobResult> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const auth = await getRequiredIdToken();
    if (!auth.success || !auth.token) {
      return auth;
    }

    const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, requiresAuth: true };
      }
      throw new Error(`Failed to remove saved job: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to remove saved job via API", error);
    return { success: false };
  }
}

/**
 * Get all saved/favorite jobs from API
 */
export async function getFavoriteJobs(): Promise<Job[]> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const token = await getIdToken();
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/saved-jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch saved jobs: ${response.status}`);
    }

    const result = await response.json();
    const savedItems = result.items || [];
    const savedJobIds = new Set<string>(savedItems.map((item: { jobId: string }) => item.jobId));

    if (savedJobIds.size === 0) {
      return [];
    }

    // Now fetch jobs list to populate the job details
    const jobsResponse = await getJobs(1, 50); // get standard first 50 jobs
    const favoriteJobs = jobsResponse.data.filter(job => savedJobIds.has(job.id));

    // Mark them as saved
    return favoriteJobs.map(job => ({ ...job, saved: true }));
  } catch (error) {
    console.error("Failed to get favorite jobs from API", error);
    return [];
  }
}

/**
 * Get AI-matched jobs (sorted by matchScore desc) using API
 */
export async function getMatchingJobs(): Promise<Job[]> {
  try {
    const jobsRes = await getJobs(1, 50, 'matchScore');
    return jobsRes.data.slice(0, 20);
  } catch (error) {
    console.error("Failed to get matching jobs", error);
    return [];
  }
}
