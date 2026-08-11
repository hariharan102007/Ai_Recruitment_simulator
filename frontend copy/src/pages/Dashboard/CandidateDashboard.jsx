import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiArrowRight, FiFileText, FiBookOpen, FiCode, FiMessageSquare, FiHeart, FiClock, FiCheckCircle, FiPlay } from 'react-icons/fi';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { Card, Badge, ProgressBar, Stepper } from '@/components/ui';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const scoreCards = [
  { label: 'ATS Score', value: 82, icon: FiFileText, color: 'from-blue-500 to-cyan-500', trend: '+5%', up: true },
  { label: 'Aptitude', value: 75, icon: FiBookOpen, color: 'from-amber-500 to-orange-500', trend: '+3%', up: true },
  { label: 'Coding', value: 85, icon: FiCode, color: 'from-purple-500 to-pink-500', trend: '+8%', up: true },
  { label: 'Technical', value: 78, icon: FiMessageSquare, color: 'from-indigo-500 to-blue-500', trend: '-2%', up: false },
  { label: 'HR Score', value: 88, icon: FiHeart, color: 'from-emerald-500 to-teal-500', trend: '+12%', up: true },
];

const radarData = [
  { subject: 'ATS', score: 82 }, { subject: 'Aptitude', score: 75 }, { subject: 'Coding', score: 85 },
  { subject: 'Technical', score: 78 }, { subject: 'Project', score: 80 }, { subject: 'Sys Design', score: 70 }, { subject: 'HR', score: 88 },
];

const progressData = [
  { month: 'Jan', score: 45 }, { month: 'Feb', score: 52 }, { month: 'Mar', score: 60 },
  { month: 'Apr', score: 68 }, { month: 'May', score: 75 }, { month: 'Jun', score: 82 },
];

const activities = [
  { text: 'Completed HR Interview round', time: '2 hours ago', icon: FiHeart, color: 'text-emerald-400' },
  { text: 'Submitted Coding Assessment', time: '5 hours ago', icon: FiCode, color: 'text-purple-400' },
  { text: 'Uploaded updated resume', time: '1 day ago', icon: FiFileText, color: 'text-blue-400' },
  { text: 'Completed Technical Interview', time: '2 days ago', icon: FiMessageSquare, color: 'text-indigo-400' },
];

const stages = ['Resume Upload', 'ATS Screening', 'Aptitude', 'Coding', 'Technical', 'Project', 'System Design', 'HR'];

const learningTopics = [
  { topic: 'Docker Fundamentals', priority: 'High', progress: 30 },
  { topic: 'AWS EC2 & S3 Basics', priority: 'High', progress: 10 },
  { topic: 'System Design Patterns', priority: 'Medium', progress: 0 },
  { topic: 'Advanced React Patterns', priority: 'Low', progress: 60 },
];

const CandidateDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!</h1>
        <p className="text-gray-400 mt-1">Here's your interview preparation progress overview.</p>
      </motion.div>

      {/* Score Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {scoreCards.map((card, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="glass-card p-5 glass-card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.up ? <FiTrendingUp /> : <FiTrendingDown />}{card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}%</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
            <div className="mt-3"><ProgressBar value={card.value} size="sm" showValue={false} color={card.up ? 'green' : 'indigo'} /></div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Radar Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hiring Probability */}
        <motion.div variants={fadeUp} className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-6">Hiring Probability</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.78)}`}
                transform="rotate(-90 50 50)" initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.78) }} transition={{ duration: 1.5, ease: 'easeOut' }} />
              <defs><linearGradient id="gradient"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-3xl font-bold text-white">78%</motion.p>
              <p className="text-xs text-gray-400">Good</p>
            </div>
          </div>
          <Badge variant="success" className="mt-4">Above Average</Badge>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Timeline */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Interview Progress</h3>
          <Stepper steps={stages} currentStep={5} />
        </motion.div>

        {/* Progress Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <RTooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activities */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <a.icon className={`w-5 h-5 ${a.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{a.text}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><FiClock className="w-3 h-3" />{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Recommendations */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recommended Learning</h3>
          <div className="space-y-4">
            {learningTopics.map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{t.topic}</p>
                  <Badge variant={t.priority === 'High' ? 'error' : t.priority === 'Medium' ? 'warning' : 'info'}>{t.priority}</Badge>
                </div>
                <ProgressBar value={t.progress} size="sm" color={t.progress > 50 ? 'green' : 'indigo'} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Continue Coding', path: '/coding', icon: FiCode, color: 'from-purple-500 to-pink-500' },
            { label: 'Practice Interview', path: '/interview/technical', icon: FiMessageSquare, color: 'from-indigo-500 to-blue-500' },
            { label: 'ATS Check', path: '/resume', icon: FiFileText, color: 'from-blue-500 to-cyan-500' },
            { label: 'View Analytics', path: '/analytics', icon: FiTrendingUp, color: 'from-emerald-500 to-teal-500' },
          ].map((action, i) => (
            <Link key={i} to={action.path}>
              <motion.div whileHover={{ y: -2, scale: 1.02 }} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-white">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CandidateDashboard;
