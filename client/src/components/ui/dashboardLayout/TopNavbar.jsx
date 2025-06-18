import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import {
  FaAngleDown,
  FaCheck,
  FaCrown,
  FaFileAlt,
  FaHome,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Logo from '../../../assets/images/logo.png';

import { logoutUser } from '../../../features/auth/authSlice';

import { getExpectedRoute, getUserRole } from '../../../utils/helpers';

const TopNavbar = ({ navItems = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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
      className={`fixed left-0 top-0 z-50 w-full border-b border-light-border bg-light-background p-4 transition-all dark:border-dark-border dark:bg-dark-background ${
        isScrolled ? 'shadow-md' : 'shadow-none'
      }`}
    >
      <div className="flex items-center justify-between">
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

        <div className="hidden items-center space-x-1 lg:flex">
          {itemsToDisplay.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`relative flex items-center rounded-md px-4 py-2 transition-all duration-200 ${
                  isActive
                    ? 'text-light-primary dark:text-dark-primary'
                    : 'text-light-text hover:text-light-primary dark:text-dark-text dark:hover:text-dark-primary'
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
            className="hidden transform animate-fadeIn rounded-lg bg-light-secondary px-4 py-2 text-lg text-dark-text transition-transform duration-300 ease-in-out hover:scale-105 dark:bg-dark-secondary lg:flex"
          >
            Login / Register
          </Link>
        ) : (
          <div className="flex items-center space-x-4">
            <div
              className="avatar-dropdown relative cursor-pointer"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <div className="flex items-center justify-between space-x-2 rounded-lg border border-light-border/20 bg-light-surface/30 p-1.5 backdrop-blur-sm transition-all duration-200 hover:bg-light-surface/50 dark:border-dark-border/20 dark:bg-dark-surface/30 dark:hover:bg-dark-surface/50 sm:space-x-4 sm:p-2 md:px-4 md:py-2">
                <div className="hidden text-right sm:block">
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

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-light-secondary text-xs font-semibold text-dark-text dark:bg-dark-secondary sm:h-9 sm:w-9">
                      {getUserInitials()}
                    </div>
                    {user.isVerified && (
                      <div className="absolute -bottom-1 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 sm:h-4 sm:w-4">
                        <span className="text-[8px] text-white sm:text-xs">
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
