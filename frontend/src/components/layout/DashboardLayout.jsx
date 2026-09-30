import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />
      <Sidebar />
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.15 }}
        className="pt-16 min-h-screen flex-1"
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
