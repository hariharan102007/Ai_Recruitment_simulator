import { motion } from 'framer-motion';

const ProgressBar = ({ value = 0, max = 100, label, showValue = true, size = 'md', color = 'indigo', className = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    indigo: 'from-indigo-500 to-purple-500',
    green: 'from-emerald-500 to-teal-500',
    red: 'from-red-500 to-rose-500',
    amber: 'from-amber-500 to-yellow-500',
    blue: 'from-blue-500 to-cyan-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-gray-300">{label}</span>}
          {showValue && <span className="text-sm font-medium text-white">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-white/5 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
