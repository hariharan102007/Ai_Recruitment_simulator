import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Card, Badge, ProgressBar } from '@/components/ui';

const AnalyticsDashboard = () => {
  const { scores, hiringProbability, performanceHistory, strengths, weaknesses, learningPath } = useSelector((state) => state.analytics);

  const radarData = Object.entries(scores).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    score: val,
  }));
  const barData = Object.entries(scores).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    score: val,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Analytics & Hiring Telemetry</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Multi-stage assessment scoring, competency vectors, and growth trajectories.</p>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(scores).map(([key, val], i) => (
          <div key={i} className="glass-card p-4 text-center border border-slate-800">
            <p className="text-2xl font-bold font-mono text-white tabular-nums">{val}%</p>
            <p className="text-[11px] text-slate-400 mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Competency Distribution Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} stroke="#334155" />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend */}
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Assessment Progression Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <RTooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Stage-Wise Competency Benchmark</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <RTooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Probability Gauge */}
        <div className="glass-card p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-white mb-4">Overall Hiring Index</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - hiringProbability / 100)}`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - hiringProbability / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold font-mono text-white tabular-nums">{hiringProbability}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate Score</p>
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-3">High Employability Benchmark</p>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">Core Strengths</h3>
          <div className="space-y-3">
            {strengths.map((s, i) => (
              <ProgressBar key={i} label={s.skill} value={s.level} color="green" />
            ))}
          </div>
        </div>
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">Development Areas</h3>
          <div className="space-y-3">
            {weaknesses.map((w, i) => (
              <ProgressBar key={i} label={w.skill} value={w.level} color="amber" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
