import PropTypes from 'prop-types';
import { FaBriefcase, FaMoneyCheckAlt, FaUserCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { trackEvent } from '../../utils/analytics';

const features = [
  {
    icon: (
      <FaMoneyCheckAlt className="text-4xl text-light-primary dark:text-dark-primary" />
    ),
    title: 'Earn for Your Expertise',
    description:
      'Get paid for conducting professional interviews and providing valuable feedback to recruiters.',
  },
  {
    icon: (
      <FaBriefcase className="text-4xl text-light-primary dark:text-dark-primary" />
    ),
    title: 'Expand Your Portfolio',
    description:
      'Showcase your industry knowledge by screening candidates and helping recruiters make the best hiring decisions.',
  },
  {
    icon: (
      <FaUserCheck className="text-4xl text-light-primary dark:text-dark-primary" />
    ),
    title: 'Connect with Recruiters',
    description:
      'Collaborate with recruiters and help them identify top talent for their organizations.',
  },
];

const Feature = ({ icon, title, description }) => (
  <article className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <div className="w-14 h-14 flex items-center justify-center bg-light-primary bg-opacity-10 dark:bg-dark-primary dark:bg-opacity-10 rounded-full">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">
        {title}
      </h3>
      <p className="text-light-text/80 dark:text-dark-text/80 mt-2">
        {description}
      </p>
    </div>
  </article>
);

Feature.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const SectionHeader = () => (
  <div className="lg:w-1/2 lg:pr-10">
    <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-light-text dark:text-dark-text">
      Join{' '}
      <span className="text-light-secondary dark:text-dark-secondary">
        OptaHire
      </span>{' '}
      as an Interviewer
    </h2>
    <p className="text-lg sm:text-xl mb-8 text-light-text/90 dark:text-dark-text/90">
      Earn, grow, and connect with recruiters while helping them hire the best
      talent. Use your expertise to make a difference in the hiring process.
    </p>
    <div className="space-y-6">
      {features.map((feature, index) => (
        <Feature key={index} {...feature} />
      ))}
    </div>
    <div className="mt-10">
      <Link
        to="/auth/register"
        className="inline-block text-lg bg-light-primary dark:bg-dark-primary text-white px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-secondary dark:focus:ring-dark-secondary"
        onClick={() =>
          trackEvent('ForInterviewersSection', 'Get Started Button Clicked', {
            button: 'Become an Interviewer',
          })
        }
      >
        Become an Interviewer
      </Link>
    </div>
  </div>
);

export default function ForInterviewersSection() {
  return (
    <section
      className="relative text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background py-20 px-6 sm:px-12"
      id="for-interviewers"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <SectionHeader />
        <div className="lg:w-1/2 mt-12 lg:mt-0">
          <img
            src="https://img.freepik.com/free-vector/choice-worker-concept_23-2148627427.jpg"
            alt="Illustration of interviewers collaborating"
            className="rounded-xl shadow-lg w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
