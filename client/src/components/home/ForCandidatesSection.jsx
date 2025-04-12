import PropTypes from 'prop-types';
import { FaChartLine, FaHandshake, FaUserTie } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import useTheme from '../../hooks/useTheme';

import JobPortalDark from '../../assets/images/jobs_portal_dark.png';
import JobPortalLight from '../../assets/images/jobs_portal_light.png';

import { trackEvent } from '../../utils/analytics';

const features = [
  {
    icon: (
      <FaUserTie className="text-4xl text-light-primary dark:text-dark-primary" />
    ),
    title: 'Personalized Opportunities',
    description:
      'Get job opportunities tailored to your skills and preferences to help you land your dream role.',
  },
  {
    icon: (
      <FaChartLine className="text-4xl text-light-primary dark:text-dark-primary" />
    ),
    title: 'Grow Professionally',
    description:
      'Gain insights and feedback from professional interviewers to refine your skills and ace interviews.',
  },
  {
    icon: (
      <FaHandshake className="text-4xl text-light-primary dark:text-dark-primary" />
    ),
    title: 'Build Strong Connections',
    description:
      'Connect with top recruiters and industry experts to expand your professional network.',
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
      <p className="text-light-text dark:text-dark-text mt-2">{description}</p>
    </div>
  </article>
);

Feature.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const SectionHeader = () => (
  <div className="lg:w-1/2 lg:pl-10 mb-12 lg:mb-0">
    <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-light-text dark:text-dark-text">
      Unlock Your Potential with{' '}
      <span className="text-light-secondary dark:text-dark-secondary">
        OptaHire
      </span>
    </h2>
    <p className="text-lg sm:text-xl mb-8 text-light-text dark:text-dark-text">
      Whether you&apos;re starting your career or looking for your next big
      role, we connect you with personalized opportunities, expert guidance, and
      top recruiters.
    </p>
    <div className="space-y-6">
      {features.map((feature, index) => (
        <Feature key={index} {...feature} />
      ))}
    </div>
    <div className="mt-10">
      <Link
        to="/auth/register"
        className="inline-block text-lg bg-light-secondary dark:bg-dark-secondary text-white px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-secondary dark:focus:ring-dark-secondary"
        onClick={() =>
          trackEvent('ForCandidatesSection', 'Get Started Button Clicked', {
            button: 'Join as a Candidate',
          })
        }
      >
        Join as a Candidate
      </Link>
    </div>
  </div>
);

export default function ForCandidatesSection() {
  const { theme } = useTheme();

  return (
    <section
      className="relative bg-light-background dark:bg-dark-background py-20 px-6 sm:px-12"
      id="for-candidates"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <SectionHeader />
        <div className="lg:w-1/2 order-last lg:order-first">
          <img
            src={theme === 'dark' ? JobPortalDark : JobPortalLight}
            alt="For Candidates"
            className="rounded-xl shadow-lg w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
