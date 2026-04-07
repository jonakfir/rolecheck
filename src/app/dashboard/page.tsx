'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Sparkles,
  History,
  BarChart3,
  ChevronDown,
  Copy,
  Check,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ScoreGauge from '@/components/ScoreGauge';
import SubScoreBar from '@/components/SubScoreBar';
import FlagItem from '@/components/FlagItem';
import JDEditor from '@/components/JDEditor';
import DiffView from '@/components/DiffView';
import BenchmarkTable from '@/components/BenchmarkTable';
import AnalysisHistory from '@/components/AnalysisHistory';
import { createClient } from '@/lib/supabase/client';
import { ROLE_TYPES } from '@/lib/types';
import type { AnalysisResult, Flag, Analysis, RoleType } from '@/lib/types';

type Tab = 'results' | 'benchmark' | 'history';

export default function DashboardPage() {
  const [jdText, setJdText] = useState('');
  const [roleType, setRoleType] = useState<RoleType>('Engineering');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('results');
  const [history, setHistory] = useState<Analysis[]>([]);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user?.email) {
        try {
          const res = await fetch(`/api/me?email=${encodeURIComponent(data.user.email)}`);
          const info = await res.json();
          setIsAdminUser(info.isAdmin);
        } catch {}
      }
    });
  }, []);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data as Analysis[]);
  }, [user]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user, loadHistory]);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setResult(null);
    setSelectedFlag(null);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.email ? { 'x-user-email': user.email } : {}),
        },
        body: JSON.stringify({ jd_text: jdText, role_type: roleType }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data: AnalysisResult = await res.json();

      // Fetch benchmarks for pro/team
      try {
        const benchRes = await fetch('/api/benchmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role_type: roleType }),
        });
        if (benchRes.ok) {
          const benchData = await benchRes.json();
          data.benchmark_data = benchData;
        }
      } catch {
        // Benchmark is optional
      }

      setResult(data);
      setActiveTab('results');
      loadHistory();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRewrite = () => {
    if (result?.rewritten_jd) {
      navigator.clipboard.writeText(result.rewritten_jd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Input Section */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-display-sm text-slate-deep">Analyze a Job Description</h1>
              {isAdminUser && (
                <span className="px-2 py-0.5 bg-mint/20 text-mint text-xs font-bold rounded-full uppercase tracking-wide">
                  Admin — Unlimited
                </span>
              )}
            </div>
            {user && (
              <button onClick={handleSignOut} className="text-slate-light hover:text-coral text-sm flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-coral/10 border border-coral/30 rounded-xl text-coral text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-3">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste your job description here..."
                className="w-full h-64 p-4 bg-cream border border-slate-deep/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-coral/30 font-sans text-slate-deep placeholder:text-slate-light/50"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-deep mb-2">Role Type</label>
                <div className="relative">
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value as RoleType)}
                    className="w-full p-3 bg-cream border border-slate-deep/10 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-coral/30 pr-10"
                  >
                    {ROLE_TYPES.map((rt) => (
                      <option key={rt} value={rt}>{rt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-light pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !jdText.trim()}
                className="w-full bg-coral text-white py-3 rounded-xl font-semibold hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-coral"
              >
                {loading ? (
                  <span className="animate-pulse-soft">Analyzing...</span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Analyze JD
                  </>
                )}
              </button>

              <div className="text-xs text-slate-light">
                <p>{jdText.split(/\s+/).filter(Boolean).length} words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/50 rounded-xl p-1 w-fit">
          {[
            { id: 'results' as Tab, label: 'Results', icon: FileText },
            { id: 'benchmark' as Tab, label: 'Benchmark', icon: BarChart3 },
            { id: 'history' as Tab, label: 'History', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-deep shadow-card'
                  : 'text-slate-light hover:text-slate-deep'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Score Section */}
              <div className="glass-card p-8 mb-6">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <ScoreGauge score={result.overall_score} size={200} label="Overall Score" />
                  <div className="flex-1 space-y-4 w-full">
                    <SubScoreBar label="Inclusivity" score={result.sub_scores.inclusivity} delay={0.1} />
                    <SubScoreBar label="Clarity" score={result.sub_scores.clarity} delay={0.2} />
                    <SubScoreBar label="Realistic Requirements" score={result.sub_scores.realistic_requirements} delay={0.3} />
                    <SubScoreBar label="Completeness" score={result.sub_scores.completeness} delay={0.4} />
                  </div>
                </div>
                <p className="mt-6 text-slate-light leading-relaxed">{result.summary}</p>
              </div>

              {/* Flags + Editor */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg text-slate-deep mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-coral" />
                    Flagged Issues ({result.flags.length})
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {result.flags.map((flag, i) => (
                      <FlagItem
                        key={i}
                        flag={flag}
                        onSelect={() => setSelectedFlag(flag)}
                        isSelected={selectedFlag?.phrase === flag.phrase}
                      />
                    ))}
                    {result.flags.length === 0 && (
                      <p className="text-mint font-medium">No issues found. Great job!</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-display text-lg text-slate-deep mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-light" />
                    JD Editor
                  </h3>
                  <JDEditor
                    text={jdText}
                    flags={result.flags}
                    selectedFlag={selectedFlag}
                    onTextChange={setJdText}
                  />
                </div>
              </div>

              {/* Rewrite */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-slate-deep flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-mint" />
                    AI Rewrite
                  </h3>
                  <button
                    onClick={handleCopyRewrite}
                    className="flex items-center gap-2 text-sm text-slate-light hover:text-slate-deep transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy rewrite'}
                  </button>
                </div>
                <DiffView original={jdText} rewritten={result.rewritten_jd} />
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && !result && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-16 text-center"
            >
              <Upload className="w-16 h-16 text-slate-light/30 mx-auto mb-4" />
              <h3 className="font-display text-xl text-slate-deep mb-2">Paste a job description to get started</h3>
              <p className="text-slate-light">
                We&apos;ll score it, flag issues, and rewrite it for you.
              </p>
            </motion.div>
          )}

          {activeTab === 'results' && loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-16 text-center"
            >
              <div className="animate-pulse-soft">
                <Sparkles className="w-16 h-16 text-coral mx-auto mb-4" />
                <h3 className="font-display text-xl text-slate-deep mb-2">Analyzing your JD...</h3>
                <p className="text-slate-light">Checking for bias, scoring quality, generating rewrite</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'benchmark' && (
            <motion.div
              key="benchmark"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {result?.benchmark_data && result.benchmark_data.length > 0 ? (
                <BenchmarkTable benchmarks={result.benchmark_data} userScore={result.overall_score} />
              ) : (
                <div className="glass-card p-16 text-center">
                  <BarChart3 className="w-16 h-16 text-slate-light/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl text-slate-deep mb-2">No benchmarks yet</h3>
                  <p className="text-slate-light">
                    Analyze a JD first to see how it compares to similar live postings.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnalysisHistory analyses={history} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
