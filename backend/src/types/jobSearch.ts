import type { Job } from "./job.js";

export type JobSearchSort =
  | "relevance"
  | "latest"
  | "posted_at_asc";

export interface JobSearchQuery {
  keyword?: string;
  location?: string;
  scheduleType?: string;
  postedAt?: string;
  sort?: JobSearchSort;
  limit: number;
  nextToken?: string;
}

export interface JobSearchResponse {
  count: number;
  items: Job[];
  nextToken?: string;
  filters: JobSearchQuery;
}
