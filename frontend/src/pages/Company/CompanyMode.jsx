import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiActivity, FiRefreshCw, FiLayers, FiShield } from 'react-icons/fi';
import { Button, Badge, Card, Textarea, ProgressBar } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI, inferDomainAndSkills } from '@/services/aiService';
import toast from 'react-hot-toast';

const companies = [
  { id: 'google', name: 'Google', stages: 5, difficulty: 'Hard', focus: ['Algorithmic Complexity', 'Distributed Scale', 'Googliness'], tips: 'Focus on clean algorithmic complexity and scalable distributed patterns.' },
  { id: 'microsoft', name: 'Microsoft', stages: 4, difficulty: 'Medium', focus: ['Systems Design', 'Modular Architecture', 'Collaboration'], tips: 'Emphasize modular components and collaborative engineering decisions.' },
  { id: 'amazon', name: 'Amazon', stages: 5, difficulty: 'Hard', focus: ['Leadership Principles', 'Operational Excellence', 'Customer Obsession'], tips: 'Structure answers using Customer Obsession, Ownership, and Bias for Action.' },
  { id: 'infosys', name: 'Infosys', stages: 3, difficulty: 'Easy', focus: ['Core CS Fundamentals', 'Aptitude Math', 'Technical HR'], tips: 'Focus on fundamental data structures and clean verbal explanations.' },
  { id: 'tcs', name: 'TCS', stages: 3, difficulty: 'Easy', focus: ['System Reliability', 'Object-Oriented Design', 'Analytical Logic'], tips: 'Demonstrate disciplined engineering and algorithmic reliability.' },
  { id: 'wipro', name: 'Wipro', stages: 3, difficulty: 'Easy', focus: ['OOP Architecture', 'Database Normalization', 'Communication'], tips: 'Explain OOP concepts and clean code architecture.' },
];

const CompanyMode = () => {
  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const targetRole = useSelector((state) => state.resume.targetRole || state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');
  const atsReport = useSelector((state) => state.resume.atsReport);

  const { domain, skills, projects } = inferDomainAndSkills(resumeText, targetRole, atsReport);

  const [selected, setSelected] = useState(null);
  const [inSimulation, setInSimulation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const company = companies.find((c) => c.id === selected);

  const startSimulation = async (forceNew = false) => {
    if (!company) return;
    try {
      setLoading(true);
      setInSimulation(true);
      setSubmitted(false);
      setEvaluation(null);
      setAnswers({});
      setCurrent(0);

      const data = await generateInterviewQuestionsForStage({
        stageId: 'company',
        atsScore,
        targetRole,
        resumeText,
        projects,
        companyName: company.name,
        forceNew
      });

      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error starting company simulation:', err);
      toast.error('Failed to start company simulation.');
    } finally {
      setLoading(false);
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
        stageId: 'company',
        answers,
        questions,
        targetRole,
        companyName: company?.name
      });
      setEvaluation(evalData);
      setSubmitted(true);
      toast.success(`${company.name} interview evaluation complete`);
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast.error('Evaluation failed. Please retry.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Enterprise Company Tracks</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Calibrated hiring rubrics tailored to specific tech employers and your domain ({domain}).</p>
        </div>
      </div>

      {!inSimulation ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiLayers className="text-blue-400 shrink-0" />
              <span>Target Role: <strong className="text-white">{targetRole}</strong> · Calibrated ATS: <strong className="text-white">{atsScore}%</strong></span>
            </div>
            <span className="font-mono text-slate-400">Employer Track Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`glass-card p-5 cursor-pointer flex flex-col justify-between border transition-all ${
                  selected === c.id
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-base">{c.name}</h3>
                    <Badge variant={c.difficulty === 'Hard' ? 'error' : c.difficulty === 'Medium' ? 'warning' : 'success'}>
                      {c.difficulty}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{c.tips}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {c.focus.map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{c.stages} Interview Rounds</span>
                  <span className="text-blue-400 font-medium">Select Track →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => startSimulation()}
              disabled={!selected || loading}
              loading={loading}
              className="px-6 py-2.5"
            >
              {loading ? 'Synthesizing Track...' : `Launch ${company ? company.name : ''} Simulation`}
            </Button>
          </div>
        </div>
      ) : submitted && evaluation ? (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{company.name} Evaluation Scorecard</h2>
              <p className="text-xs text-slate-400 mt-0.5">Performance assessment for {targetRole} track.</p>
            </div>
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
              <FiActivity className="text-blue-400" /> Hiring Committee Feedback
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

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setInSimulation(false)}>
              Back to Companies
            </Button>
            <Button onClick={() => startSimulation(true)} icon={<FiRefreshCw />}>
              Retake Track
            </Button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-300">Generating {company?.name} hiring track questions for {domain}...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{company.name} Simulation</h2>
                <Badge variant="info">Question {current + 1} of {questions.length}</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{questions[current]?.category}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => startSimulation(true)}
              icon={<FiRefreshCw />}
            >
              Regenerate
            </Button>
          </div>

          {questions[current] && (
            <div className="glass-card p-6 border border-slate-800 space-y-4">
              <p className="text-white text-base font-medium leading-relaxed">{questions[current].question}</p>
              <Textarea
                value={answers[questions[current].id] || ''}
                onChange={(e) => setAnswers({ ...answers, [questions[current].id]: e.target.value })}
                placeholder={`Formulate your response tailored to ${company.name}'s engineering standards and culture...`}
                className="min-h-[200px] bg-slate-900 border-slate-700 text-xs leading-relaxed"
              />
            </div>
          )}

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
              <Button onClick={handleSubmit} variant="success" loading={evaluating}>
                Submit Track Assessment
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CompanyMode;
