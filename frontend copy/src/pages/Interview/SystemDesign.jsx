import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiActivity } from 'react-icons/fi';
import { Button, Card, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const SystemDesign = () => {
  const dispatch = useDispatch();

  // Select profile and ATS state
  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const isSimulatedATS = !useSelector((state) => state.resume.atsScore);
  const targetRole = useSelector((state) => state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');

  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const data = await generateInterviewQuestionsForStage({
          stageId: 'systemDesign',
          atsScore,
          targetRole,
          resumeText
        });
        setProblems(data.problems || []);
      } catch (error) {
        console.error('Failed to load system design problems:', error);
        toast.error('Failed to load dynamic system design challenges.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [atsScore, targetRole]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return toast.error('Please enter your system design approach before submitting.');
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

      // Save overall score to analytics and update stage status
      dispatch(updateScore({ stage: 'systemDesign', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'system-design', status: 'completed' }));

      setSubmitted(true);
      toast.success('System design evaluated by AI!');
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
        <p className="text-gray-400 text-sm">AI is designing system design problems tailored for your level...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is evaluating your system architecture design...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-8">System Design - Evaluation</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {evaluation.scores?.map((s, i) => (
            <div key={i} className="glass-card p-5">
              <ProgressBar label={s.label} value={s.value} />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FiActivity className="text-indigo-400" />
            Detailed Architect Feedback
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
        <Link to="/interview/hr">
          <Button icon={<FiArrowRight />} iconPosition="right">
            Proceed to HR Interview
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (!selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-2">System Design Round</h1>
        <p className="text-gray-400 mb-6">Choose a system design problem to solve.</p>
        
        {/* ATS score notification */}
        <div className="mb-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/50 text-sm text-gray-300 flex items-center justify-between">
          <span>
            {isSimulatedATS 
              ? `ℹ️ Using simulated System Design problems based on ATS Score of 75%.`
              : `🎯 Problems generated by AI based on your custom ATS Score: ${atsScore}%`}
          </span>
          {isSimulatedATS && <Link to="/resume" className="text-indigo-400 hover:underline">Upload Resume</Link>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p) => (
            <motion.div 
              key={p.id} 
              whileHover={{ y: -2 }} 
              onClick={() => setSelected(p)} 
              className="glass-card glass-card-hover p-6 cursor-pointer"
            >
              <h3 className="text-white font-semibold text-lg mb-1">{p.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1">
                {p.focus?.map((f, i) => (
                  <Badge key={i} variant="info">{f}</Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <button 
        onClick={() => { setSelected(null); setAnswer(''); }} 
        className="text-sm text-gray-400 hover:text-white mb-2"
      >
        Back to Problems
      </button>
      <h1 className="text-xl font-bold text-white mb-1">{selected.name}</h1>
      <p className="text-sm text-gray-400 mb-6">{selected.desc}</p>
      
      <div className="glass-card p-8">
        <p className="text-white text-lg font-medium mb-4">
          Describe your system design approach covering: architecture, data model, API design, scaling strategy, and potential bottlenecks.
        </p>
        <Textarea 
          value={answer} 
          onChange={(e) => setAnswer(e.target.value)} 
          placeholder="Type your architecture plan here... Describe components, databases, CDNs, cache, message queues, and endpoints." 
          className="min-h-[300px]" 
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} variant="success">
            Submit Design
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemDesign;
