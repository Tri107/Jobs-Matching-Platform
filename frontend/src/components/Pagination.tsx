'use client';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('...');

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {totalItems !== undefined && (
        <p className="text-sm text-slate-500">
          Hiển thị {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalItems)} trên{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span> kết quả
        </p>
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
