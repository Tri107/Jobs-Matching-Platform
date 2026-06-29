'use client';

import { HiOutlineDocumentArrowUp } from 'react-icons/hi2';
import { AnalysisResultCard } from '@/features/cv-analysis/components/AnalysisResultCard';
import { mockCVAnalysis } from '@/mock/cvAnalysis';
import type { CvMatchResult } from '@/types/cvAnalysis';

function toMockMatchResult(): CvMatchResult {
  return {
    matchId: 'mock-match-result',
    jobId: 'mock-job',
    jobTitle: mockCVAnalysis.targetPosition,
    cvKey: 'mock-cv-key',
    pageCount: 1,
    evaluatedAt: '2026-06-29T06:37:15.186Z',
    score: {
      overallScore: mockCVAnalysis.matchScore,
      skillsScore: mockCVAnalysis.skillScore,
      experienceScore: mockCVAnalysis.structureScore,
      educationScore: mockCVAnalysis.structureScore,
      summary: mockCVAnalysis.aiAdvice,
      strengths: mockCVAnalysis.strengths,
      weaknesses: mockCVAnalysis.weaknesses,
      matchedSkills: ['React', 'Next.js', 'Performance Optimization', 'Portfolio'],
      missingSkills: mockCVAnalysis.suggestedSkills.map((skill) => skill.name),
      suggestions: [mockCVAnalysis.expertTip],
    },
  };
}

function formatEvaluatedAt(evaluatedAt: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(evaluatedAt));
}

export default function CVAnalysisPage() {
  const result = toMockMatchResult();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
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
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30"
        >
          <HiOutlineDocumentArrowUp className="h-5 w-5" />
          Chọn CV để phân tích lại
        </button>
      </div>

      <AnalysisResultCard result={result} scoreLabel={mockCVAnalysis.matchLabel} />
    </div>
  );
}
