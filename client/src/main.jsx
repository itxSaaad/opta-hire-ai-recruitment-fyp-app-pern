import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import './index.css';
import ThemeProvider from './provider/ThemeProvider.jsx';
import store from './store.js';
import { initGA } from './utils/analytics.js';

import AdminLayout from './layouts/AdminLayout.jsx';
import CandidateLayout from './layouts/CandidateLayout';
import InterviewerLayout from './layouts/InterviewerLayout';
import InterviewLayout from './layouts/InterviewLayout';
import MainLayout from './layouts/MainLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

import AdminApplicationsScreen from './pages/admin/ApplicationsScreen.jsx';
import AdminContractsScreen from './pages/admin/ContractsScreen.jsx';
import AdminDashboardScreen from './pages/admin/DashboardScreen.jsx';
import AdminInterviewerRatingsScreen from './pages/admin/InterviewerRatingsScreen.jsx';
import AdminInterviewsScreen from './pages/admin/InterviewsScreen.jsx';
import AdminJobsScreen from './pages/admin/JobsScreen.jsx';
import AdminTransactionsScreen from './pages/admin/TransactionsScreen.jsx';
import AdminUsersScreen from './pages/admin/UsersScreen.jsx';

import LoginScreen from './pages/auth/LoginScreen.jsx';
import RegisterScreen from './pages/auth/RegisterScreen.jsx';
import ResetPwdScreen from './pages/auth/ResetPwdScreen.jsx';
import VerifyProfileScreen from './pages/auth/VerifyProfileScreen.jsx';
import ProfileScreen from './pages/user/ProfileScreen.jsx';
import ResumeScreen from './pages/user/ResumeScreen.jsx';

import CandidateApplicationsScreen from './pages/candidate/ApplicationsScreen.jsx';
import CandidateApplicationSuccessScreen from './pages/candidate/ApplicationSuccessScreen.jsx';
import CandidateApplyScreen from './pages/candidate/ApplyScreen.jsx';
import CandidateDashboardScreen from './pages/candidate/DashboardScreen.jsx';
import CandidateInterviewsScreen from './pages/candidate/InterviewsScreen.jsx';
import CandidateJobsScreen from './pages/candidate/JobsScreen.jsx';

import InterviewScreen from './pages/interview/InterviewScreen.jsx';
import FeedbackScreen from './pages/interview/FeedbackScreen.jsx';

import ComingSoon from './pages/ComingSoon.jsx';
import ErrorScreen from './pages/ErrorScreen.jsx';
import HomeScreen from './pages/HomeScreen.jsx';
import JobsScreen from './pages/JobsScreen.jsx';
import NotFoundScreen from './pages/NotFoundScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorScreen />}>
      <Route path="admin" element={<AdminLayout />}>
        <Route index path="dashboard" element={<AdminDashboardScreen />} />
        <Route path="users" element={<AdminUsersScreen />} />
        <Route path="jobs" element={<AdminJobsScreen />} />
        <Route path="applications" element={<AdminApplicationsScreen />} />
        <Route path="contracts" element={<AdminContractsScreen />} />
        <Route path="interviews" element={<AdminInterviewsScreen />} />
        <Route path="transactions" element={<AdminTransactionsScreen />} />
        <Route
          path="interviewer-ratings"
          element={<AdminInterviewerRatingsScreen />}
        />

        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="auth">
        <Route index path="login" element={<LoginScreen />} />
        <Route path="register" element={<RegisterScreen />} />
        <Route path="reset-password" element={<ResetPwdScreen />} />
        <Route path="verify" element={<VerifyProfileScreen />} />
      </Route>

      <Route path="candidate" element={<CandidateLayout />}>
        <Route index element={<ComingSoon />} />
        <Route index path="dashboard" element={<CandidateDashboardScreen />} />
        <Route path="jobs" element={<CandidateJobsScreen />} />
        <Route path="apply/:jobId" element={<CandidateApplyScreen />} />
        <Route
          path="apply/:jobId/success"
          element={<CandidateApplicationSuccessScreen />}
        />
        <Route path="applications" element={<CandidateApplicationsScreen />} />
        <Route path="interviews" element={<CandidateInterviewsScreen />} />
      </Route>

      <Route path="interview" element={<InterviewLayout />}>
        <Route index path=":roomId" element={<InterviewScreen />} />
        <Route path=":roomId/feedback" element={<FeedbackScreen />} />
      </Route>

      <Route path="interviewer" element={<InterviewerLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="user">
          <Route index path="profile" element={<ProfileScreen />} />
          <Route path="resume" element={<ResumeScreen />} />
        </Route>
        <Route path="jobs" element={<JobsScreen />} />
      </Route>

      <Route path="recruiter" element={<RecruiterLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
      <Route path="coming-soon" element={<ComingSoon />} />
    </Route>
  )
);

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

if (GA_TRACKING_ID) {
  initGA(GA_TRACKING_ID);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);
