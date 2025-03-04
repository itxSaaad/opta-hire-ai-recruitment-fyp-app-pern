import PropTypes from 'prop-types';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMoon,
  FaSun,
  FaTwitter,
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
    className="text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition duration-300 transform hover:rotate-6 hover:scale-110"
  >
    <Icon size={20} />
  </a>
);

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="text-light-text dark:text-dark-text py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
      <div className="text-xs md:text-sm">
        &copy; {new Date().getFullYear()} OptaHire. All Rights Reserved.
      </div>

      <div className="flex space-x-2 md:space-x-4 items-center">
        {socials.map((social, index) => (
          <SocialIcon key={index} {...social} />
        ))}
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
    </footer>
  );
}

SocialIcon.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
};
