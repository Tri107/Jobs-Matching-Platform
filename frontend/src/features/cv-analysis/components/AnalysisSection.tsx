import type { ReactNode } from 'react';

type AnalysisSectionTone = 'success' | 'danger' | 'neutral';

interface AnalysisSectionProps {
  title: string;
  items: string[];
  icon: ReactNode;
  tone?: AnalysisSectionTone;
}

const toneClasses: Record<AnalysisSectionTone, { container: string; dot: string }> = {
  success: {
    container: 'border-emerald-100 bg-emerald-50/50',
    dot: 'bg-emerald-400',
  },
  danger: {
    container: 'border-red-100 bg-red-50/30',
    dot: 'bg-red-400',
  },
  neutral: {
    container: 'border-slate-200 bg-white',
    dot: 'bg-slate-400',
  },
};

export function AnalysisSection({
  title,
  items,
  icon,
  tone = 'neutral',
}: AnalysisSectionProps) {
  const classes = toneClasses[tone];

  return (
    <div className={`rounded-2xl border p-5 ${classes.container}`}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${classes.dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
