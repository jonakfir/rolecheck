'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score < 40) return '#FF4F4F';
  if (score <= 70) return '#FFB347';
  return '#00C896';
}

function getScoreColorClass(score: number): string {
  if (score < 40) return 'text-coral';
  if (score <= 70) return 'text-amber-score';
  return 'text-mint';
}

export default function ScoreGauge({ score, size = 200, label }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const motionScore = useMotionValue(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 10;
  const center = size / 2;

  useEffect(() => {
    const clampedScore = Math.max(0, Math.min(100, score));
    const controls = animate(motionScore, clampedScore, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayScore(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [score, motionScore]);

  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-deep/10"
            strokeWidth={strokeWidth}
          />
          {/* Score circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono font-bold ${getScoreColorClass(score)}`}
            style={{ fontSize: size * 0.22 }}
          >
            {displayScore}
          </span>
          <span
            className="font-mono text-slate-light uppercase tracking-wider"
            style={{ fontSize: size * 0.07 }}
          >
            / 100
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-slate-deep/70 tracking-wide uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
