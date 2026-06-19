'use client';

import { EXPERIENCE_OPTIONS, SKILL_OPTIONS, WORK_TYPE_OPTIONS } from '@/lib/constants';
import type { JobFilterParams } from '@/types/job';

interface JobFilterProps {
  filters: JobFilterParams;
  onFilterChange: (params: Partial<JobFilterParams>) => void;
  onReset: () => void;
}

export function JobFilter({ filters, onFilterChange, onReset }: JobFilterProps) {
  const selectedExperience = filters.experience ?? [];
  const selectedSkills = filters.skills ?? [];
  const selectedWorkType = filters.workType ?? [];

  const toggleArrayValue = (
    key: 'experience' | 'skills' | 'workType',
    value: string,
    current: string[]
  ) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ [key]: next });
  };

  const hasFilters =
    selectedExperience.length > 0 ||
    selectedSkills.length > 0 ||
    selectedWorkType.length > 0;

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-64 xl:w-72">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Bộ lọc</h3>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Experience */}
      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Kinh nghiệm
        </h4>
        <div className="mt-3 space-y-2.5">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedExperience.includes(opt.value)}
                onChange={() => toggleArrayValue('experience', opt.value, selectedExperience)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Kỹ năng
        </h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleArrayValue('skills', skill, selectedSkills)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Work Type */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Hình thức làm việc
        </h4>
        <div className="mt-3 space-y-2.5">
          {WORK_TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedWorkType.includes(opt.value)}
                onChange={() => toggleArrayValue('workType', opt.value, selectedWorkType)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
