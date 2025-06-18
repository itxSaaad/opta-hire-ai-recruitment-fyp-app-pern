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
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../utils/validations';

import { useRegisterMutation } from '../../features/auth/authApi';
import { setUserInfo, updateAccessToken } from '../../features/auth/authSlice';

function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [register, { isLoading, error, isSuccess, data }] =
    useRegisterMutation();

  const handleChange = (field, value) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        setErrors((prev) => ({ ...prev, firstName: validateName(value) }));
        break;
      case 'lastName':
        setLastName(value);
        setErrors((prev) => ({ ...prev, lastName: validateName(value) }));
        break;
      case 'phone':
        setPhone(value);
        setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
        break;
      case 'email':
        setEmail(value);
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        break;
      case 'password':
        setPassword(value);
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
          confirmPassword: validateConfirmPassword(confirmPassword, value),
        }));
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value, password),
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      firstName: validateName(firstName),
      lastName: validateName(lastName),
      phone: validatePhone(phone),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      role: role ? '' : 'Please select a role.',
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err);
    if (hasErrors) return;

    try {
      const result = await register({
        firstName,
        lastName,
        phone,
        email,
        password,
        role,
      }).unwrap();

      dispatch(setUserInfo(result.user));
      dispatch(updateAccessToken(result.accessToken));

      const expectedRoute = getExpectedRoute(result.user);

      navigate(expectedRoute);
      trackEvent('Authentication', 'Registration', 'Success');
    } catch (err) {
      console.error('Registration failed:', err);
      trackEvent(
        'Authentication',
        'Registration',
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
        <title>
          Register - OptaHire | Join the AI-Powered Recruitment Platform
        </title>
        <meta
          name="description"
          content="Join OptaHire - Create your account as a recruiter, candidate, or interviewer. Start your AI-powered recruitment journey today."
        />
        <meta
          name="keywords"
          content="OptaHire Register, Join OptaHire, Recruitment Signup, Create Account, AI Recruitment"
        />
      </Helmet>
      <section className="flex min-h-screen items-center justify-center bg-light-background px-4 py-14 dark:bg-dark-background">
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
              Join{' '}
              <span className="text-light-primary dark:text-dark-primary">
                OptaHire
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Create your account and start optimizing your recruitment journey
              with AI-powered candidate matching.
            </p>

            {error && <Alert message={error.data.message} />}

            {isSuccess && data.data?.message && (
              <Alert message={data.data?.message} isSuccess={true} />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-1">
                <InputField
                  id="firstName"
                  type="text"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  validationMessage={errors.firstName}
                />
                <InputField
                  id="lastName"
                  type="text"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  validationMessage={errors.lastName}
                />
                <div className="mb-6">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setErrors((prev) => ({ ...prev, role: '' }));
                    }}
                    className="w-full rounded-lg border border-light-border bg-light-background p-4 text-light-text transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-light-primary dark:border-dark-border dark:bg-dark-background dark:text-dark-text dark:focus:ring-dark-primary"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="interviewer">Interviewer</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                  )}
                </div>

                <InputField
                  id="phone"
                  type="tel"
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  validationMessage={errors.phone}
                />
              </div>

              <InputField
                id="email"
                type="email"
                label="Email Address"
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
              <InputField
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                validationMessage={errors.confirmPassword}
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-light-primary py-2 text-lg font-semibold text-white shadow-md transition-all duration-300 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary sm:py-3"
                disabled={isLoading}
              >
                Register
              </button>
            </form>

            <div className="mt-4 text-center sm:mt-6">
              <p className="text-light-text dark:text-dark-text">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-light-primary transition-all duration-200 hover:text-light-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                  onClick={() =>
                    trackEvent(
                      'Authentication',
                      'Login',
                      'Clicked from Register'
                    )
                  }
                >
                  Login
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

export default RegisterScreen;
