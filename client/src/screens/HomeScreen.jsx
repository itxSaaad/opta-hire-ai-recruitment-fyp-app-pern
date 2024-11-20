import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowUp } from 'react-icons/fa';

import Navbar from '../components/layout/Navbar';
import AboutSection from '../components/ui/home/AboutSection';
import FAQSection from '../components/ui/home/FAQSection';
import ForCandidatesSection from '../components/ui/home/ForCandidatesSection';
import ForInterviewersSection from '../components/ui/home/ForInterviewersSection';
import ForRecruitersSection from '../components/ui/home/ForRecruitersSection';
import HeroSection from '../components/ui/home/HeroSection';
import PricingSection from '../components/ui/home/PricingSection';

export default function HomeScreen() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 500) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>OptaHire - Optimizing your Recruitment Journey</title>
        <meta
          name="description"
          content="OptaHire is an innovative recruitment platform that connects job seekers with employers. Find your next job today!"
        />
      </Helmet>
      <Navbar />
      <HeroSection />
      <ForRecruitersSection />
      <ForInterviewersSection />
      <ForCandidatesSection />
      <PricingSection />
      <FAQSection />
      <AboutSection />
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-fadeIn"
        >
          <FaArrowUp size={24} />
        </button>
      )}
    </>
  );
}
