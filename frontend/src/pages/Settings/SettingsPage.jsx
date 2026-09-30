import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiCpu, FiMic, FiDatabase, FiCheck, FiTrash2, FiVolume2, FiRefreshCw, FiLayers, FiSliders, FiSun } from 'react-icons/fi';
import { Button, Badge, Card, Textarea } from '@/components/ui';
import { setTargetRole, clearResume } from '@/store/resumeSlice';
import { resetInterview } from '@/store/interviewSlice';
import { resetAptitude } from '@/store/aptitudeSlice';
import { resetCoding } from '@/store/codingSlice';
import { setColorTheme } from '@/store/uiSlice';
import { inferDomainAndSkills } from '@/services/aiService';
import toast from 'react-hot-toast';

const domainOptions = [
  { label: 'Full Stack Developer', domain: 'Full Stack Development' },
  { label: 'Frontend Developer', domain: 'Frontend Engineering' },
  { label: 'Backend Developer', domain: 'Backend & Distributed Systems' },
  { label: 'DevOps & Cloud Engineer', domain: 'DevOps & Cloud Architecture' },
  { label: 'Data Scientist & ML Engineer', domain: 'Machine Learning & Data Science' },
  { label: 'Mobile App Developer', domain: 'Mobile App Development' },
  { label: 'Data Engineer', domain: 'Data Engineering & Analytics' },
];

