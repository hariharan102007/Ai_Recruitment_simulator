import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Table } from '@/components/ui';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const FinalReport = () => {
  const { scores, hiringProbability, strengths, weaknesses } = useSelector((state) => state.analytics);
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);

  const rounds = [
    { round: 'ATS Screening', score: scores.ats, status: 'Completed' },
    { round: 'Aptitude', score: scores.aptitude, status: 'Completed' },
    { round: 'Coding Assessment', score: scores.coding, status: 'Completed' },
    { round: 'Technical Interview', score: scores.technical, status: 'Completed' },
    { round: 'Project Discussion', score: scores.project, status: 'Completed' },
    { round: 'System Design', score: scores.systemDesign, status: 'Completed' },
    { round: 'HR Interview', score: scores.hr, status: 'Completed' },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text('AI Recruitment - Final Report', 20, 20);
    doc.setFontSize(12); doc.text(`Overall Score: ${overall}%`, 20, 35);
    doc.text(`Hiring Probability: ${hiringProbability}%`, 20, 45);
    doc.text('--- Round Breakdown ---', 20, 60);
    rounds.forEach((r, i) => doc.text(`${r.round}: ${r.score}%`, 20, 72 + i * 10));
    doc.save('recruitment-report.pdf');
    toast.success('Report downloaded!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Final Hiring Report</h1>
          <p className="text-gray-400 mt-1">Complete analysis of your recruitment simulation.</p>
        </div>
        <Button onClick={exportPDF} icon={<FiDownload />}>Export PDF</Button>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 text-center">
          <p className="text-5xl font-extrabold gradient-text">{overall}%</p>
          <p className="text-gray-400 mt-2">Overall Score</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-5xl font-extrabold text-emerald-400">{hiringProbability}%</p>
          <p className="text-gray-400 mt-2">Hiring Probability</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-5xl font-extrabold text-indigo-400">{rounds.length}</p>
          <p className="text-gray-400 mt-2">Rounds Completed</p>
        </div>
      </div>

      {/* Round Breakdown */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Round-wise Breakdown</h3>
        <Table
          columns={[
            { key: 'round', label: 'Round', sortable: true },
            { key: 'score', label: 'Score', sortable: true, render: (val) => <span className={`font-bold ${val >= 70 ? 'text-emerald-400' : val >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{val}%</span> },
            { key: 'status', label: 'Status', render: () => <Badge variant="success">Completed</Badge> },
          ]}
          data={rounds}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Strengths</h3>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><FiCheck className="w-4 h-4 text-emerald-400" />{s.skill} ({s.level}%)</div>
            ))}
          </div>
        </div>
        {/* Weaknesses */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Improvement Areas</h3>
          <div className="space-y-2">
            {weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><FiX className="w-4 h-4 text-red-400" />{w.skill} ({w.level}%)</div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Learning Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Master Docker & Kubernetes', 'AWS Cloud Certification Prep', 'System Design Interview Handbook', 'Advanced Data Structures Practice'].map((rec, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300">{rec}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FinalReport;
