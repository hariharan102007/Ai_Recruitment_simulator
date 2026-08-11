import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Badge, Card } from '@/components/ui';
import toast from 'react-hot-toast';

const companies = [
  { id: 'google', name: 'Google', color: 'from-blue-500 to-green-500', stages: 5, difficulty: 'Hard', focus: ['Algorithms', 'System Design', 'Googliness'], tips: 'Focus on data structures and dynamic programming.' },
  { id: 'microsoft', name: 'Microsoft', color: 'from-blue-600 to-cyan-500', stages: 4, difficulty: 'Medium', focus: ['Problem Solving', 'Coding', 'Behavioral'], tips: 'Emphasize collaborative problem solving.' },
  { id: 'amazon', name: 'Amazon', color: 'from-amber-500 to-orange-500', stages: 5, difficulty: 'Hard', focus: ['Leadership Principles', 'Coding', 'System Design'], tips: 'Prepare stories for all 16 Leadership Principles.' },
  { id: 'infosys', name: 'Infosys', color: 'from-blue-500 to-indigo-500', stages: 3, difficulty: 'Easy', focus: ['Aptitude', 'Coding Basics', 'HR'], tips: 'Focus on fundamentals and communication skills.' },
  { id: 'tcs', name: 'TCS', color: 'from-indigo-500 to-purple-500', stages: 3, difficulty: 'Easy', focus: ['Aptitude', 'Technical Basics', 'HR'], tips: 'Prepare well for the aptitude section.' },
  { id: 'wipro', name: 'Wipro', color: 'from-purple-500 to-pink-500', stages: 3, difficulty: 'Easy', focus: ['Aptitude', 'Coding', 'Interview'], tips: 'Practice logical reasoning and basic coding.' },
];

const CompanyMode = () => {
  const [selected, setSelected] = useState(null);
  const company = companies.find(c => c.id === selected);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-white mb-2">Company-Specific Interview Mode</h1>
      <p className="text-gray-400 mb-8">Choose a company to practice their specific interview style.</p>

      {!selected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <motion.div key={c.id} whileHover={{ y: -4 }} onClick={() => setSelected(c.id)}
              className="glass-card glass-card-hover p-6 cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4`}>
                <span className="text-white font-bold text-lg">{c.name[0]}</span>
              </div>
              <h3 className="text-white font-semibold text-lg">{c.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={c.difficulty === 'Hard' ? 'error' : c.difficulty === 'Medium' ? 'warning' : 'success'}>{c.difficulty}</Badge>
                <Badge variant="info">{c.stages} Stages</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">{c.focus.map((f, i) => <span key={i} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{f}</span>)}</div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-white mb-4">Back to Companies</button>
          <div className="glass-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-2xl">{company.name[0]}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{company.name} Interview Prep</h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant={company.difficulty === 'Hard' ? 'error' : company.difficulty === 'Medium' ? 'warning' : 'success'}>{company.difficulty}</Badge>
                  <Badge variant="info">{company.stages} Interview Stages</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-indigo-400 mb-3">Focus Areas</h4>
                <div className="space-y-2">{company.focus.map((f, i) => <div key={i} className="flex items-center gap-2 text-sm text-gray-300"><span className="w-2 h-2 rounded-full bg-indigo-500" />{f}</div>)}</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-3">Pro Tips</h4>
                <p className="text-sm text-gray-300">{company.tips}</p>
              </div>
            </div>
            <Button onClick={() => toast('Starting ' + company.name + ' interview simulation...')}>Start {company.name} Simulation</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CompanyMode;
