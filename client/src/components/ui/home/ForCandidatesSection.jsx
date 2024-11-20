import PropTypes from 'prop-types';
import { FaChartLine, FaHandshake, FaUserTie } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <FaUserTie className="text-4xl text-primary" />,
    title: 'Personalized Opportunities',
    description:
      'Get job opportunities tailored to your skills and preferences to help you land your dream role.',
  },
  {
    icon: <FaChartLine className="text-4xl text-primary" />,
    title: 'Grow Professionally',
    description:
      'Gain insights and feedback from professional interviewers to refine your skills and ace interviews.',
  },
  {
    icon: <FaHandshake className="text-4xl text-primary" />,
    title: 'Build Strong Connections',
    description:
      'Connect with top recruiters and industry experts to expand your professional network.',
  },
];

const Feature = ({ icon, title, description }) => (
  <article className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <div className="w-14 h-14 flex items-center justify-center bg-primary bg-opacity-10 rounded-full">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-darkText mt-2">{description}</p>
    </div>
  </article>
);

Feature.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const SectionHeader = () => (
  <div className="lg:w-1/2 lg:pl-10">
    <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
      Unlock Your Potential with{' '}
      <span className="text-secondary">OptaHire</span>
    </h2>
    <p className="text-lg sm:text-xl mb-8">
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
        to="/register"
        className="inline-block text-lg bg-secondary text-white px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
      >
        Join as a Candidate
      </Link>
    </div>
  </div>
);

export default function ForCandidatesSection() {
  return (
    <section
      className="relative text-white py-20 px-6 sm:px-12"
      id="for-candidates"
    >
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-12 lg:mb-0">
          <img
            src="https://img.freepik.com/premium-vector/online-job-search-concept-group-people-are-looking-job-selection-resumes-interviews-via-internet_688351-112.jpg"
            alt="For Candidates"
            className="rounded-xl shadow-lg w-full"
            loading="lazy"
          />
        </div>
        <SectionHeader />
      </div>
    </section>
  );
}
