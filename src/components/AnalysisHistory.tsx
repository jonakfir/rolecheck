'use client';

import { motion } from 'framer-motion';
import { FileText, Clock, ChevronRight } from 'lucide-react';
import type { Analysis } from '@/lib/types';

interface AnalysisHistoryProps {
  analyses: Analysis[];
  onSelect?: (analysis: Analysis) => void;
}

function getScoreColor(score: number): string {
  if (score < 40) return 'text-coral';
  if (score <= 70) return 'text-amber-score';
  return 'text-mint';
}

function getScoreBg(score: number): string {
  if (score < 40) return 'bg-coral-bg';
  if (score <= 70) return 'bg-amber-100/50';
  return 'bg-mint-bg';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export default function AnalysisHistory({
  analyses,
  onSelect,
}: AnalysisHistoryProps) {
  if (analyses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-deep/20 bg-white/50 p-12 text-center">
        <FileText className="w-10 h-10 text-slate-light/40 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-slate-deep/60">
          No analyses yet
        </h3>
        <p className="mt-2 text-sm text-slate-light/60 max-w-xs mx-auto">
          Paste a job description to get started. Your analysis history will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis, idx) => (
        <motion.button
          key={analysis.id}
          onClick={() => onSelect?.(analysis)}
          className="w-full text-left rounded-2xl border border-slate-deep/10 bg-white p-4 shadow-card hover:shadow-card-hover transition-shadow group"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          <div className="flex items-center gap-4">
            {/* Score badge */}
            <div
              className={`shrink-0 w-14 h-14 rounded-xl ${getScoreBg(analysis.overall_score)} flex flex-col items-center justify-center`}
            >
              <span
                className={`font-mono text-lg font-bold ${getScoreColor(analysis.overall_score)}`}
              >
                {analysis.overall_score}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-slate-deep/5 px-2 py-0.5 text-xs font-medium text-slate-deep">
                  {analysis.role_type}
                </span>
                <span className="text-xs text-slate-light/50">
                  {analysis.flags.length} flag{analysis.flags.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-slate-deep/70 truncate">
                {truncateText(analysis.original_jd, 80)}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock className="w-3 h-3 text-slate-light/40" />
                <span className="text-xs text-slate-light/50">
                  {formatDate(analysis.created_at)}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-slate-light/30 group-hover:text-slate-deep/50 transition-colors shrink-0" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
