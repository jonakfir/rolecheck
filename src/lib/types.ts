export interface AnalysisResult {
  overall_score: number;
  sub_scores: {
    inclusivity: number;
    clarity: number;
    realistic_requirements: number;
    completeness: number;
  };
  flags: Flag[];
  rewritten_jd: string;
  summary: string;
  gender_coding: GenderCodingResult;
  benchmark_data?: BenchmarkJob[];
}

export interface Flag {
  phrase: string;
  category: 'Gendered Language' | 'Vague Requirement' | 'Unrealistic Experience' | 'Missing Info' | 'Exclusionary Qualifier' | 'Buzzword' | 'Negative Framing';
  explanation: string;
  suggestion: string;
}

export interface GenderCodingResult {
  masculineWords: { word: string; count: number; positions: number[] }[];
  feminineWords: { word: string; count: number; positions: number[] }[];
  score: 'strongly masculine' | 'masculine' | 'neutral' | 'feminine' | 'strongly feminine';
  masculineCount: number;
  feminineCount: number;
}

export interface BenchmarkJob {
  title: string;
  company: string;
  source: string;
  url?: string;
  word_count: number;
  requirement_count: number;
  tone: string;
}

export interface UserProfile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  plan: 'free' | 'pro' | 'team';
  jds_used_this_month: number;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  original_jd: string;
  role_type: string;
  overall_score: number;
  sub_scores: AnalysisResult['sub_scores'];
  flags: Flag[];
  rewritten_jd: string;
  benchmark_data: BenchmarkJob[] | null;
  created_at: string;
}

export type RoleType = 'Engineering' | 'Sales' | 'Marketing' | 'Operations' | 'Design' | 'Product' | 'Data Science' | 'Customer Success' | 'Finance' | 'HR' | 'Legal' | 'Other';

export const ROLE_TYPES: RoleType[] = [
  'Engineering', 'Sales', 'Marketing', 'Operations', 'Design',
  'Product', 'Data Science', 'Customer Success', 'Finance', 'HR', 'Legal', 'Other',
];
