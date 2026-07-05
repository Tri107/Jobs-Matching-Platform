export interface CvMatchScore {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface CvMatchResult {
  matchId: string;
  jobId: string;
  jobTitle: string;
  cvKey: string;
  pageCount?: number;
  score: CvMatchScore;
  evaluatedAt: string;
}

export interface BackendMatchResult {
  matchId: string;
  userId: string;
  jobId: string;
  cvKey: string;
  score: CvMatchScore;
  evaluatedAt: string;
  modelId?: string;
  ttl?: number;
}

export interface CvMatchResultsResponse {
  count: number;
  items: BackendMatchResult[];
}

export interface EvaluateCvMatchRequest {
  jobId: string;
  cvKey: string;
}
