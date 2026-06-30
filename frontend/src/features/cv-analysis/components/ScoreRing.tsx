interface ScoreRingProps {
  score: number;
  label: string;
}

function getScoreColor(score: number) {
  if (score >= 80) {
    return { ring: '#16a34a', text: 'text-emerald-600' };
  }

  if (score >= 60) {
    return { ring: '#eab308', text: 'text-yellow-600' };
  }

  return { ring: '#ef4444', text: 'text-red-600' };
}

export function ScoreRing({ score, label }: ScoreRingProps) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

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
            className="mt-1 rounded-full px-3 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: color.ring }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
