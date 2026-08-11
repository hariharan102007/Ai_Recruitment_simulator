import { FiChevronDown } from 'react-icons/fi';

const Select = ({ label, error, options = [], className = '', placeholder = 'Select...', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <div className="relative">
      <select
        className={`w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="" className="bg-gray-900">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
        ))}
      </select>
      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
    </div>
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

export default Select;
