import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { getExpectedRoute } from '../utils/helpers';

const IsAuth = (WrappedComponent) => {
  const WithAuthComponent = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.userInfo);

    useEffect(() => {
      if (!user || user === null) {
        navigate('/auth/login');
        return;
      }

      if (!user.isVerified && location.pathname !== '/auth/verify') {
        navigate('/auth/verify');
        return;
      }

      if (user.isVerified) {
        const expectedRoute = getExpectedRoute(user);
        if (
          !location.pathname.startsWith(expectedRoute) &&
          !location.pathname.startsWith('/auth')
        ) {
          navigate(expectedRoute);
        }
      }
    }, [user, navigate, location.pathname]);

    if (location.pathname === '/auth/verify') {
      return <WrappedComponent {...props} />;
    }

    if (user && user.isVerified) {
      return <WrappedComponent {...props} />;
    }

    return null;
  };

  return WithAuthComponent;
};

export default IsAuth;
