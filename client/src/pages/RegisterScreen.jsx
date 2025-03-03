import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, ScrollRestoration, useNavigate } from 'react-router-dom';

import Loader from '../components/Loader';
import InputField from '../components/ui/mainLayout/InputField';

import { useRegisterMutation } from '../features/auth/authApi';
import { setUserInfo, updateAccessToken } from '../features/auth/authSlice';

import { useDispatch } from 'react-redux';
import ErrorMsg from '../components/ErrorMsg';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../utils/validations';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [register, { isLoading, error }] = useRegisterMutation();

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
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
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
    };
    setErrors(newErrors);

    const result = await register({
      firstName,
      lastName,
      phone,
      email,
      password,
      role: 'candidate',
    }).unwrap();
    dispatch(setUserInfo(result.user));
    dispatch(updateAccessToken(result.accessToken));
    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Register - OptaHire</title>
        <meta
          name="description"
          content="Register for an OptaHire account to start applying for jobs and managing your applications."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-16 px-4">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-light-primary dark:text-dark-primary mb-4 sm:mb-6">
                Create an Account
              </h2>
              <p className="text-center text-light-text dark:text-dark-text mb-6 sm:mb-8">
                Please fill in the details to create your account.
              </p>
              {error && <ErrorMsg errorMsg={error.data.message} />}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-4">
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
                </div>
                <InputField
                  id="phone"
                  type="tel"
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  validationMessage={errors.phone}
                />
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
                  className="w-full bg-light-primary dark:bg-dark-primary text-white py-2 sm:py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-all duration-300 shadow-md"
                  disabled={isLoading}
                >
                  Register
                </button>
              </form>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-light-text dark:text-dark-text">
                  Already have an account?{' '}
                  <Link
                    to="/auth/login"
                    className="text-light-primary dark:text-dark-primary hover:text-light-secondary dark:hover:text-dark-secondary transition-all duration-200"
                  >
                    Login
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
