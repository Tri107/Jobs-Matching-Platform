/**
 * API service for Jobs feature integrated with AWS API Gateway & DynamoDB
 */

import type { Job, JobSearchParams, JobFilterParams } from '@/types/job';
import type { PaginatedResponse } from '@/types/common';
import { mockJobs } from '@/mock/jobs';
import { PAGINATION } from '@/lib/constants';

// Helper to map DynamoDB attributes to frontend Job interface
function mapDynamoJobToFrontendJob(item: any): Job {
  return {
    id: item.jobId || item.id || '',
    title: item.originalTitle || item.title || 'Unknown Title',
    company: item.companyName || item.company_name || item.company || 'Unknown Company',
    location: item.location || 'Việt Nam',
    salaryMin: item.salaryMin !== undefined ? Number(item.salaryMin) : 0,
    salaryMax: item.salaryMax !== undefined ? Number(item.salaryMax) : 0,
    experience: item.experience || 'under-1',
    workType: (item.workType || (item.scheduleType === 'Toàn thời gian' ? 'Fulltime' : 'Hybrid')) as any,
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
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://38icub30ig.execute-api.ap-southeast-1.amazonaws.com/dev';
    const response = await fetch(`${apiBase}/jobs?limit=${limit}`);
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
    console.error("Failed to fetch jobs from API, falling back to mock", error);
    const sorted = [...mockJobs].sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'salaryMax') return b.salaryMax - a.salaryMax;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const data = sorted.slice(start, end);

    return {
      data,
      total: mockJobs.length,
      page,
      limit,
      totalPages: Math.ceil(mockJobs.length / limit),
    };
  }
}

/**
 * Get single job by ID from DynamoDB
 */
export async function getJobById(id: string): Promise<Job | null> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://38icub30ig.execute-api.ap-southeast-1.amazonaws.com/dev';
    
    // Fetch from the list endpoint /jobs (which has CORS configured and works)
    // and find the matching job on the client side to avoid CORS blocks on unmapped routes.
    const response = await fetch(`${apiBase}/jobs?limit=100`);
    if (response.ok) {
      const result = await response.json();
      const items = result.items || [];
      const matchedItem = items.find((item: any) => item.jobId === id || item.id === id);
      if (matchedItem) {
        return mapDynamoJobToFrontendJob(matchedItem);
      }
    }
  } catch (error) {
    console.error("Failed to fetch job detail from API, falling back to mock", error);
  }
  
  // Fallback to mock data if not found
  const job = mockJobs.find((j) => j.id === id) ?? null;
  return job;
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
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://38icub30ig.execute-api.ap-southeast-1.amazonaws.com/dev';
    const limit = searchParams.limit ?? PAGINATION.DEFAULT_LIMIT;
    let url = `${apiBase}/jobs?limit=${limit}`;
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
    console.error("Failed to search jobs from API, falling back to mock", error);
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

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}

/**
 * Save a job to favorites
 */
export async function saveJob(jobId: string): Promise<{ success: boolean }> {
  const job = mockJobs.find((j) => j.id === jobId);
  if (job) job.saved = true;
  return { success: true };
}

/**
 * Remove a job from favorites
 */
export async function removeSavedJob(jobId: string): Promise<{ success: boolean }> {
  const job = mockJobs.find((j) => j.id === jobId);
  if (job) job.saved = false;
  return { success: true };
}

/**
 * Get all saved/favorite jobs
 */
export async function getFavoriteJobs(): Promise<Job[]> {
  const favorites = mockJobs.filter((j) => j.saved);
  return favorites;
}

/**
 * Get AI-matched jobs (sorted by matchScore desc)
 */
export async function getMatchingJobs(): Promise<Job[]> {
  const matched = [...mockJobs]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);
  return matched;
}
