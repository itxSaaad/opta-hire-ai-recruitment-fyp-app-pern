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
// import Loader from './components/Loader.jsx';

// const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
// const CandidateLayout = lazy(() => import('./layouts/CandidateLayout'));
// const InterviewerLayout = lazy(() => import('./layouts/InterviewerLayout'));
// const RecruiterLayout = lazy(() => import('./layouts/RecruiterLayout'));
// const MainLayout = lazy(() => import('./layouts/MainLayout'));

// const HomeScreen = lazy(() => import('./pages/HomeScreen.jsx'));
// const JobsScreen = lazy(() => import('./pages/JobsScreen.jsx'));
// const LoginScreen = lazy(() => import('./pages/auth/LoginScreen.jsx'));
// const RegisterScreen = lazy(() => import('./pages/auth/RegisterScreen.jsx'));
// const ResetPwdScreen = lazy(() => import('./pages/auth/ResetPwdScreen.jsx'));
// const VerifyProfileScreen = lazy(() =>
//   import('./pages/auth/VerifyProfileScreen.jsx')
// );
// const ComingSoon = lazy(() => import('./pages/ComingSoon.jsx'));
// const ErrorScreen = lazy(() => import('./pages/ErrorScreen.jsx'));

import AdminLayout from './layouts/AdminLayout.jsx';
import CandidateLayout from './layouts/CandidateLayout';
import InterviewerLayout from './layouts/InterviewerLayout';
import MainLayout from './layouts/MainLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

import LoginScreen from './pages/auth/LoginScreen.jsx';
import RegisterScreen from './pages/auth/RegisterScreen.jsx';
import ResetPwdScreen from './pages/auth/ResetPwdScreen.jsx';
import VerifyProfileScreen from './pages/auth/VerifyProfileScreen.jsx';
import HomeScreen from './pages/HomeScreen.jsx';
import JobsScreen from './pages/JobsScreen.jsx';

import ComingSoon from './pages/ComingSoon.jsx';
import ErrorScreen from './pages/ErrorScreen.jsx';
import NotFoundScreen from './pages/NotFoundScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorScreen />}>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="candidate" element={<CandidateLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="interviewer" element={<InterviewerLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="jobs" element={<JobsScreen />} />
      </Route>

      <Route path="recruiter" element={<RecruiterLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="auth">
        <Route index element={<NotFoundScreen />} />
        <Route path="login" element={<LoginScreen />} />
        <Route path="register" element={<RegisterScreen />} />
        <Route path="reset-password" element={<ResetPwdScreen />} />
        <Route path="verify" element={<VerifyProfileScreen />} />
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
      <Route path="coming-soon" element={<ComingSoon />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          {/* <Suspense fallback={<Loader />}> */}
          <RouterProvider router={router} />
          {/* </Suspense> */}
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);
