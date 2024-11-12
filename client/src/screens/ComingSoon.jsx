import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Logo from '../assets/images/logo.png';
import { Helmet } from 'react-helmet-async';

export default function ComingSoon({
  logoSrc = Logo,
  launchDate = '2025-05-15',
}) {
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
      <main className="relative flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="absolute text-[20vw] font-extrabold text-primary opacity-10 flex items-center justify-center">
          OptaHire
        </h1>

        <div className="relative z-10 flex flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="Spinning Logo"
            className="w-60 h-60 animate-loaderAlt"
          />
          <h1 className="text-4xl font-bold text-darkText mb-4">
            Coming Soon!
          </h1>
          <p className="text-lg text-darkText opacity-80 mb-8">
            We are working hard to bring you something special. Stay tuned!
          </p>

          <div className="flex space-x-8 text-darkText text-lg font-medium">
            <div className="flex flex-col items-center">
              <p className="text-5xl font-extrabold text-primary">
                {timeLeft.days || 0}
              </p>
              <p className="text-sm uppercase text-white opacity-80">Days</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-5xl font-extrabold text-primary">
                {timeLeft.hours || 0}
              </p>
              <p className="text-sm uppercase text-white opacity-80">Hours</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-5xl font-extrabold text-primary">
                {timeLeft.minutes || 0}
              </p>
              <p className="text-sm uppercase text-white opacity-80">Minutes</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-5xl font-extrabold text-primary">
                {timeLeft.seconds || 0}
              </p>
              <p className="text-sm uppercase text-white opacity-80">Seconds</p>
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
