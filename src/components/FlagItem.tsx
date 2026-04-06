'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  HelpCircle,
  Clock,
  Info,
  Ban,
  Sparkles,
  ThumbsDown,
} from 'lucide-react';
import type { Flag } from '@/lib/types';

interface FlagItemProps {
  flag: Flag;
  onSelect?: (flag: Flag) => void;
  isSelected?: boolean;
}

const categoryConfig: Record<
  Flag['category'],
  { color: string; bgColor: string; icon: React.ElementType }
> = {
  'Gendered Language': {
    color: 'text-coral',
    bgColor: 'bg-coral-bg',
    icon: AlertTriangle,
  },
  'Vague Requirement': {
    color: 'text-amber-score',
    bgColor: 'bg-amber-100/50',
    icon: HelpCircle,
  },
  'Unrealistic Experience': {
    color: 'text-coral',
    bgColor: 'bg-coral-bg',
    icon: Clock,
  },
  'Missing Info': {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    icon: Info,
  },
  'Exclusionary Qualifier': {
    color: 'text-coral-dark',
    bgColor: 'bg-coral-bg',
    icon: Ban,
  },
  Buzzword: {
    color: 'text-amber-score',
    bgColor: 'bg-amber-100/50',
    icon: Sparkles,
  },
  'Negative Framing': {
    color: 'text-coral',
    bgColor: 'bg-coral-bg',
    icon: ThumbsDown,
  },
};

export default function FlagItem({ flag, onSelect, isSelected }: FlagItemProps) {
  const config = categoryConfig[flag.category];
  const Icon = config.icon;

  return (
    <motion.div
      className={`group cursor-pointer rounded-2xl border bg-white p-4 shadow-card transition-shadow ${isSelected ? 'border-coral ring-2 ring-coral/20' : 'border-slate-deep/10'}`}
      onClick={() => onSelect?.(flag)}
      whileHover={{
        y: -2,
        boxShadow:
          '0 2px 8px rgba(26, 31, 46, 0.06), 0 8px 24px rgba(26, 31, 46, 0.10)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${config.bgColor}`}
        >
          <Icon className="w-3 h-3" />
          {flag.category}
        </span>
      </div>

      {/* Flagged phrase */}
      <p className="font-mono text-sm text-coral font-medium mb-2">
        &ldquo;{flag.phrase}&rdquo;
      </p>

      {/* Explanation */}
      <p className="text-sm text-slate-deep/70 mb-3 leading-relaxed">
        {flag.explanation}
      </p>

      {/* Suggestion */}
      <div className="flex items-start gap-2 rounded-xl bg-mint-bg px-3 py-2">
        <Sparkles className="w-3.5 h-3.5 text-mint mt-0.5 shrink-0" />
        <p className="text-sm text-mint-dark font-medium">{flag.suggestion}</p>
      </div>
    </motion.div>
  );
}
