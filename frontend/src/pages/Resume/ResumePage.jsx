import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheck, FiX, FiArrowRight, FiSearch, FiEye, FiEyeOff, FiAlertCircle, FiInfo, FiEdit3, FiLayers, FiFileText } from 'react-icons/fi';
import { FileUpload, Button, Badge, ProgressBar, Textarea } from '@/components/ui';
import { uploadResume, analyzeResume, clearResume, clearError, setManualResumeText, setTargetRole } from '@/store/resumeSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import { inferDomainAndSkills } from '@/services/aiService';
import { saveResumeToCloud } from '@/firebase/firestoreService';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const roleOptions = [
  { value: 'fullstack', label: 'Full Stack Developer', domain: 'Full Stack Development' },
  { value: 'frontend', label: 'Frontend Developer', domain: 'Frontend Engineering' },
  { value: 'backend', label: 'Backend Developer', domain: 'Backend & Distributed Systems' },
  { value: 'devops', label: 'DevOps & Cloud Engineer', domain: 'DevOps & Cloud Architecture' },
  { value: 'data-scientist', label: 'Data Scientist & ML Engineer', domain: 'Machine Learning & Data Science' },
  { value: 'mobile', label: 'Mobile App Developer', domain: 'Mobile App Development' },
  { value: 'data-eng', label: 'Data Engineer', domain: 'Data Engineering & Analytics' },
];

const sampleResumes = {
  frontend: `EXPERIENCE:
Senior Frontend Developer - Acme Tech (2022-Present)
• Architected core React 19 and Next.js SPA serving 500,000 MAU with 98 Lighthouse performance score.
• Integrated Redux Toolkit, Tailwind CSS, WebSockets for live collaborative feeds, and Monaco editor.
• Implemented client-side caching, virtualized lists for 50k items, and optimized webpack/vite bundles by 45%.

PROJECTS:
• Real-time Analytics Dashboard: Built with React, TypeScript, Tailwind, Recharts, and WebSockets.
• Interactive UI Component Library: Developed accessible headless component system with Cypress/Jest test suites.

SKILLS: React, TypeScript, Next.js, Redux, Tailwind CSS, JavaScript (ES6+), HTML5, CSS3, GraphQL, Vite, Jest, Webpack.`,

  backend: `EXPERIENCE:
Backend Distributed Systems Engineer - CloudScale Corp (2021-Present)
• Designed and maintained Node.js / Express and Go microservices handling 25,000 requests/sec.
• Optimized PostgreSQL database queries with B-Tree indexes and partitioned high-volume transaction tables.
• Implemented Redis distributed locks, Kafka message queues for asynchronous order pipelines, and Dockerized deployment.

PROJECTS:
• High-Throughput Payment Orchestrator: Built with Node.js, Express, PostgreSQL, Redis, and Stripe API with idempotency keys.
• Event-Driven Notification Stream: Developed Kafka event consumer processing 2M daily alerts.

SKILLS: Node.js, Express, Go, PostgreSQL, Redis, Apache Kafka, Docker, Kubernetes, REST APIs, gRPC, Microservices, MongoDB, JWT.`,

  ml: `EXPERIENCE:
Machine Learning Engineer - DataMind AI (2022-Present)
• Developed predictive recommendation algorithms and NLP text classification pipelines with PyTorch and Transformers.
• Deployed real-time inference microservices using FastAPI and Triton Server with sub-30ms latency.
• Engineered automated data preprocessing and feature extraction using Pandas, NumPy, and Scikit-Learn.

PROJECTS:
• Resume Intelligence Matcher: Fine-tuned BERT model for semantic entity extraction and candidate matching.
• Automated Anomaly Detector: Built real-time time-series telemetry analysis with PyTorch and FastAPI.

SKILLS: Python, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, FastAPI, Docker, NLP, LLMs, Computer Vision, SQL.`,

  devops: `EXPERIENCE:
DevOps & Cloud Architect - InfraCore Systems (2021-Present)
• Managed multi-region Kubernetes (EKS) clusters with Terraform, Helm, and ArgoCD GitOps pipelines.
• Automated CI/CD workflows using GitHub Actions and Jenkins, cutting deployment time from 45m to 6m.
• Implemented Prometheus, Grafana, and OpenTelemetry monitoring with proactive SLA alerting.

PROJECTS:
• Multi-Region GitOps Kubernetes Platform: Configured automated blue-green deployments on AWS with Terraform.
• Zero-Trust Service Mesh: Deployed Istio ingress gateway and mutual TLS encryption.

SKILLS: Kubernetes, Docker, AWS, Terraform, CI/CD, GitHub Actions, Linux, Nginx, Prometheus, Grafana, Bash, Helm, Ansible.`
};

