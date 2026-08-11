import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { Input, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setSent(true);
    toast.success('Reset link sent to your email!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"><FiArrowLeft /> Back to login</Link>
      <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
      <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
      {sent ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"><FiMail className="w-8 h-8 text-emerald-400" /></div>
          <p className="text-white font-medium">Check your email</p>
          <p className="text-gray-400 text-sm mt-2">We sent a password reset link to {email}</p>
          <button onClick={() => setSent(false)} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">Try another email</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" icon={FiMail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPasswordPage;
