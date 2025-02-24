import PropTypes from 'prop-types';
import { FaClipboardList, FaHandshake, FaRegSmileBeam } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Features = [
  {
    icon: <FaHandshake className="text-3xl animate-slideUp" />,
    title: 'Seamless Collaboration',
    description:
      'Connect with industry-expert interviewers who match your job requirements and work collaboratively.',
  },
  {
    icon: <FaClipboardList className="text-3xl animate-slideUp" />,
    title: 'Streamlined Screening',
    description:
      'Easily schedule interviews and receive comprehensive feedback for candidate evaluation.',
  },
  {
    icon: <FaRegSmileBeam className="text-3xl animate-slideUp" />,
    title: 'Optimized Hiring',
    description:
      'Shortlist top candidates based on interview feedback and ensure the perfect fit for your team.',
  },
];

const Feature = ({ icon, title, description }) => (
  <div className="p-6 bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg text-left transform transition-transform hover:scale-105 hover:shadow-xl duration-300">
    <div className="w-16 h-16 rounded-full bg-light-secondary dark:bg-dark-secondary text-white flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">
      {title}
    </h3>
    <p className="text-lg text-light-text dark:text-dark-text">{description}</p>
  </div>
);

export default function ForRecruitersSection() {
  return (
    <section
      className="relative bg-light-background dark:bg-dark-background py-20 px-6 sm:px-12"
      id="for-recruiters"
    >
      <header className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-slideUp text-light-text dark:text-dark-text">
          For Recruiters
        </h2>
        <p className="text-lg sm:text-xl mb-6 max-w-3xl mx-auto animate-slideUp text-light-text dark:text-dark-text">
          <span className="underline">OptaHire</span> empowers recruiters to
          hire faster and smarter by connecting them with professional
          interviewers who screen candidates effectively.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
        {Features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
      </div>

      <div className="text-center mt-10 animate-slideUp">
        <Link
          to="/auth/register"
          className="inline-block text-lg bg-light-secondary dark:bg-dark-secondary text-white px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-secondary dark:focus:ring-dark-secondary"
        >
          Get Started Now
        </Link>
      </div>
    </section>
  );
}

Feature.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
