import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingLayout = () => (
  <div className="min-h-screen bg-gray-950">
    <Navbar />
    <main className="pt-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default LandingLayout;
