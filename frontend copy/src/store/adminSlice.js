import { createSlice } from '@reduxjs/toolkit';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'candidate', status: 'active', joinedAt: '2026-01-15', lastActive: '2026-06-10' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'candidate', status: 'active', joinedAt: '2026-02-20', lastActive: '2026-06-09' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'recruiter', status: 'active', joinedAt: '2026-03-10', lastActive: '2026-06-08' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'admin', status: 'active', joinedAt: '2025-12-01', lastActive: '2026-06-10' },
  { id: '5', name: 'Alex Brown', email: 'alex@example.com', role: 'candidate', status: 'inactive', joinedAt: '2026-04-05', lastActive: '2026-05-20' },
];

const mockStats = {
  totalUsers: 1250,
  activeUsers: 890,
  totalInterviews: 3420,
  avgScore: 72,
  totalCompanies: 45,
  revenue: 24500,
};

const initialState = {
  users: mockUsers,
  stats: mockStats,
  questionBank: [
    { id: '1', category: 'aptitude', type: 'quantitative', question: 'Sample question 1', difficulty: 'medium' },
    { id: '2', category: 'technical', type: 'react', question: 'Explain React lifecycle methods', difficulty: 'hard' },
    { id: '3', category: 'coding', type: 'arrays', question: 'Two Sum Problem', difficulty: 'easy' },
  ],
  companyTemplates: [
    { id: '1', name: 'Google', interviewStages: 5, difficulty: 'hard', focus: ['Algorithms', 'System Design', 'Googliness'] },
    { id: '2', name: 'Microsoft', interviewStages: 4, difficulty: 'medium', focus: ['Problem Solving', 'Coding', 'Behavioral'] },
    { id: '3', name: 'Amazon', interviewStages: 5, difficulty: 'hard', focus: ['Leadership Principles', 'Coding', 'System Design'] },
  ],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addUser: (state, action) => { state.users.push(action.payload); },
    removeUser: (state, action) => { state.users = state.users.filter(u => u.id !== action.payload); },
    updateUserRole: (state, action) => {
      const { id, role } = action.payload;
      const user = state.users.find(u => u.id === id);
      if (user) user.role = role;
    },
    addQuestion: (state, action) => { state.questionBank.push(action.payload); },
    removeQuestion: (state, action) => { state.questionBank = state.questionBank.filter(q => q.id !== action.payload); },
    updateStats: (state, action) => { state.stats = { ...state.stats, ...action.payload }; },
  },
});

export const { addUser, removeUser, updateUserRole, addQuestion, removeQuestion, updateStats } = adminSlice.actions;
export default adminSlice.reducer;
