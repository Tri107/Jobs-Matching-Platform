'use client';

import { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineBanknotes } from 'react-icons/hi2';
import { LOCATION_OPTIONS, SALARY_RANGES } from '@/lib/constants';

interface JobSearchBarProps {
  onSearch: (params: { keyword: string; location: string; salaryMin: number; salaryMax: number }) => void;
  variant?: 'hero' | 'compact';
}

export function JobSearchBar({ onSearch, variant = 'compact' }: JobSearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('Tất cả địa điểm');
  const [salaryRange, setSalaryRange] = useState(0);

  const handleSearch = () => {
    const salary = SALARY_RANGES[salaryRange];
    onSearch({
      keyword,
      location,
      salaryMin: salary.min,
      salaryMax: salary.max,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (variant === 'hero') {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
          {/* Keyword */}
          <div className="flex flex-[1.5] items-center gap-2.5 px-4 py-2">
            <HiOutlineMagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Vị trí tuyển dụng, tên công ty..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="hidden h-8 w-px bg-slate-200 md:block" />

          {/* Location */}
          <div className="relative flex flex-1 items-center gap-2.5 px-4 py-2">
            <HiOutlineMapPin className="h-5 w-5 shrink-0 text-slate-400" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-sm text-slate-700 outline-none"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 md:ml-1"
          >
            Tìm kiếm ngay
          </button>
        </div>
      </div>
    );
  }

  // Compact variant
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-0">
        <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
          <HiOutlineMagnifyingGlass className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Từ khóa, tên công việc"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="hidden h-8 w-px bg-slate-200 lg:block" />

        <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
          <HiOutlineMapPin className="h-5 w-5 shrink-0 text-slate-400" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full cursor-pointer bg-transparent text-sm text-slate-700 outline-none"
          >
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden h-8 w-px bg-slate-200 lg:block" />

        <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
          <HiOutlineBanknotes className="h-5 w-5 shrink-0 text-slate-400" />
          <select
            value={salaryRange}
            onChange={(e) => setSalaryRange(Number(e.target.value))}
            className="w-full cursor-pointer bg-transparent text-sm text-slate-700 outline-none"
          >
            {SALARY_RANGES.map((range, idx) => (
              <option key={range.label} value={idx}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
}
