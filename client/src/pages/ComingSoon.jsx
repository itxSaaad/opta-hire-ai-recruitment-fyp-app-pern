import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Logo from '../assets/images/logo.png';

import { trackEvent, trackPageView } from '../utils/analytics';

export default function ComingSoon({
  logoSrc = Logo,
  launchDate = '2025-07-01',
}) {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(launchDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [launchDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const isLaunched = Object.keys(timeLeft).length === 0;

  useEffect(() => {
    trackPageView('/coming-soon');
  }, []);

  return (
    <>
      <Helmet>
        <title>Coming Soon - OptaHire | New Features in Development</title>
        <meta
          name="description"
          content="Exciting new features coming to OptaHire. Stay tuned for enhanced AI recruitment capabilities and improved user experience."
        />
        <meta
          name="keywords"
          content="OptaHire Coming Soon, New Features, AI Recruitment Updates, Platform Development"
        />
      </Helmet>
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-light-background p-4 text-center dark:bg-dark-background">
        <h1 className="absolute flex items-center justify-center text-[20vw] font-extrabold leading-3 text-light-primary opacity-10 dark:text-dark-primary">
          OptaHire
        </h1>
        <div className="relative z-10 flex w-full max-w-xl flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="Spinning Logo"
            className="h-40 w-40 animate-loader sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-60 lg:w-60"
          />
          <h1 className="mb-4 text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
            {isLaunched ? "We're Live!" : 'Coming Soon!'}
          </h1>
          {!isLaunched ? (
            <>
              <p className="mb-8 text-base text-light-text opacity-80 dark:text-dark-text sm:text-lg md:text-xl">
                We&apos;re working on exciting new features to enhance your
                recruitment experience. Stay tuned!
              </p>
              <div className="mb-8 flex flex-wrap justify-center space-x-4 text-base font-medium text-light-text dark:text-dark-text sm:space-x-8 sm:text-lg md:text-xl">
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-extrabold text-light-primary dark:text-dark-primary sm:text-5xl">
                    {timeLeft.days || 0}
                  </p>
                  <p className="text-xs uppercase opacity-80 sm:text-sm">
                    Days
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-extrabold text-light-primary dark:text-dark-primary sm:text-5xl">
                    {timeLeft.hours || 0}
                  </p>
                  <p className="text-xs uppercase opacity-80 sm:text-sm">
                    Hours
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-extrabold text-light-primary dark:text-dark-primary sm:text-5xl">
                    {timeLeft.minutes || 0}
                  </p>
                  <p className="text-xs uppercase opacity-80 sm:text-sm">
                    Minutes
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl font-extrabold text-light-primary dark:text-dark-primary sm:text-5xl">
                    {timeLeft.seconds || 0}
                  </p>
                  <p className="text-xs uppercase opacity-80 sm:text-sm">
                    Seconds
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="mb-8 text-base text-light-text opacity-80 dark:text-dark-text sm:text-lg md:text-xl">
              Our platform is now live. Check it out!
            </p>
          )}
          <Link
            to="/"
            className="flex transform items-center space-x-2 text-base font-medium text-light-secondary underline-offset-4 transition duration-300 ease-in-out hover:scale-105 hover:underline dark:text-dark-primary sm:text-lg md:text-xl"
            onClick={() =>
              trackEvent('ComingSoon', 'Go to Home Clicked', {
                isLaunched,
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

ComingSoon.propTypes = {
  logoSrc: PropTypes.string,
  launchDate: PropTypes.string,
};
