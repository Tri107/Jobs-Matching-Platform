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

export interface EvaluateCvMatchRequest {
  jobId: string;
  cvKey: string;
}
