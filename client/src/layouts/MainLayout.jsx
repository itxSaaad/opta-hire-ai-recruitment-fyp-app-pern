import { useCallback, useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '../components/ui/mainLayout/Footer';
import Navbar from '../components/ui/mainLayout/Navbar';

export default function MainLayout() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const scrollHandler = useCallback(() => {
    setShowScrollToTop(window.scrollY > 500);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          scrollHandler();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollHandler]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />
      <Outlet />
      <ScrollRestoration />
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-12 right-8 p-3 bg-light-primary dark:bg-dark-primary text-dark-text rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-110 hover:bg-light-secondary dark:hover:bg-dark-secondary focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:ring-offset-2 animate-fadeIn"
        >
          <FaArrowUp size={24} />
        </button>
      )}
      <Footer />
    </>
  );
}