const colorThemes = [
  { id: 'teal', name: 'Electric Cyan & Teal', desc: 'Modern high-tech platform standard', primary: '#0ea5e9', accent: '#14b8a6', surface: '#10182b' },
  { id: 'cobalt', name: 'Enterprise Cobalt Blue', desc: 'Authoritative B2B SaaS executive theme', primary: '#3b82f6', accent: '#60a5fa', surface: '#131b2e' },
  { id: 'emerald', name: 'Emerald Infrastructure', desc: 'High-contrast engineering devtools look', primary: '#10b981', accent: '#34d399', surface: '#0f2218' },
  { id: 'titanium', name: 'Monochrome Titanium', desc: 'Ultra-clean minimalist dark workspace', primary: '#f8fafc', accent: '#94a3b8', surface: '#16161c' },
];

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { colorTheme } = useSelector((state) => state.ui);
  const { targetRole, parsedText, atsScore, atsReport } = useSelector((state) => state.resume);

  const [name, setName] = useState(user?.name || 'Candidate User');
  const [email, setEmail] = useState(user?.email || 'candidate@example.com');
  const [selectedRole, setSelectedRole] = useState(targetRole || 'Full Stack Developer');
  
  // Audio & Mic Testing state
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [speechLang, setSpeechLang] = useState('en-US');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  const { domain, skills } = inferDomainAndSkills(parsedText, selectedRole, atsReport);

  const handleSaveProfile = () => {
    dispatch(setTargetRole(selectedRole));
    toast.success('Settings & Domain configuration saved successfully');
  };

  const handleThemeChange = (themeId) => {
    dispatch(setColorTheme(themeId));
    toast.success(`Active theme updated to ${colorThemes.find(t => t.id === themeId)?.name}`);
  };

  const startMicTest = async () => {
    try {
      if (isTestingMic) {
        stopMicTest();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsTestingMic(true);
      toast.success('Microphone active! Speak to see volume levels.');

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.error('Mic test error:', err);
      toast.error('Could not access microphone. Please check browser permissions.');
    }
  };

  const stopMicTest = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    setIsTestingMic(false);
    setMicVolume(0);
  };

  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  const testTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        'Voice synthesis check. Speech engine is calibrated and ready for technical interview rounds.'
      );
      utterance.rate = ttsRate;
      utterance.pitch = ttsPitch;
      utterance.lang = speechLang;
      window.speechSynthesis.speak(utterance);
      toast.success('Playing voice sample audio...');
    } else {
      toast.error('Speech synthesis not supported in this browser.');
    }
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to reset all candidate session data, resume text, and scores?')) {
      dispatch(clearResume());
      dispatch(resetInterview());
      dispatch(resetAptitude());
      dispatch(resetCoding());
      toast.success('Session reset. Ready for fresh candidate calibration.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Platform Configuration & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Calibrate your candidate profile, user interface theme, microphone input, and AI engine parameters.</p>
      </div>

      {/* Live UI Color Theme Customizer */}
      <div className="glass-card p-6 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FiSliders className="text-blue-400" /> Platform Visual Theme & Palette
          </h3>
          <span className="text-xs text-slate-400">Live 1-Click Update</span>
        </div>
        <p className="text-xs text-slate-400">Select the executive color palette for the entire platform interface:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {colorThemes.map((t) => {
            const isSelected = colorTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-slate-900 shadow-md ring-1 ring-blue-500/50'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.accent }} />
                  </div>
                  {isSelected && <FiCheck className="w-4 h-4 text-blue-400" />}
                </div>
                <p className="text-xs font-semibold text-white">{t.name}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Target Domain */}
        <div className="glass-card p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FiUser className="text-blue-400" /> Candidate Profile & Target Domain
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Candidate Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Target Engineering Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {domainOptions.map((opt, i) => (
                  <option key={i} value={opt.label} className="bg-slate-900">
                    {opt.label} ({opt.domain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <FiLayers className="text-blue-400 shrink-0" />
              <span>Calibrated Domain: <strong className="text-white">{domain}</strong></span>
            </div>
            <p>ATS Rating: <strong className="text-white font-mono">{atsScore || 75}%</strong></p>
          </div>

          <Button onClick={handleSaveProfile} className="w-full" icon={<FiCheck />}>
            Save Profile & Domain Configuration
          </Button>
        </div>

        {/* AI & Model Diagnostics */}
        <div className="glass-card p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FiCpu className="text-blue-400" /> AI Engine Configuration
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Active Model</span>
              <Badge variant="info">Gemini 3.1 Flash</Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Fallback Engine</span>
              <Badge variant="success">Deterministic Domain Generator</Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Anti-Repetition Seed</span>
              <span className="font-mono text-emerald-400">Dynamic Anti-Collision</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Access Tier</span>
              <Badge variant="success">100% Free & Open Access</Badge>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            Secure AI Studio proxy active. All LLM calls run server-side without client keys.
          </div>
        </div>
      </div>

      {/* Voice & Speech Synthesis Settings */}
      <div className="glass-card p-6 space-y-4 border border-slate-800">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FiMic className="text-blue-400" /> Voice Interview & Microphone Audio Calibration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mic Tester */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-900 border border-slate-800">
            <h4 className="text-xs font-semibold text-white">Live Microphone Test</h4>
            <p className="text-[11px] text-slate-400">Verify microphone input and monitor live speech audio gain.</p>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Input Gain Level:</span>
                <span className="font-mono">{micVolume}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <motion.div
                  className={`h-full transition-all duration-75 ${
                    micVolume > 70 ? 'bg-red-500' : micVolume > 30 ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${micVolume}%` }}
                />
              </div>
            </div>

            <Button
              variant={isTestingMic ? 'danger' : 'secondary'}
              onClick={startMicTest}
              size="sm"
              icon={<FiMic />}
            >
              {isTestingMic ? 'Stop Microphone Test' : 'Test Microphone'}
            </Button>
          </div>

          {/* Text to Speech config */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-900 border border-slate-800">
            <h4 className="text-xs font-semibold text-white">Question Speaker Speech Synthesis</h4>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Playback Speed: {ttsRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Speech Recognition Accent</label>
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="en-AU">English (Australia)</option>
                </select>
              </div>

              <Button variant="secondary" onClick={testTTS} size="sm" icon={<FiVolume2 />}>
                Test Audio Voice
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FiDatabase className="text-rose-400" /> Session & Cache Management
        </h3>
        <p className="text-xs text-slate-400">
          Clear your local cached resume, reset interview scores, or start a completely fresh session anytime.
        </p>

        <div className="pt-1">
          <Button variant="danger" onClick={handleResetAllData} icon={<FiTrash2 />} size="sm">
            Reset All Assessment Data
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
