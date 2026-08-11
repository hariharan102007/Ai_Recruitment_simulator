import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiActivity } from 'react-icons/fi';
import { Button, Card, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const HRInterview = () => {
  const dispatch = useDispatch();

  // Select profile and ATS state
  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const isSimulatedATS = !useSelector((state) => state.resume.atsScore);
  const targetRole = useSelector((state) => state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await generateInterviewQuestionsForStage({
          stageId: 'hr',
          atsScore,
          targetRole,
          resumeText
        });
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Failed to load HR questions:', error);
        toast.error('Failed to load dynamic behavioral questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [atsScore, targetRole]);

  const handleAnswer = (val) => {
    if (questions[current]) {
      setAnswers({ ...answers, [questions[current].id]: val });
    }
  };

  const handleSubmit = async () => {
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered === 0) {
      return toast.error('Please answer at least one question before submitting.');
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

      // Save overall score to analytics and update stage status
      dispatch(updateScore({ stage: 'hr', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'hr', status: 'completed' }));

      setSubmitted(true);
      toast.success('HR interview evaluated by AI!');
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast.error('AI Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is designing HR interview questions tailored for ATS Score: {atsScore}%...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is evaluating your soft-skills and behavioral alignment...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-8">HR Interview - Results</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {evaluation.scores?.map((s, i) => (
            <div key={i} className="glass-card p-5">
              <ProgressBar label={s.label} value={s.value} color="green" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FiActivity className="text-emerald-400" />
            AI Soft-Skills Feedback
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            {evaluation.feedback?.map((fb, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                {fb}
              </p>
            ))}
          </div>
        </div>
        <Link to="/report">
          <Button icon={<FiArrowRight />} iconPosition="right">
            View Final Report
          </Button>
        </Link>
      </motion.div>
    );
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="text-center py-20 text-gray-400">
        No HR questions available. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-white">HR Interview</h1>
          <p className="text-sm text-gray-400">
            Question {current + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* ATS score notification */}
      <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/50 text-xs text-indigo-300">
        {isSimulatedATS 
          ? `ℹ️ Using simulated HR questions based on ATS Score of 75%.`
          : `🎯 Questions customized by AI for your ATS Score: ${atsScore}%`}
      </div>

      <div className="glass-card p-8 mb-6">
        <Badge variant="primary" className="mb-4">Behavioral</Badge>
        <p className="text-white text-lg font-medium mb-6">{q.question}</p>
        <Textarea 
          value={answers[q.id] || ''} 
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Share your experience using the STAR framework (Situation, Task, Action, Result)..." 
          className="min-h-[200px]" 
        />
      </div>

      <div className="flex justify-between">
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
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="success">
            Submit Interview
          </Button>
        )}
      </div>
    </div>
  );
};

export default HRInterview;
