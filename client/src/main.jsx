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

import App from './App.jsx';
import ComingSoon from './screens/ComingSoon.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import NotFoundScreen from './screens/NotFoundScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="coming-soon" element={<ComingSoon />} />
      <Route path="*" element={<NotFoundScreen />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>
);
