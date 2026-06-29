import {
  HiOutlineCheckCircle,
  HiOutlineDocumentArrowUp,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import type { CvMatchResult } from '@/types/cvAnalysis';
import { AnalysisAdviceCard } from './AnalysisAdviceCard';
import { AnalysisSection } from './AnalysisSection';
import { MiniProgress } from './MiniProgress';
import { ScoreRing } from './ScoreRing';
import { SkillChips } from './SkillChips';

interface AnalysisResultCardProps {
  result: CvMatchResult;
  scoreLabel: string;
}

export function AnalysisResultCard({ result, scoreLabel }: AnalysisResultCardProps) {
  const { score } = result;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-slate-500">
            Match Score Tổng Thể
          </h3>
          <ScoreRing score={score.overallScore} label={scoreLabel} />

          <div className="mt-8 space-y-4">
            <MiniProgress
              label="Kỹ năng chuyên môn"
              score={score.skillsScore}
              icon={<HiOutlineSparkles className="h-4 w-4" />}
            />
            <MiniProgress
              label="Kinh nghiệm"
              score={score.experienceScore}
              icon={<HiOutlineDocumentArrowUp className="h-4 w-4" />}
            />
            <MiniProgress
              label="Học vấn"
              score={score.educationScore}
              icon={<HiOutlineCheckCircle className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnalysisSection
            title="Điểm mạnh"
            items={score.strengths}
            tone="success"
            icon={<HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />}
          />
          <AnalysisSection
            title="Điểm yếu"
            items={score.weaknesses}
            tone="danger"
            icon={<HiOutlineExclamationTriangle className="h-5 w-5 text-red-400" />}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <HiOutlineSparkles className="h-5 w-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900">Kỹ năng phù hợp</h3>
          </div>
          <SkillChips skills={score.matchedSkills} variant="matched" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <HiOutlineSparkles className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900">Kỹ năng cần bổ sung</h3>
          </div>
          <SkillChips skills={score.missingSkills} variant="missing" />
        </div>

        <AnalysisAdviceCard summary={score.summary} suggestions={score.suggestions} />
      </div>
    </div>
  );
}
