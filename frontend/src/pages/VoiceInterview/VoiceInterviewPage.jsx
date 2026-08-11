import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiVolume2, FiStopCircle, FiActivity } from 'react-icons/fi';
import { Button, Card, Badge, ProgressBar } from '@/components/ui';
import { generateInterviewQuestionsForStage, evaluateStageAnswersWithAI } from '@/services/aiService';
import toast from 'react-hot-toast';

const VoiceInterviewPage = () => {
  // Select profile and ATS state
  const atsScore = useSelector((state) => state.resume.atsScore || 75);
  const isSimulatedATS = !useSelector((state) => state.resume.atsScore);
  const targetRole = useSelector((state) => state.resume.atsReport?.targetRole || 'Full Stack Developer');
  const resumeText = useSelector((state) => state.resume.parsedText || '');

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  // Load questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await generateInterviewQuestionsForStage({
          stageId: 'voice',
          atsScore,
          targetRole,
          resumeText
        });
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Failed to load voice questions:', error);
        toast.error('Failed to load voice questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [atsScore, targetRole]);

  // Setup Web Speech API
  useEffect(() => {
    if (speechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied.');
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [speechSupported]);

  const toggleRecording = () => {
    if (!speechSupported) {
      if (isRecording) {
        setIsRecording(false);
        const simulatedText = 'I implemented a microservices architecture using Node.js and Docker. The main challenge was managing inter-service communication, which I solved using RabbitMQ message queues.';
        setTranscript(simulatedText);
        setAnswers({ ...answers, [questions[current].id]: simulatedText });
        toast.success('Simulation stopped');
      } else {
        setIsRecording(true);
        setTranscript('');
        toast('Speech API not supported in this browser. Simulating recording...');
      }
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        setAnswers({ ...answers, [questions[current].id]: transcript });
      }
      toast.success('Recording stopped');
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success('Recording started... Speak clearly.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to start microphone. Please try again.');
      }
    }
  };

  const handleNext = () => {
    if (transcript.trim() && !answers[questions[current].id]) {
      setAnswers({ ...answers, [questions[current].id]: transcript });
    }
    setTranscript('');
    setCurrent(current + 1);
  };

  const handlePrevious = () => {
    setCurrent(current - 1);
    setTranscript(answers[questions[current - 1].id] || '');
  };

  const handleSubmit = async () => {
    const updatedAnswers = { ...answers };
    if (transcript.trim()) {
      updatedAnswers[questions[current].id] = transcript;
    }

    const totalAnswered = Object.keys(updatedAnswers).length;
    if (totalAnswered === 0) {
      return toast.error('Please record at least one answer before finishing.');
    }

    try {
      setEvaluating(true);
      const evalData = await evaluateStageAnswersWithAI({
        stageId: 'voice',
        answers: updatedAnswers,
        questions,
        targetRole
      });
      setEvaluation(evalData);
      setSubmitted(true);
      toast.success('Voice interview evaluated by AI!');
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast.error('AI evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const playQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      toast('Playing audio...');
    } else {
      toast.error('Text-to-speech not supported.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is designing voice questions tailored for your level...</p>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm">AI is evaluating your speech clarity and response quality...</p>
      </div>
    );
  }

  if (submitted && evaluation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold text-white mb-8">Voice Interview - Analysis</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {evaluation.scores?.map((s, i) => (
            <div key={i} className="glass-card p-5">
              <ProgressBar label={s.label} value={s.value} color="indigo" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FiActivity className="text-indigo-400" />
            AI Coaching & Speech Feedback
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            {evaluation.feedback?.map((fb, idx) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                {fb}
              </p>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Note: Speech evaluation metrics assess clarity, pacing, and core content relevance.</p>
        </div>
      </motion.div>
    );
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="text-center py-20 text-gray-400">
        No questions available. Please try again.
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-white mb-2">Voice Interview Mode</h1>
      <p className="text-gray-400 mb-6">Practice answering questions verbally with AI-powered speech analysis.</p>

      {/* ATS score notification */}
      <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/50 text-xs text-indigo-300">
        {isSimulatedATS 
          ? `ℹ️ Using simulated questions based on ATS Score of 75%.`
          : `🎯 Questions customized by AI for your ATS Score: ${atsScore}%`}
      </div>

      <div className="glass-card p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => playQuestion(q.question)} 
            className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/30 transition-all"
            title="Read Question Aloud"
          >
            <FiVolume2 className="w-5 h-5" />
          </button>
          <Badge variant="info">Question {current + 1}/{questions.length}</Badge>
        </div>
        <p className="text-white text-lg font-medium mb-8">{q.question}</p>

        {/* Recording UI */}
        <div className="flex flex-col items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 shadow-lg shadow-red-500/30 animate-pulse' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
            }`}
          >
            {isRecording ? <FiStopCircle className="w-8 h-8 text-white" /> : <FiMic className="w-8 h-8 text-white" />}
          </motion.button>
          <p className="text-sm text-gray-400">
            {isRecording ? 'Listening... Click to stop recording' : 'Click microphone to record your response'}
          </p>

          {/* Waveform animation */}
          {isRecording && (
            <div className="flex items-center gap-1 h-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  animate={{ height: [4, Math.random() * 28 + 4, 4] }} 
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                  className="w-1 bg-indigo-500 rounded-full" 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {(transcript || answers[q.id]) && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Transcript</h3>
          <p className="text-white text-sm leading-relaxed">
            {transcript || answers[q.id]}
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={handlePrevious} 
          disabled={current === 0}
        >
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button onClick={handleNext}>Next Question</Button>
        ) : (
          <Button onClick={handleSubmit} variant="success">Finish Interview</Button>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceInterviewPage;
