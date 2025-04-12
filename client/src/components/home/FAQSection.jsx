import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { trackEvent } from '../../utils/analytics';

const faqs = [
  {
    id: 1,
    question: 'What is OptaHire?',
    answer:
      'OptaHire is a platform that connects job seekers with personalized opportunities, expert guidance, and top recruiters to help them achieve their career goals.',
  },
  {
    id: 2,
    question: 'How can I register as a candidate?',
    answer:
      'You can register as a candidate by clicking the "Join as a Candidate" button, creating an account, and filling in your profile details.',
  },
  {
    id: 3,
    question: 'Is OptaHire free to use?',
    answer:
      'Yes, OptaHire offers free registration and access to basic features. Premium plans are also available for advanced insights and services.',
  },
  {
    id: 4,
    question: 'Can I connect with recruiters directly?',
    answer:
      'Yes, OptaHire provides features that allow candidates to connect with top recruiters and industry experts.',
  },
];

const FAQItem = ({ question, answer, id, isOpen, onClick }) => {
  return (
    <div className="border-b dark:border-dark-border border-light-border py-4">
      <button
        onClick={() => onClick(id)}
        className="flex items-center justify-between w-full text-left text-lg sm:text-xl font-semibold 
        text-light-text dark:text-dark-text focus:outline-none hover:text-light-secondary 
        dark:hover:text-dark-secondary transition-all"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
      >
        <span>{question}</span>
        {isOpen ? (
          <FaChevronUp className="text-light-secondary dark:text-dark-secondary transition-transform transform rotate-180" />
        ) : (
          <FaChevronDown className="text-light-secondary dark:text-dark-secondary transition-transform" />
        )}
      </button>
      {isOpen && (
        <p
          id={`faq-answer-${id}`}
          className="mt-3 text-light-text dark:text-dark-text text-base sm:text-lg 
          opacity-100 translate-y-0 transition-all duration-300 ease-in-out"
          aria-live="polite"
        >
          {answer}
        </p>
      )}
    </div>
  );
};

FAQItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
    trackEvent('FAQSection', 'FAQ Item Clicked', {
      question: faqs.find((faq) => faq.id === id).question,
    });
  };

  return (
    <section
      className="relative bg-light-background dark:bg-dark-background text-light-text 
    dark:text-dark-text py-20 px-6 sm:px-12"
      id="faq"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-light-text dark:text-dark-text">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-light-text dark:text-dark-text opacity-90">
            Find answers to some of the most common questions about OptaHire.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              {...faq}
              isOpen={openId === faq.id}
              onClick={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
