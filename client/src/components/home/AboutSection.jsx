import PropTypes from 'prop-types';
import { FaBullhorn, FaLightbulb, FaUsers } from 'react-icons/fa';

const InfoCard = ({ icon: Icon, title, children }) => (
  <article className="text-center lg:text-left lg:w-1/3">
    <Icon className="text-light-primary dark:text-dark-primary text-5xl mb-4" />
    <h3 className="text-2xl font-semibold text-light-text dark:text-dark-text">
      {title}
    </h3>
    <p className="text-light-text dark:text-dark-text mt-2">{children}</p>
  </article>
);

const AboutSection = () => (
  <section
    className="relative py-20 px-6 sm:px-12 bg-light-background dark:bg-dark-background"
    id="about"
    aria-labelledby="about-us-heading"
  >
    <h2
      id="about-us-heading"
      className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-light-text dark:text-dark-text"
    >
      About{' '}
      <span className="text-light-primary dark:text-dark-primary">
        OptaHire
      </span>
    </h2>
    <p className="text-lg sm:text-xl mb-8 text-light-text dark:text-dark-text">
      At{' '}
      <span className="text-light-primary dark:text-dark-primary">
        OptaHire
      </span>
      , we are transforming the hiring landscape. Our platform unites recruiters
      and industry experts to ensure efficient, fair, and transparent talent
      acquisition.
    </p>
    <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12 mb-16">
      <InfoCard icon={FaUsers} title="Our Mission">
        Our mission is to bridge the gap between top talent and companies by
        enabling professionals to contribute their expertise to the hiring
        process, enhancing efficiency, reliability, and inclusivity.
      </InfoCard>
      <InfoCard icon={FaBullhorn} title="Our Vision">
        We envision a global hiring ecosystem where recruiters and interviewers
        collaborate seamlessly to select outstanding candidates and elevate the
        recruitment process.
      </InfoCard>
      <InfoCard icon={FaLightbulb} title="Our Values">
        We uphold transparency, collaboration, and fairness. Our platform
        empowers recruiters, interviewers, and job seekers by ensuring fair
        compensation and trust throughout the hiring journey.
      </InfoCard>
    </div>
    <div className="text-center">
      <p className="text-lg sm:text-xl mb-8 text-light-text dark:text-dark-text">
        Whether you&apos;re a recruiter seeking expert evaluators or an
        interviewer eager to share your industry knowledge,{' '}
        <span className="text-light-secondary dark:text-dark-secondary">
          OptaHire
        </span>{' '}
        connects you with the right people, facilitates informed hiring
        decisions, and ensures optimal outcomes for all parties involved.
      </p>
      <a
        href="/auth/login"
        className="inline-block bg-light-primary dark:bg-dark-primary text-light-background dark:text-dark-background px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-secondary dark:focus:ring-dark-secondary"
      >
        Get Started
      </a>
    </div>
  </section>
);

export default AboutSection;

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
