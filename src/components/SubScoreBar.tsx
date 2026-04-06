'use client';

import { motion } from 'framer-motion';

interface SubScoreBarProps {
  label: string;
  score: number;
  delay?: number;
}

function getBarColor(score: number): string {
  if (score < 40) return 'bg-coral';
  if (score <= 70) return 'bg-amber-score';
  return 'bg-mint';
}

function getScoreTextColor(score: number): string {
  if (score < 40) return 'text-coral';
  if (score <= 70) return 'text-amber-score';
  return 'text-mint';
}

export default function SubScoreBar({ label, score, delay = 0 }: SubScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-slate-deep w-44 shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-2.5 bg-slate-deep/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor(clampedScore)}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
      <span className={`font-mono text-sm font-semibold w-10 text-right ${getScoreTextColor(clampedScore)}`}>
        {clampedScore}
      </span>
    </div>
  );
}
