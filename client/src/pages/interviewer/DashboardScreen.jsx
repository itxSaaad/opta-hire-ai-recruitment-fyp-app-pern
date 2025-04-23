import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import Logo from '../../assets/images/logo.png';

import { trackPageView } from '../../utils/analytics';

export default function DashboardScreen() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return (
    <>
      <Helmet>
        <title>Interviewer Dashboard - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Interviewer Dashboard - Manage your Interviews and ratings efficiently with our powerful tools and insights."
        />
        <meta
          name="keywords"
          content="OptaHire, Interviewer Dashboard, Recruitment, Management"
        />
      </Helmet>

      <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        <div className="max-w-4xl w-full mx-auto text-center bg-light-surface dark:bg-dark-surface p-8 rounded-xl shadow-lg animate-slideUp">
          <img
            src={Logo}
            alt="OptaHire Logo"
            className="w-24 h-24 mx-auto mb-6 animate-loader"
          />
          <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-6">
            Welcome to the Interviewer Dashboard
          </h1>
          <p className="text-xl text-light-text dark:text-dark-text mb-8">
            Manage your interviews, ratings, and feedback efficiently with our
            powerful tools and insights.
          </p>
          <div className="border-t border-light-border dark:border-dark-border pt-6 mt-6">
            <p className="text-lg text-light-text dark:text-dark-text mb-6">
              Please select an option from the menu to get started.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
