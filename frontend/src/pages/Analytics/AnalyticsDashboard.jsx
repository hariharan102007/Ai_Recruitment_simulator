import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Card, Badge, ProgressBar } from '@/components/ui';

const AnalyticsDashboard = () => {
  const { scores, hiringProbability, performanceHistory, strengths, weaknesses, learningPath } = useSelector((state) => state.analytics);

  const radarData = Object.entries(scores).map(([key, val]) => ({ subject: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), score: val }));
  const barData = Object.entries(scores).map(([key, val]) => ({ name: key.replace(/([A-Z])/g, ' $1').trim(), score: val }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
      <p className="text-gray-400 mb-8">Comprehensive overview of your interview preparation performance.</p>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {Object.entries(scores).map(([key, val], i) => (
          <div key={i} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold gradient-text">{val}%</p>
            <p className="text-xs text-gray-400 mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <RTooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Round-wise Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <RTooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="score" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Probability Gauge */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-6">Hiring Probability</h3>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#gauge)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - hiringProbability / 100)}`}
                transform="rotate(-90 50 50)" initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - hiringProbability / 100) }} transition={{ duration: 1.5 }} />
              <defs><linearGradient id="gauge"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-white">{hiringProbability}%</p>
              <Badge variant="success" className="mt-1">Good</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Strengths</h3>
          <div className="space-y-3">{strengths.map((s, i) => <ProgressBar key={i} label={s.skill} value={s.level} color="green" />)}</div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Areas to Improve</h3>
          <div className="space-y-3">{weaknesses.map((w, i) => <ProgressBar key={i} label={w.skill} value={w.level} color="red" />)}</div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personalized Learning Path</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {learningPath.map((week) => (
            <div key={week.week} className={`p-4 rounded-xl border ${week.completed ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400">Week {week.week}</span>
                {week.completed && <Badge variant="success">Done</Badge>}
              </div>
              <h4 className="text-white font-semibold text-sm mb-2">{week.title}</h4>
              <ul className="space-y-1">{week.topics.map((t, i) => <li key={i} className="text-xs text-gray-400">{t}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
