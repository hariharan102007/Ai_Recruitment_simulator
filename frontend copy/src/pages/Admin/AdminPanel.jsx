import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiActivity, FiDollarSign, FiSearch, FiTrash2, FiEdit } from 'react-icons/fi';
import { Tabs, Table, Button, Badge, Card, Input } from '@/components/ui';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { removeUser } from '@/store/adminSlice';
import { useState } from 'react';

const usageData = [
  { month: 'Jan', users: 450, interviews: 800 }, { month: 'Feb', users: 520, interviews: 950 },
  { month: 'Mar', users: 680, interviews: 1200 }, { month: 'Apr', users: 750, interviews: 1400 },
  { month: 'May', users: 890, interviews: 1650 }, { month: 'Jun', users: 1050, interviews: 2100 },
];

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users, stats, questionBank, companyTemplates } = useSelector((state) => state.admin);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const tabContent = [
    { id: 'overview', label: 'Overview', content: (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-400' },
            { label: 'Active Users', value: stats.activeUsers, icon: FiActivity, color: 'text-emerald-400' },
            { label: 'Interviews', value: stats.totalInterviews, icon: FiFileText, color: 'text-purple-400' },
            { label: 'Avg Score', value: stats.avgScore + '%', icon: FiActivity, color: 'text-amber-400' },
            { label: 'Companies', value: stats.totalCompanies, icon: FiUsers, color: 'text-indigo-400' },
            { label: 'Revenue', value: '$' + stats.revenue, icon: FiDollarSign, color: 'text-emerald-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4 text-center">
              <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} /><YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="users" stroke="#818cf8" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="interviews" stroke="#10b981" strokeWidth={2} name="Interviews" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )},
    { id: 'users', label: 'Users', content: (
      <div>
        <div className="mb-4"><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} icon={FiSearch} /></div>
        <div className="glass-card">
          <Table
            columns={[
              { key: 'name', label: 'Name', sortable: true },
              { key: 'email', label: 'Email', sortable: true },
              { key: 'role', label: 'Role', render: (val) => <Badge variant={val === 'admin' ? 'error' : val === 'recruiter' ? 'warning' : 'info'}>{val}</Badge> },
              { key: 'status', label: 'Status', render: (val) => <Badge variant={val === 'active' ? 'success' : 'default'}>{val}</Badge> },
              { key: 'actions', label: 'Actions', render: (_, row) => (
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"><FiEdit className="w-4 h-4" /></button>
                  <button onClick={() => dispatch(removeUser(row.id))} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              )},
            ]}
            data={filteredUsers}
          />
        </div>
      </div>
    )},
    { id: 'questions', label: 'Question Bank', content: (
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Question Bank ({questionBank.length})</h3>
          <Button size="sm">Add Question</Button>
        </div>
        <Table
          columns={[
            { key: 'question', label: 'Question', sortable: true },
            { key: 'category', label: 'Category', render: (val) => <Badge variant="info">{val}</Badge> },
            { key: 'type', label: 'Type' },
            { key: 'difficulty', label: 'Difficulty', render: (val) => <Badge variant={val === 'hard' ? 'error' : val === 'medium' ? 'warning' : 'success'}>{val}</Badge> },
          ]}
          data={questionBank}
        />
      </div>
    )},
    { id: 'companies', label: 'Companies', content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companyTemplates.map((c) => (
          <div key={c.id} className="glass-card p-5">
            <h4 className="text-white font-semibold mb-2">{c.name}</h4>
            <Badge variant={c.difficulty === 'hard' ? 'error' : 'warning'} className="mb-2">{c.difficulty}</Badge>
            <p className="text-xs text-gray-400">{c.interviewStages} stages</p>
            <div className="flex flex-wrap gap-1 mt-2">{c.focus.map((f, i) => <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">{f}</span>)}</div>
          </div>
        ))}
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Panel</h1>
      <Tabs tabs={tabContent} />
    </motion.div>
  );
};

export default AdminPanel;
