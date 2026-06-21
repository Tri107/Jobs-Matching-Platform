'use client';

import { useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePlusSmall,
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineDocumentArrowUp,
} from 'react-icons/hi2';
import { mockCVAnalysis } from '@/mock/cvAnalysis';

/* ---------- Circular Progress Ring ---------- */
function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { ring: '#16a34a', bg: '#dcfce7', text: 'text-emerald-600' };
    if (s >= 60) return { ring: '#eab308', bg: '#fef9c3', text: 'text-yellow-600' };
    return { ring: '#ef4444', bg: '#fee2e2', text: 'text-red-600' };
  };
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color.ring}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
              strokeLinecap: 'round',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${color.text}`}>{score}%</span>
          <span
            className="mt-1 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: color.ring }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mini Progress Bar ---------- */
function MiniProgress({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">{label}</span>
          <span className="font-bold text-slate-900">{score}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${score}%`,
              background:
                score >= 80
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : score >= 60
                  ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                  : 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function CVAnalysisPage() {
  const data = mockCVAnalysis;
  const [selectedCV] = useState('CV_Senior_Frontend_2024.pdf');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kết quả phân tích AI
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Đánh giá độ phù hợp cho vị trí{' '}
            <span className="font-bold text-blue-600">{data.targetPosition}</span>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left — Score */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-slate-500">
              Match Score Tổng Thể
            </h3>
            <ScoreRing score={data.matchScore} label={data.matchLabel} />

            <div className="mt-8 space-y-4">
              <MiniProgress
                label="Kỹ năng chuyên môn"
                score={data.skillScore}
                icon={<HiOutlineSparkles className="h-4 w-4" />}
              />
              <MiniProgress
                label="Cấu trúc CV"
                score={data.structureScore}
                icon={<HiOutlineDocumentArrowUp className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        {/* Right — Details */}
        <div className="space-y-6 lg:col-span-8">
          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900">Điểm mạnh</h3>
              </div>
              <ul className="space-y-2.5">
                {data.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
              <div className="mb-3 flex items-center gap-2">
                <HiOutlineExclamationTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-base font-bold text-slate-900">Điểm yếu</h3>
              </div>
              <ul className="space-y-2.5">
                {data.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Skills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <HiOutlineSparkles className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-bold text-slate-900">
                Kỹ năng cần bổ sung
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.suggestedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  {skill.name}
                  <HiOutlinePlusSmall className="h-4 w-4 text-blue-400" />
                </span>
              ))}
            </div>
          </div>

          {/* AI Advice Card */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-600/20">
            <div className="mb-4 flex items-center gap-2">
              <HiOutlineLightBulb className="h-5 w-5 text-yellow-300" />
              <h3 className="text-base font-bold">Lời khuyên từ AI để tối ưu CV</h3>
            </div>
            <p className="text-sm leading-relaxed text-blue-100">{data.aiAdvice}</p>

            {/* Expert Tip sub-card */}
            <div className="mt-5 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <HiOutlineCpuChip className="h-4 w-4 text-blue-200" />
                </div>
                <span className="text-sm font-bold text-white">Mẹo từ chuyên gia AI</span>
              </div>
              <p className="text-sm leading-relaxed text-blue-200">{data.expertTip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
