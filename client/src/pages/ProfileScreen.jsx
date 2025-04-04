import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaTrash, FaUserEdit } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ErrorMsg from '../components/ErrorMsg';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import InputField from '../components/ui/mainLayout/InputField';

import {
  validateEmail,
  validateName,
  validatePhone,
} from '../utils/validations';

import { logoutUser, setUserInfo } from '../features/auth/authSlice';
import {
  useDeleteProfileMutation,
  useUpdateProfileMutation,
} from '../features/user/userApi';

import IsAuth from '../hoc/IsAuth';

function ProfileScreen() {
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
      <section className="min-h-screen flex items-center justify-center pt-20 pb-14 px-4 bg-light-background dark:bg-dark-background">
        {loading || isLoading || isDeleting ? (
          <Loader />
        ) : (
          <div className="w-full max-w-md relative animate-fadeIn">
            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary mb-4">
                Your Profile
              </h2>
              <p className="text-light-text dark:text-dark-text mb-6">
                Manage your personal information
              </p>
            </div>
            <>
              {error && <ErrorMsg errorMsg={error.data?.message} />}
              {deleteError && <ErrorMsg errorMsg={deleteError.data?.message} />}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4 sm:space-y-6"
              >
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

                <div className="mb-2">
                  <label className="block text-light-text dark:text-dark-text text-sm font-medium mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={getRoleString()}
                    disabled
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-light-text dark:text-dark-text cursor-not-allowed opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center bg-light-primary dark:bg-dark-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isLoading || !isFormChanged
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  disabled={isLoading || !isFormChanged}
                >
                  <FaUserEdit className="mr-2" />
                  Update Profile
                </button>

                <button
                  type="button"
                  className={`w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg active:scale-98 transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
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
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Confirm Deletion"
        >
          <div>
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200"
                onClick={() => {
                  confirmDelete();
                  setShowModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </section>
    </>
  );
}

const ProtectedProfileScreen = IsAuth(ProfileScreen);

export default ProtectedProfileScreen;
