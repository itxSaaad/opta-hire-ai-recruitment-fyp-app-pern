import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Loader from '../components/Loader';

import { getExpectedRoute } from '../utils/helpers';

const IsAuth = (WrappedComponent) => {
  const WithAuthComponent = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    const { userInfo: user, loading } = useSelector((state) => state.auth);

    useEffect(() => {
      if (loading) return;

      if (!user && pathname === '/auth/reset-password') {
        return;
      }

      if (!user) {
        if (pathname !== '/auth/login') {
          navigate('/auth/login', { replace: true });
        }
        return;
      }

      if (!user.isVerified && pathname !== '/auth/verify') {
        navigate('/auth/verify', { replace: true });
        return;
      }

      if (user.isVerified) {
        const expectedRoute = getExpectedRoute(user);

        if (
          pathname === '/auth/login' ||
          pathname === '/auth/register' ||
          pathname === '/auth/verify' ||
          pathname === '/auth/reset-password'
        ) {
          navigate(expectedRoute, { replace: true });
          return;
        }

        const isAuthRoute = pathname.startsWith('/auth');
        const isExpectedRoute = pathname.startsWith(expectedRoute);

        if (!isExpectedRoute && !isAuthRoute) {
          navigate(expectedRoute, { replace: true });
        }
      }
    }, [user, loading, navigate, pathname]);

    if (loading) {
      return <Loader />;
    }

    if (
      !user &&
      (pathname === '/auth/login' || pathname === '/auth/reset-password')
    ) {
      return <WrappedComponent {...props} />;
    }

    if (user && !user.isVerified && pathname === '/auth/verify') {
      return <WrappedComponent {...props} />;
    }

    if (user && user.isVerified) {
      return <WrappedComponent {...props} />;
    }

    return null;
  };

  WithAuthComponent.displayName = `IsAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  WithAuthComponent.propTypes = {
    location: PropTypes.object,
    navigate: PropTypes.func,
    user: PropTypes.object,
    loading: PropTypes.bool,
  };

  return memo(WithAuthComponent);
};

export default IsAuth;
