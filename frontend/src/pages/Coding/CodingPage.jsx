import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiSend, FiArrowRight, FiCheck, FiX, FiRefreshCw, FiLayers, FiCode, FiTerminal } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import { Button, Badge } from '@/components/ui';
import { selectProblem, setLanguage, setCode, runCode, submitCode, fetchCodingProblems } from '@/store/codingSlice';
import { updateScore } from '@/store/analyticsSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import { inferDomainAndSkills } from '@/services/aiService';
import toast from 'react-hot-toast';

const languages = [
  { value: 'javascript', label: 'JavaScript (Node 20)' },
  { value: 'python', label: 'Python (3.11)' },
  { value: 'java', label: 'Java (OpenJDK 21)' },
];

const CodingPage = () => {
  const dispatch = useDispatch();
  const { problems, selectedProblem, language, code, output, testResults, isRunning, isSubmitted, submissionResult, loading } = useSelector((state) => state.coding);
  const { atsScore, atsReport, parsedText, targetRole } = useSelector((state) => state.resume);
  const currentAtsScore = atsScore || 75;

  const { domain, skills } = inferDomainAndSkills(parsedText, targetRole || atsReport?.targetRole, atsReport);

  useEffect(() => {
    if (!problems || problems.length === 0) {
      dispatch(fetchCodingProblems());
    }
  }, [dispatch, problems]);

  useEffect(() => {
    if (isSubmitted && submissionResult) {
      dispatch(updateScore({ stage: 'coding', score: submissionResult.codeQuality }));
      dispatch(updateStageStatus({ stageId: 'coding', status: 'completed' }));
    }
  }, [isSubmitted, submissionResult, dispatch]);

  const handleRun = () => {
    if (!selectedProblem) return toast.error('Select a challenge first');
    dispatch(runCode({ code, problem: selectedProblem, language }));
  };

  const handleSubmit = () => {
    if (!selectedProblem) return;
    dispatch(submitCode({ code, problem: selectedProblem }));
    toast.success('Submitted solution for automated AI evaluation');
  };

  const handleRegenerate = async () => {
    toast.loading('Synthesizing fresh coding challenges...', { id: 'regen-code' });
    const res = await dispatch(fetchCodingProblems({ forceNew: true }));
    toast.dismiss('regen-code');
    if (res.type === 'coding/fetchProblems/fulfilled') {
      toast.success('Generated brand-new coding challenges');
    }
  };

  const handleEditorChange = (val) => {
    dispatch(setCode(val || ''));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Formulating algorithmic challenges for {domain}...</p>
      </div>
    );
  }

  if (!selectedProblem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Interactive Coding Assessment</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Data structures and algorithms grounded in your target engineering stack.</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRegenerate}
            disabled={loading}
            icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
          >
            Regenerate Problems
          </Button>
        </div>

        {/* Domain Context Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FiLayers className="text-blue-400 w-4 h-4 shrink-0" />
              <span>Target Domain: <strong className="text-white">{domain}</strong> ({targetRole})</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400">ATS Rating: {currentAtsScore}%</span>
            </div>
            {!atsScore && (
              <Link to="/resume" className="text-xs text-blue-400 hover:text-blue-300">
                Calibrate Resume →
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p) => (
            <div
              key={p.id}
              onClick={() => { dispatch(selectProblem(p)); }}
              className="glass-card p-5 cursor-pointer flex flex-col justify-between border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={p.difficulty === 'Easy' ? 'success' : p.difficulty === 'Medium' ? 'warning' : 'error'}>
                    {p.difficulty}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">{p.topic}</span>
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{p.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4">{p.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-medium">
                <span>Solve in Editor</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(selectProblem(null))}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            ← Problems
          </button>
          <h1 className="text-base font-bold text-white">{selectedProblem.title}</h1>
          <Badge variant={selectedProblem.difficulty === 'Easy' ? 'success' : selectedProblem.difficulty === 'Medium' ? 'warning' : 'error'}>
            {selectedProblem.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value} className="bg-slate-900">
                {l.label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={handleRun} loading={isRunning} icon={<FiPlay />} size="sm">
            Run Tests
          </Button>
          <Button onClick={handleSubmit} loading={isRunning} icon={<FiSend />} size="sm">
            Submit Solution
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Problem Description & Results */}
        <div className="glass-card p-6 border border-slate-800 overflow-y-auto space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-200 font-semibold text-sm mb-2">Problem Statement</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4 whitespace-pre-line">{selectedProblem.description}</p>

            {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
              <>
                <h4 className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2">Constraints</h4>
                <ul className="space-y-1 mb-4 text-xs text-slate-300 font-mono">
                  {selectedProblem.constraints.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </>
            )}

            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2">Test Examples</h4>
            {selectedProblem.examples?.map((ex, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-2 text-xs font-mono">
                <p className="text-slate-300 mb-1"><span className="text-blue-400 font-semibold">Input:</span> {ex.input}</p>
                <p className="text-slate-300 mb-1"><span className="text-emerald-400 font-semibold">Output:</span> {ex.output}</p>
                {ex.explanation && (
                  <p className="text-slate-400 mt-1 font-sans"><span className="text-amber-400 font-semibold">Note:</span> {ex.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            {output && (
              <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <FiTerminal className="w-3.5 h-3.5 text-blue-400" /> Test Output
                  </span>
                </div>
                <pre className="text-slate-200 whitespace-pre-wrap">{output}</pre>
              </div>
            )}

            {isSubmitted && submissionResult && (
              <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-blue-500/40 text-xs">
                <h4 className="text-white font-semibold text-sm mb-2">AI Code Review & Quality Score</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="success">{submissionResult.passed}/{submissionResult.total} Cases Passed</Badge>
                  <Badge variant="info">Quality: {submissionResult.codeQuality}%</Badge>
                  <span className="text-slate-400 font-mono">Time Complexity: {submissionResult.timeComplexity}</span>
                </div>
                <div className="space-y-1 my-2">
                  {submissionResult.suggestions?.map((s, i) => (
                    <p key={i} className="text-slate-300">• {s}</p>
                  ))}
                </div>
                <div className="mt-4">
                  <Link to="/interview/technical">
                    <Button icon={<FiArrowRight />} iconPosition="right" size="sm">
                      Proceed to Technical Round
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="glass-card overflow-hidden flex flex-col border border-slate-800">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <FiCode className="text-blue-400" />
              solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}
            </span>
            <span>Target: {domain}</span>
          </div>
          <div className="flex-1 min-h-[450px]">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
              value={code}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: false,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
