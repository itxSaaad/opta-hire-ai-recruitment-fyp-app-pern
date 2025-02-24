import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Logo from '../assets/images/logo.png';

export default function ComingSoon({
  logoSrc = Logo,
  launchDate = '2025-05-15',
}) {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(launchDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
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

  return (
    <>
      <Helmet>
        <title>Coming Soon - OptaHire</title>
        <meta
          name="description"
          content="OptaHire is working hard to bring you an innovative recruitment platform. Stay tuned for something amazing!"
        />
      </Helmet>
      <main className="relative flex flex-col items-center justify-center min-h-screen text-center p-4 bg-light-background dark:bg-dark-background">
        <h1 className="absolute leading-3 text-[20vw] font-extrabold text-light-primary dark:text-dark-primary opacity-10 flex items-center justify-center">
          OptaHire
        </h1>

        <div className="relative w-full max-w-xl z-10 flex flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="Spinning Logo"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-60 lg:h-60 animate-loader"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
            Coming Soon!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-light-text dark:text-dark-text opacity-80 mb-8">
            We are working hard to bring you something special. Stay tuned!
          </p>

          <div className="flex flex-wrap justify-center space-x-4 sm:space-x-8 text-light-text dark:text-dark-text text-base sm:text-lg md:text-xl font-medium mb-8">
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-light-primary dark:text-dark-primary">
                {timeLeft.days || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-light-text dark:text-dark-text opacity-80">
                Days
              </p>
            </div>
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-light-primary dark:text-dark-primary">
                {timeLeft.hours || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-light-text dark:text-dark-text opacity-80">
                Hours
              </p>
            </div>
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-light-primary dark:text-dark-primary">
                {timeLeft.minutes || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-light-text dark:text-dark-text opacity-80">
                Minutes
              </p>
            </div>
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-light-primary dark:text-dark-primary">
                {timeLeft.seconds || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-light-text dark:text-dark-text opacity-80">
                Seconds
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center space-x-2 text-base sm:text-lg md:text-xl font-medium text-light-secondary dark:text-dark-primary hover:underline underline-offset-4 transition duration-300 ease-in-out transform hover:scale-105"
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
