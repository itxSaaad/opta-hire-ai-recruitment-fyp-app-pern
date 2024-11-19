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
  <div className="p-6 bg-white bg-opacity-20 rounded-lg shadow-lg text-left transform transition-transform hover:scale-105 hover:shadow-xl duration-300">
    <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-lg text-gray-300">{description}</p>
  </div>
);

export default function ForRecruitersSection() {
  return (
    <section
      className="relative bg-gradient-to-tl from-secondary via-primary to-secondary text-white py-20 px-6 sm:px-12"
      id="for-recruiters"
    >
      <header className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-slideUp">
          For Recruiters
        </h2>
        <p className="text-lg sm:text-xl mb-6 max-w-3xl mx-auto animate-slideUp">
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
          to="/recruiter/register"
          className="inline-block text-lg bg-secondary text-white px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
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
