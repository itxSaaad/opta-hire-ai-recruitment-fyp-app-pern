import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { trackEvent } from '../../utils/analytics';

const TypeWriter = ({ texts, speed = 100, deleteSpeed = 50, delay = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        const fullText = texts[currentTextIndex];

        if (isDeleting) {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        } else {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }

        if (!isDeleting && currentText === fullText) {
          setTimeout(() => setIsDeleting(true), delay);
        } else if (isDeleting && currentText === '') {
          setIsDeleting(false);
          setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }
      },
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [
    currentText,
    isDeleting,
    currentTextIndex,
    texts,
    speed,
    deleteSpeed,
    delay,
  ]);

  return (
    <span className="text-light-secondary dark:text-dark-secondary">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

TypeWriter.propTypes = {
  texts: PropTypes.arrayOf(PropTypes.string).isRequired,
  speed: PropTypes.number,
  deleteSpeed: PropTypes.number,
  delay: PropTypes.number,
};

const StatsCounter = ({ end, label, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-light-primary dark:text-dark-primary md:text-3xl">
        {count.toLocaleString()}+
      </div>
      <div className="text-sm text-light-text/70 dark:text-dark-text/70">
        {label}
      </div>
    </div>
  );
};

StatsCounter.propTypes = {
  end: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  duration: PropTypes.number,
};

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const heroTexts = [
    'AI Recruitment',
    'Perfect Matches',
    'Smart Interviews',
    'Fair Decisions',
    'Top Talent',
  ];

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-light-background via-light-surface/30 to-light-background px-6 pt-24 dark:from-dark-background dark:via-dark-surface/30 dark:to-dark-background sm:px-10"
      id="hero"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic gradient orbs */}
        <div
          className="absolute h-96 w-96 rounded-full bg-light-primary/10 blur-3xl dark:bg-dark-primary/10"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            left: '10%',
            top: '20%',
          }}
        />
        <div
          className="absolute h-96 w-96 rounded-full bg-light-secondary/10 blur-3xl dark:bg-dark-secondary/10"
          style={{
            transform: `translate(-${mousePosition.x * 0.015}px, -${mousePosition.y * 0.015}px)`,
            right: '10%',
            bottom: '20%',
          }}
        />

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute left-1/4 top-1/4 h-32 w-32 rotate-45 animate-spin border border-light-primary"
            style={{ animationDuration: '20s' }}
          />
          <div
            className="absolute right-1/4 top-3/4 h-24 w-24 rotate-12 animate-spin border border-light-secondary"
            style={{ animationDuration: '15s', animationDirection: 'reverse' }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
        <div className="animate-fadeIn">
          {/* Main headline */}
          <h1 className="mb-6 px-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            <span className="text-light-text dark:text-dark-text">
              Optimize Your
              <br />
              Hiring with{' '}
            </span>
            <TypeWriter texts={heroTexts} />
          </h1>

          {/* Subheadline */}
          <div className="mx-auto max-w-4xl px-4">
            <p className="mb-8 text-lg leading-relaxed text-light-text/80 dark:text-dark-text/80 sm:text-xl md:text-2xl">
              Connect with{' '}
              <span className="font-semibold text-light-primary dark:text-dark-primary">
                expert interviewers
              </span>
              , find{' '}
              <span className="font-semibold text-light-secondary dark:text-dark-secondary">
                top candidates
              </span>
              , and make{' '}
              <span className="font-semibold text-light-primary dark:text-dark-primary">
                smarter hiring decisions
              </span>{' '}
              with our AI-powered platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-12 flex animate-slideUp flex-col items-center justify-center gap-4 px-4 sm:flex-row">
            <Link
              to="/auth/register"
              className="group flex w-full transform items-center justify-center space-x-2 rounded-xl bg-light-primary px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-light-secondary hover:shadow-xl dark:bg-dark-primary dark:hover:bg-dark-secondary sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              onClick={() =>
                trackEvent('HeroSection', 'Primary CTA Clicked', {
                  button: 'Get Started Free',
                })
              }
            >
              <span>Get Started Free</span>
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              className="group flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-light-primary bg-transparent px-6 py-3 text-base font-semibold text-light-primary transition-all duration-300 hover:bg-light-primary hover:text-white dark:border-dark-primary dark:text-dark-primary dark:hover:bg-dark-primary dark:hover:text-white sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              onClick={() =>
                trackEvent('HeroSection', 'Secondary CTA Clicked', {
                  button: 'Learn More',
                })
              }
            >
              <span>Learn More</span>
            </button>
          </div>

          {/* Quick stats */}
          <div
            className="flex animate-slideUp flex-wrap justify-center gap-6 px-4 sm:gap-8 md:gap-12"
            style={{ animationDelay: '500ms' }}
          >
            <StatsCounter end={1500} label="Successful Hires" />
            <StatsCounter end={500} label="Expert Interviewers" />
            <StatsCounter end={200} label="Companies" />
            <StatsCounter end={98} label="Success Rate %" />
          </div>

          <div className="mt-12 flex h-12 flex-col items-center gap-6 px-4 sm:flex-row sm:gap-8"></div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform animate-bounce">
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-light-primary dark:border-dark-primary">
          <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-light-primary dark:bg-dark-primary"></div>
        </div>
      </div>
    </section>
  );
}
