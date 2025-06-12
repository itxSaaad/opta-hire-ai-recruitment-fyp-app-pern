import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  FaDollarSign,
  FaHandshake,
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaCalculator,
  FaArrowRight,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { trackEvent } from '../../utils/analytics';

const PricingCard = ({
  icon: Icon,
  title,
  description,
  features,
  highlight = false,
}) => (
  <div
    className={`relative rounded-2xl border-2 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
      highlight
        ? 'border-light-primary bg-gradient-to-br from-light-primary/10 to-light-secondary/10 shadow-lg dark:border-dark-primary dark:from-dark-primary/10 dark:to-dark-secondary/10'
        : 'border-light-border/20 bg-light-surface/30 hover:border-light-primary/50 dark:border-dark-border/20 dark:bg-dark-surface/30 dark:hover:border-dark-primary/50'
    }`}
  >
    {highlight && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
        <div className="rounded-full bg-gradient-to-r from-light-primary to-light-secondary px-6 py-2 text-sm font-semibold text-white">
          Most Popular
        </div>
      </div>
    )}

    {/* Icon */}
    <div
      className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
        highlight
          ? 'bg-gradient-to-br from-light-primary to-light-secondary'
          : 'bg-light-primary/10 dark:bg-dark-primary/10'
      }`}
    >
      <Icon
        className={`text-2xl ${highlight ? 'text-white' : 'text-light-primary dark:text-dark-primary'}`}
      />
    </div>

    {/* Content */}
    <h3 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text">
      {title}
    </h3>
    <p className="mb-6 leading-relaxed text-light-text/70 dark:text-dark-text/70">
      {description}
    </p>

    {/* Features */}
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start space-x-3">
          <FaCheckCircle className="mt-1 flex-shrink-0 text-light-primary dark:text-dark-primary" />
          <span className="text-sm leading-relaxed text-light-text/80 dark:text-dark-text/80">
            {feature}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

PricingCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
  highlight: PropTypes.bool,
};

const PricingCalculator = () => {
  const [contractAmount, setContractAmount] = useState(1000);

  const platformFee = contractAmount * 0.025;
  const interviewerReceives = contractAmount - platformFee;

  return (
    <div className="rounded-2xl border border-light-border/20 bg-gradient-to-r from-light-surface/40 to-light-surface/20 p-8 backdrop-blur-sm dark:border-dark-border/20 dark:from-dark-surface/40 dark:to-dark-surface/20">
      <div className="mb-6 flex items-center space-x-3">
        <FaCalculator className="text-2xl text-light-primary dark:text-dark-primary" />
        <h4 className="text-xl font-bold text-light-text dark:text-dark-text">
          Pricing Calculator
        </h4>
      </div>

      <div className="space-y-6">
        {/* Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-light-text dark:text-dark-text">
            Contract Amount ($)
          </label>
          <input
            type="number"
            value={contractAmount}
            onChange={(e) => setContractAmount(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-light-border bg-light-background px-4 py-3 text-light-text outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-background dark:text-dark-text dark:focus:ring-dark-primary"
            placeholder="1000"
            min="0"
          />
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-light-border/20 py-2 dark:border-dark-border/20">
            <span className="text-light-text/70 dark:text-dark-text/70">
              Contract Amount
            </span>
            <span className="font-semibold text-light-text dark:text-dark-text">
              ${contractAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-light-border/20 py-2 dark:border-dark-border/20">
            <span className="text-light-text/70 dark:text-dark-text/70">
              Platform Fee (2.5%)
            </span>
            <span className="font-semibold text-red-500">
              -${platformFee.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-light-primary/10 px-3 py-2 dark:bg-dark-primary/10">
            <span className="font-semibold text-light-text dark:text-dark-text">
              Interviewer Receives
            </span>
            <span className="text-lg font-bold text-light-primary dark:text-dark-primary">
              ${interviewerReceives.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureComparison = () => {
  const features = [
    {
      name: 'AI-Powered Matching',
      description: 'Smart candidate-job matching using machine learning',
    },
    {
      name: 'Secure Payments',
      description: 'Escrow system with Stripe integration',
    },
    {
      name: 'Expert Network',
      description: 'Access to 500+ verified professional interviewers',
    },
    {
      name: 'Real-time Chat',
      description: 'Direct communication between all parties',
    },
    {
      name: 'Video Interviews',
      description: 'Built-in video calling with recording capabilities',
    },
    {
      name: 'Detailed Reports',
      description: 'Comprehensive interview feedback and analytics',
    },
    { name: '24/7 Support', description: 'Round-the-clock customer support' },
    { name: 'Global Reach', description: 'International interviewer network' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex items-start space-x-3 rounded-xl bg-light-background/50 p-4 dark:bg-dark-background/50"
        >
          <FaCheckCircle className="mt-1 flex-shrink-0 text-light-primary dark:text-dark-primary" />
          <div>
            <div className="font-semibold text-light-text dark:text-dark-text">
              {feature.name}
            </div>
            <div className="text-sm text-light-text/60 dark:text-dark-text/60">
              {feature.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function PricingSection() {
  const pricingCards = [
    {
      icon: FaDollarSign,
      title: 'Simple Fee Structure',
      description:
        'We only charge 2.5% of the contract amount between recruiters and interviewers. No hidden fees, no monthly subscriptions.',
      features: [
        'Only 2.5% platform fee on completed contracts',
        'No setup or monthly subscription fees',
        'Free registration for all user types',
        'Transparent pricing with no surprises',
      ],
    },
    {
      icon: FaHandshake,
      title: 'Fair for Everyone',
      description:
        'Our pricing ensures that both recruiters and interviewers are fairly compensated while maintaining platform sustainability.',
      features: [
        'Recruiters pay only for successful hires',
        'Interviewers keep 97.5% of contract value',
        'Escrow system protects all parties',
        'Dispute resolution included at no extra cost',
      ],
      highlight: true,
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Protected',
      description:
        'All transactions are secured through Stripe with full payment protection and instant transfers upon completion.',
      features: [
        'Stripe-powered secure payment processing',
        'Instant payouts upon contract completion',
        'Payment protection for all parties',
        'Multiple payment methods supported',
      ],
    },
  ];

  return (
    <section
      className="relative bg-light-background px-4 py-16 dark:bg-dark-background sm:px-6 lg:px-8"
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg, #0EB0E3 25%, transparent 25%), linear-gradient(-45deg, #0EB0E3 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3946AE 75%), linear-gradient(-45deg, transparent 75%, #3946AE 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-light-primary/10 px-6 py-3 dark:bg-dark-primary/10">
            <FaDollarSign className="text-light-primary dark:text-dark-primary" />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Transparent & fair pricing
            </span>
          </div>

          <h2
            id="pricing-heading"
            className="mb-6 text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl lg:text-5xl"
          >
            Simple, Transparent{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Pricing
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-light-text/80 dark:text-dark-text/80 sm:text-xl">
            At OptaHire, we believe in keeping things simple and transparent. We
            take just
            <span className="font-semibold text-light-primary dark:text-dark-primary">
              {' '}
              2.5%{' '}
            </span>
            to facilitate connections between recruiters and interviewers.
          </p>
        </div>

        {/* Pricing Cards - Equal Height */}
        <div className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-3">
          {pricingCards.map((card, index) => (
            <div key={index} className="h-full">
              <PricingCard {...card} />
            </div>
          ))}
        </div>

        {/* Pricing Calculator & Features */}
        <div className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-2 lg:gap-12">
          <PricingCalculator />

          <div>
            <h3 className="mb-6 text-2xl font-bold text-light-text dark:text-dark-text lg:text-3xl">
              Everything Included
            </h3>
            <p className="mb-8 text-light-text/70 dark:text-dark-text/70">
              No hidden costs or premium tiers. Every user gets access to our
              full platform with all features included.
            </p>
            <FeatureComparison />
          </div>
        </div>

        {/* Value Proposition */}
        <div className="rounded-3xl border border-light-border/20 bg-gradient-to-r from-light-surface/30 to-light-surface/20 p-6 text-center backdrop-blur-sm dark:border-dark-border/20 dark:from-dark-surface/30 dark:to-dark-surface/20 lg:p-8">
          <h3 className="mb-6 text-2xl font-bold text-light-text dark:text-dark-text lg:text-3xl">
            Why Choose Our Pricing Model?
          </h3>

          <div className="mb-8 grid gap-6 sm:grid-cols-3 lg:mb-10 lg:gap-8">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <FaClock className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <h4 className="mb-2 font-semibold text-light-text dark:text-dark-text">
                No Upfront Costs
              </h4>
              <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                Pay only when you successfully complete a contract
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="mb-2 font-semibold text-light-text dark:text-dark-text">
                Fair to All Parties
              </h4>
              <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                Balanced fee structure that benefits everyone
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FaShieldAlt className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="mb-2 font-semibold text-light-text dark:text-dark-text">
                Secure Transactions
              </h4>
              <p className="text-sm text-light-text/70 dark:text-dark-text/70">
                Enterprise-grade security for all payments
              </p>
            </div>
          </div>

          <p className="mb-8 text-lg text-light-text/80 dark:text-dark-text/80">
            No hidden costs. No surprises. Just a small, fair fee for connecting
            the right talent with the right opportunities.
          </p>

          <Link
            to="/auth/register"
            className="inline-flex transform items-center space-x-2 rounded-xl bg-light-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-light-secondary hover:shadow-xl dark:bg-dark-primary dark:hover:bg-dark-secondary"
            onClick={() =>
              trackEvent('PricingSection', 'Start Today Button Clicked', {
                button: 'Start Today',
              })
            }
          >
            <span>Start Today</span>
            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
