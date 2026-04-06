'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface DiffViewProps {
  original: string;
  rewritten: string;
}

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
}

function computeDiff(original: string, rewritten: string): { left: DiffLine[]; right: DiffLine[] } {
  const origLines = original.split('\n');
  const rewriteLines = rewritten.split('\n');

  // Simple line-by-line diff using LCS approach
  const m = origLines.length;
  const n = rewriteLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1].trim() === rewriteLines[j - 1].trim()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  let i = m;
  let j = n;

  const leftTemp: DiffLine[] = [];
  const rightTemp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1].trim() === rewriteLines[j - 1].trim()) {
      leftTemp.push({ type: 'same', text: origLines[i - 1] });
      rightTemp.push({ type: 'same', text: rewriteLines[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      leftTemp.push({ type: 'same', text: '' });
      rightTemp.push({ type: 'added', text: rewriteLines[j - 1] });
      j--;
    } else if (i > 0) {
      leftTemp.push({ type: 'removed', text: origLines[i - 1] });
      rightTemp.push({ type: 'same', text: '' });
      i--;
    }
  }

  leftTemp.reverse();
  rightTemp.reverse();

  return { left: leftTemp, right: rightTemp };
}

export default function DiffView({ original, rewritten }: DiffViewProps) {
  const [copied, setCopied] = useState(false);
  const { left, right } = computeDiff(original, rewritten);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rewritten);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = rewritten;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-deep/10 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-deep/10 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-coral/20 border border-coral" />
            <span className="text-sm font-medium text-slate-deep">Original</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-mint/20 border border-mint" />
            <span className="text-sm font-medium text-slate-deep">Rewritten</span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-deep/5 px-3 py-1.5 text-xs font-medium text-slate-deep hover:bg-slate-deep/10 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-mint" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy rewritten
            </>
          )}
        </button>
      </div>

      {/* Diff content */}
      <div className="grid grid-cols-2 divide-x divide-slate-deep/10 font-mono text-sm overflow-auto max-h-[500px]">
        {/* Left - Original */}
        <div className="p-4">
          <AnimatePresence mode="sync">
            {left.map((line, idx) => (
              <motion.div
                key={`l-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className={`py-0.5 px-2 rounded leading-6 min-h-[1.5rem] ${
                  line.type === 'removed'
                    ? 'bg-coral/10 text-coral-dark'
                    : line.text === ''
                    ? 'opacity-0'
                    : 'text-slate-deep/70'
                }`}
              >
                {line.type === 'removed' && (
                  <span className="select-none text-coral/50 mr-2">-</span>
                )}
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right - Rewritten */}
        <div className="p-4">
          <AnimatePresence mode="sync">
            {right.map((line, idx) => (
              <motion.div
                key={`r-${idx}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className={`py-0.5 px-2 rounded leading-6 min-h-[1.5rem] ${
                  line.type === 'added'
                    ? 'bg-mint/10 text-mint-dark'
                    : line.text === ''
                    ? 'opacity-0'
                    : 'text-slate-deep/70'
                }`}
              >
                {line.type === 'added' && (
                  <span className="select-none text-mint/50 mr-2">+</span>
                )}
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
