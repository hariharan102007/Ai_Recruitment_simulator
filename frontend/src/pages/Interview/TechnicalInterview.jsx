import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiClock, FiActivity, FiRefreshCw, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI, inferDomainAndSkills } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const TechnicalInterview = () => {
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
  const [errorMessage, setErrorMessage] = useState('');

  const fetchQuestions = async (forceNew = false) => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await generateInterviewQuestionsForStage({
        stageId: 'technical',
        atsScore,
        targetRole,
        resumeText,
        projects,
        forceNew
      });

      const nextQuestions = Array.isArray(data?.questions) ? data.questions : [];
      setQuestions(nextQuestions);
      setCurrent(0);

      if (nextQuestions.length === 0) {
        throw new Error('No questions returned by AI engine.');
      }
    } catch (error) {
      console.error('Failed to generate technical questions:', error);
      setQuestions([]);
      setErrorMessage('No questions available. Please click retry.');
      toast.error('Failed to load technical questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [atsScore, targetRole, resumeText]);

  const handleRegenerate = async () => {
    toast.loading('Synthesizing fresh technical questions...', { id: 'regen-tech' });
    await fetchQuestions(true);
    toast.dismiss('regen-tech');
    toast.success('Generated brand-new technical questions');
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
        stageId: 'technical',
        answers,
        questions,
        targetRole
      });
      setEvaluation(evalData);
      
      dispatch(updateScore({ stage: 'technical', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'technical', status: 'completed' }));
      
      setSubmitted(true);
      toast.success('Technical interview evaluation complete');
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
        <p className="text-xs text-slate-300">Generating technical architectural questions for {domain}...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Evaluating technical depth and conceptual accuracy...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Technical Assessment Scorecard</h1>
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
            <FiActivity className="text-blue-400" /> AI Evaluation Feedback
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
          <Link to="/interview/project">
            <Button icon={<FiArrowRight />} iconPosition="right">
              Proceed to Project Architecture
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
        <p className="text-xs">{errorMessage || 'No questions available.'}</p>
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Technical Architecture Round</h1>
            <Badge variant="info">{q.category || domain}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Question {current + 1} of {questions.length}
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

      {/* Domain Context Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FiLayers className="text-blue-400 shrink-0" />
          <span>Resume Stack: <strong className="text-white">{domain}</strong> ({targetRole}) · ATS {atsScore}%</span>
        </div>
        <span className="font-mono text-slate-400">Technical Depth</span>
      </div>

      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>
        <Textarea 
          value={answers[q.id] || ''} 
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Articulate your technical response... Detail architectural patterns, performance trade-offs, and design principles." 
          className="min-h-[200px] bg-slate-900 border-slate-700 text-xs leading-relaxed" 
        />
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="secondary" 
          onClick={() => setCurrent(Math.max(0, current - 1))} 
          icon={<FiArrowLeft />} 
          disabled={current === 0}
        >
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)} icon={<FiArrowRight />} iconPosition="right">
            Next Question
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="success">
            Submit Technical Round
          </Button>
        )}
      </div>
    </div>
  );
};

export default TechnicalInterview;
