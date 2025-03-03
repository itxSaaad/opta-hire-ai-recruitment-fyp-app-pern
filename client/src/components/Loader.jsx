import PropTypes from 'prop-types';

import Logo from '../assets/images/logo.png';

export default function Loader({ logoSrc = Logo, altText = 'Loading...' }) {
  return (
    <section className="w-full bg-light-background dark:bg-dark-background flex justify-center items-center">
      <img src={logoSrc} alt={altText} className="h-2/3 w-2/3 animate-loader" />
    </section>
  );
}

Loader.propTypes = {
  logoSrc: PropTypes.string,
  altText: PropTypes.string,
};
