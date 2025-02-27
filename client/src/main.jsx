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

import ComingSoon from './pages/ComingSoon.jsx';
import HomeScreen from './pages/HomeScreen.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import NotFoundScreen from './pages/NotFoundScreen.jsx';
import RegisterScreen from './pages/RegisterScreen.jsx';

import CandidateLayout from './layouts/CandidateLayout';
import InterviewerLayout from './layouts/InterviewerLayout';
import MainLayout from './layouts/MainLayout';
import RecruiterLayout from './layouts/RecruiterLayout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="auth">
        <Route path="login" element={<LoginScreen />} />
        <Route path="register" element={<RegisterScreen />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="jobs" element={<ComingSoon />} />
      </Route>

      <Route path="recruiter" element={<RecruiterLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="interviewer" element={<InterviewerLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      <Route path="candidate" element={<CandidateLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
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
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);
