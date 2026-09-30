import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiBriefcase, FiDatabase, FiServer, FiShield, FiAlertTriangle, FiActivity, FiRefreshCw, FiLayers } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI, inferDomainAndSkills } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const ProjectDiscussion = () => {
  const dispatch = useDispatch();

  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const targetRole = useSelector((state) => state.resume.targetRole || state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');
  const atsReport = useSelector((state) => state.resume.atsReport);

  const { domain, skills, projects: detectedProjects } = inferDomainAndSkills(resumeText, targetRole, atsReport);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const fetchProjectQuestions = async (forceNew = false) => {
    try {
      setLoading(true);
      const data = await generateInterviewQuestionsForStage({
        stageId: 'project',
        atsScore,
        targetRole,
        resumeText,
        projects: detectedProjects,
        forceNew
      });
      setProjects(data.projects || []);
      if (!selectedProject && data.projects?.length > 0) {
        setSelectedProject(0);
      }
    } catch (error) {
      console.error('Failed to load project questions:', error);
      toast.error('Failed to load project discussion questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectQuestions();
  }, [atsScore, targetRole, resumeText]);

  const handleRegenerate = async () => {
    toast.loading('Synthesizing fresh project discussion questions...', { id: 'regen-proj' });
    await fetchProjectQuestions(true);
    toast.dismiss('regen-proj');
    toast.success('Generated brand-new project questions');
  };

  const handleSubmit = async () => {
    const project = projects[selectedProject ?? 0];
    if (!project) return;

    const totalAnswers = Object.keys(answers).length;
    if (totalAnswers === 0) {
      return toast.error('Please formulate at least one answer before submission.');
    }

    try {
      setEvaluating(true);
      const evalData = await evaluateStageAnswersWithAI({
        stageId: 'project',
        answers,
        questions: project.questions.map((q, i) => ({ id: i, question: q.q })),
        targetRole
      });
      setEvaluation(evalData);

      dispatch(updateScore({ stage: 'project', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'project', status: 'completed' }));

      setSubmitted(true);
      toast.success('Project architecture evaluation complete');
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
        <p className="text-xs text-slate-300">Formulating project architecture questions from your resume...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">AI is evaluating portfolio design decisions and scalability answers...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Project Architecture Scorecard</h1>
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
            <FiActivity className="text-blue-400" /> AI Project Evaluation Feedback
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
          <Button variant="secondary" onClick={() => { setSubmitted(false); fetchProjectQuestions(true); }} icon={<FiRefreshCw />}>
            Retake Discussion
          </Button>
          <Link to="/interview/system-design">
            <Button icon={<FiArrowRight />} iconPosition="right">
              Proceed to System Design
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const project = projects[selectedProject ?? 0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Project Architecture Discussion</h1>
          <p className="text-xs text-slate-400 mt-0.5">Production decision-making, state modeling, and performance bottlenecks.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          disabled={loading}
          icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
        >
          Regenerate Discussion
        </Button>
      </div>

      {/* Domain & Resume Context Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FiLayers className="text-blue-400 shrink-0" />
          <span>Resume Domain: <strong className="text-white">{domain}</strong> · Role: <strong className="text-white">{targetRole}</strong></span>
        </div>
        <Badge variant="info">ATS {atsScore}%</Badge>
      </div>

      {/* Project Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {projects.map((p, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedProject(idx); setCurrentQ(0); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer border ${
              (selectedProject ?? 0) === idx
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {project && (
        <div className="glass-card p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">{project.name}</h2>
              <p className="text-[11px] text-blue-400 font-mono mt-0.5">Stack: {project.tech}</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Question {currentQ + 1} of {project.questions?.length || 1}</span>
          </div>

          {project.questions?.[currentQ] && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="info">{project.questions[currentQ].category}</Badge>
              </div>
              <p className="text-white text-base font-medium leading-relaxed">
                {project.questions[currentQ].q}
              </p>
              <Textarea
                value={answers[currentQ] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                placeholder="Explain the architectural choices, tradeoffs, and scaling bottlenecks you addressed..."
                className="min-h-[200px] bg-slate-900 border-slate-700 text-xs leading-relaxed"
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              icon={<FiArrowLeft />}
            >
              Previous
            </Button>

            {currentQ < (project.questions?.length || 1) - 1 ? (
              <Button onClick={() => setCurrentQ(currentQ + 1)} icon={<FiArrowRight />} iconPosition="right">
                Next Question
              </Button>
            ) : (
              <Button onClick={handleSubmit} variant="success">
                Submit Project Discussion
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDiscussion;
