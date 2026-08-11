import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { Input, Button } from '@/components/ui';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirm) return toast.error('Please fill in all fields');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    toast.success('Password reset successful!');
    navigate('/login');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"><FiArrowLeft /> Back to login</Link>
      <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
      <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="New Password" type="password" icon={FiLock} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm Password" type="password" icon={FiLock} placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" className="w-full">Reset Password</Button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordPage;
