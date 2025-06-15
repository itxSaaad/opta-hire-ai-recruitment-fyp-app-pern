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
        <title>Candidate Dashboard - OptaHire | Your Job Search Hub</title>
        <meta
          name="description"
          content="OptaHire Candidate Dashboard - Track your applications, upcoming interviews, and discover new opportunities with AI-powered matching."
        />
        <meta
          name="keywords"
          content="OptaHire Candidate Dashboard, Job Search, Application Tracking, Interview Schedule, Career Opportunities"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn items-center justify-center bg-light-background px-4 py-24 dark:bg-dark-background">
        <div className="mx-auto w-full max-w-4xl animate-slideUp rounded-xl bg-light-surface p-8 text-center shadow-lg dark:bg-dark-surface">
          <img
            src={Logo}
            alt="OptaHire Logo"
            className="mx-auto mb-6 h-24 w-24 animate-loader"
          />
          <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
            Your Career{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Dashboard
            </span>
          </h1>
          <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
            Track your applications, monitor interview schedules, and discover
            new career opportunities tailored for you.
          </p>
          <div className="mt-6 border-t border-light-border pt-6 dark:border-dark-border">
            <p className="mb-6 text-lg text-light-text dark:text-dark-text">
              Please select an option from the menu to get started.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
