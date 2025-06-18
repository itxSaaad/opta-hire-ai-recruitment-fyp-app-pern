import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import {
  FaBriefcase,
  FaChartLine,
  FaClock,
  FaHandshake,
  FaStar,
  FaUsers,
} from 'react-icons/fa';

const StatCard = ({
  icon: Icon,
  number,
  label,
  suffix = '',
  prefix = '',
  delay = 0,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        let start = 0;
        const duration = 2000;
        const increment = number / (duration / 16);
        const counter = setInterval(() => {
          start += increment;
          if (start > number) {
            setCount(number);
            clearInterval(counter);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);

        return () => clearInterval(counter);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, number, delay]);

  return (
    <div
      ref={ref}
      className="group relative transform rounded-2xl border border-light-border/20 bg-light-surface/50 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:bg-light-surface/70 dark:border-dark-border/20 dark:bg-dark-surface/50 dark:hover:bg-dark-surface/70"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-light-primary/5 to-light-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-dark-primary/5 dark:to-dark-secondary/5" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light-primary/10 transition-colors duration-300 group-hover:bg-light-primary/20 dark:bg-dark-primary/10 dark:group-hover:bg-dark-primary/20">
          <Icon className="text-2xl text-light-primary transition-transform duration-300 group-hover:scale-110 dark:text-dark-primary" />
        </div>

        {/* Number */}
        <div className="mb-2 text-4xl font-bold text-light-text dark:text-dark-text md:text-5xl">
          {prefix}
          {count.toLocaleString()}
          {suffix}
        </div>

        {/* Label */}
        <div className="font-medium text-light-text/70 dark:text-dark-text/70">
          {label}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  number: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  delay: PropTypes.number,
};

const AchievementBadge = ({
  icon: Icon,
  title,
  description,
  color = 'primary',
}) => {
  const colorClasses = {
    primary: 'from-light-primary to-light-secondary',
    secondary: 'from-light-secondary to-light-primary',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
  };

  return (
    <div className="flex items-center space-x-4 rounded-xl border border-light-border/20 bg-light-surface/30 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-light-surface/50 dark:border-dark-border/20 dark:bg-dark-surface/30 dark:hover:bg-dark-surface/50">
      <div
        className={`h-12 w-12 rounded-full bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}
      >
        <Icon className="text-lg text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-light-text dark:text-dark-text">
          {title}
        </h4>
        <p className="text-sm text-light-text/70 dark:text-dark-text/70">
          {description}
        </p>
      </div>
    </div>
  );
};

AchievementBadge.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning']),
};

export default function StatsSection() {
  const stats = [
    {
      icon: FaUsers,
      number: 10000,
      suffix: '+',
      label: 'Active Users',
      delay: 0,
    },
    {
      icon: FaBriefcase,
      number: 1500,
      suffix: '+',
      label: 'Successful Hires',
      delay: 200,
    },
    {
      icon: FaHandshake,
      number: 500,
      suffix: '+',
      label: 'Expert Interviewers',
      delay: 400,
    },
    {
      icon: FaChartLine,
      number: 98,
      suffix: '%',
      label: 'Success Rate',
      delay: 600,
    },
  ];

  const achievements = [
    {
      icon: FaStar,
      title: 'Top-Rated Platform',
      description: 'Highest user satisfaction in recruitment tech',
      color: 'success',
    },
    {
      icon: FaChartLine,
      title: '98% Success Rate',
      description: 'Industry-leading hiring success metrics',
      color: 'primary',
    },
    {
      icon: FaClock,
      title: '50% Faster Hiring',
      description: 'Reduce time-to-hire with AI optimization',
      color: 'warning',
    },
    {
      icon: FaHandshake,
      title: 'Global Network',
      description: 'Expert interviewers from 50+ countries',
      color: 'secondary',
    },
  ];

  return (
    <section className="relative bg-light-background px-4 py-16 dark:bg-dark-background sm:px-6 lg:px-8" id='stats'>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #0EB0E3 2px, transparent 2px), radial-gradient(circle at 75% 75%, #3946AE 2px, transparent 2px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-6 text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl lg:text-5xl">
            Driving Success in{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Modern Recruitment
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-light-text/80 dark:text-dark-text/80 sm:text-xl">
            Our platform powers thousands of successful hiring decisions every
            month. Join the companies that trust OptaHire for their recruitment
            needs.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="mb-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Achievements Section */}
        <div className="rounded-3xl border border-light-border/20 bg-gradient-to-r from-light-surface/30 to-light-surface/20 p-6 backdrop-blur-sm dark:border-dark-border/20 dark:from-dark-surface/30 dark:to-dark-surface/20 lg:p-8">
          <div className="mb-10 text-center">
            <h3 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text lg:text-3xl">
              Why Companies Choose OptaHire
            </h3>
            <p className="text-light-text/70 dark:text-dark-text/70">
              Leading the industry with innovation, reliability, and results
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {achievements.map((achievement, index) => (
              <AchievementBadge key={index} {...achievement} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-light-primary/10 px-6 py-3 dark:bg-dark-primary/10">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Join 10,000+ users already transforming their hiring process
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
