import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaHome } from 'react-icons/fa';
import { Link, useLocation, useRouteError } from 'react-router-dom';

import { trackEvent, trackPageView } from '../utils/analytics';

export default function ErrorScreen() {
  const location = useLocation();
  const error = useRouteError();

  console.error(error);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          Error - OptaHire |{' '}
          {error?.status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
        </title>
        <meta
          name="description"
          content={
            error?.status === 404
              ? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.'
              : 'An error occurred on OptaHire. Our team is working to resolve the issue. Return to our recruitment platform.'
          }
        />
        <meta
          name="keywords"
          content="OptaHire Error, Technical Issue, Error Page, Platform Error"
        />
      </Helmet>
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-light-background px-4 text-center dark:bg-dark-background sm:px-6 lg:px-8">
        <h1 className="absolute flex animate-pulse items-center justify-center text-[50vw] font-extrabold leading-3 text-light-primary opacity-10 dark:text-dark-primary sm:text-[30vw] md:text-[20vw]">
          {error?.status || 500}
        </h1>

        <div className="relative z-10 flex w-full max-w-xl flex-col items-center justify-center">
          <h1 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text sm:text-3xl md:text-4xl">
            {error?.status === 404 ? 'Page Not Found' : 'Something Went Wrong.'}
          </h1>
          <p className="mb-8 text-base text-light-text opacity-80 dark:text-dark-text sm:text-lg md:text-xl">
            {error?.status === 404
              ? 'The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to optimizing your recruitment journey.'
              : ' We&apos;re experiencing a technical issue. Our team is working to get you back to your recruitment journey.'}
          </p>

          <Link
            to="/"
            className="flex transform items-center space-x-2 text-base font-medium text-light-secondary underline-offset-4 transition duration-300 ease-in-out hover:scale-105 hover:underline dark:text-dark-primary sm:text-lg md:text-xl"
            onClick={() =>
              trackEvent('ErrorScreen', 'Go to Home Clicked', {
                errorStatus: error?.status,
              })
            }
          >
            <FaHome />
            <span>Go to Home</span>
          </Link>
        </div>
      </main>
    </>
  );
}
