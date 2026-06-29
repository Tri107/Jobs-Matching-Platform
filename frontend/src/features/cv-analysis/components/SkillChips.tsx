import { HiOutlinePlusSmall } from 'react-icons/hi2';

interface SkillChipsProps {
  skills: string[];
  variant?: 'matched' | 'missing';
}

const variantClasses = {
  matched: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  missing: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
};

export function SkillChips({ skills, variant = 'missing' }: SkillChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${variantClasses[variant]}`}
        >
          {skill}
          {variant === 'missing' ? <HiOutlinePlusSmall className="h-4 w-4 text-blue-400" /> : null}
        </span>
      ))}
    </div>
  );
}
