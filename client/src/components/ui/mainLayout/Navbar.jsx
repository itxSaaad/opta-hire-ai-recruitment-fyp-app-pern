import { useCallback, useEffect, useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { logoutUser } from '../../../features/auth/authSlice';

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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo: user } = useSelector((state) => state.auth);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const isLinkActive = useCallback(
    (link) => {
      if (!link.sectionId && location.pathname === link.link) return true;
      if (location.pathname === '/' && link.sectionId === activeSection)
        return true;
      if (location.hash === `#${link.sectionId}`) return true;
      return false;
    },
    [location, activeSection]
  );

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          if (location.pathname === '/') {
            const sections = document.querySelectorAll('section[id]');
            let current = '';
            sections.forEach((section) => {
              const rect = section.getBoundingClientRect();
              if (
                rect.top <= window.innerHeight / 3 &&
                rect.bottom >= window.innerHeight / 3
              ) {
                current = section.id;
              }
            });
            setActiveSection(current);
          }
          ticking = false;
        });
        ticking = true;
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

        {!user ? (
          <Link
            to="/auth/login"
            className="hidden md:flex text-lg bg-light-secondary dark:bg-dark-secondary text-dark-text px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out"
          >
            Login / Register
          </Link>
        ) : (
          <button
            onClick={() => {
              dispatch(logoutUser());
              navigate('/auth/login');
            }}
            className="text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-all"
          >
            <FaSignOutAlt className="inline-block -mt-1 mr-2" />
            Logout
          </button>
        )}

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary z-20 transition duration-500 ease-in-out focus:outline-none"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6 transform transition-transform duration-500 ease-in-out hover:rotate-180" />
            ) : (
              <FiMenu className="w-6 h-6 transform transition-transform duration-500 ease-in-out" />
            )}
          </button>

          <div
            className={`fixed top-16 right-0 w-2/3 h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-md px-4 transform transition-transform duration-500 ease-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
