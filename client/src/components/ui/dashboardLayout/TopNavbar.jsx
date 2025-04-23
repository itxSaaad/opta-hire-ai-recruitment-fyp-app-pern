import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import {
  FaAngleDown,
  FaFileAlt,
  FaHome,
  FaMoon,
  FaSignOutAlt,
  FaSun,
  FaUser,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Logo from '../../../assets/images/logo.png';

import { logoutUser } from '../../../features/auth/authSlice';

import { getExpectedRoute } from '../../../utils/helpers';

import useTheme from '../../../hooks/useTheme';

const TopNavbar = ({ navItems = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const { userInfo: user } = useSelector((state) => state.auth);

  const getUserInitials = useCallback(() => {
    if (!user) return 'U';
    let initials = '';
    if (user.firstName) initials += user.firstName[0].toUpperCase();
    if (user.lastName) initials += user.lastName[0].toUpperCase();
    return initials || 'U';
  }, [user]);

  const itemsToDisplay = navItems.length > 0 ? navItems : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.avatar-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all p-4 border-b border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background ${
        isScrolled ? 'shadow-md' : 'shadow-none'
      }`}
    >
      <div className="flex justify-between items-center">
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

        <div className="hidden  lg:flex items-center space-x-1">
          {itemsToDisplay.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`relative flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'text-light-primary dark:text-dark-primary'
                    : 'text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary'
                }`}
              >
                {item.icon && <span className="mr-2 text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {!user ? (
          <Link
            to="/auth/login"
            className="hidden lg:flex text-lg bg-light-secondary dark:bg-dark-secondary text-dark-text px-4 py-2 rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out animate-fadeIn"
          >
            Login / Register
          </Link>
        ) : (
          <div className="flex flex-row-reverse md:flex-row items-center space-x-0 space-x-reverse">
            <div
              className="relative avatar-dropdown flex items-center cursor-pointer p-2"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="flex items-center space-x-2">
                <p className="hidden md:block text-sm text-light-text dark:text-dark-text font-semibold">
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
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                      <FaHome className="mr-3 text-light-text/70 dark:text-dark-text/70 group-hover:text-light-primary dark:group-hover:text-dark-primary transform group-hover:scale-110 transition-all duration-200" />{' '}
                      Dashboard
                    </Link>

                    <Link
                      to="/user/profile"
                      className="flex items-center w-full px-4 py-2.5 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200 group"
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                      <FaUser className="mr-3 text-light-text/70 dark:text-dark-text/70 group-hover:text-light-primary dark:group-hover:text-dark-primary transform group-hover:scale-110 transition-all duration-200" />{' '}
                      Profile
                    </Link>

                    {!user.isAdmin && (
                      <Link
                        to="/user/resume"
                        className="flex items-center w-full px-4 py-2.5 text-sm text-light-text dark:text-dark-text hover:bg-light-surface dark:hover:bg-dark-surface transition-colors duration-200 group"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                      >
                        <FaFileAlt className="mr-3 text-light-text/70 dark:text-dark-text/70 group-hover:text-light-primary dark:group-hover:text-dark-primary transform group-hover:scale-110 transition-all duration-200" />{' '}
                        Resume
                      </Link>
                    )}

                    <div className="border-t border-light-border dark:border-dark-border my-1.5"></div>

                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        setIsDropdownOpen((prev) => !prev);
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

            <div className="flex items-center space-x-3">
              <div className="relative inline-flex items-center">
                <button
                  onClick={toggleTheme}
                  className={`w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                    theme === 'dark' ? 'bg-light-primary' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle theme"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform duration-300 flex items-center justify-center ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <FaMoon size={12} className="text-gray-600" />
                    ) : (
                      <FaSun size={12} className="text-yellow-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

TopNavbar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.element,
    })
  ),
};

export default TopNavbar;
