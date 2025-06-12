import { useCallback, useEffect, useState } from 'react';
import {
  FaAngleDown,
  FaCheck,
  FaCrown,
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

import { getExpectedRoute, getUserRole } from '../../../utils/helpers';

import Logo from '../../../assets/images/logo.png';

const NavLinks = [
  { title: 'Jobs', link: '/jobs', sectionId: null },
  { title: 'How It Works', link: '/#how-it-works', sectionId: 'how-it-works' },
  { title: 'Benefits', link: '/#benefits', sectionId: 'benefits' },
  { title: 'Stats', link: '/#stats', sectionId: 'stats' },
  { title: 'Pricing', link: '/#pricing', sectionId: 'pricing' },
  { title: 'FAQ', link: '/#faq', sectionId: 'faq' },
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

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    setIsDropdownOpen(false);
  }, []);

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
      className={` ${isMobile ? 'block px-4 py-2' : ''} text-md transition duration-500 ease-in-out ${
        isLinkActive(link)
          ? 'text-light-primary dark:text-dark-primary'
          : 'text-light-text hover:text-light-primary dark:text-dark-text dark:hover:text-dark-primary'
      } `}
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
        setIsDropdownOpen((prev) => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full p-4 transition-all ${
        isScrolled
          ? 'bg-light-background shadow-md dark:bg-dark-background'
          : 'bg-transparent shadow-none md:bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-1"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <img
            src={Logo}
            alt="OptaHire Logo"
            className={`h-10 w-10 transition-transform duration-500 ease-in-out ${
              isHover ? 'rotate-180 scale-110' : ''
            }`}
          />
          <span className="text-2xl font-semibold text-light-text dark:text-dark-text">
            OptaHire
          </span>
        </Link>

        <div className="hidden items-center space-x-4 md:flex">
          {NavLinks.map((link, index) => renderNavLink(link, index))}
        </div>

        {!user ? (
          <Link
            to="/auth/login"
            className="hidden transform animate-fadeIn rounded-lg bg-light-secondary px-4 py-2 text-lg text-dark-text transition-transform duration-300 ease-in-out hover:scale-105 dark:bg-dark-secondary md:flex"
          >
            Login / Register
          </Link>
        ) : (
          <div
            className="avatar-dropdown relative cursor-pointer"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <div className="flex items-center justify-between space-x-4 rounded-lg border border-light-border/20 bg-light-surface/30 p-2 px-4 py-2 backdrop-blur-sm transition-all duration-200 hover:bg-light-surface/50 dark:border-dark-border/20 dark:bg-dark-surface/30 dark:hover:bg-dark-surface/50">
              <div className="hidden text-right md:block">
                <div className="flex items-center space-x-1">
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {user.firstName} {user.lastName}
                  </p>
                  {user.isTopRated && (
                    <FaCrown className="text-xs text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                  {getUserRole(user).charAt(0).toUpperCase() +
                    getUserRole(user).slice(1)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-light-secondary text-xs font-semibold text-dark-text dark:bg-dark-secondary">
                    {getUserInitials()}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                      <span className="text-xs text-white">
                        <FaCheck />
                      </span>
                    </div>
                  )}
                </div>

                <FaAngleDown
                  className={`text-light-text/70 transition-transform duration-300 dark:text-dark-text/70 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  size={12}
                />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-6 w-60 animate-slideUp rounded-lg bg-light-background shadow-xl ring-1 ring-light-border dark:bg-dark-background dark:ring-dark-border">
                <div className="border-b border-light-border p-4 dark:border-dark-border">
                  <p className="mb-1 text-xs text-light-text/70 dark:text-dark-text/70">
                    Signed in as
                  </p>
                  <p className="truncate text-sm font-medium text-light-primary dark:text-dark-primary">
                    {user?.email || 'User'}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    to={getExpectedRoute(user)}
                    className="group flex w-full items-center px-4 py-2.5 text-sm text-light-text transition-colors duration-200 hover:bg-light-surface dark:text-dark-text dark:hover:bg-dark-surface"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    <FaHome className="mr-3 transform text-light-text/70 transition-all duration-200 group-hover:scale-110 group-hover:text-light-primary dark:text-dark-text/70 dark:group-hover:text-dark-primary" />{' '}
                    Dashboard
                  </Link>

                  <Link
                    to="/user/profile"
                    className="group flex w-full items-center px-4 py-2.5 text-sm text-light-text transition-colors duration-200 hover:bg-light-surface dark:text-dark-text dark:hover:bg-dark-surface"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    <FaUser className="mr-3 transform text-light-text/70 transition-all duration-200 group-hover:scale-110 group-hover:text-light-primary dark:text-dark-text/70 dark:group-hover:text-dark-primary" />{' '}
                    Profile
                  </Link>

                  {!user.isAdmin && !user.isRecruiter && (
                    <Link
                      to="/user/resume"
                      className="group flex w-full items-center px-4 py-2.5 text-sm text-light-text transition-colors duration-200 hover:bg-light-surface dark:text-dark-text dark:hover:bg-dark-surface"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                      <FaFileAlt className="mr-3 transform text-light-text/70 transition-all duration-200 group-hover:scale-110 group-hover:text-light-primary dark:text-dark-text/70 dark:group-hover:text-dark-primary" />{' '}
                      Resume
                    </Link>
                  )}

                  <div className="my-1.5 border-t border-light-border dark:border-dark-border"></div>

                  <button
                    onClick={() => {
                      dispatch(logoutUser());
                      setIsDropdownOpen((prev) => !prev);
                      navigate('/auth/login');
                    }}
                    className="group flex w-full items-center px-4 py-2.5 text-left text-sm text-red-600 transition-colors duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <FaSignOutAlt className="mr-3 transition-transform duration-200 group-hover:scale-110" />
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
            className="z-20 text-light-text transition duration-500 ease-in-out hover:text-light-primary focus:outline-none dark:text-dark-text dark:hover:text-dark-primary"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6 transform transition-transform duration-500 ease-in-out hover:rotate-180" />
            ) : (
              <FiMenu className="h-6 w-6 transform transition-transform duration-500 ease-in-out" />
            )}
          </button>

          <div
            className={`fixed right-0 top-16 h-screen w-2/3 transform bg-light-background px-4 text-light-text shadow-md transition-transform duration-500 ease-out dark:bg-dark-background dark:text-dark-text ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="pt-4">
              {NavLinks.map((link, index) => renderNavLink(link, index, true))}
              {!user ? (
                <Link
                  to="/auth/login"
                  className="mt-4 block transform rounded-lg bg-light-secondary px-4 py-2 text-lg text-dark-text transition-transform duration-300 ease-in-out hover:scale-105 dark:bg-dark-secondary"
                  onClick={toggleMenu}
                >
                  <FaSignInAlt className="mr-2 inline-block" />
                  Login / Register
                </Link>
              ) : (
                <>
                  <div className="border-y border-light-border p-3 dark:border-dark-border">
                    <p className="text-xs text-light-text/70 dark:text-dark-text/70">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-medium text-light-primary dark:text-dark-primary">
                      {user?.email || 'User'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to={getExpectedRoute(user)}
                      className="flex w-full items-center px-4 py-2 text-sm text-light-text transition-colors duration-150 hover:bg-light-surface dark:text-dark-text dark:hover:bg-dark-surface"
                      onClick={toggleMenu}
                    >
                      <FaHome className="mr-2" /> Dashboard
                    </Link>
                    <Link
                      to="/user/profile"
                      className="flex w-full items-center px-4 py-2 text-sm text-light-text transition-colors duration-150 hover:bg-light-surface dark:text-dark-text dark:hover:bg-dark-surface"
                      onClick={toggleMenu}
                    >
                      <FaUser className="mr-2" /> Profile
                    </Link>
                    {!user.isAdmin && !user.isRecruiter && (
                      <Link
                        to="/user/resume"
                        className="flex w-full items-center px-4 py-2 text-sm text-light-text transition-colors duration-150 hover:bg-light-surface dark:text-dark-text dark:hover:bg-dark-surface"
                        onClick={toggleMenu}
                      >
                        <FaFileAlt className="mr-2" /> Resume
                      </Link>
                    )}

                    <div className="my-1 border-t border-light-border dark:border-dark-border"></div>

                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        toggleMenu();
                        navigate('/auth/login');
                      }}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
