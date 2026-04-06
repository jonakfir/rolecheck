'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASE_PAIRS = [
  { bad: 'rockstar', good: 'skilled engineer' },
  { bad: 'ninja', good: 'specialist' },
  { bad: 'must have 10+ years', good: '3+ years preferred' },
  { bad: 'fast-paced environment', good: 'supportive environment' },
  { bad: 'work hard play hard', good: 'work-life balance' },
  { bad: 'guru', good: 'expert' },
  { bad: 'competitive salary', good: 'salary: $X-$Y' },
  { bad: 'synergy', good: 'collaboration' },
  { bad: 'self-starter', good: 'self-directed' },
  { bad: 'wear many hats', good: 'versatile role' },
  { bad: 'culture fit', good: 'values-aligned' },
  { bad: 'digital native', good: 'tech-savvy' },
];

interface FloatingPhrase {
  id: number;
  bad: string;
  good: string;
  x: number;
  phase: 'bad' | 'good';
}

let nextId = 0;

export default function HeroAnimation() {
  const [phrases, setPhrases] = useState<FloatingPhrase[]>([]);

  const addPhrase = useCallback(() => {
    const pair = PHRASE_PAIRS[Math.floor(Math.random() * PHRASE_PAIRS.length)];
    const x = 10 + Math.random() * 80; // 10-90% horizontal position

    const newPhrase: FloatingPhrase = {
      id: nextId++,
      bad: pair.bad,
      good: pair.good,
      x,
      phase: 'bad',
    };

    setPhrases((prev) => [...prev.slice(-8), newPhrase]);

    // Transition to good phase after 1.5s
    setTimeout(() => {
      setPhrases((prev) =>
        prev.map((p) => (p.id === newPhrase.id ? { ...p, phase: 'good' } : p))
      );
    }, 1500);

    // Remove after full animation
    setTimeout(() => {
      setPhrases((prev) => prev.filter((p) => p.id !== newPhrase.id));
    }, 3500);
  }, []);

  useEffect(() => {
    // Add initial phrases staggered
    const initialTimeouts = [0, 400, 800, 1200, 1600].map((delay) =>
      setTimeout(addPhrase, delay)
    );

    // Continue adding phrases
    const interval = setInterval(addPhrase, 1000);

    return () => {
      initialTimeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [addPhrase]);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-3xl bg-slate-deep/[0.03] backdrop-blur-sm border border-slate-deep/10">
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cream to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cream to-transparent z-10 pointer-events-none" />

      <AnimatePresence>
        {phrases.map((phrase) => (
          <motion.div
            key={phrase.id}
            className="absolute"
            style={{ left: `${phrase.x}%`, transform: 'translateX(-50%)' }}
            initial={{ bottom: '-10%', opacity: 0 }}
            animate={{ bottom: '110%', opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5, ease: 'linear' }}
          >
            <AnimatePresence mode="wait">
              {phrase.phase === 'bad' ? (
                <motion.span
                  key="bad"
                  className="inline-block font-mono text-sm px-3 py-1.5 rounded-full bg-coral/10 text-coral border border-coral/20 whitespace-nowrap"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    scale: 0.5,
                    opacity: 0,
                    filter: 'blur(4px)',
                    rotate: -5,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {phrase.bad}
                </motion.span>
              ) : (
                <motion.span
                  key="good"
                  className="inline-block font-mono text-sm px-3 py-1.5 rounded-full bg-mint/10 text-mint border border-mint/20 whitespace-nowrap shadow-glow-mint"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {phrase.good}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
