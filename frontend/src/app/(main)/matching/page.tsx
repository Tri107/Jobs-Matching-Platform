'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMatchResults } from '@/features/cv-analysis/services/cvAnalysisApi';
import { getJobById } from '@/features/jobs/services/jobApi';
import type { BackendMatchResult, CvMatchResult } from '@/types/cvAnalysis';
import { MatchProgressBar } from '@/features/jobs/components/MatchBadge';
import { formatDate } from '@/features/jobs/utils/formatDate';
import { Pagination } from '@/components/Pagination';
import { HiOutlineDocumentText } from 'react-icons/hi2';

const ITEMS_PER_PAGE = 10;

export default function MatchingPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState<BackendMatchResult[]>([]);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getMatchResults();
        const items = res.items || [];
        setResults(items);

        // Fetch job titles for unique jobIds
        const uniqueJobIds = Array.from(new Set(items.map((item) => item.jobId)));
        const titlesMap: Record<string, string> = {};
        
        await Promise.all(
          uniqueJobIds.map(async (jobId) => {
            try {
              const job = await getJobById(jobId);
              if (job) {
                titlesMap[jobId] = job.title;
              } else {
                titlesMap[jobId] = 'Công việc không tồn tại';
              }
            } catch {
              titlesMap[jobId] = 'Lỗi tải tên công việc';
            }
          })
        );
        setJobTitles(titlesMap);
      } catch (err: any) {
        console.error('Error fetching matching history:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải lịch sử đánh giá.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getFileName = (cvKey: string) => {
    if (!cvKey) return 'CV.pdf';
    const parts = cvKey.split('/');
    return parts[parts.length - 1];
  };

  const handleViewDetails = (result: BackendMatchResult) => {
    const cvMatchResult: CvMatchResult = {
      matchId: result.matchId,
      jobId: result.jobId,
      jobTitle: jobTitles[result.jobId] || 'Công việc',
      cvKey: result.cvKey,
      score: result.score,
      evaluatedAt: result.evaluatedAt,
    };
    sessionStorage.setItem('cvAnalysisResult', JSON.stringify(cvMatchResult));
    router.push('/cv-analysis');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-slate-500 font-medium">Đang tải lịch sử đánh giá...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-600">Đã xảy ra lỗi</p>
          <p className="mt-1 text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử đánh giá</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý và xem lại các phân tích CV đã thực hiện bằng AI.
        </p>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900">
              Danh sách đánh giá
            </h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Tổng lượt đánh giá: {results.length}
            </span>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center">
            <HiOutlineDocumentText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">Chưa có lịch sử đánh giá</h3>
            <p className="mt-1 text-xs text-slate-500">
              Hãy bắt đầu bằng cách tìm kiếm một công việc và phân tích CV của bạn.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">Ngày</th>
                    <th className="px-6 py-3">Tên công việc</th>
                    <th className="px-6 py-3">CV</th>
                    <th className="px-6 py-3">Điểm phù hợp</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentResults.map((result) => {
                    const jobTitle = jobTitles[result.jobId] || 'Đang tải...';
                    const overallScore = result.score.overallScore;
                    return (
                      <tr key={result.matchId} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(result.evaluatedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900">
                            {jobTitle}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <HiOutlineDocumentText className="h-5 w-5 text-red-400" />
                            <span className="text-sm text-slate-600">
                              {getFileName(result.cvKey)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 w-48">
                          <MatchProgressBar score={overallScore} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewDetails(result)}
                            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all ${
                              overallScore >= 70
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : overallScore >= 50
                                ? 'bg-amber-500 hover:bg-amber-600'
                                : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 p-4 md:hidden">
              {currentResults.map((result) => {
                const jobTitle = jobTitles[result.jobId] || 'Đang tải...';
                const overallScore = result.score.overallScore;
                return (
                  <div
                    key={result.matchId}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{jobTitle}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(result.evaluatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetails(result)}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold text-white ${
                          overallScore >= 70
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : overallScore >= 50
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        Xem
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <HiOutlineDocumentText className="h-4 w-4 text-red-400" />
                      {getFileName(result.cvKey)}
                    </div>
                    <div className="mt-2">
                      <MatchProgressBar score={overallScore} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-100 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={results.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
