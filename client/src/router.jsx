import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout.jsx';
import CandidateLayout from './layouts/CandidateLayout.jsx';
import InterviewerLayout from './layouts/InterviewerLayout.jsx';
import InterviewLayout from './layouts/InterviewLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import RecruiterLayout from './layouts/RecruiterLayout.jsx';

import AdminAIConfigurationScreen from './pages/admin/AIConfigurationScreen.jsx';
import AdminApplicationsScreen from './pages/admin/ApplicationsScreen.jsx';
import AdminContractsScreen from './pages/admin/ContractsScreen.jsx';
import AdminDashboardScreen from './pages/admin/DashboardScreen.jsx';
import AdminInterviewerRatingsScreen from './pages/admin/InterviewerRatingsScreen.jsx';
import AdminInterviewsScreen from './pages/admin/InterviewsScreen.jsx';
import AdminJobsScreen from './pages/admin/JobsScreen.jsx';
import AdminReportsScreen from './pages/admin/ReportsScreen.jsx';
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

import FeedbackScreen from './pages/interview/FeedbackScreen.jsx';
import InterviewScreen from './pages/interview/InterviewScreen.jsx';

import InterviewerApplicationsScreen from './pages/interviewer/ApplicationsScreen.jsx';
import InterviewerChatScreen from './pages/interviewer/ChatScreen.jsx';
import InterviewerContractsScreen from './pages/interviewer/ContractsScreen.jsx';
import InterviewerDashboardScreen from './pages/interviewer/DashboardScreen.jsx';
import InterviewerInterviewsScreen from './pages/interviewer/InterviewsScreen.jsx';
import InterviewerJobsScreen from './pages/interviewer/JobsScreen.jsx';
import InterviewerRatingsScreen from './pages/interviewer/RatingsScreen.jsx';
import InterviewerStripeConnectRefreshScreen from './pages/interviewer/StripeConnectRefreshScreen.jsx';
import InterviewerStripeConnectReturnScreen from './pages/interviewer/StripeConnectReturnScreen.jsx';

import RecruiterApplicationsScreen from './pages/recruiter/ApplicationsScreen.jsx';
import RecruiterChatsScreen from './pages/recruiter/ChatsScreen.jsx';
import RecruiterContractsScreen from './pages/recruiter/ContractsScreen.jsx';
import RecruiterDashboardScreen from './pages/recruiter/DashboardScreen.jsx';
import RecruiterInterviewsScreen from './pages/recruiter/InterviewsScreen.jsx';
import RecruiterJobsScreen from './pages/recruiter/JobsScreen.jsx';
import RecruiterRatingsScreen from './pages/recruiter/RatingsScreen.jsx';

import ComingSoon from './pages/ComingSoon.jsx';
import ErrorScreen from './pages/ErrorScreen.jsx';
import HomeScreen from './pages/HomeScreen.jsx';
import JobsScreen from './pages/JobsScreen.jsx';
import NotFoundScreen from './pages/NotFoundScreen.jsx';

import RequireAuth from './guards/RequireAuth.jsx';
import RequireRole from './guards/RequireRole.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorScreen />}>
      <Route
        path="admin"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['admin']}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardScreen />} />
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
        <Route
          path="ai-configuration"
          element={<AdminAIConfigurationScreen />}
        />
        <Route path="reports" element={<AdminReportsScreen />} />
      </Route>

      <Route path="auth">
        <Route index element={<Navigate to="login" replace />} />
        <Route
          path="login"
          element={
            <RequireAuth>
              <LoginScreen />
            </RequireAuth>
          }
        />
        <Route
          path="register"
          element={
            <RequireAuth>
              <RegisterScreen />
            </RequireAuth>
          }
        />
        <Route
          path="reset-password"
          element={
            <RequireAuth>
              <ResetPwdScreen />
            </RequireAuth>
          }
        />
        <Route
          path="verify"
          element={
            <RequireAuth>
              <VerifyProfileScreen />
            </RequireAuth>
          }
        />
      </Route>

      <Route
        path="candidate"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['candidate']}>
              <CandidateLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboardScreen />} />
        <Route path="jobs" element={<CandidateJobsScreen />} />
        <Route path="apply/:jobId" element={<CandidateApplyScreen />} />
        <Route
          path="apply/:jobId/success"
          element={<CandidateApplicationSuccessScreen />}
        />
        <Route path="applications" element={<CandidateApplicationsScreen />} />
        <Route path="interviews" element={<CandidateInterviewsScreen />} />
      </Route>

      <Route
        path="interview"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['candidate', 'interviewer']}>
              <InterviewLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/" replace />} />
        <Route path=":roomId" element={<InterviewScreen />} />
        <Route path=":roomId/feedback" element={<FeedbackScreen />} />
      </Route>

      <Route path="interviewer" element={<InterviewerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InterviewerDashboardScreen />} />
        <Route path="jobs" element={<InterviewerJobsScreen />} />
        <Route path="contracts" element={<InterviewerContractsScreen />} />
        <Route
          path="applications"
          element={<InterviewerApplicationsScreen />}
        />
        <Route path="interviews" element={<InterviewerInterviewsScreen />} />
        <Route path="chats" element={<InterviewerChatScreen />} />
        <Route path="ratings" element={<InterviewerRatingsScreen />} />
        <Route
          path="stripe/refresh"
          element={<InterviewerStripeConnectRefreshScreen />}
        />
        <Route
          path="stripe/return"
          element={<InterviewerStripeConnectReturnScreen />}
        />
      </Route>

      <Route element={<MainLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="user">
          <Route index element={<Navigate to="profile" replace />} />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfileScreen />
              </RequireAuth>
            }
          />
          <Route
            path="resume"
            element={
              <RequireAuth>
                <ResumeScreen />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="jobs" element={<JobsScreen />} />
      </Route>

      <Route
        path="recruiter"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['recruiter']}>
              <RecruiterLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboardScreen />} />
        <Route path="jobs" element={<RecruiterJobsScreen />} />
        <Route path="chats" element={<RecruiterChatsScreen />} />
        <Route path="contracts" element={<RecruiterContractsScreen />} />
        <Route path="applications" element={<RecruiterApplicationsScreen />} />
        <Route path="interviews" element={<RecruiterInterviewsScreen />} />
        <Route
          path="interviewer-ratings"
          element={<RecruiterRatingsScreen />}
        />
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
      <Route path="coming-soon" element={<ComingSoon />} />
    </Route>
  )
);

export default router;
