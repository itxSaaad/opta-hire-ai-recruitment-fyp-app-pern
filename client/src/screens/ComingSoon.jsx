import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Logo from '../assets/images/logo.png';

export default function ComingSoon({ logoSrc = Logo, launchDate = '2025-07-01' }) {
  const calculateTimeLeft = () => {
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
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <>
      <Helmet>
        <title>Coming Soon - OptaHire</title>
        <meta
          name="description"
          content="OptaHire is working hard to bring you an innovative recruitment platform. Stay tuned for something amazing!"
        />
      </Helmet>
      <main className="relative flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="absolute leading-3 text-[20vw] font-extrabold text-primary opacity-10 flex items-center justify-center">
          OptaHire
        </h1>

        <div className="relative w-full max-w-xl z-10 flex flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="Spinning Logo"
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-60 lg:h-60 animate-loader"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-darkText mb-4">
            Coming Soon!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-darkText opacity-80 mb-8">
            We are working hard to bring you something special. Stay tuned!
          </p>

          <div className="flex flex-wrap justify-center space-x-4 sm:space-x-8 text-darkText text-base sm:text-lg md:text-xl font-medium">
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-primary">
                {timeLeft.days || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-white opacity-80">Days</p>
            </div>
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-primary">
                {timeLeft.hours || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-white opacity-80">Hours</p>
            </div>
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-primary">
                {timeLeft.minutes || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-white opacity-80">Minutes</p>
            </div>
            <div className="flex flex-col items-center mb-4 sm:mb-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-primary">
                {timeLeft.seconds || 0}
              </p>
              <p className="text-xs sm:text-sm uppercase text-white opacity-80">Seconds</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

ComingSoon.propTypes = {
  logoSrc: PropTypes.string,
  launchDate: PropTypes.string,
};
