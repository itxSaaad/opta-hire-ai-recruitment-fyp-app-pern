import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../../assets/images/logo.png';

const NavLinks = [
  { title: 'Jobs', link: '/jobs', sectionId: null },
  {
    title: 'For Recruiters',
    link: '/#for-recruiters',
    sectionId: 'for-recruiters',
  },
  {
    title: 'For Interviewers',
    link: '/#for-interviewers',
    sectionId: 'for-interviewers',
  },
  { title: 'Pricing', link: '/#pricing', sectionId: 'pricing' },
  { title: 'About', link: '/#about', sectionId: 'about' },
];

export default function Navbar() {
  const [isHover, setIsHover] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isLinkActive = (link) => {
    if (!link.sectionId && location.pathname === link.link) {
      return true;
    }

    if (location.pathname === '/' && link.sectionId === activeSection) {
      return true;
    }

    if (location.hash === `#${link.sectionId}`) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);

      if (location.pathname === '/') {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (
            rect.top <= window.innerHeight / 3 &&
            rect.bottom >= window.innerHeight / 3
          ) {
            currentSection = section.id;
          }
        });

        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setActiveSection('');
  }, [location.pathname]);

  const renderNavLink = (link, index, isMobile = false) => (
    <Link
      key={index}
      to={link.link}
      className={`
        ${isMobile ? 'block px-4 py-2' : ''} 
        text-md transition duration-500 ease-in-out
        ${
          isLinkActive(link)
            ? 'text-light-primary dark:text-dark-primary'
            : 'text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary'
        }
      `}
      onClick={() => isMobile && toggleMenu()}
    >
      {link.title}
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all p-4 ${
        isScrolled
          ? 'bg-light-background dark:bg-dark-background shadow-md'
          : 'bg-transparent md:bg-transparent shadow-none'
      }`}
    >
      <nav className="flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center space-x-1"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <img
            src={Logo}
            alt="OptaHire Logo"
            className={`w-10 h-10 transform transition-transform duration-500 ease-in-out ${
              isHover ? 'rotate-180 scale-110' : ''
            }`}
          />
          <span className="text-2xl font-semibold text-light-text dark:text-dark-text">
            OptaHire
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          {NavLinks.map((link, index) => renderNavLink(link, index))}
        </div>

        <Link
          to="/auth/login"
          className="hidden md:flex text-lg bg-light-secondary dark:bg-dark-secondary text-dark-text px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
        >
          Login / Register
        </Link>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition duration-500 ease-in-out focus:outline-none"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6 transform transition-transform duration-500 ease-in-out hover:rotate-180" />
            ) : (
              <FiMenu className="w-6 h-6 transform transition-transform duration-500 ease-in-out" />
            )}
          </button>

          <div
            className={`absolute top-16 left-0 w-full bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text z-10 shadow-md px-4 pb-4 transform transition-transform duration-500 ease-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {NavLinks.map((link, index) => renderNavLink(link, index, true))}
            <Link
              to="/auth/login"
              className="block text-lg bg-light-secondary dark:bg-dark-secondary text-dark-text px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out mt-4"
              onClick={toggleMenu}
            >
              Login / Register
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
