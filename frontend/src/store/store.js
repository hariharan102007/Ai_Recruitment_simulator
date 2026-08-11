import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import interviewReducer from './interviewSlice';
import resumeReducer from './resumeSlice';
import aptitudeReducer from './aptitudeSlice';
import codingReducer from './codingSlice';
import analyticsReducer from './analyticsSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    interview: interviewReducer,
    resume: resumeReducer,
    aptitude: aptitudeReducer,
    coding: codingReducer,
    analytics: analyticsReducer,
    admin: adminReducer,
  },
});

export default store;
