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
          <p className="text-gray-400 text-sm">AI-powered recruitment simulator to help you ace your dream job interview.</p>
          <div className="flex gap-3 mt-4">
            {[FiGithub, FiTwitter, FiLinkedin, FiMail].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Icon className="w-4 h-4" /></a>
            ))}
          </div>
        </div>
        {[
          { title: 'Product', links: ['Features', 'Pricing', 'API', 'Integrations'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie Policy', 'Licenses'] },
        ].map((col) => (
          <div key={col.title}>
            <h3 className="text-white font-semibold text-sm mb-4">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} RecruitAI. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
