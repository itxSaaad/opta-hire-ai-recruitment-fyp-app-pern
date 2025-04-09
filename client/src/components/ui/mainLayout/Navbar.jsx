import { useCallback, useEffect, useState } from 'react';
import {
  FaAngleDown,
  FaFileAlt,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { logoutUser } from '../../../features/auth/authSlice';

import { getExpectedRoute } from '../../../utils/helpers';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const getUserInitials = useCallback(() => {
    if (!user) return 'U';

    let initials = '';

    if (user.firstName) {
      initials += user.firstName[0].toUpperCase();
    }

    if (user.lastName) {
      initials += user.lastName[0].toUpperCase();
    }

    return initials || 'U';
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.avatar-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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
            className={`w-10 h-10 transition-transform duration-500 ease-in-out ${
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
            className="hidden md:flex text-lg bg-light-secondary dark:bg-dark-secondary text-dark-text px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out animate-fadeIn"
          >
            Login / Register
          </Link>
        ) : (
          <div
            className="relative avatar-dropdown hidden md:flex items-center cursor-pointer p-2"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <div className="flex items-center space-x-2">
              <p className="text-sm text-light-text dark:text-dark-text font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center space-x-1 p-1 rounded-full border border-light-border dark:border-dark-border hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200">
                <span className="w-6 h-6 rounded-full bg-light-secondary dark:bg-dark-secondary flex items-center justify-center text-xs text-dark-text font-semibold">
                  {getUserInitials()}
                </span>
                <FaAngleDown
                  className={`text-light-text dark:text-dark-text transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-6 w-60 z-50 rounded-lg bg-light-background dark:bg-dark-background shadow-xl ring-1 ring-light-border dark:ring-dark-border animate-slideUp">
                <div className="p-4 border-b border-light-border dark:border-dark-border">
                  <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-1">
                    Signed in as
                  </p>
                  <p className="text-sm font-medium truncate text-light-primary dark:text-dark-primary">
                    {user?.email || 'User'}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    to={getExpectedRoute(user)}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaHome className="mr-3 text-light-text/70 dark:text-dark-text/70 group-hover:text-light-primary dark:group-hover:text-dark-primary transform group-hover:scale-110 transition-all duration-200" />{' '}
                    Dashboard
                  </Link>

                  <Link
                    to="/user/profile"
                    className="flex items-center w-full px-4 py-2.5 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="mr-3 text-light-text/70 dark:text-dark-text/70 group-hover:text-light-primary dark:group-hover:text-dark-primary transform group-hover:scale-110 transition-all duration-200" />{' '}
                    Profile
                  </Link>

                  <Link
                    to="/user/resume"
                    className="flex items-center w-full px-4 py-2.5 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaFileAlt className="mr-3 text-light-text/70 dark:text-dark-text/70 group-hover:text-light-primary dark:group-hover:text-dark-primary transform group-hover:scale-110 transition-all duration-200" />{' '}
                    Resume
                  </Link>

                  <div className="border-t border-light-border dark:border-dark-border my-1.5"></div>

                  <button
                    onClick={() => {
                      dispatch(logoutUser());
                      navigate('/auth/login');
                    }}
                    className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group"
                  >
                    <FaSignOutAlt className="mr-3 group-hover:scale-110 transition-transform duration-200" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary z-20 transition duration-500 ease-in-out focus:outline-none"
            aria-label="Menu"
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
            <div className="pt-4">
              {NavLinks.map((link, index) => renderNavLink(link, index, true))}
              {!user ? (
                <Link
                  to="/auth/login"
                  className="block text-lg bg-light-secondary dark:bg-dark-secondary text-dark-text px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out mt-4"
                  onClick={toggleMenu}
                >
                  <FaSignInAlt className="inline-block mr-2" />
                  Login / Register
                </Link>
              ) : (
                <>
                  <div className="p-3 border-y border-light-border dark:border-dark-border">
                    <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium truncate text-light-primary dark:text-dark-primary">
                      {user?.email || 'User'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getExpectedRoute(user)}
                      className="flex items-center w-full px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaHome className="mr-2" /> Dashboard
                    </Link>
                    <Link
                      to="/user/profile"
                      className="flex items-center w-full px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUser className="mr-2" /> Profile
                    </Link>

                    <Link
                      to="/user/resume"
                      className="flex items-center w-full px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaFileAlt className="mr-2" /> Resume
                    </Link>

                    <div className="border-t border-light-border dark:border-dark-border my-1"></div>

                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        navigate('/auth/login');
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
