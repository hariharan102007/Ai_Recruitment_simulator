const badgeColors = {
  success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  error: 'bg-red-950/60 text-red-300 border-red-800/60',
  info: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  primary: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
};

const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeColors[variant] || badgeColors.default} tracking-tight ${className}`}>
    {children}
  </span>
);

export default Badge;
