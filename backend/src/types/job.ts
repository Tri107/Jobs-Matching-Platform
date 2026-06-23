export interface RawJob {
  title?: string;
  job_title?: string;
  company_name: string;
  location?: string;
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
  };
  extensions?: string[];
  source_link?: string;
  description?: string;
  thumbnail?: string;
}

export interface Job {
  jobId: string;
  hash: string;
  title: string;
  originalTitle: string;
  companyName: string;
  location: string;
  postedAt: string;
  originalPostedAt: string;
  scheduleType: string;
  sourceLink: string;
  description: string;
  createdAt: string;
  thumbnail?: string;
}

export interface NormalizeMatchResult {
  status: "inserted" | "duplicate" | "rejected";
  jobId?: string;
  hash?: string;
  reason?: string;
  similarity?: number;
  matched_job_id?: string;
  received_fields?: string[];
}
