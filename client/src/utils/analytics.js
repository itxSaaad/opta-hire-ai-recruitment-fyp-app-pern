import ReactGA from 'react-ga4';

export const initGA = (measurementId) => {
  ReactGA.initialize(measurementId);
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const trackEvent = (category, action, label = null) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
