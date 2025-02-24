import PropTypes from 'prop-types';

import Logo from '../assets/images/logo.png';

export default function Loader({ logoSrc = Logo, altText = 'Loading...' }) {
  return (
    <section className="flex justify-center items-center h-full w-full bg-light-background dark:bg-dark-background">
      <img src={logoSrc} alt={altText} className="animate-loader" />
    </section>
  );
}

Loader.propTypes = {
  logoSrc: PropTypes.string,
  altText: PropTypes.string,
};
