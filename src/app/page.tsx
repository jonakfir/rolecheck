'use client';

import { useState } from 'react';
import { ArrowRight, AlertTriangle, Sparkles, BarChart3, Shield, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroAnimation from '@/components/HeroAnimation';
import ScoreGauge from '@/components/ScoreGauge';
import PricingCard from '@/components/PricingCard';

export default function LandingPage() {
  const [demoText, setDemoText] = useState('');
  const [demoScore, setDemoScore] = useState<number | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoFlags, setDemoFlags] = useState<Array<{ phrase: string; category: string; suggestion: string }>>([]);

  const handleDemo = async () => {
    if (!demoText.trim() || demoText.split(/\s+/).length > 300) return;
    setDemoLoading(true);
    try {
      const res = await fetch('/api/analyze?demo=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: demoText, role_type: 'Engineering' }),
      });
      const data = await res.json();
      setDemoScore(data.overall_score);
      setDemoFlags(data.flags?.slice(0, 3) || []);
    } catch {
      setDemoScore(null);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="font-display text-display-xl text-slate-deep mb-6">
              Your job description is why you&apos;re not finding great candidates.
            </h1>
            <p className="text-xl text-slate-light mb-8 leading-relaxed">
              Rolecheck scores, flags, and rewrites your JDs to attract better, more diverse applicants.
            </p>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-coral-dark transition-colors shadow-glow-coral"
            >
              Check your JD free <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="animate-fade-in relative">
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-display-md text-slate-deep mb-4">
              Try it now — paste a JD snippet
            </h2>
            <p className="text-slate-light text-lg">
              Get an instant score. No sign-up required. Limited to 300 words.
            </p>
          </div>

          <div className="glass-card p-8">
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder="Paste a job description here... (max 300 words)"
              className="w-full h-48 p-4 bg-cream border border-slate-deep/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-coral/30 font-sans text-slate-deep placeholder:text-slate-light/50"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-light">
                {demoText.split(/\s+/).filter(Boolean).length}/300 words
              </span>
              <button
                onClick={handleDemo}
                disabled={demoLoading || !demoText.trim()}
                className="bg-slate-deep text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {demoLoading ? (
                  <span className="animate-pulse-soft">Analyzing...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Analyze
                  </>
                )}
              </button>
            </div>

            {demoScore !== null && (
              <div className="mt-8 flex flex-col items-center gap-6 animate-slide-up">
                <ScoreGauge score={demoScore} size={160} label="Overall Score" />
                {demoFlags.length > 0 && (
                  <div className="w-full space-y-3">
                    <h3 className="font-semibold text-slate-deep">Top Issues Found:</h3>
                    {demoFlags.map((flag, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-coral-bg rounded-xl animate-slide-up"
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        <AlertTriangle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-sm text-coral">&ldquo;{flag.phrase}&rdquo;</span>
                          <p className="text-sm text-slate-light mt-1">{flag.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <a
                  href="/dashboard"
                  className="text-coral font-semibold hover:underline flex items-center gap-1"
                >
                  Get the full analysis <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-display-md text-center text-slate-deep mb-16">
            Three ways Rolecheck improves your hiring
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card p-8 hover:shadow-card-hover transition-shadow animate-slide-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                    feature.color === 'coral'
                      ? 'bg-coral-bg text-coral'
                      : feature.color === 'mint'
                      ? 'bg-mint-bg text-mint'
                      : 'bg-amber-50 text-amber-500'
                  }`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-display-sm text-slate-deep mb-3">{feature.title}</h3>
                <p className="text-slate-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-display-md text-slate-deep mb-4">
            See how your JDs compare
          </h2>
          <p className="text-lg text-slate-light mb-8">
            Benchmark against similar live job postings from top companies hiring for the same role.
            Know where you stand on word count, requirement count, and tone.
          </p>
          <div className="glass-card p-8 flex items-center justify-center gap-8 flex-wrap">
            {['Word Count', 'Requirements', 'Tone Score', 'Inclusivity'].map((metric) => (
              <div key={metric} className="text-center">
                <div className="font-mono text-2xl text-slate-deep font-semibold">--</div>
                <div className="text-sm text-slate-light mt-1">{metric}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-light mt-4">
            Available on Pro and Team plans
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-display-md text-center text-slate-deep mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-center text-slate-light text-lg mb-16">
            Start free. Upgrade when you need more.
          </p>

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
