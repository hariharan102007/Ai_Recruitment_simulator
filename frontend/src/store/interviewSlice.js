import { createSlice } from '@reduxjs/toolkit';

const stages = [
  { id: 'resume', name: 'Resume Upload', status: 'pending' },
  { id: 'ats', name: 'ATS Screening', status: 'pending' },
  { id: 'aptitude', name: 'Aptitude Round', status: 'pending' },
  { id: 'coding', name: 'Coding Assessment', status: 'pending' },
  { id: 'technical', name: 'Technical Interview', status: 'pending' },
  { id: 'project', name: 'Project Discussion', status: 'pending' },
  { id: 'system-design', name: 'System Design', status: 'pending' },
  { id: 'hr', name: 'HR Interview', status: 'pending' },
];

const initialState = {
  currentStage: 0,
  stages,
  answers: {},
  scores: {},
  isCompleted: false,
  loading: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCurrentStage: (state, action) => {
      state.currentStage = action.payload;
    },
    updateStageStatus: (state, action) => {
      const { stageId, status } = action.payload;
      const stage = state.stages.find(s => s.id === stageId);
      if (stage) stage.status = status;
    },
    saveAnswer: (state, action) => {
      const { stageId, questionId, answer } = action.payload;
      if (!state.answers[stageId]) state.answers[stageId] = {};
      state.answers[stageId][questionId] = answer;
    },
    saveScore: (state, action) => {
      const { stageId, score } = action.payload;
      state.scores[stageId] = score;
    },
    completeInterview: (state) => {
      state.isCompleted = true;
    },
    resetInterview: (state) => {
      state.currentStage = 0;
      state.stages = stages;
      state.answers = {};
      state.scores = {};
      state.isCompleted = false;
    },
  },
});

export const { setCurrentStage, updateStageStatus, saveAnswer, saveScore, completeInterview, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
