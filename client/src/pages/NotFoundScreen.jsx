import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { trackEvent, trackPageView } from '../utils/analytics'; // Adjust path as needed

export default function NotFoundScreen() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleHomeClick = () => {
    trackEvent('Navigation', 'Click', 'Go to Home from 404 page');
  };

  return (
    <>
      <Helmet>
        <title>Page Not Found - OptaHire | 404 Error</title>
        <meta
          name="description"
          content="Page not found on OptaHire. The requested page doesn't exist. Return to our AI-powered recruitment platform."
        />
        <meta
          name="keywords"
          content="OptaHire 404, Page Not Found, Error Page, OptaHire Navigation"
        />
      </Helmet>
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-light-background px-4 text-center dark:bg-dark-background sm:px-6 lg:px-8">
        <h1 className="absolute flex animate-pulse items-center justify-center text-[50vw] font-extrabold leading-3 text-light-primary opacity-10 dark:text-dark-primary sm:text-[30vw] md:text-[20vw]">
          404
        </h1>

        <div className="relative z-10 flex w-full max-w-xl flex-col items-center justify-center">
          <h1 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text sm:text-3xl md:text-4xl">
            Page Not Found
          </h1>
          <p className="mb-8 text-base text-light-text opacity-80 dark:text-dark-text sm:text-lg md:text-xl">
            The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get
            you back to optimizing your recruitment journey.
          </p>

          <Link
            to="/"
            className="flex transform items-center space-x-2 text-base font-medium text-light-secondary underline-offset-4 transition duration-300 ease-in-out hover:scale-105 hover:underline dark:text-dark-primary sm:text-lg md:text-xl"
            onClick={handleHomeClick}
          >
            <FaHome />
            <span>Go to Home</span>
          </Link>
        </div>
      </main>
    </>
  );
}
