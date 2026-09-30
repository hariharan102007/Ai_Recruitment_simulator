import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBarChart2, FiCpu, FiFileText } from 'react-icons/fi';
import { logout } from '@/store/authSlice';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Resume ATS', path: '/resume' },
        { label: 'Interviews', path: '/interview/technical' },
        { label: 'Voice Mode', path: '/voice-interview' },
        { label: 'Analytics', path: '/analytics' },
      ]
    : [
        { label: 'Platform', path: '/#platform' },
        { label: 'Features', path: '/#features' },
      ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'H';
  const userName = user?.name?.split(' ')[0] || 'Candidate';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070A12]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              R
            </div>
            <span className="text-white font-bold text-base tracking-tight">RecruitAI</span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Zone 3: Actions & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
                >
                  {!avatarError ? (
                    <img
                      src="/images/candidate_professional_avatar_1790744542810.jpg"
                      alt={userName}
                      onError={() => setAvatarError(true)}
                      className="w-7 h-7 rounded-md object-cover border border-slate-700 bg-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {userInitial}
                    </div>
                  )}
                  <span className="text-xs text-slate-200 font-medium">{userName}</span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 mt-2 w-52 bg-[#0C1220] rounded-xl p-1.5 shadow-2xl border border-slate-800"
                    >
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-semibold text-white truncate">{user?.name || 'Candidate'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email || 'candidate@example.com'}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <FiBarChart2 className="w-3.5 h-3.5 text-blue-400" /> Performance Center
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <FiSettings className="w-3.5 h-3.5 text-blue-400" /> Platform Settings
                      </Link>
                      <div className="border-t border-slate-800 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                      >
                        <FiLogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-xs font-medium px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Launch Simulator
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0C1220] border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/30 text-xs"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg border border-slate-700 text-slate-300 text-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                  >
                    Launch Simulator
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
