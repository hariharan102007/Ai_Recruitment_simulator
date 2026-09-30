import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="border-t border-white/5 bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-white font-bold text-lg">RecruitAI</span>
          </div>
          <p className="text-gray-400 text-sm">100% Free AI-powered recruitment process simulator to help you ace your dream interview.</p>
        </div>
        {[
          { title: 'Practice Rounds', links: ['Resume ATS', 'Aptitude Test', 'Live Coding', 'Technical Interview', 'Voice Mode'] },
          { title: 'Platform', links: ['About', 'Dashboard', 'Analytics', 'System Design'] },
          { title: 'Settings & Data', links: ['Settings', 'Candidate Profile', 'Reset Data'] },
        ].map((col) => (
          <div key={col.title}>
            <h3 className="text-white font-semibold text-sm mb-4">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}><span className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">{link}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} RecruitAI. All rights reserved. Free & Open Access.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
