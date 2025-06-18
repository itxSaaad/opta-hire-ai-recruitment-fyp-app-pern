import { useEffect, useRef, useState } from 'react';
import {
  FaArrowRight,
  FaChartLine,
  FaClock,
  FaHandshake,
  FaMoneyCheckAlt,
  FaRocket,
  FaShieldAlt,
  FaUsers,
  FaUserTie,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import PropTypes from 'prop-types';
import { trackEvent } from '../../utils/analytics';

const BenefitCard = ({
  icon: Icon,
  title,
  description,
  benefits,
  cta,
  userType,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const userTypeColors = {
    recruiter: 'from-blue-500 to-indigo-500',
    interviewer: 'from-green-500 to-emerald-500',
    candidate: 'from-purple-500 to-pink-500',
  };

  return (
    <div
      ref={ref}
      className={`group relative h-full transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-light-border/20 bg-light-surface/30 p-8 backdrop-blur-sm hover:scale-105 hover:bg-light-surface/50 hover:shadow-2xl dark:border-dark-border/20 dark:bg-dark-surface/30 dark:hover:bg-dark-surface/50`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-light-primary/5 to-light-secondary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-dark-primary/5 dark:to-dark-secondary/5" />

      <div className="relative z-10 flex h-full flex-col">
        {/* User Type Badge */}
        <div
          className={`inline-flex items-center space-x-2 rounded-full bg-gradient-to-r px-3 py-1 ${userTypeColors[userType]} mb-4 self-start text-sm font-semibold text-white`}
        >
          <Icon className="text-sm" />
          <span className="capitalize">For {userType}s</span>
        </div>

        {/* Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-light-primary/20 to-light-secondary/20 transition-transform duration-300 group-hover:scale-110 dark:from-dark-primary/20 dark:to-dark-secondary/20">
          <Icon className="text-3xl text-light-primary transition-transform duration-300 group-hover:scale-110 dark:text-dark-primary" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-4 text-2xl font-bold text-light-text transition-colors duration-300 group-hover:text-light-primary dark:text-dark-text dark:group-hover:text-dark-primary">
            {title}
          </h3>
          <p className="mb-6 leading-relaxed text-light-text/70 dark:text-dark-text/70">
            {description}
          </p>

          {/* Benefits */}
          <ul className="mb-6 flex-1 space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-light-primary dark:bg-dark-primary"></div>
                <span className="text-sm leading-relaxed text-light-text/80 dark:text-dark-text/80">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link
          to="/auth/register"
          className={`w-full bg-gradient-to-r ${userTypeColors[userType]} mt-auto flex transform items-center justify-center space-x-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105`}
          onClick={() =>
            trackEvent('BenefitsSection', 'CTA Clicked', {
              userType,
              button: cta,
            })
          }
        >
          <span>{cta}</span>
          <FaArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Hover Arrow */}
        <div
          className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-light-primary/20 transition-all duration-300 dark:bg-dark-primary/20 ${
            isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
          }`}
        >
          <FaArrowRight className="text-sm text-light-primary dark:text-dark-primary" />
        </div>
      </div>
    </div>
  );
};

BenefitCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  benefits: PropTypes.arrayOf(PropTypes.string).isRequired,
  cta: PropTypes.string.isRequired,
  userType: PropTypes.oneOf(['recruiter', 'interviewer', 'candidate'])
    .isRequired,
  delay: PropTypes.number,
};

const FeatureHighlight = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-4 rounded-xl border border-light-border/10 bg-light-background/50 p-4 transition-all duration-300 hover:bg-light-surface/30 dark:border-dark-border/10 dark:bg-dark-background/50 dark:hover:bg-dark-surface/30">
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-light-primary to-light-secondary">
      <Icon className="text-lg text-white" />
    </div>
    <div>
      <h4 className="mb-1 font-semibold text-light-text dark:text-dark-text">
        {title}
      </h4>
      <p className="text-sm text-light-text/70 dark:text-dark-text/70">
        {description}
      </p>
    </div>
  </div>
);

FeatureHighlight.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default function BenefitsSection() {
  const benefits = [
    {
      icon: FaUserTie,
      title: 'Hire Smarter & Faster',
      description:
        'Connect with expert interviewers and leverage AI to find the perfect candidates for your roles.',
      userType: 'recruiter',
      cta: 'Start Hiring',
      benefits: [
        'AI shortlists top 5 candidates automatically',
        'Access to 500+ verified expert interviewers',
        '70% reduction in time-to-hire',
        'Comprehensive interview feedback and reports',
        'Secure payment processing with escrow protection',
      ],
    },
    {
      icon: FaMoneyCheckAlt,
      title: 'Monetize Your Expertise',
      description:
        'Turn your professional knowledge into income by conducting interviews for top companies.',
      userType: 'interviewer',
      cta: 'Start Earning',
      benefits: [
        'Earn $25-200+ per hour based on expertise',
        'Keep 97.5% of earnings (only 2.5% platform fee)',
        'Flexible schedule - work when you want',
        'Build professional network and reputation',
        'Weekly payouts via Stripe Connect',
      ],
    },
    {
      icon: FaUsers,
      title: 'Land Your Dream Job',
      description:
        'Get discovered by top recruiters and interviewed by industry experts for the best opportunities.',
      userType: 'candidate',
      cta: 'Find Jobs',
      benefits: [
        'AI-powered job matching based on your skills',
        'Professional interviews with expert feedback',
        'Access to exclusive job opportunities',
        'Career guidance from industry professionals',
        'Higher success rate with expert evaluation',
      ],
    },
  ];

  const platformFeatures = [
    {
      icon: FaRocket,
      title: 'AI-Powered Matching',
      description:
        'Smart algorithms connect the right people for optimal outcomes',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Trusted',
      description:
        'Enterprise-grade security with verified users and secure payments',
    },
    {
      icon: FaClock,
      title: 'Time Efficient',
      description: 'Streamlined process reduces hiring time by up to 70%',
    },
    {
      icon: FaChartLine,
      title: 'Data-Driven Results',
      description: 'Comprehensive analytics and feedback for better decisions',
    },
  ];

  return (
    <section
      className="relative bg-light-background px-4 py-16 dark:bg-dark-background sm:px-6 lg:px-8"
      id="benefits"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-light-primary/10 px-6 py-3 dark:bg-dark-primary/10">
            <FaHandshake className="text-light-primary dark:text-dark-primary" />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Built for everyone in recruitment
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl lg:text-5xl">
            Benefits for{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Every User
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-light-text/80 dark:text-dark-text/80 sm:text-xl">
            OptaHire creates value for recruiters, interviewers, and candidates
            through our innovative AI-powered platform.
          </p>
        </div>

        {/* Benefits Grid - Equal Height Cards */}
        <div className="mb-16 grid gap-8 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} delay={index * 200} />
          ))}
        </div>

        {/* Platform Features */}
        <div className="rounded-3xl border border-light-border/20 bg-gradient-to-r from-light-surface/30 to-light-surface/20 p-6 backdrop-blur-sm dark:border-dark-border/20 dark:from-dark-surface/30 dark:to-dark-surface/20 lg:p-8">
          <div className="mb-10 text-center">
            <h3 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text lg:text-3xl">
              Why Choose OptaHire?
            </h3>
            <p className="text-light-text/70 dark:text-dark-text/70">
              Our platform combines cutting-edge technology with human expertise
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature, index) => (
              <FeatureHighlight key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
