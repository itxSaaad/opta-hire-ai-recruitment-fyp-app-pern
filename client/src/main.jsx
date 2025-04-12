import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import './index.css';
import { initGA } from './utils/analytics.js';

import App from './App.jsx';
import ComingSoon from './screens/ComingSoon.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import NotFoundScreen from './screens/NotFoundScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="coming-soon" element={<ComingSoon />} />
      <Route path="login" element={<ComingSoon />} />
      <Route path="register" element={<ComingSoon />} />
      <Route path="jobs" element={<ComingSoon />} />
      <Route path="recruiter/*" element={<ComingSoon />} />
      <Route path="interviewer/*" element={<ComingSoon />} />
      <Route path="*" element={<NotFoundScreen />} />
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
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>
);
