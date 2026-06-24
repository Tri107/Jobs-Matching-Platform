/**
 * API service for Jobs feature integrated with AWS API Gateway & DynamoDB
 */

import type { Job, JobSearchParams, JobFilterParams, DynamoJobItem } from '@/types/job';
import type { PaginatedResponse } from '@/types/common';
import { PAGINATION } from '@/lib/constants';
import { getIdToken } from '@/features/auth/services/cognitoAuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';


// Helper to map DynamoDB attributes to frontend Job interface
function mapDynamoJobToFrontendJob(item: DynamoJobItem): Job {
  const getWorkType = (): Job['workType'] => {
    const rawType = item.workType || (item.scheduleType === 'Toàn thời gian' ? 'Fulltime' : 'Hybrid');
    if (rawType === 'Fulltime' || rawType === 'Part-time' || rawType === 'Remote' || rawType === 'Hybrid') {
      return rawType;
    }
    return 'Fulltime';
  };

  return {
    id: item.jobId || item.id || '',
    title: item.originalTitle || item.title || 'Unknown Title',
    company: item.companyName || item.company_name || item.company || 'Unknown Company',
    location: item.location || 'Việt Nam',
    salaryMin: item.salaryMin !== undefined ? Number(item.salaryMin) : 0,
    salaryMax: item.salaryMax !== undefined ? Number(item.salaryMax) : 0,
    experience: item.experience || 'under-1',
    workType: getWorkType(),
    skills: Array.isArray(item.skills) ? item.skills : (item.skills ? [item.skills] : []),
    description: item.description || '',
    requirements: Array.isArray(item.requirements) ? item.requirements : (item.requirements ? [item.requirements] : []),
    benefits: Array.isArray(item.benefits) ? item.benefits : (item.benefits ? [item.benefits] : []),
    matchScore: item.matchScore !== undefined ? Number(item.matchScore) : 0,
    postedAt: item.postedAt || item.createdAt || new Date().toISOString(),
    saved: !!item.saved,
    logo: item.logo || '💻',
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
 * Search and filter jobs using API
 */
export async function searchJobs(
  searchParams: JobSearchParams,
  filterParams: JobFilterParams,
  sortBy: 'matchScore' | 'postedAt' | 'salaryMax' = 'matchScore'
): Promise<PaginatedResponse<Job>> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }
    const limit = searchParams.limit ?? PAGINATION.DEFAULT_LIMIT;
    let url = `${API_BASE_URL}/jobs?limit=${limit}`;
    if (searchParams.keyword) {
      url += `&keyword=${encodeURIComponent(searchParams.keyword)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const items = (result.items || []).map(mapDynamoJobToFrontendJob);

    return {
      data: items,
      total: result.count || items.length,
      page: searchParams.page ?? 1,
      limit,
      totalPages: Math.ceil((result.count || items.length) / limit),
    };
  } catch (error) {
    console.error("Failed to search jobs from API", error);
    return {
      data: [],
      total: 0,
      page: searchParams.page ?? 1,
      limit: searchParams.limit ?? PAGINATION.DEFAULT_LIMIT,
      totalPages: 0,
    };
  }
}

/**
 * Save a job to favorites via API
 */
export async function saveJob(jobId: string): Promise<{ success: boolean }> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const token = await getIdToken();
    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
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
export async function removeSavedJob(jobId: string): Promise<{ success: boolean }> {
  try {
    if (!API_BASE_URL) {
      throw new Error('API Base URL is not configured');
    }

    const token = await getIdToken();
    if (!token) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
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