const ResumePage = () => {
  const dispatch = useDispatch();
  const { file, uploading, loading, atsReport, parsedText, targetRole, error } = useSelector((state) => state.resume);
  const user = useSelector((state) => state.auth?.user);
  const [selectedRole, setSelectedRole] = useState(targetRole || 'Full Stack Developer');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'templates'
  const [pastedText, setPastedText] = useState('');

  const { domain, skills, projects } = inferDomainAndSkills(parsedText, selectedRole, atsReport);

  const handleFileDrop = async (f) => {
    dispatch(clearError());
    const result = await dispatch(uploadResume(f));
    if (result.type === 'resume/upload/fulfilled') {
      toast.success(`Resume parsed successfully (${result.payload.extractedText?.length || 0} characters)`);
    } else {
      toast.error(result.payload || 'Failed to process resume');
    }
  };

  const handleApplyPastedText = () => {
    if (!pastedText.trim() || pastedText.trim().length < 40) {
      return toast.error('Please enter at least 40 characters of resume text');
    }
    dispatch(setManualResumeText(pastedText.trim()));
    toast.success('Resume text calibrated successfully');
  };

  const handleApplyTemplate = (key, roleName) => {
    const text = sampleResumes[key];
    setPastedText(text);
    setSelectedRole(roleName);
    dispatch(setManualResumeText(text));
    dispatch(setTargetRole(roleName));
    toast.success(`Loaded ${roleName} profile profile`);
  };

  const handleAnalyze = async () => {
    if (!parsedText) return toast.error('Please upload or paste a resume first');
    
    dispatch(setTargetRole(selectedRole));
    const result = await dispatch(analyzeResume({ targetRole: selectedRole }));
    
    if (result.type === 'resume/analyze/fulfilled') {
      dispatch(updateStageStatus({ stageId: 'ats', status: 'completed' }));
      if (user?.id) {
        saveResumeToCloud(user.id, {
          targetRole: selectedRole,
          domain,
          parsedText,
          atsScore: result.payload?.atsScore || 75,
          atsReport: result.payload,
        }).catch((err) => console.warn('Cloud sync note:', err));
      }
      toast.success('AI ATS analysis and profile calibration complete');
    } else {
      toast.error(result.payload || 'Analysis failed');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ATS Resume Screening & Domain Calibration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide your candidate profile. The AI analyzes your experience, extracting technologies and domain competencies to calibrate questions for all subsequent interview rounds.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Input Section */}
        <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Candidate Profile Source</h3>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'upload' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'paste' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'templates' ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
              </div>
            </div>

            {activeTab === 'upload' && (
              <FileUpload onDrop={handleFileDrop} file={file} />
            )}

            {activeTab === 'paste' && (
              <div className="space-y-3">
                <Textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste candidate resume text here (Skills, Experience, Projects)..."
                  className="min-h-[160px] font-mono text-xs bg-slate-900/80 border-slate-700"
                />
                <Button onClick={handleApplyPastedText} size="sm" variant="secondary" className="w-full">
                  Apply Resume Text
                </Button>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { key: 'frontend', role: 'Frontend Developer', title: 'Frontend Specialist', sub: 'React 19, TS, Tailwind' },
                  { key: 'backend', role: 'Backend Developer', title: 'Backend Distributed', sub: 'Node.js, Postgres, Kafka' },
                  { key: 'ml', role: 'Data Scientist & ML Engineer', title: 'ML & Data Systems', sub: 'Python, PyTorch, FastAPI' },
                  { key: 'devops', role: 'DevOps & Cloud Engineer', title: 'Cloud & Kubernetes', sub: 'Terraform, AWS, CI/CD' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleApplyTemplate(item.key, item.role)}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                  </button>
                ))}
              </div>
            )}

            {parsedText && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowExtractedText(!showExtractedText)}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {showExtractedText ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  <span>{showExtractedText ? 'Hide' : 'Review'} Loaded Text ({parsedText.length} chars)</span>
                </button>
                <AnimatePresence>
                  {showExtractedText && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                        {parsedText}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Assessment Role</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  dispatch(setTargetRole(e.target.value));
                }}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.label} className="bg-slate-900">
                    {role.label} ({role.domain})
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-2">
                <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            loading={loading || uploading}
            disabled={!parsedText || loading || uploading}
            className="w-full mt-5"
            icon={<FiSearch />}
          >
            {loading ? 'Analyzing Profile with AI...' : 'Run ATS Evaluation & Calibrate'}
          </Button>
        </motion.div>

        {/* ATS Score & Summary */}
        <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">ATS Diagnostic Telemetry</h3>
              {atsReport && (
                <Badge variant="info">Domain: {domain}</Badge>
              )}
            </div>

            {atsReport ? (
              <div className="space-y-5">
                {/* Score Dial */}
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={atsReport.atsScore >= 75 ? '#3b82f6' : atsReport.atsScore >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - atsReport.atsScore / 100)}`}
                        transform="rotate(-90 50 50)"
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - atsReport.atsScore / 100) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold font-mono text-white tabular-nums">{atsReport.atsScore}%</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">ATS Rating</p>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {atsReport.summary && (
                  <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {atsReport.summary}
                  </div>
                )}

                {/* Score Metrics */}
                {(atsReport.keywordMatch || atsReport.formatScore || atsReport.experienceScore) && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {atsReport.keywordMatch && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-base font-bold font-mono text-blue-400 tabular-nums">{atsReport.keywordMatch.score}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Keywords</p>
                      </div>
                    )}
                    {atsReport.formatScore && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-base font-bold font-mono text-slate-200 tabular-nums">{atsReport.formatScore.score}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Formatting</p>
                      </div>
                    )}
                    {atsReport.experienceScore && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <p className="text-base font-bold font-mono text-emerald-400 tabular-nums">{atsReport.experienceScore.score}%</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Relevance</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FiFileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Awaiting Candidate Resume</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Upload a resume or select a preset to generate domain-tailored technical challenges.</p>
              </div>
            )}
          </div>

          {atsReport && (
            <Link to="/aptitude" className="mt-5 block">
              <Button className="w-full" icon={<FiArrowRight />} iconPosition="right">
                Proceed to Domain Aptitude Assessment
              </Button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Skills & Insights Section */}
      {atsReport && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FiCheck className="text-emerald-400" /> Detected Technical Competencies ({atsReport.matchedSkills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {atsReport.matchedSkills?.map((s, i) => (
                <Badge key={i} variant="success">{s}</Badge>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FiX className="text-amber-400" /> Recommended Stack Expansion ({atsReport.missingSkills?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {atsReport.missingSkills?.map((s, i) => (
                <Badge key={i} variant="warning">{s}</Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResumePage;
