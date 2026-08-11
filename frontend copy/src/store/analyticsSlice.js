import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scores: {
    ats: 82,
    aptitude: 75,
    coding: 85,
    technical: 78,
    project: 80,
    systemDesign: 70,
    hr: 88,
  },
  hiringProbability: 78,
  performanceHistory: [
    { date: '2026-01', score: 45 },
    { date: '2026-02', score: 52 },
    { date: '2026-03', score: 60 },
    { date: '2026-04', score: 68 },
    { date: '2026-05', score: 75 },
    { date: '2026-06', score: 82 },
  ],
  strengths: [
    { skill: 'React', level: 90 },
    { skill: 'JavaScript', level: 88 },
    { skill: 'Problem Solving', level: 85 },
    { skill: 'Communication', level: 82 },
    { skill: 'Node.js', level: 80 },
  ],
  weaknesses: [
    { skill: 'System Design', level: 45 },
    { skill: 'Docker', level: 40 },
    { skill: 'AWS', level: 35 },
    { skill: 'GraphQL', level: 30 },
    { skill: 'Data Structures', level: 55 },
  ],
  learningPath: [
    { week: 1, title: 'Docker Fundamentals', topics: ['Docker Basics', 'Dockerfile', 'Docker Compose', 'Container Networking'], completed: true },
    { week: 2, title: 'AWS EC2 & S3', topics: ['EC2 Instances', 'S3 Buckets', 'IAM Roles', 'CloudWatch'], completed: false },
    { week: 3, title: 'System Design Basics', topics: ['Load Balancing', 'Caching Strategies', 'Database Sharding', 'Microservices'], completed: false },
    { week: 4, title: 'Advanced MERN Prep', topics: ['React Performance', 'Node.js Streams', 'MongoDB Aggregation', 'Security Best Practices'], completed: false },
  ],
  loading: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateScore: (state, action) => {
      const { stage, score } = action.payload;
      state.scores[stage] = score;
    },
    updateHiringProbability: (state, action) => {
      state.hiringProbability = action.payload;
    },
    addPerformanceEntry: (state, action) => {
      state.performanceHistory.push(action.payload);
    },
    completeWeek: (state, action) => {
      const week = state.learningPath.find(w => w.week === action.payload);
      if (week) week.completed = true;
    },
  },
});

export const { updateScore, updateHiringProbability, addPerformanceEntry, completeWeek } = analyticsSlice.actions;
export default analyticsSlice.reducer;
