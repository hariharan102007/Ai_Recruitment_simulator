import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiBookmark, FiCheck, FiRefreshCw, FiCpu, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button, Badge, CountdownTimer } from '@/components/ui';
import { fetchQuestions, setCategory, setDifficulty, startTest, setAnswer, setCurrentQuestion, toggleMarkForReview, submitTest, decrementTime, resetAptitude } from '@/store/aptitudeSlice';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import { inferDomainAndSkills } from '@/services/aiService';
import toast from 'react-hot-toast';

const categories = [
  { id: 'quantitative', name: 'Quantitative Engineering', desc: 'Latency, IOPS, cache hits, throughput & compute resource math' },
  { id: 'logical', name: 'Logical Reasoning', desc: 'Distributed workflows, deployment validation gates, sequences' },
  { id: 'verbal', name: 'Technical Verbal', desc: 'Architecture terminology, incident post-mortems, communication' },
  { id: 'dataInterpretation', name: 'Data Interpretation', desc: 'Telemetry graphs, latency percentiles, index analytics' },
];

const AptitudePage = () => {
  const dispatch = useDispatch();
  const { selectedCategory, questions, currentQuestion, answers, markedForReview, isStarted, isSubmitted, result, loading } = useSelector((state) => state.aptitude);
  const { atsScore, atsReport, parsedText, targetRole } = useSelector((state) => state.resume);
  const currentAtsScore = atsScore || 75;
  const adaptiveDifficulty = currentAtsScore < 60 ? 'easy' : currentAtsScore < 80 ? 'medium' : 'hard';

  const { domain, skills } = inferDomainAndSkills(parsedText, targetRole || atsReport?.targetRole, atsReport);

  useEffect(() => {
    if (isSubmitted && result) {
      dispatch(updateScore({ stage: 'aptitude', score: result.score }));
      dispatch(updateStageStatus({ stageId: 'aptitude', status: 'completed' }));
    }
  }, [isSubmitted, result, dispatch]);

  const handleStart = async (catId) => {
    const categoryToUse = catId || selectedCategory;
    if (!categoryToUse) {
      return toast.error('Please select an assessment category');
    }
    dispatch(setCategory(categoryToUse));
    try {
      const fetchRes = await dispatch(fetchQuestions({ category: categoryToUse, difficulty: adaptiveDifficulty, forceNew: true }));
      if (fetchRes.type === 'aptitude/fetchQuestions/fulfilled') {
        dispatch(startTest());
        toast.success(`Generated 5 questions tailored to ${domain}`);
      } else {
        toast.error('Failed to generate questions. Please retry.');
      }
    } catch {
      toast.error('Error initiating assessment.');
    }
  };

  const handleRegenerate = async () => {
    if (!selectedCategory) return;
    toast.loading('Generating fresh questions...', { id: 'regen' });
    const res = await dispatch(fetchQuestions({ category: selectedCategory, difficulty: adaptiveDifficulty, forceNew: true }));
    toast.dismiss('regen');
    if (res.type === 'aptitude/fetchQuestions/fulfilled') {
      toast.success('Generated brand-new non-repeating question set');
    }
  };

  const handleSubmit = () => {
    dispatch(submitTest());
    toast.success('Assessment submitted successfully');
  };

  if (!isStarted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Adaptive Aptitude Assessment</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Domain-grounded numerical throughput, logic reasoning, and telemetry analysis.</p>
          </div>
        </div>

        {/* Domain Context Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FiLayers className="text-blue-400 w-4 h-4 shrink-0" />
              <span>Calibrated Domain: <strong className="text-white">{domain}</strong> ({targetRole})</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400">{adaptiveDifficulty.toUpperCase()} (ATS {currentAtsScore}%)</span>
            </div>
            {!atsScore && (
              <Link to="/resume" className="text-xs text-blue-400 hover:text-blue-300">
                Calibrate Resume →
              </Link>
            )}
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => dispatch(setCategory(cat.id))}
              className={`glass-card p-5 cursor-pointer transition-all border ${
                selectedCategory === cat.id
                  ? 'border-blue-500 bg-blue-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                {selectedCategory === cat.id && (
                  <Badge variant="info">Selected</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={() => handleStart()}
            loading={loading}
            disabled={!selectedCategory || loading}
            className="px-6 py-2.5"
          >
            {loading ? 'Synthesizing Problems...' : 'Start Assessment'}
          </Button>

          {selectedCategory && (
            <Button
              variant="secondary"
              onClick={handleRegenerate}
              disabled={loading}
              icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
            >
              Regenerate Question Set
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (isSubmitted && result) {
    const pieData = [
      { name: 'Correct', value: result.correct, color: '#10b981' },
      { name: 'Incorrect', value: result.incorrect, color: '#ef4444' },
      { name: 'Unanswered', value: result.unanswered, color: '#64748b' },
    ];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Aptitude Results</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Performance evaluation for {selectedCategory} ({domain}).</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Overall Score', value: `${result.score}%` },
            { label: 'Accuracy', value: `${result.accuracy}%` },
            { label: 'Correct Answers', value: `${result.correct} / ${result.totalQuestions}` },
            { label: 'Elapsed Time', value: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 text-center border border-slate-800">
              <p className="text-2xl font-bold font-mono text-white tabular-nums">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-4">Response Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RTooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span>{d.name}: <strong className="text-slate-200 font-mono">{d.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-4">Question Review</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {questions.map((item, idx) => {
                const isCorrect = answers[item.id] === item.correct;
                return (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-slate-200">{idx + 1}. {item.question}</span>
                      <Badge variant={isCorrect ? 'success' : 'error'}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Correct Answer: <span className="text-emerald-400 font-medium">{item.options[item.correct]}</span>
                    </p>
                    {item.explanation && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">{item.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => dispatch(resetAptitude())}>
            Change Category
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              dispatch(resetAptitude());
              await handleStart(selectedCategory);
            }}
            icon={<FiRefreshCw />}
          >
            Practice Again
          </Button>
          <Link to="/coding">
            <Button icon={<FiArrowRight />} iconPosition="right">Proceed to Code Sandbox</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];
  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Generating domain question sets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white capitalize">{selectedCategory} Assessment</h1>
            <Badge variant="info">{domain}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Question {currentQuestion + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <CountdownTimer time={1800} warning={false} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card p-6 border border-slate-800">
          <div className="flex items-start justify-between mb-6">
            <p className="text-white font-medium text-base leading-relaxed">{q.question}</p>
            <button
              onClick={() => dispatch(toggleMarkForReview(q.id))}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                markedForReview.includes(q.id) ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Mark for review"
            >
              <FiBookmark className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => dispatch(setAnswer({ questionId: q.id, answer: i }))}
                className={`p-3.5 rounded-lg cursor-pointer transition-all border ${
                  answers[q.id] === i
                    ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      answers[q.id] === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-xs leading-relaxed">{opt}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              onClick={() => dispatch(setCurrentQuestion(Math.max(0, currentQuestion - 1)))}
              disabled={currentQuestion === 0}
              icon={<FiArrowLeft />}
            >
              Previous
            </Button>

            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={() => dispatch(setCurrentQuestion(currentQuestion + 1))}
                icon={<FiArrowRight />}
                iconPosition="right"
              >
                Next Question
              </Button>
            ) : (
              <Button onClick={handleSubmit} variant="success">
                Submit Assessment
              </Button>
            )}
          </div>
        </div>

        <div className="glass-card p-5 border border-slate-800 h-fit">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Questions</h4>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((qItem, i) => (
              <button
                key={i}
                onClick={() => dispatch(setCurrentQuestion(i))}
                className={`h-9 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  i === currentQuestion
                    ? 'bg-blue-600 text-white shadow-sm'
                    : answers[qItem.id] !== undefined
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                    : markedForReview.includes(qItem.id)
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-950 border border-emerald-800" /> Answered</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-950 border border-amber-800" /> Marked review</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800" /> Not visited</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudePage;
