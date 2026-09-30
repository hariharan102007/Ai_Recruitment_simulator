import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiActivity, FiRefreshCw, FiLayers } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI, inferDomainAndSkills } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const HRInterview = () => {
  const dispatch = useDispatch();

  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const targetRole = useSelector((state) => state.resume.targetRole || state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');
  const atsReport = useSelector((state) => state.resume.atsReport);

  const { domain, skills, projects } = inferDomainAndSkills(resumeText, targetRole, atsReport);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const fetchQuestions = async (forceNew = false) => {
    try {
      setLoading(true);
      const data = await generateInterviewQuestionsForStage({
        stageId: 'hr',
        atsScore,
        targetRole,
        resumeText,
        projects,
        forceNew
      });
      setQuestions(data.questions || []);
      setCurrent(0);
    } catch (error) {
      console.error('Failed to load HR questions:', error);
      toast.error('Failed to load behavioral questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [atsScore, targetRole, resumeText]);

  const handleRegenerate = async () => {
    toast.loading('Synthesizing fresh behavioral questions...', { id: 'regen-hr' });
    await fetchQuestions(true);
    toast.dismiss('regen-hr');
    toast.success('Generated brand-new behavioral questions');
  };

  const handleAnswer = (val) => {
    if (questions[current]) {
      setAnswers({ ...answers, [questions[current].id]: val });
    }
  };

  const handleSubmit = async () => {
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered === 0) {
      return toast.error('Please formulate at least one response before submission.');
    }

    try {
      setEvaluating(true);
      const evalData = await evaluateStageAnswersWithAI({
        stageId: 'hr',
        answers,
        questions,
        targetRole
      });
      setEvaluation(evalData);

      dispatch(updateScore({ stage: 'hr', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'hr', status: 'completed' }));

      setSubmitted(true);
      toast.success('Behavioral interview evaluation complete');
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
        <p className="text-xs text-slate-300">Formulating behavioral & leadership questions for {domain}...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Evaluating behavioral competencies, communication clarity, and culture fit...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Behavioral Assessment Scorecard</h1>
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
            <FiActivity className="text-blue-400" /> AI Behavioral Feedback
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
          <Button variant="secondary" onClick={() => { setSubmitted(false); fetchQuestions(true); }} icon={<FiRefreshCw />}>
            Retake Round
          </Button>
          <Link to="/voice-interview">
            <Button icon={<FiArrowRight />} iconPosition="right">
              Proceed to Voice Mode
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="text-center py-20 text-slate-400 space-y-3">
        <p className="text-xs">No questions available. Please try again.</p>
        <Button onClick={() => fetchQuestions(true)} variant="secondary" icon={<FiRefreshCw />} size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Behavioral & Leadership Round</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Question {current + 1} of {questions.length} &middot; <span className="text-blue-400 font-mono">{q.category}</span>
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          disabled={loading}
          icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
        >
          Regenerate Questions
        </Button>
      </div>

      {/* Domain Context */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FiLayers className="text-blue-400 shrink-0" />
          <span>Role Alignment: <strong className="text-white">{targetRole}</strong> · Domain: <strong className="text-white">{domain}</strong></span>
        </div>
        <Badge variant="info">{q.category || 'Culture & Fit'}</Badge>
      </div>

      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>
        <Textarea
          value={answers[q.id] || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Frame your answer using the STAR method (Situation, Task, Action, Result)..."
          className="min-h-[200px] bg-slate-900 border-slate-700 text-xs leading-relaxed"
        />
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          icon={<FiArrowLeft />}
        >
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)} icon={<FiArrowRight />} iconPosition="right">
            Next Question
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="success">
            Submit Behavioral Round
          </Button>
        )}
      </div>
    </div>
  );
};

export default HRInterview;
