import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaEnvelope,
  FaIdCard,
  FaLock,
  FaPhone,
  FaSave,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserEdit,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../utils/validations';

import { logoutUser, setUserInfo } from '../../features/auth/authSlice';
import {
  useDeleteProfileMutation,
  useGetProfileQuery,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from '../../features/user/userApi';

function ProfileScreen() {
  const { userInfo: user, loading } = useSelector((state) => state.auth);
  const {
    data: userProfile,
    isLoading: loadingUser,
    error: userError,
  } = useGetProfileQuery(undefined, {
    skip: !user,
  });

  const [firstName, setFirstName] = useState(
    userProfile?.user?.firstName || ''
  );
  const [lastName, setLastName] = useState(userProfile?.user?.lastName || '');
  const [phone, setPhone] = useState(userProfile?.user?.phone || '');
  const [email, setEmail] = useState(userProfile?.user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [passwordEditMode, setPasswordEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [updateProfile, { isLoading: isUpdatingProfile, error: updateError }] =
    useUpdateProfileMutation();
  const [
    updatePassword,
    { isLoading: isUpdatingPassword, error: passwordError },
  ] = useUpdatePasswordMutation();
  const [deleteAccount, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProfileMutation();

  useEffect(() => {
    if (userProfile && !editMode) {
      setFirstName(userProfile.user.firstName || '');
      setLastName(userProfile.user.lastName || '');
      setPhone(userProfile.user.phone || '');
      setEmail(userProfile.user.email || '');
      setErrors({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      dispatch(setUserInfo(userProfile.user));
    }
  }, [editMode, userProfile, dispatch]);

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
      case 'currentPassword':
        setCurrentPassword(value);
        setErrors((prev) => ({
          ...prev,
          currentPassword: value ? '' : 'Current password is required',
        }));
        break;
      case 'newPassword':
        setNewPassword(value);
        setErrors((prev) => ({
          ...prev,
          newPassword: validatePassword(value),
          confirmPassword: confirmPassword
            ? value === confirmPassword
              ? ''
              : 'Passwords do not match'
            : '',
        }));
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(newPassword, value),
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
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (Object.values(newErrors).some((err) => err)) return;

    try {
      const result = await updateProfile({
        firstName,
        lastName,
        phone,
        email,
      }).unwrap();

      if (result.success) {
        dispatch(setUserInfo(result.user));
        setEditMode(false);
      }
      trackEvent('User Profile', 'User Action', `Profile Updated`);
    } catch (err) {
      console.error('Profile update failed:', err);
      trackEvent(
        'User Profile',
        'User Action',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const passwordErrors = {
      currentPassword: currentPassword ? '' : 'Current password is required',
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    };

    setErrors((prev) => ({ ...prev, ...passwordErrors }));
    if (Object.values(passwordErrors).some((err) => err)) return;

    try {
      await updatePassword({
        id: user._id,
        currentPassword,
        newPassword,
      }).unwrap();

      setPasswordEditMode(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      trackEvent('User Profile', 'User Action', `Password Updated`);
    } catch (err) {
      console.error('Password update failed:', err);
      trackEvent(
        'User Profile',
        'User Action',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteAccount(user._id).unwrap();
      dispatch(logoutUser());
      navigate('/auth/register');
      trackEvent('User Profile', 'User Action', `Account Deleted`);
    } catch (err) {
      console.error('Account deletion failed:', err);
      trackEvent(
        'User Profile',
        'User Action',
        `Failed - ${err.data?.message || 'Server Error'}`
      );
    }
  };

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const getRoleString = () => {
    if (!userProfile?.user) return '';
    const roles = [];
    if (userProfile.user.isAdmin) roles.push('Admin');
    if (userProfile.user.isRecruiter) roles.push('Recruiter');
    if (userProfile.user.isInterviewer) roles.push('Interviewer');
    if (userProfile.user.isCandidate) roles.push('Candidate');
    return roles.length > 0 ? roles.join(', ') : 'No roles assigned';
  };

  const isFormChanged =
    userProfile?.user &&
    (firstName !== userProfile?.user?.firstName ||
      lastName !== userProfile?.user?.lastName ||
      phone !== userProfile?.user?.phone ||
      email !== userProfile?.user?.email);

  const isPasswordFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    !errors.currentPassword &&
    !errors.newPassword &&
    !errors.confirmPassword;

  const overallLoading =
    loading ||
    loadingUser ||
    isUpdatingProfile ||
    isUpdatingPassword ||
    isDeleting;

  return (
    <>
      <Helmet>
        <title>Profile - OptaHire</title>
        <meta
          name="description"
          content="Manage your personal information and account security on OptaHire."
        />
      </Helmet>
      <section className="min-h-screen flex items-center justify-center py-24 px-4 bg-light-background dark:bg-dark-background">
        {overallLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl relative animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">
                Your Profile
              </h2>
              <p className="text-light-text dark:text-dark-text">
                Manage your personal information and account security
              </p>
            </div>

            {(userError || updateError || passwordError || deleteError) && (
              <Alert
                message={
                  userError?.data?.message ||
                  updateError?.data?.message ||
                  passwordError?.data?.message ||
                  deleteError?.data?.message
                }
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 animate-slideInLeft">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                    Personal Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary text-white hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                  >
                    {editMode ? (
                      <>
                        <FaTimes /> Cancel
                      </>
                    ) : (
                      <>
                        <FaUserEdit /> Edit Profile
                      </>
                    )}
                  </button>
                </div>

                {!editMode ? (
                  <div className="space-y-6">
                    <div className="border-b border-light-border dark:border-dark-border pb-4">
                      <div className="flex items-start">
                        <FaUser
                          className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                          size={20}
                        />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Name
                          </p>
                          <p className="text-lg font-medium text-light-text dark:text-dark-text">
                            {userProfile?.user?.firstName || 'Not set'}{' '}
                            {userProfile?.user?.lastName || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-light-border dark:border-dark-border pb-4">
                      <div className="flex items-start">
                        <FaPhone
                          className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                          size={20}
                        />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Phone
                          </p>
                          <p className="text-lg font-medium text-light-text dark:text-dark-text">
                            {userProfile?.user?.phone || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-light-border dark:border-dark-border pb-4">
                      <div className="flex items-start">
                        <FaEnvelope
                          className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                          size={20}
                        />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Email
                          </p>
                          <p className="text-lg font-medium text-light-text dark:text-dark-text">
                            {userProfile?.user?.email || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pb-2">
                      <div className="flex items-start">
                        <FaIdCard
                          className="text-light-primary dark:text-dark-primary mt-1 mr-4"
                          size={20}
                        />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Role
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {getRoleString() &&
                              getRoleString()
                                .split(', ')
                                .map((role) => (
                                  <span
                                    key={role}
                                    className="text-lg font-medium text-light-text dark:text-dark-text"
                                  >
                                    {role}
                                  </span>
                                ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputField
                        id="firstName"
                        type="text"
                        label="First Name"
                        value={firstName}
                        onChange={(e) =>
                          handleChange('firstName', e.target.value)
                        }
                        validationMessage={errors.firstName}
                        icon={<FaUser className="text-gray-400" />}
                      />
                      <InputField
                        id="lastName"
                        type="text"
                        label="Last Name"
                        value={lastName}
                        onChange={(e) =>
                          handleChange('lastName', e.target.value)
                        }
                        validationMessage={errors.lastName}
                        icon={<FaUser className="text-gray-400" />}
                      />
                    </div>

                    <InputField
                      id="phone"
                      type="tel"
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      validationMessage={errors.phone}
                      icon={<FaPhone className="text-gray-400" />}
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
                      icon={<FaEnvelope className="text-gray-400" />}
                    />

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className={`flex items-center justify-center bg-light-primary dark:bg-dark-primary text-white py-2 px-6 rounded-lg font-semibold text-md hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-md hover:shadow-lg ${
                          isUpdatingProfile || !isFormChanged
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={isUpdatingProfile || !isFormChanged}
                      >
                        <FaSave className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 animate-slideIn">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-light-primary dark:text-dark-primary">
                      Password Management
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPasswordEditMode(!passwordEditMode)}
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-light-primary dark:bg-dark-primary text-white hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
                    >
                      {passwordEditMode ? (
                        <>
                          <FaTimes /> Cancel
                        </>
                      ) : (
                        <>
                          <FaLock /> Change Password
                        </>
                      )}
                    </button>
                  </div>

                  {passwordEditMode ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <InputField
                        id="currentPassword"
                        type="password"
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) =>
                          handleChange('currentPassword', e.target.value)
                        }
                        validationMessage={errors.currentPassword}
                        icon={<FaLock className="text-gray-400" />}
                      />

                      <InputField
                        id="newPassword"
                        type="password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) =>
                          handleChange('newPassword', e.target.value)
                        }
                        validationMessage={errors.newPassword}
                        icon={<FaLock className="text-gray-400" />}
                      />

                      <InputField
                        id="confirmPassword"
                        type="password"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) =>
                          handleChange('confirmPassword', e.target.value)
                        }
                        validationMessage={errors.confirmPassword}
                        icon={<FaLock className="text-gray-400" />}
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className={`flex items-center justify-center bg-light-primary dark:bg-dark-primary text-white py-2 px-6 rounded-lg font-semibold text-md hover:bg-light-secondary dark:hover:bg-dark-secondary active:scale-98 transition-all duration-300 shadow-md hover:shadow-lg ${
                            isUpdatingPassword || !isPasswordFormValid
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          disabled={isUpdatingPassword || !isPasswordFormValid}
                        >
                          <FaLock className="mr-2" />
                          Update Password
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <p>
                        For security reasons, your password is never displayed.
                        Click &apos;Change Password&apos; to update it.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 animate-slideIn">
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">
                    Delete Account
                  </h3>
                  <div className="flex items-start mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className={`flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold text-md active:scale-98 transition-all duration-300 shadow-md hover:shadow-lg ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => setShowModal(true)}
                      disabled={isDeleting}
                    >
                      <FaTrash className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
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

export default ProfileScreen;
