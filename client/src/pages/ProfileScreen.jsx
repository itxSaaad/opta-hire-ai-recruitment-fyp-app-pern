import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';

import ErrorMsg from '../components/ErrorMsg';
import Loader from '../components/Loader';
import InputField from '../components/ui/mainLayout/InputField';

import {
  validateEmail,
  validateName,
  validatePhone,
} from '../utils/validations';

import {
  useUpdateProfileMutation,
  useDeleteProfileMutation,
} from '../features/user/userApi';
import { setUserInfo, logoutUser } from '../features/auth/authSlice';

function Modal({ show, onClose, onConfirm }) {
  Modal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };
  const [display, setDisplay] = useState(show);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setDisplay(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      const timeout = setTimeout(() => setDisplay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!display) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        animate ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm transform transition-all duration-300 ${
          animate ? 'scale-100' : 'scale-95'
        }`}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Confirm Deletion
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { userInfo: user, loading } = useSelector((state) => state.auth);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProfileMutation();

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

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
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err)) return;

    try {
      const result = await updateProfile({
        id: user._id,
        firstName,
        lastName,
        phone,
        email,
      }).unwrap();

      dispatch(setUserInfo(result.user));
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteAccount(user._id).unwrap();
      dispatch(logoutUser());
      navigate('/auth/register');
    } catch (err) {
      console.error('Account deletion failed:', err);
    }
  };

  const getRoleString = () => {
    if (!user) return '';
    const roles = [];
    if (user.isAdmin) roles.push('Admin');
    if (user.isRecruiter) roles.push('Recruiter');
    if (user.isInterviewer) roles.push('Interviewer');
    if (user.isCandidate) roles.push('Candidate');
    return roles.length > 0 ? roles.join(', ') : 'User';
  };

  const isFormChanged =
    firstName !== user?.firstName ||
    lastName !== user?.lastName ||
    phone !== user?.phone ||
    email !== user?.email;

  return (
    <>
      <Helmet>
        <title>Profile - OptaHire</title>
        <meta
          name="description"
          content="View and update your profile information."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-16 px-4 bg-gray-100 dark:bg-gray-900">
        {loading || isLoading || isDeleting ? (
          <Loader />
        ) : (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                Your Profile
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your personal information
              </p>
            </div>
            <>
              {error && <ErrorMsg errorMsg={error.data?.message} />}
              {deleteError && <ErrorMsg errorMsg={deleteError.data?.message} />}

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2">
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
                  disabled
                  className="cursor-not-allowed opacity-60"
                />

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
                    Role
                  </label>
                  <input
                    type="text"
                    value={getRoleString()}
                    disabled
                    className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-xl ${
                    isLoading || !isFormChanged
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-blue-600 hover:to-blue-700'
                  }`}
                  disabled={isLoading || !isFormChanged}
                >
                  <FaUserEdit className="mr-2" />
                  Update Profile
                </button>

                <button
                  type="button"
                  className={`w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white py-3 mt-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-xl ${
                    isDeleting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-red-600 hover:to-red-700'
                  }`}
                  onClick={() => setShowModal(true)}
                  disabled={isDeleting}
                >
                  <FaTrash className="mr-2" />
                  Delete Account
                </button>
              </form>
            </>
          </div>
        )}

        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            confirmDelete();
            setShowModal(false);
          }}
        />
      </section>
    </>
  );
}

export default ProfileScreen;
