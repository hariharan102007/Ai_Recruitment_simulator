import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiBookmark, FiCheck } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button, Card, Badge, CountdownTimer } from '@/components/ui';
import { fetchQuestions, setCategory, setDifficulty, startTest, setAnswer, setCurrentQuestion, toggleMarkForReview, submitTest, decrementTime, resetAptitude } from '@/store/aptitudeSlice';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import { useTimer } from '@/hooks/useTimer';
import toast from 'react-hot-toast';

const categories = [
  { id: 'quantitative', name: 'Quantitative', desc: 'Numbers, percentages, ratios', icon: '123' },
  { id: 'logical', name: 'Logical Reasoning', desc: 'Patterns, sequences, puzzles', icon: '🧩' },
  { id: 'verbal', name: 'Verbal Ability', desc: 'Grammar, vocabulary, comprehension', icon: '📝' },
  { id: 'dataInterpretation', name: 'Data Interpretation', desc: 'Charts, tables, data analysis', icon: '📊' },
];

const AptitudePage = () => {
  const dispatch = useDispatch();
  const { selectedCategory, selectedDifficulty, questions, currentQuestion, answers, markedForReview, isStarted, isSubmitted, result, loading } = useSelector((state) => state.aptitude);
  const atsScore = useSelector((state) => state.resume.atsScore);
  const adaptiveDifficulty = atsScore < 60 ? 'easy' : atsScore < 80 ? 'medium' : 'hard';

  useEffect(() => {
    if (isSubmitted && result) {
      dispatch(updateScore({ stage: 'aptitude', score: result.score }));
      dispatch(updateStageStatus({ stageId: 'aptitude', status: 'completed' }));
    }
  }, [isSubmitted, result, dispatch]);

  const handleStart = () => {
    if (!selectedCategory) return toast.error('Please select a category');
    dispatch(fetchQuestions({ category: selectedCategory, difficulty: adaptiveDifficulty }));
    dispatch(startTest());
  };

  const handleSubmit = () => { dispatch(submitTest()); toast.success('Test submitted!'); };

  if (!isStarted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Aptitude Assessment</h1>
        <p className="text-gray-400 mb-6">Test your quantitative, logical, verbal, and data interpretation skills.</p>
        <div className="mb-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-gray-300 flex items-center justify-between">
          <span>
            {atsScore ? `🎯 AI has customized these questions for your resume ATS Score of ${atsScore}%` : 'ℹ️ No resume uploaded. Using a simulated ATS Score of 75% for dynamic AI question generation.'}
          </span>
          {!atsScore && <Link to="/resume" className="text-indigo-400 hover:underline">Upload Resume</Link>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map((cat) => (
            <motion.div key={cat.id} whileHover={{ y: -2 }} onClick={() => dispatch(setCategory(cat.id))}
              className={`glass-card p-6 cursor-pointer transition-all ${selectedCategory === cat.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/30' : ''}`}>
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="text-white font-semibold mt-3">{cat.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mb-6 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-sm text-gray-300">
          <p>AI will generate a single ATS-tailored question set for this category at the <span className="font-semibold text-white">{adaptiveDifficulty}</span> level.</p>
        </div>
        <Button onClick={handleStart} loading={loading}>Start Test</Button>
      </motion.div>
    );
  }

  if (isSubmitted && result) {
    const pieData = [
      { name: 'Correct', value: result.correct, color: '#10b981' },
      { name: 'Incorrect', value: result.incorrect, color: '#ef4444' },
      { name: 'Unanswered', value: result.unanswered, color: '#6b7280' },
    ];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-8">Aptitude Results</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Score', value: `${result.score}%`, color: 'from-indigo-500 to-purple-500' },
            { label: 'Accuracy', value: `${result.accuracy}%`, color: 'from-emerald-500 to-teal-500' },
            { label: 'Correct', value: result.correct, color: 'from-green-500 to-emerald-500' },
            { label: 'Time Taken', value: `${Math.floor(result.timeTaken / 60)}m`, color: 'from-amber-500 to-orange-500' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5 text-center">
              <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Answer Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RTooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: d.color }} /><span className="text-xs text-gray-400">{d.name}: {d.value}</span></div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Feedback</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Your performance in {selectedCategory} shows strong fundamentals.</p>
              <p className="text-sm text-gray-300">Focus areas: Time management and accuracy on medium-difficulty questions.</p>
              <p className="text-sm text-gray-300">Recommended: Practice more data interpretation questions to improve speed.</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => dispatch(resetAptitude())}>Retake Test</Button>
          <Link to="/coding"><Button icon={<FiArrowRight />} iconPosition="right">Proceed to Coding</Button></Link>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];
  if (!q) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Aptitude Test</h1>
          <p className="text-sm text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
        </div>
        <CountdownTimer time={1800} warning={false} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card p-6">
          <div className="flex items-start justify-between mb-6">
            <p className="text-white font-medium text-lg">{q.question}</p>
            <button onClick={() => dispatch(toggleMarkForReview(q.id))}
              className={`p-2 rounded-lg ${markedForReview.includes(q.id) ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:bg-white/5'}`}>
              <FiBookmark className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <motion.div key={i} whileHover={{ x: 4 }}
                onClick={() => dispatch(setAnswer({ questionId: q.id, answer: i }))}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${answers[q.id] === i ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${answers[q.id] === i ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  {opt}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="secondary" onClick={() => dispatch(setCurrentQuestion(Math.max(0, currentQuestion - 1)))} icon={<FiArrowLeft />}>Previous</Button>
            {currentQuestion < questions.length - 1 ? (
              <Button onClick={() => dispatch(setCurrentQuestion(currentQuestion + 1))} icon={<FiArrowRight />} iconPosition="right">Next</Button>
            ) : (
              <Button onClick={handleSubmit} variant="success">Submit Test</Button>
            )}
          </div>
        </div>
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Question Grid</h4>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((qItem, i) => (
              <button key={i} onClick={() => dispatch(setCurrentQuestion(i))}
                className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                  i === currentQuestion ? 'bg-indigo-600 text-white' :
                  answers[qItem.id] !== undefined ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  markedForReview.includes(qItem.id) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-white/5 text-gray-400 border border-white/10'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" /> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" /> Marked</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/5 border border-white/10" /> Not Visited</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudePage;
