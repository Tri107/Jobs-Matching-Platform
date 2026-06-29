import { HiOutlineCpuChip, HiOutlineLightBulb } from 'react-icons/hi2';

interface AnalysisAdviceCardProps {
  summary: string;
  suggestions: string[];
}

export function AnalysisAdviceCard({ summary, suggestions }: AnalysisAdviceCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-600/20">
      <div className="mb-4 flex items-center gap-2">
        <HiOutlineLightBulb className="h-5 w-5 text-yellow-300" />
        <h3 className="text-base font-bold">Lời khuyên từ AI để tối ưu CV</h3>
      </div>
      <p className="text-sm leading-relaxed text-blue-100">{summary}</p>

      <div className="mt-5 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <HiOutlineCpuChip className="h-4 w-4 text-blue-200" />
          </div>
          <span className="text-sm font-bold text-white">Gợi ý cải thiện</span>
        </div>
        <ul className="space-y-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion} className="flex items-start gap-2 text-sm leading-relaxed text-blue-200">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-200" />
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
