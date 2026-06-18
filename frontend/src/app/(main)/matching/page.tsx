'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockMatchingResults } from '@/mock/matching';
import { MatchProgressBar } from '@/features/jobs/components/MatchBadge';
import { formatDate } from '@/features/jobs/utils/formatDate';
import { Pagination } from '@/components/Pagination';
import { HiOutlineFunnel, HiOutlineArrowDownTray, HiOutlineDocumentText } from 'react-icons/hi2';

const ITEMS_PER_PAGE = 10;

export default function MatchingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(mockMatchingResults.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentResults = mockMatchingResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử Matching</h1>
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
              Danh sách Matching
            </h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Tổng lượt Matching: {mockMatchingResults.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <HiOutlineFunnel className="h-4 w-4" />
              Bộ lọc
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <HiOutlineArrowDownTray className="h-4 w-4" />
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3">Tên Job</th>
                <th className="px-6 py-3">CV</th>
                <th className="px-6 py-3">Match Score</th>
                <th className="px-6 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentResults.map((result) => (
                <tr key={result.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(result.matchedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {result.jobTitle}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HiOutlineDocumentText className="h-5 w-5 text-red-400" />
                      <span className="text-sm text-slate-600">
                        {result.cvFileName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <MatchProgressBar score={result.matchScore} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/jobs/${result.jobId}`}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all ${
                        result.matchScore >= 70
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : result.matchScore >= 50
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 p-4 md:hidden">
          {currentResults.map((result) => (
            <div
              key={result.id}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{result.jobTitle}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(result.matchedAt)}
                  </p>
                </div>
                <Link
                  href={`/jobs/${result.jobId}`}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Xem
                </Link>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <HiOutlineDocumentText className="h-4 w-4 text-red-400" />
                {result.cvFileName}
              </div>
              <div className="mt-2">
                <MatchProgressBar score={result.matchScore} />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-100 px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={mockMatchingResults.length}
          />
        </div>
      </div>
    </div>
  );
}
