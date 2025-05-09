import PropTypes from 'prop-types';
import { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Loader from '../components/Loader';

import { getExpectedRoute } from '../utils/helpers';

const RequireAuth = ({ children }) => {
  const { userInfo: user, loading } = useSelector((state) => state.auth);

  const location = useLocation();
  const navigate = useNavigate();

  const { pathname } = location;

  const isVerified = user?.isVerified;

  const isAuthRoute = pathname.startsWith('/auth');
  const isPublicAuthRoute = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
  ].includes(pathname);
  const isVerifyRoute = pathname === '/auth/verify';

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!isPublicAuthRoute) {
        navigate('/auth/login', { state: { from: location }, replace: true });
      }
      return;
    }

    if (user && !isVerified) {
      if (!isVerifyRoute) {
        navigate('/auth/verify', { replace: true });
      }
      return;
    }

    if (user && isVerified && isAuthRoute) {
      navigate(getExpectedRoute(user), { replace: true });
    }
  }, [
    user,
    isVerified,
    loading,
    navigate,
    location,
    pathname,
    isAuthRoute,
    isPublicAuthRoute,
    isVerifyRoute,
  ]);

  if (loading) {
    return <Loader />;
  }

  return isPublicAuthRoute || user ? children : null;
};

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(RequireAuth);
