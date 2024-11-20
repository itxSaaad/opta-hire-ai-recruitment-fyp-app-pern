import PropTypes from 'prop-types';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const socials = [
  { href: 'https://www.facebook.com', label: 'Facebook', Icon: FaFacebook },
  { href: 'https://www.instagram.com', label: 'Instagram', Icon: FaInstagram },
  { href: 'https://www.linkedin.com', label: 'LinkedIn', Icon: FaLinkedin },
  { href: 'https://www.twitter.com', label: 'Twitter', Icon: FaTwitter },
];

const SocialIcon = ({ href, label, Icon }) => (
  <Link
    to={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-darkText hover:text-primary transition duration-300 transform hover:rotate-6 hover:scale-110"
  >
    <Icon size={20} />
  </Link>
);

export default function Footer() {
  return (
    <footer className="text-darkText py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
      <div className="text-xs md:text-sm text-darkText">
        &copy; {new Date().getFullYear()} OptaHire. All Rights Reserved.
      </div>

      <div className="flex space-x-2 md:space-x-4">
        {socials.map((social, index) => (
          <SocialIcon key={index} {...social} />
        ))}
      </div>
    </footer>
  );
}

SocialIcon.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
};
