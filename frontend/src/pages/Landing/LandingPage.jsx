import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiFileText, FiCode, FiMessageSquare, FiMic, FiCheck, FiShield, FiTrendingUp, FiCpu, FiLayers, FiTerminal } from 'react-icons/fi';

const LandingPage = () => {
  const [heroImgError, setHeroImgError] = useState(false);

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Enterprise-Grade Simulation Engine</span>
              <span className="text-blue-500">·</span>
              <span className="text-blue-400 font-semibold">100% Free & Open Access</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Engineered Interview Simulation for Modern Software Talent
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Experience the complete multi-stage recruitment pipeline. From algorithmic ATS resume calibration to interactive code execution, real-time voice speech analysis, and architectural system design.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Launch Assessment Free <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Candidate Sign In
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div>
                <p className="text-2xl font-bold font-mono text-white tabular-nums">7+</p>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline Stages</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-blue-400 tabular-nums">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Resume Calibrated</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">0ms</p>
                <p className="text-xs text-slate-400 mt-0.5">Latency Speech Stream</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual / Platform Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-[#0C1220] shadow-2xl min-h-[280px] flex items-center justify-center">
              {!heroImgError ? (
                <img
                  src="/images/recruitment_platform_hero_1790744528927.jpg"
                  alt="RecruitAI Platform Workstation"
                  onError={() => setHeroImgError(true)}
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full p-6 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-blue-400 flex items-center gap-2">
                      <FiTerminal className="w-4 h-4" /> candidate_pipeline_evaluator.ts
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      LIVE ACTIVE
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 space-y-1">
                    <span className="text-slate-500">// Dynamic Gemini 3.1 Rubric Calibration</span>
                    <br />
                    <span className="text-blue-400">const</span> assessment = <span className="text-purple-400">await</span> calibrateProfile({'{'}
                    <br />
                    &nbsp;&nbsp;atsScore: <span className="text-emerald-400">94</span>,
                    <br />
                    &nbsp;&nbsp;domain: <span className="text-amber-300">"Full Stack Distributed"</span>,
                    <br />
                    &nbsp;&nbsp;stages: [<span className="text-teal-300">"ATS"</span>, <span className="text-teal-300">"Aptitude"</span>, <span className="text-teal-300">"Coding"</span>, <span className="text-teal-300">"Architecture"</span>]
                    <br />
                    {'}'});
                  </pre>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live AI Assessment Active
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Gemini 3.1 Flash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture */}
      <section className="py-20 px-6 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Comprehensive Architecture</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Every Step of Technical Hiring, Replicated with Precision
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Standardized, deterministic evaluation rubrics designed to mirror engineering hiring processes at high-growth tech firms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FiFileText,
              title: 'ATS Resume Intelligence',
              desc: 'Deep structural analysis extracting domain skills, experience match scores, and missing technical proficiencies.',
              badge: 'Stage 1'
            },
            {
              icon: FiCpu,
              title: 'Adaptive Quantitative Aptitude',
              desc: 'Domain-tailored mathematical and algorithmic problem sets generated dynamically from your engineering stack.',
              badge: 'Stage 2'
            },
            {
              icon: FiCode,
              title: 'Interactive Coding Sandbox',
              desc: 'In-browser code editor with multi-language execution, automated test fixtures, and complexity optimization feedback.',
              badge: 'Stage 3'
            },
            {
              icon: FiMessageSquare,
              title: 'Technical & Architecture Rounds',
              desc: 'Scenario-based architectural questioning focused on state management, distributed caching, and microservices.',
              badge: 'Stage 4'
            },
            {
              icon: FiMic,
              title: 'Real-Time Voice & Speech AI',
              desc: 'Live speech recognition with continuous transcription, tone analysis, and verbal communication assessment.',
              badge: 'Stage 5'
            },
            {
              icon: FiTrendingUp,
              title: 'Predictive Hiring Analytics',
              desc: 'Radar domain benchmarking, radar skill distribution, and downloadable PDF evaluation reports.',
              badge: 'Stage 6'
            },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{feature.badge}</span>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-6 sm:px-8 max-w-7xl mx-auto w-full mb-12">
        <div className="rounded-2xl bg-[#0C1220] border border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Calibrate Your Interview Readiness?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Upload your resume or select a target engineering profile to begin the end-to-end recruitment simulation.
          </p>
          <div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Get Started Free <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
