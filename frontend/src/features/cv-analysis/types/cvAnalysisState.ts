import type { CvMatchResult } from '@/types/cvAnalysis';

export type CvAnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CvAnalysisState {
  status: CvAnalysisStatus;
  result: CvMatchResult | null;
  error: string | null;
}
