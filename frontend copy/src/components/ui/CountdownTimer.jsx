import { FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CountdownTimer = ({ time, label, className = '', warning = false }) => {
  const mins = Math.floor(time / 60);
  const secs = time % 60;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div animate={warning ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: warning ? Infinity : 0, duration: 1 }}>
        <FiClock className={`w-5 h-5 ${warning ? 'text-red-400' : 'text-indigo-400'}`} />
      </motion.div>
      <div>
        {label && <p className="text-xs text-gray-400">{label}</p>}
        <p className={`text-lg font-mono font-bold ${warning ? 'text-red-400' : 'text-white'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
