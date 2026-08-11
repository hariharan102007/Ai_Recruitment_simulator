import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheck, FiX, FiArrowRight, FiSearch, FiEye, FiEyeOff, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { FileUpload, Button, Card, Badge, ProgressBar } from '@/components/ui';
import { uploadResume, analyzeResume, clearResume, clearError } from '@/store/resumeSlice';
import { updateStageStatus } from '@/store/interviewSlice';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const roleOptions = [
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'data', label: 'Data Engineer' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'mobile', label: 'Mobile Developer' },
  { value: 'ml-engineer', label: 'ML Engineer' },
];

const ResumePage = () => {
  const dispatch = useDispatch();
  const { file, uploading, loading, atsReport, parsedText, error } = useSelector((state) => state.resume);
  const [selectedRole, setSelectedRole] = useState('fullstack');
  const [showExtractedText, setShowExtractedText] = useState(false);

  const handleFileDrop = async (f) => {
    dispatch(clearError());
    const result = await dispatch(uploadResume(f));
    if (result.type === 'resume/upload/fulfilled') {
      toast.success(`Resume uploaded! Text extracted (${result.payload.extractedText?.length || 0} chars)`);
    } else {
      toast.error(result.payload || 'Failed to process resume');
    }
  };

  const handleAnalyze = async () => {
    if (!parsedText) return toast.error('Please upload a resume first');
    
    const roleLabel = roleOptions.find(r => r.value === selectedRole)?.label || 'Full Stack Developer';
    const result = await dispatch(analyzeResume({ targetRole: roleLabel }));
    
    if (result.type === 'resume/analyze/fulfilled') {
      dispatch(updateStageStatus({ stageId: 'ats', status: 'completed' }));
      toast.success('AI analysis complete!');
    } else {
      toast.error(result.payload || 'Analysis failed');
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FiSearch className="text-indigo-400" />
          Resume & ATS Screening
        </h1>
        <p className="text-gray-400 mt-1">Upload your resume and get a real AI-powered ATS compatibility analysis with detailed scoring.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upload Section */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upload Resume</h3>
          <FileUpload onDrop={handleFileDrop} file={file} />
          
          {parsedText && (
            <div className="mt-4">
              <button onClick={() => setShowExtractedText(!showExtractedText)}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-2">
                {showExtractedText ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                {showExtractedText ? 'Hide' : 'View'} Extracted Text ({parsedText.length} chars)
              </button>
              <AnimatePresence>
                {showExtractedText && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <pre className="bg-black/30 border border-white/5 rounded-xl p-4 text-xs text-gray-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {parsedText}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Job Role</label>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
              {roleOptions.map(role => (
                <option key={role.value} value={role.value} className="bg-gray-900">{role.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <Button onClick={handleAnalyze} loading={loading || uploading} disabled={!parsedText}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500" icon={<FiSearch />}>
            {loading ? 'AI Analyzing...' : 'Run AI ATS Analysis'}
          </Button>
        </motion.div>

        {/* ATS Score & Summary */}
        <motion.div variants={fadeUp} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ATS Report</h3>
          {atsReport ? (
            <div>
              {/* Score Circle */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" 
                      stroke={atsReport.atsScore >= 75 ? '#10b981' : atsReport.atsScore >= 50 ? '#f59e0b' : '#ef4444'} 
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`} 
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - atsReport.atsScore / 100)}`}
                      transform="rotate(-90 50 50)" 
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - atsReport.atsScore / 100) }} 
                      transition={{ duration: 1.5, ease: 'easeOut' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-bold text-white">{atsReport.atsScore}%</p>
                    <p className="text-xs text-gray-400">ATS Score</p>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {atsReport.summary && (
                <div className="mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-start gap-2">
                    <FiInfo className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">{atsReport.summary}</p>
                  </div>
                </div>
              )}

              {/* Score Breakdown */}
              {(atsReport.keywordMatch || atsReport.formatScore || atsReport.experienceScore) && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {atsReport.keywordMatch && (
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-blue-400">{atsReport.keywordMatch.score}%</p>
                      <p className="text-xs text-gray-400 mt-1">Keyword Match</p>
                    </div>
                  )}
                  {atsReport.formatScore && (
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-purple-400">{atsReport.formatScore.score}%</p>
                      <p className="text-xs text-gray-400 mt-1">Format Score</p>
                    </div>
                  )}
                  {atsReport.experienceScore && (
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <p className="text-2xl font-bold text-emerald-400">{atsReport.experienceScore.score}%</p>
                      <p className="text-xs text-gray-400 mt-1">Experience</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">Matched Skills</h4>
                  <div className="space-y-1.5">
                    {atsReport.matchedSkills?.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><FiCheck className="w-4 h-4 text-emerald-400 shrink-0" />{s}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-2">Missing Skills</h4>
                  <div className="space-y-1.5">
                    {atsReport.missingSkills?.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><FiX className="w-4 h-4 text-red-400 shrink-0" />{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <FiSearch className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">Upload your resume and click "Run AI ATS Analysis" to get real AI-generated results.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detailed Report */}
      {atsReport && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          {/* Strengths & Weaknesses */}
          {(atsReport.strengths || atsReport.weaknesses) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atsReport.strengths && (
                <motion.div variants={fadeUp} className="glass-card p-5 border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <FiCheck className="w-4 h-4" /> Resume Strengths
                  </h4>
                  <ul className="space-y-2">
                    {atsReport.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {atsReport.weaknesses && (
                <motion.div variants={fadeUp} className="glass-card p-5 border-red-500/20">
                  <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <FiX className="w-4 h-4" /> Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {atsReport.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* Extracted Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Education', items: atsReport.education?.map(e => `${e.degree} - ${e.institution} (${e.year})`) },
              { title: 'Experience', items: atsReport.experience?.map(e => `${e.role} at ${e.company} (${e.duration})`) },
              { title: 'Projects', items: atsReport.projects },
              { title: 'Certifications', items: atsReport.certifications },
            ].map((section, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card p-4">
                <h4 className="text-sm font-semibold text-indigo-400 mb-3">{section.title}</h4>
                {section.items?.length > 0 ? (
                  section.items.map((item, j) => <p key={j} className="text-sm text-gray-300 py-1 border-b border-white/5 last:border-0">{item}</p>)
                ) : (
                  <p className="text-sm text-gray-500 italic">Not detected</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Suggestions */}
          <motion.div variants={fadeUp} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Suggestions for Improvement</h3>
            <div className="space-y-3">
              {atsReport.suggestions?.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-indigo-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{s}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Score Details */}
          {(atsReport.keywordMatch?.details || atsReport.formatScore?.details || atsReport.experienceScore?.details) && (
            <motion.div variants={fadeUp} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Score Analysis</h3>
              <div className="space-y-4">
                {atsReport.keywordMatch?.details && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-400">Keyword Match</span>
                      <Badge variant={atsReport.keywordMatch.score >= 70 ? 'success' : atsReport.keywordMatch.score >= 50 ? 'warning' : 'error'}>
                        {atsReport.keywordMatch.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{atsReport.keywordMatch.details}</p>
                  </div>
                )}
                {atsReport.formatScore?.details && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-400">Resume Format</span>
                      <Badge variant={atsReport.formatScore.score >= 70 ? 'success' : atsReport.formatScore.score >= 50 ? 'warning' : 'error'}>
                        {atsReport.formatScore.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{atsReport.formatScore.details}</p>
                  </div>
                )}
                {atsReport.experienceScore?.details && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-400">Experience Relevance</span>
                      <Badge variant={atsReport.experienceScore.score >= 70 ? 'success' : atsReport.experienceScore.score >= 50 ? 'warning' : 'error'}>
                        {atsReport.experienceScore.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{atsReport.experienceScore.details}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="flex justify-end">
            <Link to="/aptitude">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" icon={<FiArrowRight />} iconPosition="right">
                Proceed to Aptitude Round
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResumePage;
