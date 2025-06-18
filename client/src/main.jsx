import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import ThemeProvider from './providers/ThemeProvider.jsx';
import { initGA } from './utils/analytics.js';

import './index.css';
import router from './router.jsx';
import store from './store.js';

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
