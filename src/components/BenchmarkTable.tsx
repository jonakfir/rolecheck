'use client';

import { motion } from 'framer-motion';
import type { BenchmarkJob } from '@/lib/types';

interface BenchmarkTableProps {
  benchmarks: BenchmarkJob[];
  userScore: number;
}

function getSourceBadge(source: string) {
  const lower = source.toLowerCase();
  if (lower.includes('muse')) {
    return { label: 'Muse', className: 'bg-purple-100 text-purple-700' };
  }
  if (lower.includes('remote')) {
    return { label: 'RemoteOK', className: 'bg-blue-100 text-blue-700' };
  }
  return { label: source, className: 'bg-slate-deep/10 text-slate-deep' };
}

function getToneBadge(tone: string) {
  const lower = tone.toLowerCase();
  if (lower.includes('inclusive') || lower.includes('neutral')) {
    return 'text-mint bg-mint-bg';
  }
  if (lower.includes('masculine') || lower.includes('aggressive')) {
    return 'text-coral bg-coral-bg';
  }
  return 'text-amber-score bg-amber-100/50';
}

function getScoreColor(score: number): string {
  if (score < 40) return 'text-coral';
  if (score <= 70) return 'text-amber-score';
  return 'text-mint';
}

export default function BenchmarkTable({
  benchmarks,
  userScore,
}: BenchmarkTableProps) {
  return (
    <div className="rounded-2xl border border-slate-deep/10 bg-white shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-deep/10 bg-slate-deep/[0.02]">
              <th className="px-4 py-3 text-left font-semibold text-slate-deep">
                Title
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-deep">
                Company
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-deep">
                Words
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-deep">
                Req&rsquo;s
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-deep">
                Tone
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-deep">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {/* User's JD row */}
            <motion.tr
              className="border-b border-mint/20 bg-mint-bg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <td className="px-4 py-3 font-medium text-slate-deep">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mint shrink-0" />
                  Your JD
                </div>
              </td>
              <td className="px-4 py-3 text-slate-deep/70">&mdash;</td>
              <td className="px-4 py-3 text-center">
                <span className={`font-mono font-semibold ${getScoreColor(userScore)}`}>
                  {userScore}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-slate-deep/70">&mdash;</td>
              <td className="px-4 py-3 text-slate-deep/70">&mdash;</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-mint/20 px-2.5 py-0.5 text-xs font-medium text-mint-dark">
                  You
                </span>
              </td>
            </motion.tr>

            {/* Benchmark rows */}
            {benchmarks.map((job, idx) => {
              const source = getSourceBadge(job.source);
              return (
                <motion.tr
                  key={`${job.title}-${job.company}-${idx}`}
                  className="border-b border-slate-deep/5 hover:bg-slate-deep/[0.02] transition-colors"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <td className="px-4 py-3 font-medium text-slate-deep max-w-[200px] truncate">
                    {job.url ? (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-coral transition-colors underline decoration-slate-deep/20 underline-offset-2"
                      >
                        {job.title}
                      </a>
                    ) : (
                      job.title
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-deep/70 max-w-[140px] truncate">
                    {job.company}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-deep/70">
                    {job.word_count}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-deep/70">
                    {job.requirement_count}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getToneBadge(job.tone)}`}
                    >
                      {job.tone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${source.className}`}
                    >
                      {source.label}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
