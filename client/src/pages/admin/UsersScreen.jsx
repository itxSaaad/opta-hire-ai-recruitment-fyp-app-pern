import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import ErrorMsg from '../../components/ErrorMsg';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useDeleteUserByIdMutation,
  useGetAllUsersQuery,
  useUpdateUserByIdMutation,
} from '../../features/user/userApi';

export default function UsersScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isTopRated, setIsTopRated] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const location = useLocation();

  const { data: users, isLoading, error, refetch } = useGetAllUsersQuery();
  const [deleteUser, { isLoading: isDeleting, error: deleteError }] =
    useDeleteUserByIdMutation();
  const [updateUser, { isLoading: isUpdating, error: updateError }] =
    useUpdateUserByIdMutation();

  useEffect(() => {
    if (selectedUser) {
      setFirstName(selectedUser.firstName || '');
      setLastName(selectedUser.lastName || '');
      setEmail(selectedUser.email || '');
      setPhone(selectedUser.phone || '');
      setIsVerified(selectedUser.isVerified || false);
      setIsTopRated(selectedUser.isTopRated || false);

      if (selectedUser.isAdmin) setRole('Admin');
      else if (selectedUser.isInterviewer) setRole('Interviewer');
      else if (selectedUser.isRecruiter) setRole('Recruiter');
      else if (selectedUser.isCandidate) setRole('Candidate');
      else setRole('User');
    }
  }, [selectedUser]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    trackEvent('Edit User', 'User Action', 'User clicked on edit button');
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    trackEvent('Delete User', 'User Action', 'User clicked on delete button');
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete User Confirmed',
        'User Action',
        `User confirmed deletion of ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    } catch (err) {
      console.error('Deletion failed:', err);
      trackEvent(
        'Delete User Failed',
        'User Action',
        `User failed to delete ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    }
  };

  const saveUserChanges = async () => {
    try {
      const updatedUserData = {
        id: selectedUser.id,
        firstName,
        lastName,
        email,
        phone,
        role: role.toLowerCase(),
        isVerified,
        isTopRated,
      };

      await updateUser(updatedUserData).unwrap();

      setShowEditModal(false);
      refetch();
      trackEvent(
        'User Updated',
        'User Action',
        `User updated ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'User Update Failed',
        'User Action',
        `User failed to update ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    }
  };

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => {
        if (user.isAdmin) return 'Admin';
        if (user.isInterviewer) return 'Interviewer';
        if (user.isRecruiter) return 'Recruiter';
        if (user.isCandidate) return 'Candidate';
        return 'User';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <div className="flex items-center">
          {user.isVerified && (
            <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              Verified
            </span>
          )}
          {user.isTopRated && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
              Top Rated
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      onClick: handleEdit,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt />
          Edit
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaTrash /> Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Users Management [Admin] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Users Management - Manage users efficiently with our powerful tools and insights."
        />
        <meta
          name="keywords"
          content="OptaHire, Admin Users Management, Recruitment, Management"
        />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        {isLoading ? (
          <div className="w-full max-w-sm sm:max-w-md relative animate-fadeIn">
            <Loader />
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-light-text dark:text-dark-text">
              Users Management
            </h1>

            {error && <ErrorMsg errorMsg={error.data.message} />}

            <Table columns={columns} data={users?.users} actions={actions} />
          </div>
        )}
      </section>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <ErrorMsg errorMsg={updateError.data.message} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="firstName"
                type="text"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <InputField
                id="lastName"
                type="text"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <InputField
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              id="phone"
              type="tel"
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <InputField
              id="role"
              type="select"
              label="Role"
              value={role.toLowerCase()}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'interviewer', label: 'Interviewer' },
                { value: 'recruiter', label: 'Recruiter' },
                { value: 'candidate', label: 'Candidate' },
                { value: 'user', label: 'User' },
              ]}
            />
            <InputField
              id="isVerified"
              type="checkbox"
              label="Verified"
              value="verified"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
            />
            <InputField
              id="isTopRated"
              type="checkbox"
              label="Top Rated"
              value="topRated"
              checked={isTopRated}
              onChange={(e) => setIsTopRated(e.target.checked)}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded transition-all duration-200"
                onClick={saveUserChanges}
                disabled={isUpdating}
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm User Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            {deleteError && <ErrorMsg errorMsg={deleteError.data.message} />}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete user {selectedUser?.firstName}{' '}
              {selectedUser?.lastName}? This action can be undone from the
              trash.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200 flex items-center gap-2"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
