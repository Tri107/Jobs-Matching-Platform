export interface MatchScore {
  overallScore: number;       // 0–100
  skillsScore: number;        // 0–100
  experienceScore: number;    // 0–100
  educationScore: number;     // 0–100
  summary: string;            // Short AI-generated explanation
  strengths?: string[];       // Candidate strengths relevant to the job
  weaknesses?: string[];      // Candidate gaps relevant to the job
  matchedSkills: string[];    // Skills found in both CV and JD
  missingSkills: string[];    // Skills in JD but absent from CV
  suggestions?: string[];     // Suggestions to improve candidate fit
}

export interface MatchResult {
  matchId: string;
  userId: string;
  jobId: string;
  cvKey: string;
  score: MatchScore;
  evaluatedAt: string;        // ISO 8601
  modelId: string;            // AI model used
  ttl?: number;               // Unix epoch — auto-expire after 90 days
}

export interface EvaluateMatchRequest {
  jobId: string;
  cvKey: string;
}
