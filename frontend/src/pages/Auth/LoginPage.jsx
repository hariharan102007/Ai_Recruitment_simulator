import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Divider } from '@/components/ui';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter your email and password');
    const result = await login(email, password);
    if (result.type === 'auth/login/fulfilled') {
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await loginWithGoogle();
      if (res.type === 'auth/googleLogin/fulfilled') {
        toast.success(`Welcome ${res.payload.user.name}! Connected to Cloud Firestore.`);
        navigate('/dashboard');
      } else {
        toast.error(res.payload || 'Google authentication failed');
      }
    } catch (err) {
      toast.error('Google sign-in error: ' + err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border border-slate-800">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-white tracking-tight">Candidate Sign In</h1>
        <p className="text-xs text-slate-400 mt-1">Access your interview simulations and cloud telemetry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={FiMail}
          placeholder="candidate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          icon={FiLock}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-400">
            <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500" />
            <span>Remember device</span>
          </label>
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <Divider label="or cloud connect" className="my-5" />

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign In with Google (Firebase Cloud Auth)
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one free</Link>
      </p>
    </motion.div>
  );
};

export default LoginPage;
