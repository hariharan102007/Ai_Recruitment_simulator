import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
    {/* Animated background orbs */}
    <div className="absolute inset-0 overflow-hidden">
      <motion.div animate={{ x: [0, 100, 0], y: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0, -80, 0], y: [0, 60, 0] }} transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <motion.div animate={{ x: [0, 60, 0], y: [0, 80, 0] }} transition={{ duration: 30, repeat: Infinity }}
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
    </div>
    <div className="relative z-10 w-full max-w-md">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
