import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHome, FiFileText, FiCode, FiMessageSquare, FiBriefcase, FiBox, FiHeart, FiBarChart2, FiBookOpen, FiAward, FiSettings, FiChevronLeft, FiChevronRight, FiMic } from 'react-icons/fi';
import { toggleSidebar } from '@/store/uiSlice';

const menuItems = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { icon: FiFileText, label: 'Resume & ATS', path: '/resume' },
  { icon: FiBookOpen, label: 'Aptitude', path: '/aptitude' },
  { icon: FiCode, label: 'Coding', path: '/coding' },
  { icon: FiMessageSquare, label: 'Technical', path: '/interview/technical' },
  { icon: FiBriefcase, label: 'Project', path: '/interview/project' },
  { icon: FiBox, label: 'System Design', path: '/interview/system-design' },
  { icon: FiHeart, label: 'HR Interview', path: '/interview/hr' },
  { icon: FiMic, label: 'Voice Mode', path: '/voice-interview' },
  { icon: FiAward, label: 'Company Mode', path: '/company' },
  { icon: FiBarChart2, label: 'Analytics', path: '/analytics' },
  { icon: FiAward, label: 'Reports', path: '/reports' },
];

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 72 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-16 bottom-0 z-40 glass border-r border-white/5 flex flex-col"
    >
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-white/5">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
