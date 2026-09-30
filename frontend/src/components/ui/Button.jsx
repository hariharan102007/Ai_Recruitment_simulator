import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm border border-blue-500/50 transition-colors',
  secondary: 'bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors',
  ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors',
  danger: 'bg-red-600/90 text-white hover:bg-red-500 border border-red-500/30 transition-colors',
  success: 'bg-emerald-600/90 text-white hover:bg-emerald-500 border border-emerald-500/30 transition-colors',
  brand: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',
  xl: 'px-7 py-3 text-base rounded-xl font-semibold',
};

const Button = forwardRef(({ children, variant = 'primary', size = 'md', className = '', loading = false, disabled = false, icon, iconPosition = 'left', ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon && iconPosition === 'left' ? icon : null}
      {children}
      {!loading && icon && iconPosition === 'right' ? icon : null}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
