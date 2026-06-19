'use client';

interface MatchBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Color-coded match score badge
 * 90%+ → green, 70-89% → blue, <70% → gray
 */
export function MatchBadge({ score, size = 'sm' }: MatchBadgeProps) {
  const getColors = () => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getBarColor = () => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    return 'bg-slate-400';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${getColors()} ${sizeClasses[size]}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${getBarColor()}`}
      />
      {score}%
    </span>
  );
}

/**
 * Match score progress bar for detailed views
 */
export function MatchProgressBar({ score }: { score: number }) {
  const getBarColor = () => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-400';
  };

  const getTextColor = () => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${getTextColor()}`}>{score}%</span>
    </div>
  );
}
