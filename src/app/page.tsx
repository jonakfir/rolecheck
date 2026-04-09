'use client';

import { useState } from 'react';
import { ArrowRight, AlertTriangle, Sparkles, BarChart3, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroAnimation from '@/components/HeroAnimation';
import ScoreGauge from '@/components/ScoreGauge';
import PricingCard from '@/components/PricingCard';
import AuthModal from '@/components/AuthModal';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const [demoScore, setDemoScore] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoFlags, setDemoFlags] = useState<Array<{ phrase: string; category: string; suggestion: string }>>([]);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const handleDemo = async () => {
    if (!demoText.trim() || demoText.split(/\s+/).length > 300) return;
    setDemoLoading(true);
    setDemoScore(null);
    setDemoFlags([]);
    setDemoError(null);
    try {
      const res = await fetch('/api/analyze?demo=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: demoText, role_type: 'Engineering' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errData.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      if (typeof data.overall_score !== 'number' || isNaN(data.overall_score)) {
        throw new Error('Invalid response from analysis engine');
      }
      setDemoScore(data.overall_score);
      setDemoFlags(data.flags?.slice(0, 3) || []);
    } catch (err: any) {
      setDemoScore(null);
      setDemoError(err?.message || 'Analysis failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar onSignInClick={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ====== HERO ====== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-coral/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-mint/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-score/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-coral/[0.08] border border-coral/20 px-4 py-1.5 text-sm font-medium text-coral mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Claude AI
            </motion.span>

            <h1 className="font-display text-display-xl text-slate-deep mb-6 leading-[1.08]">
              Your job description is why you&apos;re not finding{' '}
              <span className="bg-gradient-to-r from-coral via-amber-score to-mint bg-clip-text text-transparent">
                great candidates.
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-xl text-slate-light mb-10 leading-relaxed max-w-lg"
            >
              Rolecheck scores, flags, and rewrites your JDs to attract better, more diverse applicants.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-coral-dark transition-all duration-300 shadow-glow-coral hover:shadow-[0_0_30px_rgba(255,79,79,0.4)] hover:-translate-y-0.5"
              >
                Check your JD free
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <span className="text-sm text-slate-light/60">No sign-up required</span>
            </motion.div>
          </motion.div>

          {/* Right — animated hero vis */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </section>

      {/* ====== LIVE DEMO ====== */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-14">
              <h2 className="font-display text-display-md text-slate-deep mb-4">
                Try it now &mdash; paste a JD snippet
              </h2>
              <p className="text-slate-light text-lg max-w-xl mx-auto">
                Get an instant score. No sign-up required. Limited to 300 words.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="glass-card p-8 md:p-10 relative overflow-hidden">
              {/* Gradient border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coral/20 via-transparent to-mint/20 opacity-60 pointer-events-none" />

              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Paste a job description here... (max 300 words)"
                className="relative w-full h-48 p-4 bg-cream border border-slate-deep/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral/30 font-sans text-slate-deep placeholder:text-slate-light/50 transition-all duration-300"
              />

              <div className="flex items-center justify-between mt-4 relative">
                <span className="text-sm text-slate-light">
                  {demoText.split(/\s+/).filter(Boolean).length}/300 words
                </span>
                <button
                  onClick={handleDemo}
                  disabled={demoLoading || !demoText.trim()}
                  className="group bg-slate-deep text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-card hover:-translate-y-0.5"
                >
                  {demoLoading ? (
                    <span className="animate-pulse-soft">Analyzing...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />{' '}
                      Analyze
                    </>
                  )}
                </button>
              </div>

              {demoError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-coral/10 border border-coral/30 rounded-xl text-coral text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{demoError}</span>
                </motion.div>
              )}

              {demoScore !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-8 flex flex-col items-center gap-6"
                >
                  <ScoreGauge score={demoScore} size={160} label="Overall Score" />

                  {demoFlags.length > 0 && (
                    <div className="w-full space-y-3">
                      <h3 className="font-semibold text-slate-deep">Top Issues Found:</h3>
                      {demoFlags.map((flag, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12, duration: 0.4 }}
                          className="flex items-start gap-3 p-3 bg-coral-bg rounded-xl"
                        >
                          <AlertTriangle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-sm text-coral">
                              &ldquo;{flag.phrase}&rdquo;
                            </span>
                            <p className="text-sm text-slate-light mt-1">{flag.suggestion}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <a
                    href="/dashboard"
                    className="group text-coral font-semibold hover:underline flex items-center gap-1"
                  >
                    Get the full analysis{' '}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </motion.div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="py-24 px-6 bg-white/50 relative overflow-hidden">
        {/* Soft radial glow behind cards */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-coral/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <AnimatedSection>
            <h2 className="font-display text-display-md text-center text-slate-deep mb-4">
              Three ways Rolecheck improves your hiring
            </h2>
            <p className="text-center text-slate-light text-lg mb-16 max-w-2xl mx-auto">
              From detection to action &mdash; write JDs that attract the right people.
            </p>
          </AnimatedSection>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {([
              {
                icon: Shield,
                title: 'Bias Detection',
                desc: 'Flags gendered language, exclusionary qualifiers, and unnecessary barriers that drive away qualified candidates. Uses research-backed word lists and AI analysis.',
                color: 'coral',
              },
              {
                icon: BarChart3,
                title: 'Quality Scoring',
                desc: 'Scores your JD on inclusivity, clarity, realistic requirements, and completeness. Benchmarks against similar live postings from top companies.',
                color: 'amber-score',
              },
              {
                icon: Zap,
                title: 'AI Rewrite',
                desc: 'Generates a complete rewrite that removes all flags, clarifies requirements, uses inclusive language, and adds missing sections like salary range.',
                color: 'mint',
              },
            ] as const).map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group glass-card p-8 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Hover colour wash */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    feature.color === 'coral'
                      ? 'bg-gradient-to-br from-coral/[0.04] to-transparent'
                      : feature.color === 'mint'
                      ? 'bg-gradient-to-br from-mint/[0.04] to-transparent'
                      : 'bg-gradient-to-br from-amber-score/[0.04] to-transparent'
                  }`}
                />

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${
                    feature.color === 'coral'
                      ? 'bg-coral-bg text-coral'
                      : feature.color === 'mint'
                      ? 'bg-mint-bg text-mint'
                      : 'bg-amber-50 text-amber-500'
                  }`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-display-sm text-slate-deep mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-light leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== BENCHMARK ====== */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-80 h-80 bg-mint/[0.05] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="font-display text-display-md text-slate-deep mb-4">
              See how your JDs compare
            </h2>
            <p className="text-lg text-slate-light mb-10 max-w-2xl mx-auto">
              Benchmark against similar live job postings from top companies hiring for the same
              role. Know where you stand on word count, requirement count, and tone.
            </p>
          </AnimatedSection>

          <motion.div
            className="glass-card p-10 flex items-center justify-center gap-10 md:gap-16 flex-wrap relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            {/* Decorative gradient trim */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-coral/10 via-amber-score/10 to-mint/10 pointer-events-none" />

            {['Word Count', 'Requirements', 'Tone Score', 'Inclusivity'].map((metric, i) => (
              <motion.div
                key={metric}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                <div className="font-mono text-3xl text-slate-deep font-semibold">--</div>
                <div className="text-sm text-slate-light mt-1.5">{metric}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="text-sm text-slate-light mt-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Available on Pro and Team plans
          </motion.p>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="pricing" className="py-24 px-6 bg-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-coral/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-mint/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <AnimatedSection>
            <h2 className="font-display text-display-md text-center text-slate-deep mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-center text-slate-light text-lg mb-16">
              Start free. Upgrade when you need more.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            <PricingCard
              plan="Free"
              price="Free"
              features={['3 JD analyses/month', 'Bias detection', 'AI rewrite', 'Quality scoring']}
              ctaText="Get Started"
              highlighted={false}
            />
            <PricingCard
              plan="Pro"
              price="$49"
              features={[
                'Unlimited analyses',
                'Everything in Free',
                'Benchmarking against live JDs',
                'Export reports',
                'Priority support',
              ]}
              ctaText="Start Pro Trial"
              highlighted={true}
            />
            <PricingCard
              plan="Team"
              price="$149"
              features={[
                'Everything in Pro',
                'Multi-seat access',
                'API access',
                'Team analytics dashboard',
                'Custom word lists',
                'SSO support',
              ]}
              ctaText="Contact Sales"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
