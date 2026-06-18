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

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  sortBy?: 'matchScore' | 'postedAt' | 'salaryMax';
}

export interface JobFilterParams {
  experience?: string[];
  skills?: string[];
  workType?: string[];
}
