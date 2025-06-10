import PropTypes from 'prop-types';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMoon,
  FaSun,
  FaTwitter,
  FaHeart,
} from 'react-icons/fa';
import useTheme from '../../../hooks/useTheme';

const socials = [
  {
    href: 'https://www.facebook.com/optahire',
    label: 'Facebook',
    Icon: FaFacebook,
  },
  {
    href: 'https://www.instagram.com/optahire',
    label: 'Instagram',
    Icon: FaInstagram,
  },
  {
    href: 'https://www.linkedin.com/company/optahire',
    label: 'LinkedIn',
    Icon: FaLinkedin,
  },
  { href: 'https://www.x.com/optahire', label: 'Twitter', Icon: FaTwitter },
];

const SocialIcon = ({ href, label, Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="group relative transform rounded-full bg-light-surface p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-light-primary hover:shadow-lg dark:bg-dark-surface dark:hover:bg-dark-primary"
  >
    <Icon
      size={18}
      className="text-light-text transition-colors duration-300 group-hover:text-white dark:text-dark-text"
    />
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-light-primary to-light-secondary opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
  </a>
);

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="relative overflow-hidden border-t border-light-border bg-light-background dark:border-dark-border dark:bg-dark-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 -skew-y-1 scale-110 transform bg-gradient-to-r from-light-primary via-light-secondary to-light-primary" />
      </div>
      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Copyright section */}
          <div className="flex flex-col items-center space-y-2 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm font-medium text-light-text dark:text-dark-text md:text-base">
              <span>&copy; {new Date().getFullYear()} OptaHire.</span>
              <span className="hidden md:inline">All Rights Reserved.</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-light-text/70 dark:text-dark-text/70 md:text-sm">
              <span>Made with</span>
              <FaHeart className="animate-pulse text-red-500" size={12} />
              <span>for better recruitment</span>
            </div>
          </div>

          {/* Social links and theme toggle */}
          <div className="flex items-center space-x-4">
            {/* Social icons */}
            <div className="flex items-center space-x-2 rounded-xl bg-light-surface/50 p-2 backdrop-blur-sm dark:bg-dark-surface/50">
              {socials.map((social, index) => (
                <SocialIcon key={index} {...social} />
              ))}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-light-border dark:bg-dark-border" />

            {/* Theme toggle */}
            <div className="relative">
              <button
                onClick={toggleTheme}
                className={`group relative h-8 w-14 rounded-full shadow-inner transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-light-primary focus:ring-offset-2 focus:ring-offset-light-background dark:focus:ring-dark-primary dark:focus:ring-offset-dark-background ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-dark-primary to-dark-secondary'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400'
                }`}
                aria-label="Toggle theme"
              >
                {/* Toggle background glow */}
                <div
                  className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                    theme === 'dark' ? 'bg-blue-400/20' : 'bg-yellow-300/20'
                  } opacity-0 group-hover:opacity-100`}
                />

                {/* Background icons - positioned to match slider movement */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                  <FaSun
                    size={10}
                    className={`transition-all duration-300 ${
                      theme === 'light'
                        ? 'text-yellow-500 opacity-80'
                        : 'text-white/30 opacity-30'
                    }`}
                  />
                  <FaMoon
                    size={10}
                    className={`transition-all duration-300 ${
                      theme === 'dark'
                        ? 'text-blue-300 opacity-80'
                        : 'text-white/30 opacity-30'
                    }`}
                  />
                </div>

                {/* Toggle slider */}
                <div
                  className={`absolute top-1 flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg transition-all duration-500 ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  } group-hover:scale-110`}
                >
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                    {theme === 'dark' ? (
                      <FaMoon
                        size={12}
                        className="transform text-dark-primary transition-all duration-300 group-hover:rotate-12"
                      />
                    ) : (
                      <FaSun
                        size={12}
                        className="transform text-yellow-500 transition-all duration-300 group-hover:rotate-90"
                      />
                    )}
                  </div>
                </div>
              </button>

              {/* Theme toggle label */}
              <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="whitespace-nowrap text-xs text-light-text/70 dark:text-dark-text/70">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 hidden items-center justify-center border-t border-light-border/30 pt-4 dark:border-dark-border/30 lg:flex">
          <p className="text-center text-xs text-light-text/60 dark:text-dark-text/60">
            Optimizing Your Recruitment Journey • Connect • Interview • Hire
          </p>
        </div>
      </div>
    </footer>
  );
}

SocialIcon.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
};
