import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Link, ScrollRestoration, useNavigate } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import InputField from '../../components/ui/mainLayout/InputField';

import { validateEmail, validatePassword } from '../../utils/validations';

import { useLoginMutation } from '../../features/auth/authApi';
import { setUserInfo, updateAccessToken } from '../../features/auth/authSlice';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
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
      <section className="min-h-screen flex items-center justify-center py-14 px-4 bg-light-background dark:bg-dark-background">
        <Link
          to="/"
          className="absolute top-4 left-4 text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-all"
        >
          <FaArrowLeft className="inline-block -mt-1 mr-2" />
          Back to Home
        </Link>

        <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
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
                    className="text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-lg hover:shadow-xl"
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
