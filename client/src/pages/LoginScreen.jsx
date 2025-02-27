import PropTypes from 'prop-types';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Link, ScrollRestoration, useNavigate } from 'react-router-dom';

import ErrorMsg from '../components/ErrorMsg';
import Loader from '../components/Loader';

import { validateEmail, validatePassword } from '../utils/validations';

import { useLoginMutation } from '../features/auth/authApi';
import { setUserInfo, updateAccessToken } from '../features/auth/authSlice';

const InputField = ({
  id,
  type,
  label,
  value,
  onChange,
  validationMessage,
}) => (
  <div className="relative w-full">
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder=""
      className={`w-full p-4 bg-light-background dark:bg-dark-background border ${
        validationMessage
          ? 'border-red-500'
          : 'border-light-border dark:border-dark-border'
      } rounded-lg text-light-text dark:text-dark-text focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none peer transition-all duration-300`}
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-4 text-light-text dark:text-dark-text text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-light-primary dark:peer-focus:text-dark-primary"
    >
      {label}
    </label>
    {validationMessage && (
      <p className="absolute text-red-500 text-sm mt-1">{validationMessage}</p>
    )}
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading, error }] = useLoginMutation();

  const handleChange = (field, value) => {
    switch (field) {
      case 'email':
        setEmail(value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: validateEmail(value),
        }));
        break;
      case 'password':
        setPassword(value);
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: validatePassword(value),
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    const result = await login({ email, password }).unwrap();
    dispatch(setUserInfo(result.user));
    dispatch(updateAccessToken(result.accessToken));
    navigate('/dashboard');
  };
  return (
    <>
      <Helmet>
        <title>Login - OptaHire</title>
        <meta
          name="description"
          content="Login to your OptaHire account to access your job applications, interviews, and more."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-16 px-4 bg-light-background dark:bg-dark-background">
        <Link
          to="/"
          className="absolute top-4 left-4 text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-all"
        >
          <FaArrowLeft className="inline-block -mt-1 mr-2" />
          Back to Home
        </Link>

        <div className="bg-light-background/80 dark:bg-dark-background/80 backdrop-blur-lg rounded-xl shadow-xl p-8 sm:p-10 lg:p-12 max-w-md sm:max-w-lg lg:max-w-xl w-full relative animate-fadeIn">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-light-primary dark:text-dark-primary mb-4 sm:mb-6">
                Welcome Back!
              </h2>

              <p className="text-center text-light-text dark:text-dark-text mb-6 sm:mb-8">
                Please login to continue to your account.
              </p>

              {error && <ErrorMsg errorMsg={error.data.message} />}

              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
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
                <div className="flex items-center justify-end space-x-2">
                  <Link
                    to="/forgot-password"
                    className="text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="w-full bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  Login
                </button>
              </form>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-light-text dark:text-dark-text">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/auth/register"
                    className="text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all duration-200"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      <ScrollRestoration />
    </>
  );
}
