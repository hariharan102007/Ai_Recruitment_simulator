import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiDownload, FiCheck, FiX, FiFileText } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Table } from '@/components/ui';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const FinalReport = () => {
  const { scores, hiringProbability, strengths, weaknesses } = useSelector((state) => state.analytics);
  const { targetRole } = useSelector((state) => state.resume);
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);

  const rounds = [
    { round: 'ATS Resume Screening', score: scores.ats, status: 'Completed' },
    { round: 'Quantitative & Logic Aptitude', score: scores.aptitude, status: 'Completed' },
    { round: 'Code Execution Sandbox', score: scores.coding, status: 'Completed' },
    { round: 'Technical Architecture Round', score: scores.technical, status: 'Completed' },
    { round: 'Project Deep-Dive Discussion', score: scores.project, status: 'Completed' },
    { round: 'System Infrastructure Design', score: scores.systemDesign, status: 'Completed' },
    { round: 'Behavioral & Leadership HR', score: scores.hr, status: 'Completed' },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('RecruitAI - Final Candidate Hiring Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Target Role: ${targetRole || 'Full Stack Developer'}`, 20, 32);
    doc.text(`Overall Composite Score: ${overall}%`, 20, 42);
    doc.text(`Hiring Probability Index: ${hiringProbability}%`, 20, 52);
    doc.text('--- Multi-Stage Assessment Breakdown ---', 20, 66);
    rounds.forEach((r, i) => doc.text(`${r.round}: ${r.score}% (${r.status})`, 20, 78 + i * 9));
    doc.save('recruitai-hiring-report.pdf');
    toast.success('Official report downloaded successfully');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Final Assessment & Hiring Report</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Multi-stage evaluation summary for <strong className="text-white">{targetRole || 'Full Stack Developer'}</strong>.</p>
        </div>
        <Button onClick={exportPDF} icon={<FiDownload />} className="px-4 py-2">Export Official PDF</Button>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-5 text-center border border-slate-800">
          <p className="text-4xl font-extrabold font-mono text-white tabular-nums">{overall}%</p>
          <p className="text-xs text-slate-400 mt-1.5">Composite Performance</p>
        </div>
        <div className="glass-card p-5 text-center border border-slate-800">
          <p className="text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">{hiringProbability}%</p>
          <p className="text-xs text-slate-400 mt-1.5">Hiring Probability Index</p>
        </div>
        <div className="glass-card p-5 text-center border border-slate-800">
          <p className="text-4xl font-extrabold font-mono text-blue-400 tabular-nums">{rounds.length}</p>
          <p className="text-xs text-slate-400 mt-1.5">Stages Calibrated & Evaluated</p>
        </div>
      </div>

      {/* Round Breakdown */}
      <div className="glass-card p-6 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-4">Stage-Wise Competency Rubric</h3>
        <Table
          columns={[
            { key: 'round', label: 'Assessment Stage', sortable: true },
            {
              key: 'score',
              label: 'Proficiency Score',
              sortable: true,
              render: (val) => (
                <span className={`font-mono font-bold text-xs ${val >= 75 ? 'text-emerald-400' : val >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {val}%
                </span>
              ),
            },
            { key: 'status', label: 'Evaluation Status', render: () => <Badge variant="success">Completed</Badge> },
          ]}
          data={rounds}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">Identified Technical Strengths</h3>
          <div className="space-y-2 text-xs text-slate-300">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                <FiCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{s.skill}</span>
                <span className="ml-auto font-mono text-slate-400">{s.level}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4">Targeted Technical Gap Areas</h3>
          <div className="space-y-2 text-xs text-slate-300">
            {weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                <FiX className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{w.skill}</span>
                <span className="ml-auto font-mono text-slate-400">{w.level}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className="glass-card p-6 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-4">Targeted Curriculum Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Distributed Consensus & Eventual Consistency Deep-Dive',
            'Kubernetes Multi-Cluster Orchestration & Terraform State Refactoring',
            'System Design: Scalable Real-Time Telemetry & Partitioning Strategies',
            'Advanced Data Structures: Trie, Segment Trees, and Interval Scheduling',
          ].map((rec, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              {rec}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FinalReport;
