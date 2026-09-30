import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiActivity, FiRefreshCw, FiLayers, FiCheck } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI, inferDomainAndSkills } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const SystemDesign = () => {
  const dispatch = useDispatch();

  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const targetRole = useSelector((state) => state.resume.targetRole || state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');
  const atsReport = useSelector((state) => state.resume.atsReport);

  const { domain, skills, projects } = inferDomainAndSkills(resumeText, targetRole, atsReport);

  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const fetchProblems = async (forceNew = false) => {
    try {
      setLoading(true);
      const data = await generateInterviewQuestionsForStage({
        stageId: 'systemDesign',
        atsScore,
        targetRole,
        resumeText,
        projects,
        forceNew
      });
      const nextProblems = data.problems || [];
      setProblems(nextProblems);
      if (nextProblems.length > 0) {
        setSelected(nextProblems[0]);
      }
    } catch (error) {
      console.error('Failed to load system design problems:', error);
      toast.error('Failed to load system design challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [atsScore, targetRole, resumeText]);

  const handleRegenerate = async () => {
    toast.loading('Synthesizing fresh system design problems...', { id: 'regen-sd' });
    await fetchProblems(true);
    toast.dismiss('regen-sd');
    toast.success('Generated brand-new system design challenges');
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return toast.error('Please formulate your architecture proposal before submission.');
    }

    try {
      setEvaluating(true);
      const evalData = await evaluateStageAnswersWithAI({
        stageId: 'system-design',
        answers: { [selected.id]: answer },
        questions: [{ id: selected.id, desc: selected.desc }],
        targetRole
      });
      setEvaluation(evalData);

      dispatch(updateScore({ stage: 'systemDesign', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'system-design', status: 'completed' }));

      setSubmitted(true);
      toast.success('System design evaluation complete');
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast.error('Evaluation failed. Please retry.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Formulating distributed system challenges for {domain}...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Evaluating infrastructure topology, concurrency, and data models...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Design Scorecard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Evaluation telemetry for {targetRole} ({domain}).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluation.scores?.map((s, i) => (
            <div key={i} className="glass-card p-4 border border-slate-800">
              <ProgressBar label={s.label} value={s.value} color="blue" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiActivity className="text-blue-400" /> AI Architectural Feedback
          </h3>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {evaluation.feedback?.map((fb, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                {fb}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => { setSubmitted(false); fetchProblems(true); }} icon={<FiRefreshCw />}>
            Try Another Problem
          </Button>
          <Link to="/interview/hr">
            <Button icon={<FiArrowRight />} iconPosition="right">
              Proceed to Behavioral HR
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">System Architecture & Infrastructure</h1>
          <p className="text-xs text-slate-400 mt-0.5">High-availability, data sharding, caching tiers, and event streaming design.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          disabled={loading}
          icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
        >
          Regenerate Challenges
        </Button>
      </div>

      {/* Domain Context */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FiLayers className="text-blue-400 shrink-0" />
          <span>Domain: <strong className="text-white">{domain}</strong> ({targetRole}) · ATS {atsScore}%</span>
        </div>
        <Badge variant="info">Distributed Systems</Badge>
      </div>

      {/* Problems Choice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {problems.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            className={`glass-card p-4 cursor-pointer transition-all border ${
              selected?.id === p.id
                ? 'border-blue-500 bg-blue-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-xs truncate">{p.name}</h3>
              {selected?.id === p.id && <FiCheck className="text-blue-400 shrink-0 w-3.5 h-3.5" />}
            </div>
            <p className="text-slate-400 text-[11px] line-clamp-2 mb-3 leading-relaxed">{p.desc}</p>
            <div className="flex flex-wrap gap-1">
              {p.focus?.slice(0, 2).map((f, i) => (
                <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="glass-card p-6 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white mb-1.5">{selected.name}</h2>
            <p className="text-slate-300 text-xs leading-relaxed mb-3">{selected.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.focus?.map((f, i) => (
                <Badge key={i} variant="info">{f}</Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Architecture Proposal & Scalability Blueprint
            </label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Detail your system architecture: Ingress/Load Balancers, Microservices breakdown, Database schema & partition keys, Cache topology, Concurrency limits..."
              className="min-h-[220px] bg-slate-900 border-slate-700 text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit} variant="success">
              Submit Architecture Proposal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemDesign;
