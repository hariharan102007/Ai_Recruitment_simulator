import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => (
  <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-6 relative">
    {/* Subtle architectural background grid */}
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }}
    />

    {/* Brand Header */}
    <div className="relative z-10 mb-8 text-center">
      <Link to="/" className="inline-flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          R
        </div>
        <span className="text-white font-bold text-xl tracking-tight">RecruitAI</span>
      </Link>
      <p className="text-xs text-slate-400 mt-2">Enterprise Technical Assessment & Simulation Platform</p>
    </div>

    {/* Form Container */}
    <div className="relative z-10 w-full max-w-md">
      <Outlet />
    </div>

    {/* Quiet Footer */}
    <div className="relative z-10 mt-8 text-center text-xs text-slate-500">
      &copy; {new Date().getFullYear()} RecruitAI Platform · 100% Free & Open Access
    </div>
  </div>
);

export default AuthLayout;
