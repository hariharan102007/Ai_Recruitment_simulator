import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiArrowRight, FiFileText, FiBookOpen, FiCode, FiMessageSquare, FiHeart, FiClock, FiCheckCircle, FiPlay, FiLayers, FiActivity, FiShield } from 'react-icons/fi';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { Card, Badge, ProgressBar, Stepper } from '@/components/ui';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const progressData = [
  { month: 'Jan', score: 45 }, { month: 'Feb', score: 52 }, { month: 'Mar', score: 60 },
  { month: 'Apr', score: 68 }, { month: 'May', score: 75 }, { month: 'Jun', score: 82 },
];

const activities = [
  { text: 'Completed Behavioral HR assessment', time: '2 hours ago', stage: 'HR Round', status: 'Passed' },
  { text: 'Executed live coding challenge with 100% test coverage', time: '5 hours ago', stage: 'Coding', status: 'Passed' },
  { text: 'Uploaded updated resume and calibrated ATS profile', time: '1 day ago', stage: 'Resume ATS', status: 'Calibrated' },
  { text: 'Completed Technical Architecture Interview', time: '2 days ago', stage: 'Technical', status: 'Reviewed' },
];

const stages = ['Resume ATS', 'Aptitude Math', 'Live Coding', 'Technical', 'Project Architecture', 'System Design', 'Behavioral HR'];

const CandidateDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { atsScore, targetRole, atsReport } = useSelector((state) => state.resume);
  const { scores, hiringProbability } = useSelector((state) => state.analytics);

  const currentAts = atsScore || 82;
  const currentProb = hiringProbability || 78;

  const scoreCards = [
    { label: 'ATS Screening', value: currentAts, trend: '+5%', up: true },
    { label: 'Aptitude Math', value: scores.aptitude || 75, trend: '+3%', up: true },
    { label: 'Code Execution', value: scores.coding || 85, trend: '+8%', up: true },
    { label: 'Technical Depth', value: scores.technical || 78, trend: '+4%', up: true },
    { label: 'Behavioral HR', value: scores.hr || 88, trend: '+12%', up: true },
  ];

  const radarData = [
    { subject: 'ATS', score: currentAts },
    { subject: 'Aptitude', score: scores.aptitude || 75 },
    { subject: 'Coding', score: scores.coding || 85 },
    { subject: 'Technical', score: scores.technical || 78 },
    { subject: 'Project', score: scores.project || 80 },
    { subject: 'Architecture', score: scores.systemDesign || 70 },
    { subject: 'HR Comms', score: scores.hr || 88 },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Candidate Performance Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Calibrated for: <strong className="text-slate-200">{targetRole || 'Full Stack Developer'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/resume">
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer">
              Recalibrate Profile
            </button>
          </Link>
          <Link to="/reports">
            <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer">
              View Hiring Report
            </button>
          </Link>
        </div>
      </motion.div>

      {/* High-Density Metric Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scoreCards.map((card, i) => (
          <div key={i} className="glass-card p-4 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{card.label}</span>
              <span className={`font-mono text-[11px] font-semibold ${card.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-3xl font-bold font-mono text-white tabular-nums mb-3">{card.value}%</p>
            <ProgressBar value={card.value} size="sm" showValue={false} color={card.value >= 75 ? 'blue' : 'amber'} />
          </div>
        ))}
      </motion.div>

      {/* Radar & Probability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white tracking-tight">Competency Vector Distribution</h3>
            <span className="text-[11px] font-mono text-slate-400">Multi-Stage Rubric</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} stroke="#334155" />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hiring Probability */}
        <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-white mb-6">Overall Hiring Index</h3>
          <div className="relative w-36 h-36">
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
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentProb / 100)}`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - currentProb / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold font-mono text-white tabular-nums">{currentProb}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Candidate Score</p>
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-medium mt-4">Above Industry Benchmark</p>
        </motion.div>
      </div>

      {/* Progress Timeline & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Recruitment Pipeline Readiness</h3>
          <Stepper steps={stages} currentStep={5} />
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Historical Progression Telemetry</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <RTooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Assessment Activities & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Assessment History</h3>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div>
                  <p className="text-xs font-medium text-slate-200">{a.text}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{a.time} · {a.stage}</p>
                </div>
                <Badge variant="success">{a.status}</Badge>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Launch Assessment Stages</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Code Execution', path: '/coding', desc: 'Live multi-language compiler', icon: FiCode },
              { label: 'Voice Speech Mode', path: '/voice-interview', desc: 'Real-time transcript analysis', icon: FiMessageSquare },
              { label: 'Technical Architecture', path: '/interview/technical', desc: 'System & stack evaluation', icon: FiLayers },
              { label: 'ATS Calibration', path: '/resume', desc: 'Resume domain matching', icon: FiFileText },
            ].map((action, i) => (
              <Link key={i} to={action.path}>
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all cursor-pointer h-full flex flex-col justify-between">
                  <action.icon className="w-5 h-5 text-blue-400 mb-2" />
                  <div>
                    <p className="text-xs font-semibold text-white">{action.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CandidateDashboard;
