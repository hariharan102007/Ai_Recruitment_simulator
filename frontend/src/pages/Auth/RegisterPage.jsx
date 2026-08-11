import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Select, Divider } from '@/components/ui';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', experienceLevel: '', targetRole: '', targetCompany: '' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const result = await register(form);
    if (result.type === 'auth/register/fulfilled') {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const experienceLevels = [
    { value: 'fresher', label: 'Fresher (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-Level (3-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' },
  ];

  const companies = [
    { value: 'google', label: 'Google' }, { value: 'microsoft', label: 'Microsoft' },
    { value: 'amazon', label: 'Amazon' }, { value: 'meta', label: 'Meta' },
    { value: 'apple', label: 'Apple' }, { value: 'infosys', label: 'Infosys' },
    { value: 'tcs', label: 'TCS' }, { value: 'wipro', label: 'Wipro' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-gray-400 text-sm mt-1">Start your AI-powered interview preparation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name *" name="name" icon={FiUser} placeholder="John Doe" value={form.name} onChange={handleChange} />
        <Input label="Email *" type="email" name="email" icon={FiMail} placeholder="you@example.com" value={form.email} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Password *" type="password" name="password" icon={FiLock} placeholder="Min. 6 chars" value={form.password} onChange={handleChange} />
          <Input label="Confirm Password *" type="password" name="confirmPassword" icon={FiLock} placeholder="Repeat" value={form.confirmPassword} onChange={handleChange} />
        </div>
        <Select label="Experience Level" name="experienceLevel" options={experienceLevels} value={form.experienceLevel} onChange={handleChange} />
        <Input label="Target Role" name="targetRole" icon={FiBriefcase} placeholder="e.g. Full Stack Developer" value={form.targetRole} onChange={handleChange} />
        <Select label="Target Company" name="targetCompany" options={companies} value={form.targetCompany} onChange={handleChange} />

        <label className="flex items-start gap-2 text-sm text-gray-400">
          <input type="checkbox" required className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500 mt-0.5" />
          <span>I agree to the <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a></span>
        </label>

        <Button type="submit" loading={loading} className="w-full">Create Account</Button>
      </form>

      <Divider label="or" className="my-6" />

      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </button>
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link></p>
    </motion.div>
  );
};

export default RegisterPage;
