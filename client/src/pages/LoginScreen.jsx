import PropTypes from 'prop-types';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, ScrollRestoration, useNavigate } from 'react-router-dom';

import Loader from '../components/Loader';

const InputField = ({ id, type, label, value, onChange }) => (
  <div className="relative mb-6">
    <input
      type={type}
      id={id}
      placeholder=""
      value={value}
      onChange={onChange}
      className="w-full p-4 bg-darkBackground border border-darkText rounded-lg text-darkText focus:ring-2 focus:ring-primary focus:outline-none peer transition-all duration-300"
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-4 text-darkText text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-primary"
    >
      {label}
    </label>
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
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
      <section className="min-h-screen flex items-center justify-center py-16 px-4">
        <Link
          to="/"
          className="absolute top-4 left-4 text-darkText hover:text-primary transition-all"
        >
          <FaArrowLeft className="inline-block -mt-1 mr-2" />
          Back to Home
        </Link>

        <div className="bg-primary bg-opacity-10 rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 max-w-md sm:max-w-lg lg:max-w-xl w-full relative animate-fadeIn">
          {loading ? (
            <Loader />
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-4 sm:mb-6">
                Welcome Back!
              </h2>
              <p className="text-center text-darkText mb-6 sm:mb-8">
                Please login to continue to your account.
              </p>

              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                <InputField
                  id="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <InputField
                  id="password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-darkText">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 transition-all duration-200"
                    />
                    Remember Me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-secondary transition-all duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 sm:py-3 rounded-lg font-semibold text-lg hover:bg-secondary transition-all duration-300 shadow-md"
                  disabled={loading}
                >
                  Login
                </button>
              </form>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-darkText">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/auth/register"
                    className="text-primary hover:text-secondary transition-all duration-200"
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
