import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiClock, FiActivity } from 'react-icons/fi';
import { Button, Card, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const TechnicalInterview = () => {
  const dispatch = useDispatch();
  
  // Select ATS score and profile info from Redux
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
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await generateInterviewQuestionsForStage({
        stageId: 'technical',
        atsScore,
        targetRole,
        resumeText
      });

      const nextQuestions = Array.isArray(data?.questions) ? data.questions : [];
      setQuestions(nextQuestions);

      if (nextQuestions.length === 0) {
        throw new Error('No questions returned by the AI service.');
      }
    } catch (error) {
      console.error('Failed to generate technical questions:', error);
      setQuestions([]);
      setErrorMessage('No interview questions available. Please try again.');
      toast.error('Failed to load dynamic AI questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [atsScore, targetRole, resumeText, retryCount]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

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
        stageId: 'technical',
        answers,
        questions,
        targetRole
      });
      setEvaluation(evalData);
      
      // Save overall score to analytics and update stage status
      dispatch(updateScore({ stage: 'technical', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'technical', status: 'completed' }));
      
      setSubmitted(true);
      toast.success('Interview evaluated successfully by AI!');
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
        <p className="text-gray-400 text-sm">AI is designing technical interview questions tailored for ATS Score: {atsScore}%...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is evaluating your technical interview answers...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-8">Technical Interview - Scorecard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {evaluation.scores?.map((s, i) => (
            <div key={i} className="glass-card p-5">
              <ProgressBar label={s.label} value={s.value} color="indigo" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FiActivity className="text-indigo-400" />
            AI Feedback & Analysis
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            {evaluation.feedback?.map((fb, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                {fb}
              </p>
            ))}
          </div>
        </div>
        <Link to="/interview/project">
          <Button icon={<FiArrowRight />} iconPosition="right">
            Proceed to Project Discussion
          </Button>
        </Link>
      </motion.div>
    );
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="text-center py-20 text-gray-400 space-y-4">
        <p>{errorMessage || 'No interview questions available. Please try again.'}</p>
        <Button onClick={handleRetry} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-white">Technical Interview</h1>
          <p className="text-sm text-gray-400">
            Question {current + 1} of {questions.length} &middot; {q.category}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <FiClock className="w-4 h-4" />
          <span>15:00</span>
        </div>
      </div>
      
      {/* ATS score notification */}
      <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/50 text-xs text-indigo-300">
        {isSimulatedATS 
          ? `ℹ️ Using simulated ATS Score (75%) to generate questions.`
          : `🎯 Questions generated by AI based on your custom ATS Score: ${atsScore}%`}
      </div>

      <div className="glass-card p-8 mb-6">
        <Badge variant="info" className="mb-4">{q.category}</Badge>
        <p className="text-white text-lg font-medium mb-6">{q.question}</p>
        <Textarea 
          value={answers[q.id] || ''} 
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Type your answer here... Be specific and provide examples." 
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

export default TechnicalInterview;
