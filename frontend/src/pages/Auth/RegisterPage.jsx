import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Select, Divider } from '@/components/ui';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    experienceLevel: 'mid',
    targetRole: 'Full Stack Developer',
    targetCompany: 'google',
  });
  const { register, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const result = await register(form);
    if (result.type === 'auth/register/fulfilled') {
      toast.success('Account created successfully');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await loginWithGoogle();
      if (res.type === 'auth/googleLogin/fulfilled') {
        toast.success(`Account connected for ${res.payload.user.name}!`);
        navigate('/dashboard');
      } else {
        toast.error(res.payload || 'Google authentication failed');
      }
    } catch (err) {
      toast.error('Google sign-in error: ' + err.message);
    }
  };

  const experienceLevels = [
    { value: 'fresher', label: 'Early Career (0-1 years)' },
    { value: 'junior', label: 'Junior Engineer (1-3 years)' },
    { value: 'mid', label: 'Mid-Level Engineer (3-5 years)' },
    { value: 'senior', label: 'Senior Engineer (5-8 years)' },
    { value: 'lead', label: 'Staff / Principal (8+ years)' },
  ];

  const companies = [
    { value: 'google', label: 'Google' },
    { value: 'microsoft', label: 'Microsoft' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'meta', label: 'Meta' },
    { value: 'apple', label: 'Apple' },
    { value: 'infosys', label: 'Infosys' },
    { value: 'tcs', label: 'TCS' },
    { value: 'wipro', label: 'Wipro' },
    { value: 'other', label: 'Other Tech Employer' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border border-slate-800">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-white tracking-tight">Create Candidate Account</h1>
        <p className="text-xs text-slate-400 mt-1">Connect with Cloud Database & Interview Simulator</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continue with Google
      </button>

      <Divider label="or manual registration" className="my-4" />

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name *"
          name="name"
          icon={FiUser}
          placeholder="Jane Developer"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          label="Email Address *"
          type="email"
          name="email"
          icon={FiMail}
          placeholder="candidate@example.com"
          value={form.email}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Password *"
            type="password"
            name="password"
            icon={FiLock}
            placeholder="Min. 6 chars"
            value={form.password}
            onChange={handleChange}
          />
          <Input
            label="Confirm Password *"
            type="password"
            name="confirmPassword"
            icon={FiLock}
            placeholder="Repeat"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <Select
          label="Experience Level"
          name="experienceLevel"
          options={experienceLevels}
          value={form.experienceLevel}
          onChange={handleChange}
        />
        <Input
          label="Target Role"
          name="targetRole"
          icon={FiBriefcase}
          placeholder="e.g. Full Stack Developer"
          value={form.targetRole}
          onChange={handleChange}
        />
        <Select
          label="Target Employer Track"
          name="targetCompany"
          options={companies}
          value={form.targetCompany}
          onChange={handleChange}
        />

        <Button type="submit" loading={loading} className="w-full mt-2">
          Initialize Candidate Workspace
        </Button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-4">
        Already registered? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
      </p>
    </motion.div>
  );
};

export default RegisterPage;
