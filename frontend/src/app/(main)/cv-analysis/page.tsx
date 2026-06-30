'use client';

import { useEffect, useState } from 'react';
import { AnalysisResultCard } from '@/features/cv-analysis/components/AnalysisResultCard';
import { CvAnalysisEmptyState } from '@/features/cv-analysis/components/CvAnalysisEmptyState';
import { CvAnalysisErrorState } from '@/features/cv-analysis/components/CvAnalysisErrorState';
import { CvAnalysisLoading } from '@/features/cv-analysis/components/CvAnalysisLoading';
import type { CvMatchResult, CvMatchScore } from '@/types/cvAnalysis';

const CV_ANALYSIS_RESULT_STORAGE_KEY = 'cvAnalysisResult';

type CvAnalysisPageState =
  | { status: 'loading'; result: null }
  | { status: 'empty'; result: null }
  | { status: 'error'; result: null }
  | { status: 'success'; result: CvMatchResult };

function getScoreLabel(score: number): string {
  if (score >= 80) {
    return 'EXCELLENT';
  }

  if (score >= 60) {
    return 'GOOD';
  }

  return 'NEEDS WORK';
}

function formatEvaluatedAt(evaluatedAt: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(evaluatedAt));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidScore(score: unknown): score is CvMatchScore {
  if (!score || typeof score !== 'object') {
    return false;
  }

  const candidate = score as Partial<CvMatchScore>;

  return (
    typeof candidate.overallScore === 'number' &&
    typeof candidate.skillsScore === 'number' &&
    typeof candidate.experienceScore === 'number' &&
    typeof candidate.educationScore === 'number' &&
    typeof candidate.summary === 'string' &&
    isStringArray(candidate.strengths) &&
    isStringArray(candidate.weaknesses) &&
    isStringArray(candidate.matchedSkills) &&
    isStringArray(candidate.missingSkills) &&
    isStringArray(candidate.suggestions)
  );
}

function isValidCvMatchResult(value: unknown): value is CvMatchResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CvMatchResult>;

  return (
    typeof candidate.matchId === 'string' &&
    typeof candidate.jobId === 'string' &&
    typeof candidate.jobTitle === 'string' &&
    typeof candidate.cvKey === 'string' &&
    typeof candidate.evaluatedAt === 'string' &&
    isValidScore(candidate.score)
  );
}

function readStoredAnalysisResult(): CvAnalysisPageState {
  const storedResult = window.sessionStorage.getItem(CV_ANALYSIS_RESULT_STORAGE_KEY);
  if (!storedResult) {
    return { status: 'empty', result: null };
  }

  try {
    const parsedResult: unknown = JSON.parse(storedResult);
    if (!isValidCvMatchResult(parsedResult)) {
      return { status: 'error', result: null };
    }

    return { status: 'success', result: parsedResult };
  } catch {
    window.sessionStorage.removeItem(CV_ANALYSIS_RESULT_STORAGE_KEY);
    return { status: 'error', result: null };
  }
}

export default function CVAnalysisPage() {
  const [pageState, setPageState] = useState<CvAnalysisPageState>({
    status: 'loading',
    result: null,
  });

  useEffect(() => {
    queueMicrotask(() => {
      setPageState(readStoredAnalysisResult());
    });
  }, []);

  if (pageState.status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <CvAnalysisLoading />
      </div>
    );
  }

  if (pageState.status === 'empty') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <CvAnalysisEmptyState />
      </div>
    );
  }

  if (pageState.status === 'error') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <CvAnalysisErrorState />
      </div>
    );
  }

  const { result } = pageState;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Kết quả phân tích AI
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Đánh giá độ phù hợp cho vị trí{' '}
          <span className="font-bold text-blue-600">{result.jobTitle}</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Ngày phân tích: {formatEvaluatedAt(result.evaluatedAt)}
        </p>
      </div>

      <AnalysisResultCard result={result} scoreLabel={getScoreLabel(result.score.overallScore)} />
    </div>
  );
}
