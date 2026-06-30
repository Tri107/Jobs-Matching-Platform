'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { AnalysisResultCard } from '@/features/cv-analysis/components/AnalysisResultCard';
import type { CvMatchResult } from '@/types/cvAnalysis';

const CV_ANALYSIS_RESULT_STORAGE_KEY = 'cvAnalysisResult';

let cachedStoredResult: CvMatchResult | null = null;
let cachedStoredResultRaw: string | null = null;

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

function readStoredAnalysisResult(): CvMatchResult | null {
  const storedResult = window.sessionStorage.getItem(CV_ANALYSIS_RESULT_STORAGE_KEY);
  if (!storedResult) {
    cachedStoredResult = null;
    cachedStoredResultRaw = null;
    return null;
  }

  if (storedResult === cachedStoredResultRaw) {
    return cachedStoredResult;
  }

  try {
    cachedStoredResult = JSON.parse(storedResult) as CvMatchResult;
    cachedStoredResultRaw = storedResult;
    return cachedStoredResult;
  } catch {
    window.sessionStorage.removeItem(CV_ANALYSIS_RESULT_STORAGE_KEY);
    cachedStoredResult = null;
    cachedStoredResultRaw = null;
    return null;
  }
}

function subscribeToStoredAnalysisResult(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
  };
}

function EmptyAnalysisState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Chưa có kết quả phân tích</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
        Để phân tích CV, hãy mở một công việc và chọn &quot;Đánh giá CV theo công việc&quot;.
      </p>
      <div className="mt-6">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Đi đến trang việc làm
        </Link>
      </div>
    </div>
  );
}

export default function CVAnalysisPage() {
  const result = useSyncExternalStore(
    subscribeToStoredAnalysisResult,
    readStoredAnalysisResult,
    () => null,
  );

  if (!result) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <EmptyAnalysisState />
      </div>
    );
  }

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
