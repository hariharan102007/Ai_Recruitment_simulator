import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiBriefcase, FiDatabase, FiServer, FiShield, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { Button, Card, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI } from '@/services/aiService';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const getCategoryIcon = (category) => {
  const c = category?.toLowerCase();
  if (c?.includes('database') || c?.includes('db')) return FiDatabase;
  if (c?.includes('security') || c?.includes('auth')) return FiShield;
  if (c?.includes('scalability') || c?.includes('scale') || c?.includes('architect')) return FiServer;
  if (c?.includes('challenge') || c?.includes('error') || c?.includes('problem')) return FiAlertTriangle;
  return FiBriefcase;
};

const ProjectDiscussion = () => {
  const dispatch = useDispatch();

  // Select profile and ATS state
  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const isSimulatedATS = !useSelector((state) => state.resume.atsScore);
  const targetRole = useSelector((state) => state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');
  const resumeProjects = useSelector((state) => state.resume.atsReport?.projects || []);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const fetchProjectQuestions = async () => {
      try {
        setLoading(true);
        const data = await generateInterviewQuestionsForStage({
          stageId: 'project',
          atsScore,
          targetRole,
          resumeText,
          projects: resumeProjects
        });
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to load project questions:', error);
        toast.error('Failed to load dynamic project discussion.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectQuestions();
  }, [atsScore, targetRole, resumeProjects]);

  const handleSubmit = async () => {
    const project = projects[selectedProject];
    if (!project) return;

    // Check if at least some answers exist
    const totalAnswers = Object.keys(answers).length;
    if (totalAnswers === 0) {
      return toast.error('Please answer the questions before submitting.');
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

      // Save overall score to analytics and update stage status
      dispatch(updateScore({ stage: 'project', score: evalData.overallScore }));
      dispatch(updateStageStatus({ stageId: 'project', status: 'completed' }));

      setSubmitted(true);
      toast.success('Project discussion evaluated by AI!');
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
        <p className="text-gray-400 text-sm">AI is analyzing your projects and designing interview questions...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is evaluating your project discussion responses...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-8">Project Discussion - Scorecard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {evaluation.scores?.map((s, i) => (
            <div key={i} className="glass-card p-5">
              <ProgressBar label={s.label} value={s.value} />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FiActivity className="text-indigo-400" />
            AI Project Feedback
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
        <Link to="/interview/system-design">
          <Button icon={<FiArrowRight />} iconPosition="right">
            Proceed to System Design
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (selectedProject === null) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Project Discussion</h1>
        <p className="text-gray-400 mb-6">Select a project to discuss in depth.</p>
        
        {/* ATS score notification */}
        <div className="mb-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/50 text-sm text-gray-300 flex items-center justify-between">
          <span>
            {isSimulatedATS 
              ? `ℹ️ No resume uploaded. Using simulated projects based on ATS Score of 75%.`
              : `🎯 Projects loaded from your resume and customized for ATS Score: ${atsScore}%`}
          </span>
          {isSimulatedATS && <Link to="/resume" className="text-indigo-400 hover:underline">Upload Resume</Link>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -2 }} 
              onClick={() => setSelectedProject(i)} 
              className="glass-card glass-card-hover p-6 cursor-pointer"
            >
              <FiBriefcase className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="text-white font-semibold text-lg">{p.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{p.tech}</p>
              <Badge variant="info" className="mt-3">{p.questions?.length || 0} Questions</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  const project = projects[selectedProject];
  const q = project.questions[currentQ];
  const Icon = getCategoryIcon(q.category);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <button 
            onClick={() => { setSelectedProject(null); setCurrentQ(0); setAnswers({}); }} 
            className="text-sm text-gray-400 hover:text-white mb-1 flex items-center gap-1"
          >
            <FiArrowLeft /> Change Project
          </button>
          <h1 className="text-xl font-bold text-white">{project.name}</h1>
          <p className="text-gray-400 text-xs">Technologies: {project.tech}</p>
        </div>
        <Badge variant="info">Question {currentQ + 1} of {project.questions.length}</Badge>
      </div>

      <div className="glass-card p-8 mb-6 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          <Badge variant="info">{q.category}</Badge>
        </div>
        <p className="text-white text-lg font-medium mb-6">{q.q}</p>
        <Textarea 
          value={answers[currentQ] || ''} 
          onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
          placeholder="Describe your project choices, challenges, and implementation approach..." 
          className="min-h-[180px]" 
        />
      </div>

      <div className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} 
          disabled={currentQ === 0}
        >
          Previous
        </Button>
        {currentQ < project.questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(currentQ + 1)} icon={<FiArrowRight />} iconPosition="right">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="success">
            Submit Discussion
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectDiscussion;
