import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiSend, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import { Button, Badge, Card } from '@/components/ui';
import { selectProblem, setLanguage, setCode, runCode, submitCode, fetchCodingProblems } from '@/store/codingSlice';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

const CodingPage = () => {
  const dispatch = useDispatch();
  const { problems, selectedProblem, language, code, output, testResults, isRunning, isSubmitted, submissionResult, loading } = useSelector((state) => state.coding);
  const atsScore = useSelector((state) => state.resume.atsScore);

  useEffect(() => {
    dispatch(fetchCodingProblems());
  }, [dispatch]);

  useEffect(() => {
    if (isSubmitted && submissionResult) {
      dispatch(updateScore({ stage: 'coding', score: submissionResult.codeQuality }));
      dispatch(updateStageStatus({ stageId: 'coding', status: 'completed' }));
    }
  }, [isSubmitted, submissionResult, dispatch]);

  const handleRun = () => {
    if (!selectedProblem) return toast.error('Select a problem first');
    dispatch(runCode({ code, problem: selectedProblem, language }));
  };

  const handleSubmit = () => {
    if (!selectedProblem) return;
    dispatch(submitCode({ code, problem: selectedProblem }));
    toast.success('Code submitted!');
  };

  const handleEditorChange = (val) => { dispatch(setCode(val || '')); };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">Generating AI Coding Challenges tailored to your ATS level...</p>
      </div>
    );
  }

  if (!selectedProblem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Coding Assessment</h1>
        <p className="text-gray-400 mb-6">Select a problem to begin coding.</p>
        <div className="mb-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-gray-300 flex items-center justify-between">
          <span>
            {atsScore ? `🎯 AI has customized these coding problems for your resume ATS Score of ${atsScore}%` : 'ℹ️ No resume uploaded. Using a simulated ATS Score of 75% for dynamic AI coding challenges.'}
          </span>
          {!atsScore && <Link to="/resume" className="text-indigo-400 hover:underline">Upload Resume</Link>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -2 }} onClick={() => { dispatch(selectProblem(p)); }}
              className="glass-card glass-card-hover p-5 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{p.title}</h3>
                <Badge variant={p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'error'}>{p.difficulty}</Badge>
              </div>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>
              <Badge variant="info">{p.topic}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => dispatch(selectProblem(null))} className="text-sm text-gray-400 hover:text-white mb-1">Back to Problems</button>
          <h1 className="text-xl font-bold text-white">{selectedProblem.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <select value={language} onChange={(e) => dispatch(setLanguage(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
            {languages.map(l => <option key={l.value} value={l.value} className="bg-gray-900">{l.label}</option>)}
          </select>
          <Button variant="secondary" onClick={handleRun} loading={isRunning} icon={<FiPlay />} size="sm">Run</Button>
          <Button onClick={handleSubmit} loading={isRunning} icon={<FiSend />} size="sm">Submit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Problem Description */}
        <div className="glass-card p-6 overflow-y-auto">
          <h3 className="text-white font-semibold mb-2">Description</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{selectedProblem.description}</p>
          <h4 className="text-white font-semibold text-sm mb-2">Constraints</h4>
          <ul className="space-y-1 mb-4">
            {selectedProblem.constraints.map((c, i) => <li key={i} className="text-sm text-gray-400">- {c}</li>)}
          </ul>
          <h4 className="text-white font-semibold text-sm mb-2">Examples</h4>
          {selectedProblem.examples.map((ex, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3 mb-2 text-sm">
              <p className="text-gray-300"><span className="text-indigo-400">Input:</span> {ex.input}</p>
              <p className="text-gray-300"><span className="text-emerald-400">Output:</span> {ex.output}</p>
              {ex.explanation && <p className="text-gray-400 mt-1"><span className="text-amber-400">Explanation:</span> {ex.explanation}</p>}
            </div>
          ))}

          {/* Submission Results */}
          {isSubmitted && submissionResult && (
            <div className="mt-4">
              <h4 className="text-white font-semibold text-sm mb-2">Submission Result</h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success">{submissionResult.passed}/{submissionResult.total} Passed</Badge>
                <Badge variant="info">Quality: {submissionResult.codeQuality}%</Badge>
              </div>
              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-400">Time: {submissionResult.timeComplexity} | Space: {submissionResult.spaceComplexity}</p>
              </div>
              <h5 className="text-xs font-semibold text-gray-300 mb-1">AI Suggestions:</h5>
              {submissionResult.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-gray-400 py-1">- {s}</p>
              ))}
              <div className="mt-4">
                <Link to="/interview/technical">
                  <Button icon={<FiArrowRight />} iconPosition="right">
                    Proceed to Technical Interview
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Code Editor + Output */}
        <div className="flex flex-col gap-2" style={{ minHeight: 0 }}>
          <div className="flex-1 rounded-xl overflow-hidden border border-white/10">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 12 }, scrollBeyondLastLine: false, wordWrap: 'on' }}
            />
          </div>
          <div className="glass-card p-4 h-32 overflow-y-auto">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Output</h4>
            {output ? (
              <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-sm text-gray-500">Run your code to see output here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
