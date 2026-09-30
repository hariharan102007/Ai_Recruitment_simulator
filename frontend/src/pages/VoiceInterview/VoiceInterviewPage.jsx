import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiVolume2, FiStopCircle, FiActivity, FiRefreshCw, FiLayers, FiEdit3, FiArrowLeft, FiArrowRight, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Button, Badge, ProgressBar, Textarea } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI, inferDomainAndSkills } from '@/services/aiService';
import toast from 'react-hot-toast';

const VoiceInterviewPage = () => {
  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const targetRole = useSelector((state) => state.resume.targetRole || state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');
  const atsReport = useSelector((state) => state.resume.atsReport);

  const { domain, skills, projects } = inferDomainAndSkills(resumeText, targetRole, atsReport);

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [micBlocked, setMicBlocked] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  const speechSupported = typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const fetchQuestions = async (forceNew = false) => {
    try {
      setLoading(true);
      const data = await generateInterviewQuestionsForStage({
        stageId: 'voice',
        atsScore,
        targetRole,
        resumeText,
        projects,
        forceNew
      });
      setQuestions(data.questions || []);
      setCurrent(0);
    } catch (error) {
      console.error('Failed to load voice questions:', error);
      toast.error('Failed to load voice questions.', { id: 'voice-status' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [atsScore, targetRole, resumeText]);

  useEffect(() => {
    if (questions[current]) {
      const qId = questions[current].id;
      setTranscript(answers[qId] || '');
      setInterimText('');
    }
  }, [current, questions]);

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    setAudioLevel(0);
  };

  const stopRecording = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.warn('Stop error:', e);
    }
    stopAudioVisualizer();
    setIsRecording(false);
    setInterimText('');
    toast.success('Recording complete. Transcript saved.', { id: 'voice-status' });
  };

  useEffect(() => {
    if (speechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalAccumulated = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalAccumulated += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const fullText = (finalAccumulated).trim();
        if (fullText) {
          setTranscript(fullText);
          if (questions[current]) {
            setAnswers((prev) => ({ ...prev, [questions[current].id]: fullText }));
          }
        }
        setInterimText(currentInterim);
      };

      rec.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicBlocked(true);
          toast.error('Microphone blocked. Direct text input enabled.', { id: 'voice-status' });
          stopAudioVisualizer();
          setIsRecording(false);
        }
      };

      rec.onend = () => {
        if (isRecording) {
          try {
            rec.start();
          } catch {
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = rec;
    }
  }, [speechSupported, current, questions, isRecording]);

  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const renderAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(renderAudioLevel);
      };
      renderAudioLevel();
    } catch (err) {
      console.warn('Audio visualizer error:', err);
    }
  };

  const startRecording = async () => {
    if (!speechSupported) {
      toast.error('Speech recognition not supported in browser. Direct input enabled.', { id: 'voice-status' });
      return;
    }

    try {
      setMicBlocked(false);
      recognitionRef.current?.start();
      setIsRecording(true);
      await startAudioVisualizer();
      toast.success('Listening... Speak your response clearly.', { id: 'voice-status' });
    } catch (err) {
      console.warn('Start recording:', err);
      setIsRecording(true);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playQuestion = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      toast.success('Reading question aloud...', { id: 'voice-status' });
    } else {
      toast.error('Text-to-speech unavailable.', { id: 'voice-status' });
    }
  };

  const handleNext = () => {
    if (isRecording) stopRecording();
    setCurrent((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    if (isRecording) stopRecording();
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const handleRegenerate = async () => {
    toast.loading('Generating fresh questions...', { id: 'voice-status' });
    await fetchQuestions(true);
    toast.success('Generated new voice questions', { id: 'voice-status' });
  };

  const handleSubmit = async () => {
    if (isRecording) stopRecording();

    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered === 0 && !transcript) {
      return toast.error('Please formulate a response before submitting.', { id: 'voice-status' });
    }

    const finalAnswers = { ...answers };
    if (questions[current] && transcript) {
      finalAnswers[questions[current].id] = transcript;
    }

    try {
      setEvaluating(true);
      const evalData = await evaluateStageAnswersWithAI({
        stageId: 'voice',
        answers: finalAnswers,
        questions,
        targetRole
      });
      setEvaluation(evalData);
      setSubmitted(true);
      toast.success('Voice interview evaluation complete', { id: 'voice-status' });
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Evaluation failed. Please retry.', { id: 'voice-status' });
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Formulating verbal communication questions for {domain}...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-300">Evaluating speech transcription, articulation, and domain knowledge...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Voice Assessment Scorecard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Verbal clarity and communication telemetry for {targetRole} ({domain}).</p>
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
            <FiActivity className="text-blue-400" /> AI Speech & Articulation Feedback
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
            Retake Voice Round
          </Button>
        </div>
      </motion.div>
    );
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="text-center py-20 text-slate-400 space-y-3">
        <p className="text-xs">No questions available.</p>
        <Button onClick={() => fetchQuestions(true)} variant="secondary" icon={<FiRefreshCw />} size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Voice & Speech Interview Mode</h1>
          <p className="text-xs text-slate-400 mt-0.5">Speak answers aloud for real-time speech transcription, or refine your transcript directly.</p>
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
          <span>Domain: <strong className="text-white">{domain}</strong> ({targetRole}) · ATS {atsScore}%</span>
        </div>
        <Badge variant="info">{q.category || 'Speech Articulation'}</Badge>
      </div>

      {/* Question Card */}
      <div className="glass-card p-6 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => playQuestion(q.question)}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
              title="Read Question Aloud"
            >
              <FiVolume2 className="w-3.5 h-3.5 text-blue-400" /> Read Aloud
            </button>
            <Badge variant="info">Question {current + 1} of {questions.length}</Badge>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Audio Mode</span>
        </div>

        <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>

        {/* Microphone Recording Section */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500'
            }`}
          >
            {isRecording ? <FiStopCircle className="w-7 h-7" /> : <FiMic className="w-7 h-7" />}
          </motion.button>

          <div className="text-center">
            <p className="text-xs font-semibold text-white">
              {isRecording ? 'Listening & Transcribing Live...' : 'Click microphone to record your response'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isRecording ? 'Speak clearly into your microphone' : 'Live transcript will generate automatically below'}
            </p>
          </div>

          {micBlocked && (
            <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>Microphone permission was blocked. You can type or paste your response directly in the text area below.</span>
            </div>
          )}

          {/* Soundwave */}
          {isRecording && (
            <div className="flex items-center gap-1 h-8 px-4 py-1 rounded-full bg-slate-950 border border-slate-800">
              {Array.from({ length: 20 }).map((_, i) => {
                const dynamicHeight = Math.max(3, Math.min(28, (audioLevel / 100) * 28 * (0.4 + Math.random() * 0.8)));
                return (
                  <motion.div
                    key={i}
                    animate={{ height: dynamicHeight }}
                    transition={{ duration: 0.1 }}
                    className="w-1 bg-blue-400 rounded-full"
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Live Speech-to-Text Transcript View */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiEdit3 className="text-blue-400" /> Response Transcript
            </span>
            {isRecording && (
              <span className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Recording Live
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs focus-within:border-blue-500 transition-colors">
            <textarea
              value={transcript}
              onChange={(e) => {
                const val = e.target.value;
                setTranscript(val);
                if (questions[current]) {
                  setAnswers((prev) => ({ ...prev, [questions[current].id]: val }));
                }
              }}
              placeholder="Your transcribed answer appears here. You can also type, refine, or paste text anytime..."
              className="w-full bg-transparent border-0 text-slate-200 placeholder-slate-500 focus:outline-none resize-y min-h-[110px] leading-relaxed text-xs"
            />
            {interimText && (
              <p className="text-[11px] text-blue-300/80 italic mt-2 border-t border-slate-800 pt-1.5">
                Speaking: "{interimText}"
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={current === 0}
          icon={<FiArrowLeft />}
        >
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button onClick={handleNext} icon={<FiArrowRight />} iconPosition="right">
            Next Question
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="success">
            Submit Voice Interview
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceInterviewPage;
