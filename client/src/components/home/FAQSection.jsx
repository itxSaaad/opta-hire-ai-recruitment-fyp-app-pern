import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import {
  FaBuilding,
  FaChevronDown,
  FaQuestionCircle,
  FaSearch,
  FaStar,
  FaUsers,
  FaUserTie,
} from 'react-icons/fa';

import { trackEvent } from '../../utils/analytics';

const FAQItem = ({
  question,
  answer,
  id,
  isOpen,
  onClick,
  category,
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

  const categoryColors = {
    general: 'from-light-primary to-light-secondary',
    recruiter: 'from-blue-500 to-indigo-500',
    interviewer: 'from-green-500 to-emerald-500',
    candidate: 'from-purple-500 to-pink-500',
  };

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } mb-4 rounded-xl border border-light-border/20 bg-light-surface/30 backdrop-blur-sm hover:bg-light-surface/50 hover:shadow-lg dark:border-dark-border/20 dark:bg-dark-surface/30 dark:hover:bg-dark-surface/50`}
    >
      <button
        onClick={() => onClick(id)}
        className="group flex w-full items-center justify-between p-6 text-left focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${id}`}
      >
        <div className="flex-1">
          <div className="mb-2 flex items-center space-x-3">
            {/* Category Badge */}
            <div
              className={`rounded-full bg-gradient-to-r px-2 py-1 ${categoryColors[category]} text-xs font-semibold text-white`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          </div>
          <span className="text-lg font-semibold text-light-text transition-colors duration-300 group-hover:text-light-primary dark:text-dark-text dark:group-hover:text-dark-primary">
            {question}
          </span>
        </div>

        <div className="ml-4 flex-shrink-0">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              isOpen
                ? 'rotate-180 bg-light-primary text-white dark:bg-dark-primary'
                : 'bg-light-primary/10 text-light-primary group-hover:bg-light-primary/20 dark:bg-dark-primary/10 dark:text-dark-primary dark:group-hover:bg-dark-primary/20'
            }`}
          >
            <FaChevronDown className="text-sm" />
          </div>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6">
          <div className="mb-4 h-px bg-light-border/20 dark:bg-dark-border/20"></div>
          <p
            id={`faq-answer-${id}`}
            className="leading-relaxed text-light-text/80 dark:text-dark-text/80"
            aria-live="polite"
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

FAQItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  const categoryIcons = {
    all: FaQuestionCircle,
    general: FaStar,
    recruiter: FaBuilding,
    interviewer: FaUserTie,
    candidate: FaUsers,
  };

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-3">
      {categories.map((category) => {
        const Icon = categoryIcons[category];
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex items-center space-x-2 rounded-full px-4 py-2 transition-all duration-300 ${
              isActive
                ? 'scale-105 bg-light-primary text-white shadow-lg'
                : 'bg-light-surface/50 text-light-text hover:bg-light-surface dark:bg-dark-surface/50 dark:text-dark-text dark:hover:bg-dark-surface'
            }`}
          >
            <Icon className="text-sm" />
            <span className="text-sm font-medium capitalize">
              {category === 'all' ? 'All Questions' : category}
            </span>
          </button>
        );
      })}
    </div>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
};

