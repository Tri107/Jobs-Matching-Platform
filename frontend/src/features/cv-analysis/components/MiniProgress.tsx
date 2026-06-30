import type { ReactNode } from 'react';

interface MiniProgressProps {
  label: string;
  score: number;
  icon: ReactNode;
}

function getProgressBackground(score: number): string {
  if (score >= 80) {
    return 'linear-gradient(90deg, #22c55e, #16a34a)';
  }

  if (score >= 60) {
    return 'linear-gradient(90deg, #eab308, #ca8a04)';
  }

  return 'linear-gradient(90deg, #ef4444, #dc2626)';
}

export function MiniProgress({ label, score, icon }: MiniProgressProps) {
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
              background: getProgressBackground(score),
            }}
          />
        </div>
      </div>
    </div>
  );
}
