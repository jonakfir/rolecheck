'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  onCta?: () => void;
}

export default function PricingCard({
  plan,
  price,
  features,
  highlighted = false,
  ctaText = 'Get started',
  onCta,
}: PricingCardProps) {
  return (
    <motion.div
      className={`relative rounded-3xl p-[1px] ${
        highlighted
          ? 'bg-gradient-to-br from-coral via-amber-score to-mint'
          : 'bg-slate-deep/10'
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Popular badge */}
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-coral to-mint px-4 py-1 text-xs font-bold text-white shadow-elevated">
            Popular
          </span>
        </div>
      )}

      <div
        className={`rounded-3xl p-6 sm:p-8 h-full flex flex-col ${
          highlighted
            ? 'bg-white shadow-elevated'
            : 'bg-white/80 backdrop-blur-sm shadow-card'
        }`}
      >
        {/* Plan name */}
        <h3 className="font-display text-xl font-bold text-slate-deep">
          {plan}
        </h3>

        {/* Price */}
        <div className="mt-4 mb-6">
          <span className="font-mono text-4xl font-bold text-slate-deep">
            {price}
          </span>
          {price !== 'Free' && price !== 'Custom' && (
            <span className="text-sm text-slate-light ml-1">/month</span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-deep/10 mb-6" />

        {/* Features */}
        <ul className="space-y-3 flex-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-mint mt-0.5 shrink-0" />
              <span className="text-sm text-slate-deep/80">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onCta}
          className={`mt-8 w-full rounded-xl py-3 px-6 text-sm font-semibold transition-all duration-200 ${
            highlighted
              ? 'bg-slate-deep text-cream hover:bg-slate-medium shadow-card hover:shadow-card-hover'
              : 'bg-slate-deep/5 text-slate-deep hover:bg-slate-deep/10'
          }`}
        >
          {ctaText}
        </button>
      </div>
    </motion.div>
  );
}
