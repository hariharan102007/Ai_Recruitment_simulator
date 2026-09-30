import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { syncUserProfile } from '@/firebase/firestoreService';
import { updateUser } from '@/store/authSlice';

// Layouts
import LandingLayout from '@/components/layout/LandingLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Route Guards
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';

// Public Pages
import LandingPage from '@/pages/Landing/LandingPage';

// Auth Pages
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage';

// Protected Pages
import CandidateDashboard from '@/pages/Dashboard/CandidateDashboard';
import ResumePage from '@/pages/Resume/ResumePage';
import AptitudePage from '@/pages/Aptitude/AptitudePage';
import CodingPage from '@/pages/Coding/CodingPage';
import TechnicalInterview from '@/pages/Interview/TechnicalInterview';
import ProjectDiscussion from '@/pages/Interview/ProjectDiscussion';
import SystemDesign from '@/pages/Interview/SystemDesign';
import HRInterview from '@/pages/Interview/HRInterview';
import VoiceInterviewPage from '@/pages/VoiceInterview/VoiceInterviewPage';
import CompanyMode from '@/pages/Company/CompanyMode';
import AnalyticsDashboard from '@/pages/Analytics/AnalyticsDashboard';
import FinalReport from '@/pages/Reports/FinalReport';
import SettingsPage from '@/pages/Settings/SettingsPage';

// Admin
import AdminPanel from '@/pages/Admin/AdminPanel';

// 404
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

function App() {
  const dispatch = useDispatch();
  const colorTheme = useSelector((state) => state.ui?.colorTheme || 'teal');

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const synced = await syncUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Candidate',
            email: firebaseUser.email || '',
          });
          const token = await firebaseUser.getIdToken();
          const userObj = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Candidate',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            targetRole: synced?.targetRole || 'Full Stack Developer',
            experienceLevel: synced?.experienceLevel || 'Mid-Level',
            role: 'candidate',
          };
          localStorage.setItem('user', JSON.stringify(userObj));
          localStorage.setItem('token', token);
          dispatch(updateUser(userObj));
        } catch (err) {
          console.warn('Firebase user sync:', err);
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* Redirect any legacy pricing visits directly to dashboard */}
        <Route path="/pricing" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<CandidateDashboard />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/aptitude" element={<AptitudePage />} />
        <Route path="/coding" element={<CodingPage />} />
        <Route path="/interview/technical" element={<TechnicalInterview />} />
        <Route path="/interview/project" element={<ProjectDiscussion />} />
        <Route path="/interview/system-design" element={<SystemDesign />} />
        <Route path="/interview/hr" element={<HRInterview />} />
        <Route path="/voice-interview" element={<VoiceInterviewPage />} />
        <Route path="/company-mode" element={<CompanyMode />} />
        <Route path="/company" element={<CompanyMode />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/report" element={<FinalReport />} />
        <Route path="/reports" element={<FinalReport />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<SettingsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute><RoleRoute allowedRoles={["admin"]}><DashboardLayout /></RoleRoute></ProtectedRoute>}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
