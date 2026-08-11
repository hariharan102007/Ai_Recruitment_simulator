import { Link } from 'react-router-dom';

const LandingPage = () => (
  <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white text-center">
    <div className="max-w-3xl">
      <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to InterviewAI</h1>
      <p className="text-lg text-slate-300 mb-10">
        Your interview preparation platform is ready. Explore pricing, sign in, or get started with your personalized dashboard.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Sign In
        </Link>
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          View Pricing
        </Link>
      </div>
    </div>
  </section>
);

export default LandingPage;
