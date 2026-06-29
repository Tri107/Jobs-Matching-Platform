/**
 * Job type definitions shared across features
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experience: string;
  workType: 'Fulltime' | 'Part-time' | 'Remote' | 'Hybrid';
  skills: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  matchScore: number;
  postedAt: string;
  saved: boolean;
  logo: string;
}

/** Sort values supported by GET /jobs/search API */
export type ApiSortType = 'relevance' | 'latest' | 'posted_at_asc';

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  scheduleType?: string;
  postedAt?: string;
  sort?: ApiSortType;
  page?: number;
  limit?: number;
  nextToken?: string;
  sortBy?: 'matchScore' | 'postedAt' | 'salaryMax';
}

export interface JobFilterParams {
  experience?: string[];
  skills?: string[];
  workType?: string[];
}

export interface DynamoJobItem {
  jobId?: string;
  companyName?: string;
  createdAt?: string;
  description?: string;
  location?: string;
  originalPostedAt?: string;
  originalTitle?: string;
  postedAt?: string;
  scheduleType?: string;
  sourceLink?: string;
  thumbnail?: string;
  title?: string;
}

/** Response shape from GET /jobs/search */
export interface SearchApiResponse {
  count: number;
  items: DynamoJobItem[];
  nextToken?: string;
  filters?: {
    keyword?: string;
    location?: string;
    scheduleType?: string;
    limit?: number;
    sort?: string;
  };
}