const SearchBar = ({
  searchTerm,
  onSearchChange,
  filteredCount,
  totalCount,
}) => (
  <div className="relative mx-auto mb-8 max-w-md">
    <div className="relative">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 transform text-light-text/40 dark:text-dark-text/40" />
      <input
        type="text"
        placeholder="Search FAQ..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-xl border border-light-border/20 bg-light-surface/50 py-3 pl-12 pr-4 text-light-text placeholder-light-text/40 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-light-primary dark:border-dark-border/20 dark:bg-dark-surface/50 dark:text-dark-text dark:placeholder-dark-text/40 dark:focus:ring-dark-primary"
      />
    </div>
    {searchTerm && (
      <div className="mt-2 text-center text-sm text-light-text/60 dark:text-dark-text/60">
        Showing {filteredCount} of {totalCount} questions
      </div>
    )}
  </div>
);

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
};

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Focused FAQ list - most essential questions only
  const faqs = [
    {
      id: 1,
      question: 'What is OptaHire?',
      answer:
        'OptaHire is an AI-powered recruitment platform that connects recruiters with expert interviewers and candidates. We use machine learning to shortlist top candidates and facilitate professional interviews.',
      category: 'general',
    },
    {
      id: 2,
      question: 'How much does OptaHire cost?',
      answer:
        'OptaHire charges a 2.5% platform fee on successful contracts between recruiters and interviewers. Registration is free for all users with no hidden costs or subscription fees.',
      category: 'general',
    },
    {
      id: 3,
      question: 'How does the AI shortlisting work?',
      answer:
        'When recruiters close a job, our AI analyzes all applications and automatically selects the top 5 most suitable candidates based on skills, experience, and job requirements.',
      category: 'recruiter',
    },
    {
      id: 4,
      question: 'How much can I earn as an interviewer?',
      answer:
        'Interviewers typically earn $25-200+ per hour depending on expertise. You keep 97.5% of earnings, with payments processed weekly via Stripe Connect.',
      category: 'interviewer',
    },
    {
      id: 5,
      question: 'Do I need a Stripe account?',
      answer:
        'Yes, interviewers must have a verified Stripe Connect account to accept contracts and receive payments. This ensures secure and reliable transactions.',
      category: 'interviewer',
    },
    {
      id: 6,
      question: 'How do I apply for jobs as a candidate?',
      answer:
        "Create your profile, upload your resume, and apply to positions. Our AI will match you with suitable roles and notify you if you're shortlisted for interviews.",
      category: 'candidate',
    },
    {
      id: 7,
      question: 'Is my payment secure?',
      answer:
        'Yes, all payments are processed through Stripe with enterprise-grade security. We use an escrow system to protect all parties until contract completion.',
      category: 'general',
    },
    {
      id: 8,
      question: 'What happens during the interview process?',
      answer:
        'Interviewers schedule interviews with shortlisted candidates using our built-in video platform. Candidates can join 5 minutes early, and comprehensive feedback is provided.',
      category: 'candidate',
    },
  ];

  const categories = [
    'all',
    'general',
    'recruiter',
    'interviewer',
    'candidate',
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
    trackEvent('FAQSection', 'FAQ Item Clicked', {
      question: faqs.find((faq) => faq.id === id).question,
    });
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setOpenId(null);
    trackEvent('FAQSection', 'Category Filter Changed', { category });
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setOpenId(null);
  };

  return (
    <section
      className="relative bg-light-background px-4 py-16 dark:bg-dark-background sm:px-6 lg:px-8"
      id="faq"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M15 0C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15 8.284 0 15-6.716 15-15C30 6.716 23.284 0 15 0zm0 2c7.18 0 13 5.82 13 13s-5.82 13-13 13S2 22.18 2 15 7.82 2 15 2z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="mb-12 text-center lg:mb-16">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-light-primary/10 px-6 py-3 dark:bg-dark-primary/10">
            <FaQuestionCircle className="text-light-primary dark:text-dark-primary" />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Got questions? We have answers
            </span>
          </div>

          <h2 className="mb-6 text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl lg:text-5xl">
            Frequently Asked{' '}
            <span className="text-light-primary dark:text-dark-primary">
              Questions
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-light-text/80 dark:text-dark-text/80 sm:text-xl">
            Find answers to the most common questions about OptaHire. Can&apos;t
            find what you&apos;re looking for? Contact our support team.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filteredCount={filteredFaqs.length}
          totalCount={faqs.length}
        />

        {/* Category Filters */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* FAQ Items */}
        <div className="mb-12 space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <FAQItem
                key={faq.id}
                {...faq}
                isOpen={openId === faq.id}
                onClick={handleToggle}
                delay={index * 100}
              />
            ))
          ) : (
            <div className="rounded-xl border border-light-border/20 bg-light-surface/30 py-12 text-center dark:border-dark-border/20 dark:bg-dark-surface/30">
              <FaQuestionCircle className="mx-auto mb-4 text-4xl text-light-text/40 dark:text-dark-text/40" />
              <h3 className="mb-2 text-xl font-semibold text-light-text dark:text-dark-text">
                No questions found
              </h3>
              <p className="text-light-text/70 dark:text-dark-text/70">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="rounded-2xl border border-light-border/20 bg-gradient-to-r from-light-surface/30 to-light-surface/20 p-6 backdrop-blur-sm dark:border-dark-border/20 dark:from-dark-surface/30 dark:to-dark-surface/20 lg:p-8">
            <h3 className="mb-4 text-xl font-bold text-light-text dark:text-dark-text lg:text-2xl">
              Still have questions?
            </h3>
            <p className="mb-6 text-light-text/70 dark:text-dark-text/70">
              Our support team is here to help you get the most out of OptaHire
            </p>

            <a
              href="mailto:optahire@gmail.com"
              className="inline-flex transform items-center justify-center rounded-xl bg-light-primary px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
