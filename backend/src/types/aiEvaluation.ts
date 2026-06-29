export interface AiEvaluationResult {
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

export interface AiEvaluationInput {
  cvText: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription: string;
}

export interface AiProvider {
  evaluate(input: AiEvaluationInput): Promise<AiEvaluationResult>;
}
