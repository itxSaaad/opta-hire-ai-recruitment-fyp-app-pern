import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const IsAuth = (WrappedComponent) => {
  const WithAuthComponent = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth.userInfo);

    const getExpectedRoute = (user) => {
      if (user.isAdmin) return '/admin';
      if (user.isRecruiter) return '/recruiter';
      if (user.isInterviewer) return '/interviewer';
      if (user.isCandidate) return '/candidate';
      return '/';
    };

    useEffect(() => {
      if (!user) {
        navigate('/auth/login');
        return;
      }

      if (user && !user.isVerified) {
        navigate('/auth/verify');
        return;
      }

      const expectedRoute = getExpectedRoute(user);
      if (!location.pathname.startsWith(expectedRoute)) {
        navigate(expectedRoute);
      }
    }, [user, navigate, location.pathname]);

    // Only render if authenticated, verified, and on correct route
    if (user && user.isVerified) {
      const expectedRoute = getExpectedRoute(user);
      if (location.pathname.startsWith(expectedRoute)) {
        return <WrappedComponent {...props} />;
      }
    }

    return null;
  };

  return WithAuthComponent;
};

export default IsAuth;
