import type { GenderCodingResult } from './types';

const MASCULINE_CODED_WORDS = [
  'active',
  'adventurous',
  'aggressive',
  'ambitious',
  'analytical',
  'assertive',
  'athletic',
  'autonomous',
  'battle',
  'boast',
  'bold',
  'brave',
  'challenge',
  'champion',
  'competitive',
  'confident',
  'courageous',
  'courage',
  'daring',
  'decisive',
  'decision',
  'defend',
  'determine',
  'determined',
  'dominate',
  'dominant',
  'driven',
  'enforce',
  'entrepreneurial',
  'excel',
  'exceptional',
  'exhaustive',
  'fearless',
  'fight',
  'force',
  'greedy',
  'guru',
  'hack',
  'hacker',
  'headstrong',
  'hero',
  'heroic',
  'hierarchy',
  'hostile',
  'hustle',
  'impulsive',
  'independence',
  'independent',
  'individual',
  'individualistic',
  'intellectual',
  'iron',
  'killer',
  'lead',
  'leader',
  'logic',
  'manpower',
  'maverick',
  'ninja',
  'objective',
  'opinion',
  'outperform',
  'outspoken',
  'ownership',
  'persist',
  'principle',
  'prove',
  'reckless',
  'relentless',
  'results-driven',
  'rockstar',
  'ruthless',
  'self-confident',
  'self-reliant',
  'self-sufficient',
  'strong',
  'stubborn',
  'superior',
  'tackle',
  'tenacious',
  'thick-skinned',
  'tough',
  'trailblazer',
  'tribe',
  'unreasonable',
  'unyielding',
  'war',
  'warrior',
  'willing',
  'win',
];

const FEMININE_CODED_WORDS = [
  'affectionate',
  'agree',
  'caring',
  'cheer',
  'childcare',
  'collaborate',
  'collaborative',
  'collegial',
  'commit',
  'communal',
  'community',
  'compassion',
  'compassionate',
  'connect',
  'connection',
  'considerate',
  'cooperative',
  'cooperate',
  'depend',
  'dependable',
  'devoted',
  'emotional',
  'empathy',
  'empathetic',
  'enthusiastic',
  'family',
  'feel',
  'feelings',
  'flatter',
  'gentle',
  'gracious',
  'grateful',
  'honest',
  'inclusive',
  'inclusivity',
  'interdependent',
  'interpersonal',
  'kind',
  'kindness',
  'kinship',
  'listening',
  'loyal',
  'modesty',
  'modest',
  'nourish',
  'nurture',
  'nurturing',
  'patient',
  'pleasant',
  'polite',
  'quiet',
  'receptive',
  'responsible',
  'responsive',
  'selfless',
  'sensitive',
  'share',
  'sharing',
  'submit',
  'support',
  'supportive',
  'sympathetic',
  'sympathy',
  'tender',
  'together',
  'trust',
  'trustworthy',
  'understand',
  'understanding',
  'warm',
  'welcoming',
  'wholesome',
  'yield',
];

function findWordOccurrences(
  text: string,
  word: string
): { count: number; positions: number[] } {
  const lowerText = text.toLowerCase();
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
  const positions: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(lowerText)) !== null) {
    positions.push(match.index);
  }

  return { count: positions.length, positions };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function determineScore(
  masculineCount: number,
  feminineCount: number
): GenderCodingResult['score'] {
  const total = masculineCount + feminineCount;

  if (total === 0) {
    return 'neutral';
  }

  const masculineRatio = masculineCount / total;

  if (masculineRatio >= 0.8) return 'strongly masculine';
  if (masculineRatio >= 0.6) return 'masculine';
  if (masculineRatio <= 0.2) return 'strongly feminine';
  if (masculineRatio <= 0.4) return 'feminine';
  return 'neutral';
}

export function analyzeGenderCoding(text: string): GenderCodingResult {
  const masculineWords: GenderCodingResult['masculineWords'] = [];
  const feminineWords: GenderCodingResult['feminineWords'] = [];
  let masculineCount = 0;
  let feminineCount = 0;

  for (const word of MASCULINE_CODED_WORDS) {
    const { count, positions } = findWordOccurrences(text, word);
    if (count > 0) {
      masculineWords.push({ word, count, positions });
      masculineCount += count;
    }
  }

  for (const word of FEMININE_CODED_WORDS) {
    const { count, positions } = findWordOccurrences(text, word);
    if (count > 0) {
      feminineWords.push({ word, count, positions });
      feminineCount += count;
    }
  }

  const score = determineScore(masculineCount, feminineCount);

  return {
    masculineWords,
    feminineWords,
    score,
    masculineCount,
    feminineCount,
  };
}
