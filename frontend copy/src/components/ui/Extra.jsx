import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Tooltip = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false);
  const pos = { top: 'bottom-full mb-2 left-1/2 -translate-x-1/2', bottom: 'top-full mt-2 left-1/2 -translate-x-1/2', left: 'right-full mr-2 top-1/2 -translate-y-1/2', right: 'left-full ml-2 top-1/2 -translate-y-1/2' };
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${pos[position]}`}>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <div className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white overflow-hidden ${sizes[size]} ${className}`}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  );
};

export const Divider = ({ className = '', label }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="flex-1 h-px bg-white/10" />
    {label && <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>}
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

export const Toggle = ({ enabled, onChange, label, className = '' }) => (
  <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
    <button type="button" onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-white/10'}`}>
      <motion.div animate={{ x: enabled ? 20 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
    </button>
    {label && <span className="text-sm text-gray-300">{label}</span>}
  </label>
);

export default Tooltip;
