/**
 * Matching result type definitions
 */

export interface MatchingResult {
  id: string;
  jobId: string;
  jobTitle: string;
  cvFileName: string;
  matchScore: number;
  matchedAt: string;
  status: 'completed' | 'pending' | 'failed';
}
