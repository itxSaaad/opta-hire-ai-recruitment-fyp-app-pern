import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Loader from '../components/Loader';

import { getExpectedRoute, getUserRole } from '../utils/helpers';

const RequireRole = ({ allowedRoles, children }) => {
  const { userInfo: user, loading } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const location = useLocation();

  const userRole = getUserRole(user);
  const isAllowed = allowedRoles.includes(userRole);

  useEffect(() => {
    if (loading) return;

    if (user && !isAllowed) {
      navigate(getExpectedRoute(user), {
        replace: true,
        state: { from: location },
      });
    }
  }, [loading, user, isAllowed, navigate, location]);

  if (loading) {
    return <Loader />;
  }

  return isAllowed ? children : <Loader />;
};

RequireRole.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

export default memo(RequireRole);
