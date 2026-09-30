import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHome, FiFileText, FiCode, FiMessageSquare, FiBriefcase, FiBox, FiHeart, FiBarChart2, FiBookOpen, FiAward, FiSettings, FiChevronLeft, FiChevronRight, FiMic } from 'react-icons/fi';
import { toggleSidebar } from '@/store/uiSlice';

const menuItems = [
  { icon: FiHome, label: 'Overview', path: '/dashboard', section: 'Core' },
  { icon: FiFileText, label: 'Resume & ATS', path: '/resume', section: 'Calibration' },
  { icon: FiBookOpen, label: 'Aptitude Math', path: '/aptitude', section: 'Assessments' },
  { icon: FiCode, label: 'Code Execution', path: '/coding', section: 'Assessments' },
  { icon: FiMessageSquare, label: 'Technical Round', path: '/interview/technical', section: 'Interviews' },
  { icon: FiBriefcase, label: 'Project Architecture', path: '/interview/project', section: 'Interviews' },
  { icon: FiBox, label: 'System Design', path: '/interview/system-design', section: 'Interviews' },
  { icon: FiHeart, label: 'Behavioral HR', path: '/interview/hr', section: 'Interviews' },
  { icon: FiMic, label: 'Voice Speech Mode', path: '/voice-interview', section: 'Interviews' },
  { icon: FiAward, label: 'Company Tracks', path: '/company', section: 'Simulation' },
  { icon: FiBarChart2, label: 'Analytics Telemetry', path: '/analytics', section: 'Reports' },
  { icon: FiAward, label: 'Hiring Report', path: '/reports', section: 'Reports' },
  { icon: FiSettings, label: 'Platform Settings', path: '/settings', section: 'Settings' },
];

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.15 }}
      className="fixed left-0 top-16 bottom-0 z-40 bg-[#0B101B] border-r border-slate-800 flex flex-col"
    >
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full" />
                )}
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-slate-800">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <FiChevronLeft className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
