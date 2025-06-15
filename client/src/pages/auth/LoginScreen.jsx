import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  Link,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';
import { getExpectedRoute } from '../../utils/helpers';
import { validateEmail, validatePassword } from '../../utils/validations';

import { useLoginMutation } from '../../features/auth/authApi';
import { setUserInfo, updateAccessToken } from '../../features/auth/authSlice';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [login, { isLoading, error }] = useLoginMutation();

  const handleChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'password') {
      setPassword(value);
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();

      dispatch(setUserInfo(result.user));
      dispatch(updateAccessToken(result.accessToken));

      const expectedRoute = getExpectedRoute(result.user);

      navigate(expectedRoute);
      trackEvent('Authentication', 'Login', 'Success');
    } catch (err) {
      console.error('Login failed:', err);
      trackEvent(
        'Authentication',
        'Login',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Login - OptaHire | Access Your Recruitment Account</title>
        <meta
          name="description"
          content="Login to OptaHire - Access your recruitment dashboard as a recruiter, candidate, or interviewer. Secure authentication for all users."
        />
        <meta
          name="keywords"
          content="OptaHire Login, Recruitment Login, Secure Access, User Authentication, Account Access"
        />
      </Helmet>
      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-14 dark:bg-dark-background">
        <Link
          to="/"
          className="absolute left-4 top-4 text-light-text transition-all hover:text-light-primary dark:text-dark-text dark:hover:text-dark-primary"
        >
          <FaArrowLeft className="-mt-1 mr-2 inline-block" />
          Back to Home
        </Link>

        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Welcome{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Back
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Sign in to your account and continue optimizing your recruitment
              journey with OptaHire.
            </p>

            {error && <Alert message={error.data.message} />}

            <form
              className="space-y-4 sm:space-y-6"
              onSubmit={handleSubmit}
              noValidate
            >
              <InputField
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                validationMessage={errors.email}
              />
              <InputField
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                validationMessage={errors.password}
              />
              <div className="flex items-center justify-end">
                <Link
                  to="/auth/reset-password"
                  className="text-light-primary transition-all duration-200 hover:text-light-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                >
                  Forgot your password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="active:scale-98 w-full rounded-lg bg-light-primary py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-light-secondary hover:shadow-xl dark:bg-dark-primary dark:hover:bg-dark-secondary"
              >
                Login
              </button>
            </form>

            <div className="mt-4 text-center sm:mt-6">
              <p className="text-light-text dark:text-dark-text">
                Don&apos;t have an account?{' '}
                <Link
                  to="/auth/register"
                  className="text-light-primary transition-all duration-200 hover:text-light-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                  onClick={() =>
                    trackEvent(
                      'Authentication',
                      'Register',
                      'Clicked Register Link'
                    )
                  }
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        )}
      </section>
      <ScrollRestoration />
    </>
  );
}

export default LoginScreen;
