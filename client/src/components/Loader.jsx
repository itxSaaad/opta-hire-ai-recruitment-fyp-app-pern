import PropTypes from 'prop-types';

import Logo from '../assets/images/logo.png';

export default function Loader({ logoSrc = Logo, altText = 'Loading...' }) {
  return (
    <section className="flex w-full flex-col items-center justify-center bg-transparent dark:bg-transparent">
      <img src={logoSrc} alt={altText} className="h-2/3 w-2/3 animate-loader" />

      <p className="mt-4 animate-pulse text-sm text-light-text/60 dark:text-dark-text/60">
        Please wait while we prepare your content
      </p>

      <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-light-border dark:bg-dark-border">
        <div className="animate-loading-bar h-full rounded-full bg-gradient-to-r from-light-primary to-light-secondary dark:from-dark-primary dark:to-dark-secondary"></div>
      </div>

      {/* CSS Custom Animations */}
      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

Loader.propTypes = {
  logoSrc: PropTypes.string,
  altText: PropTypes.string,
};
