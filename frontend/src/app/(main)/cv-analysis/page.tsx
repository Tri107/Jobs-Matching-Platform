'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    return 'Phù hợp cao';
  }

  if (score >= 60) {
    return 'Phù hợp trung bình';
  }

  return 'Cần cải thiện';
}

function formatEvaluatedAt(evaluatedAt: string): string {
  const date = new Date(evaluatedAt);
  if (Number.isNaN(date.getTime())) {
    return 'Không xác định';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
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
    (typeof candidate.pageCount === 'undefined' || typeof candidate.pageCount === 'number') &&
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
        <h1 className="text-2xl font-bold text-slate-900">Kết quả phân tích AI</h1>
        <p className="mt-1 text-sm text-slate-500">
          Đánh giá độ phù hợp cho vị trí{' '}
          <span className="font-bold text-blue-600">{result.jobTitle}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Phân tích lúc: {formatEvaluatedAt(result.evaluatedAt)}</span>
          {typeof result.pageCount === 'number' ? <span>Số trang CV: {result.pageCount}</span> : null}
        </div>
      </div>

      <AnalysisResultCard result={result} scoreLabel={getScoreLabel(result.score.overallScore)} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Xem thêm việc làm
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Phân tích công việc khác
        </Link>
      </div>
    </div>
  );
}
