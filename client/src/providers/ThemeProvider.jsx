import PropTypes from 'prop-types';

import useTheme from '../hooks/useTheme';

const ThemeProvider = ({ children }) => {
  useTheme();

  return <>{children}</>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
