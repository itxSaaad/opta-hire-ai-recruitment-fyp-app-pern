import PropTypes from 'prop-types';
import { FaDollarSign, FaHandshake } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PricingCard = ({ icon: Icon, title, description }) => (
  <div className="bg-light-primary dark:bg-dark-primary bg-opacity-10 dark:bg-opacity-10 text-light-text dark:text-dark-text rounded-xl p-8 shadow-lg flex flex-col items-center transition-all duration-300 hover:bg-opacity-20 dark:hover:bg-opacity-20 hover:shadow-xl focus-within:ring-2 focus-within:ring-light-secondary dark:focus-within:ring-dark-secondary">
    <Icon className="text-5xl mb-4 transition-transform duration-300 hover:scale-110" />
    <h3
      className="text-2xl font-semibold hover:text-light-secondary dark:hover:text-dark-secondary 
      transition-colors duration-300"
    >
      {title}
    </h3>
    <p className="text-light-text dark:text-dark-text mt-2 text-center">
      {description}
    </p>
  </div>
);

PricingCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const PricingSection = () => (
  <section
    className="relative text-light-text dark:text-dark-text text-center py-20 px-6 sm:px-12"
    id="pricing"
    aria-labelledby="pricing-heading"
  >
    <h2
      id="pricing-heading"
      className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
    >
      Simple, Transparent Pricing
    </h2>
    <p className="text-lg sm:text-xl mb-8">
      At{' '}
      <span className="text-light-primary dark:text-dark-primary">
        OptaHire
      </span>
      , we believe in keeping things simple and transparent. We take just a
      minor fee to help facilitate connections between recruiters and
      interviewers.
    </p>
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-8 mb-8">
      <PricingCard
        icon={FaDollarSign}
        title="Affordable Fees"
        description="We only take 0.5% of the final offer amount between the recruiter and interviewer."
      />
      <PricingCard
        icon={FaHandshake}
        title="Fair Collaboration"
        description="This ensures that both parties—recruiters and interviewers—are fairly compensated for their time and expertise."
      />
    </div>
    <p className="text-lg sm:text-xl mb-8">
      No hidden costs. No surprises. Just a small, fair fee for connecting the
      right talent with the right opportunities.
    </p>
    <Link
      to="/auth/register"
      className="inline-block text-lg bg-light-secondary dark:bg-dark-secondary text-light-background dark:text-dark-text px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-secondary dark:focus:ring-dark-secondary"
    >
      Start Today
    </Link>
  </section>
);

export default PricingSection;
