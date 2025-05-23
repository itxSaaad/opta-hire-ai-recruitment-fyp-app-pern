import PropTypes from 'prop-types';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

import Loader from '../components/ui/Loader';

import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../utils/validations';

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
      className={`w-full p-4 bg-darkBackground border ${
        validationMessage ? 'border-red-500' : 'border-darkText'
      } rounded-lg text-darkText focus:ring-2 focus:ring-primary focus:outline-none peer transition-all duration-300`}
      required
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-4 text-darkText text-sm transition-all duration-300 transform -translate-y-1/2 scale-75 origin-top-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-4 peer-focus:text-normal peer-focus:text-primary"
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

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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

  const handleSubmit = (e) => {
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

    if (Object.values(newErrors).every((error) => error === '')) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 2000);
    }
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
                Create an Account
              </h2>
              <p className="text-center text-darkText mb-6 sm:mb-8">
                Please fill in the details to create your account.
              </p>

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
                  className="w-full bg-primary text-white py-2 sm:py-3 rounded-lg font-semibold text-lg hover:bg-secondary transition-all duration-300 shadow-md"
                  disabled={loading}
                >
                  Register
                </button>
              </form>

              <div className="text-center mt-4 sm:mt-6">
                <p className="text-darkText">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:text-secondary transition-all duration-200"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
