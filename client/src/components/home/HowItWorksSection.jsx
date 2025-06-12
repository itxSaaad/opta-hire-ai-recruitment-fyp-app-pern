import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import {
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaComments,
  FaCreditCard,
  FaFileAlt,
  FaHandshake,
  FaRobot,
} from 'react-icons/fa';

const WorkflowStep = ({
  icon: Icon,
  title,
  description,
  details,
  isActive,
  onClick,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <div ref={ref} className="relative w-full min-w-0 flex-1">
      {/* Step Card */}
      <div
        className={`h-full transform cursor-pointer transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        } ${
          isActive
            ? 'scale-105 border-light-primary bg-light-primary/10 shadow-xl dark:border-dark-primary dark:bg-dark-primary/10'
            : 'hover:scale-102 border-light-border/20 bg-light-surface/50 hover:shadow-lg dark:border-dark-border/20 dark:bg-dark-surface/50'
        } flex flex-col rounded-2xl border-2 p-6 backdrop-blur-sm`}
        onClick={onClick}
      >
        {/* Icon */}
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300 ${
            isActive
              ? 'bg-light-primary/20 dark:bg-dark-primary/20'
              : 'bg-light-primary/10 dark:bg-dark-primary/10'
          }`}
        >
          <Icon
            className={`text-2xl transition-colors duration-300 ${
              isActive
                ? 'text-light-primary dark:text-dark-primary'
                : 'text-light-text/70 dark:text-dark-text/70'
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="mb-3 text-xl font-bold text-light-text dark:text-dark-text">
            {title}
          </h3>
          <p className="mb-4 leading-relaxed text-light-text/70 dark:text-dark-text/70">
            {description}
          </p>

          {/* Expandable Details */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-light-border/20 pt-4 dark:border-dark-border/20">
              <ul className="space-y-2">
                {details.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-light-text/80 dark:text-dark-text/80"
                  >
                    <FaCheckCircle className="mt-0.5 flex-shrink-0 text-light-primary dark:text-dark-primary" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-light-primary to-light-secondary">
            <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

WorkflowStep.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(PropTypes.string).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  delay: PropTypes.number,
};

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  // Actual OptaHire workflow
  const workflowSteps = [
    {
      icon: FaFileAlt,
      title: 'Post & Apply',
      description:
        'Recruiters post jobs, candidates apply, interviewers express interest',
      details: [
        'Recruiters create detailed job postings with requirements',
        'Candidates submit applications with resumes',
        'Expert interviewers browse and express interest in jobs',
        'All profiles are verified for security',
      ],
    },
    {
      icon: FaComments,
      title: 'Chat & Contract',
      description:
        'Recruiters chat with interviewers, agree on terms, and create contracts',
      details: [
        'Direct messaging between recruiters and interviewers',
        'Negotiate interview scope and pricing',
        'Create binding contracts with agreed amounts',
        'Interviewers must have verified Stripe accounts',
      ],
    },
    {
      icon: FaRobot,
      title: 'AI Shortlisting',
      description:
        'Job closes, AI shortlists top 5 candidates, payment held in escrow',
      details: [
        'Recruiter closes job when ready to proceed',
        'AI analyzes all applications and selects top 5 candidates',
        'Recruiter pays contract amount (held in secure escrow)',
        'Shortlisted candidates are revealed to interviewers',
      ],
    },
    {
      icon: FaClock,
      title: 'Schedule & Interview',
      description:
        'Interviewers schedule meetings and conduct professional interviews',
      details: [
        'Interviewers schedule interviews with shortlisted candidates',
        'Candidates can join 5 minutes before scheduled time',
        'Built-in video calling with recording capabilities',
        'Comprehensive feedback forms for each candidate',
      ],
    },
    {
      icon: FaCheckCircle,
      title: 'Complete & Pay',
      description:
        'Mark complete, payment released, rate interviewer, hire candidates',
      details: [
        'Interviewer notifies completion of all interviews',
        'Recruiter marks contract as completed',
        'Payment released to interviewer (2-3 business days)',
        'Recruiter can hire candidates and rate interviewer',
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [workflowSteps.length]);

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-light-surface/20 to-light-background px-4 py-16 dark:from-dark-surface/20 dark:to-dark-background sm:px-6 lg:px-8"
      id="how-it-works"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center lg:mb-16">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-light-primary/10 px-6 py-3 dark:bg-dark-primary/10">
            <FaClipboardList className="text-light-primary dark:text-dark-primary" />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Simple 5-step process
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl lg:text-5xl">
            <span className="text-light-primary dark:text-dark-primary">
              OptaHire
            </span>{' '}
            Works
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-light-text/80 dark:text-dark-text/80 sm:text-xl">
            From job posting to successful hire - our streamlined process
            connects recruiters, interviewers, and candidates efficiently.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:gap-4 xl:gap-6">
          {workflowSteps.map((step, index) => (
            <WorkflowStep
              key={index}
              {...step}
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
              delay={index * 200}
            />
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="mb-12 flex justify-center">
          <div className="flex space-x-2">
            {workflowSteps.map((_, index) => (
              <button
                key={index}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  activeStep === index
                    ? 'scale-125 bg-light-primary dark:bg-dark-primary'
                    : 'bg-light-text/20 hover:bg-light-text/40 dark:bg-dark-text/20 dark:hover:bg-dark-text/40'
                }`}
                onClick={() => setActiveStep(index)}
                aria-label={`Step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Key Requirements */}
        <div className="rounded-3xl border border-light-border/20 bg-gradient-to-r from-light-surface/30 to-light-surface/20 p-6 backdrop-blur-sm dark:border-dark-border/20 dark:from-dark-surface/30 dark:to-dark-surface/20 lg:p-8">
          <div className="mb-8 text-center">
            <h3 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text lg:text-3xl">
              Important Requirements
            </h3>
            <p className="text-light-text/70 dark:text-dark-text/70">
              Key prerequisites for using OptaHire effectively
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start space-x-4 rounded-xl bg-light-background/50 p-4 dark:bg-dark-background/50">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <FaCreditCard className="text-lg text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-light-text dark:text-dark-text">
                  Stripe Required
                </h4>
                <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                  Interviewers must have verified Stripe accounts to accept
                  contracts and receive payments
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 rounded-xl bg-light-background/50 p-4 dark:bg-dark-background/50">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FaRobot className="text-lg text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-light-text dark:text-dark-text">
                  AI Shortlisting
                </h4>
                <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                  Top 5 candidates are automatically selected when recruiters
                  close job postings
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 rounded-xl bg-light-background/50 p-4 dark:bg-dark-background/50 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <FaHandshake className="text-lg text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-light-text dark:text-dark-text">
                  Secure Escrow
                </h4>
                <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                  All payments are held securely until contract completion with
                  2.5% platform fee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
