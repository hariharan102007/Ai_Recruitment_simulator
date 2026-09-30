import { motion } from 'framer-motion';

const ProgressBar = ({ value = 0, max = 100, label, showValue = true, size = 'md', color = 'blue', className = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const sizes = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const colors = {
    blue: 'bg-blue-500',
    indigo: 'bg-blue-600',
    green: 'bg-emerald-500',
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          {label && <span className="text-slate-300 font-medium">{label}</span>}
          {showValue && <span className="font-mono tabular-nums text-slate-200 font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[color] || colors.blue}`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
