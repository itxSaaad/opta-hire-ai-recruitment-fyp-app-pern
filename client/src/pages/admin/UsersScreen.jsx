import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaFileSignature,
  FaPencilAlt,
  FaSave,
  FaTimes,
  FaTrash,
  FaUndo,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetResumeByUserIdQuery,
  useUpdateResumeByIdMutation,
} from '../../features/resume/resumeApi';
import {
  useDeleteUserByIdMutation,
  useGetAllUsersQuery,
  useUpdateUserByIdMutation,
} from '../../features/user/userApi';

export default function UsersScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isTopRated, setIsTopRated] = useState(false);
  const [showEditResumeModal, setShowEditResumeModal] = useState(false);
  const [selectedUserForResume, setSelectedUserForResume] = useState(null);
  const [resumeId, setResumeId] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeHeadline, setResumeHeadline] = useState('');
  const [resumeSummary, setResumeSummary] = useState('');
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeNewSkill, setResumeNewSkill] = useState('');
  const [lastDeletedSkill, setLastDeletedSkill] = useState(null);
  const [resumeExperience, setResumeExperience] = useState('');
  const [resumeEducation, setResumeEducation] = useState('');
  const [resumeIndustry, setResumeIndustry] = useState('');
  const [resumeAvailability, setResumeAvailability] = useState('Immediate');
  const [resumeCompany, setResumeCompany] = useState('');
  const [resumeAchievements, setResumeAchievements] = useState('');
  const [resumePortfolio, setResumePortfolio] = useState('');

  const location = useLocation();

  const { data: users, isLoading, error, refetch } = useGetAllUsersQuery();

  const [
    updateUser,
    {
      isLoading: isUpdating,
      error: updateError,
      isSuccess: isUpdateSuccess,
      data: updatedUserData,
    },
  ] = useUpdateUserByIdMutation();

  const [
    deleteUser,
    {
      isLoading: isDeleting,
      error: deleteError,
      isSuccess: isDeleteSuccess,
      data: deletedUserData,
    },
  ] = useDeleteUserByIdMutation();

  const {
    data: resumeData,
    isLoading: resumeLoading,
    error: resumeError,
    refetch: resumeRefetch,
  } = useGetResumeByUserIdQuery(selectedUserForResume?.id, {
    skip: !selectedUserForResume,
  });

  const [
    updateResume,
    {
      isLoading: updatingResume,
      error: updateResumeError,
      isSuccess: isResumeUpdateSuccess,
      data: updatedResumeData,
    },
  ] = useUpdateResumeByIdMutation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

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

  useEffect(() => {
    if (resumeData && resumeData.profile) {
      const p = resumeData.profile;
      setResumeId(p.id || '');
      setResumeTitle(p.title || '');
      setResumeHeadline(p.headline || '');
      setResumeSummary(p.summary || '');
      setResumeSkills(p.skills || []);
      setResumeExperience(p.experience || '');
      setResumeEducation(p.education || '');
      setResumeIndustry(p.industry || '');
      setResumeAvailability(p.availability || 'Immediate');
      setResumeCompany(p.company || '');
      setResumeAchievements(p.achievements || '');
      setResumePortfolio(p.portfolio || '');
    }
  }, [resumeData]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    trackEvent('Edit User', 'User Action', 'Admin clicked on edit button');
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    trackEvent('Delete User', 'User Action', 'Admin clicked on delete button');
  };

  const handleEditResume = (user) => {
    setSelectedUserForResume(user);
    setShowEditResumeModal(true);
    trackEvent(
      'Edit Resume',
      'User Action',
      `Admin clicked on edit resume for ${user.firstName} ${user.lastName}`
    );
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete User Confirmed',
        'User Action',
        `Deleted ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    } catch (err) {
      console.error('Deletion failed:', err);
      trackEvent(
        'Delete User Failed',
        'User Action',
        `Failed to delete ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    }
  };

  const handleDeleteSkill = (index) => {
    const deletedSkill = {
      index,
      value: resumeSkills[index],
    };
    setLastDeletedSkill(deletedSkill);
    setResumeSkills(resumeSkills.filter((_, i) => i !== index));
  };

  const handleUndoDelete = () => {
    if (lastDeletedSkill) {
      const updatedSkills = [...resumeSkills];
      updatedSkills.splice(lastDeletedSkill.index, 0, lastDeletedSkill.value);
      setResumeSkills(updatedSkills);
      setLastDeletedSkill(null);
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
        `Updated ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'User Update Failed',
        'User Action',
        `Failed to update ${selectedUser.firstName} ${selectedUser.lastName}`
      );
    }
  };

  const handleSaveResume = async () => {
    try {
      await updateResume({
        id: resumeId,
        title: resumeTitle,
        headline: resumeHeadline,
        summary: resumeSummary,
        skills: resumeSkills,
        experience: resumeExperience,
        education: resumeEducation,
        industry: resumeIndustry,
        availability: resumeAvailability,
        company: resumeCompany,
        achievements: resumeAchievements,
        portfolio: resumePortfolio,
      }).unwrap();

      setShowEditResumeModal(false);
      resumeRefetch();
      trackEvent(
        'Resume Updated',
        'User Action',
        `Admin updated resume for ${selectedUserForResume.firstName} ${selectedUserForResume.lastName}`
      );
    } catch (err) {
      console.error('Failed to update resume:', err);
      trackEvent(
        'Resume Update Failed',
        'User Action',
        `Admin failed to update resume for ${selectedUserForResume.firstName} ${selectedUserForResume.lastName}: ${err.data?.message || err.error || err.message}`
      );
    }
  };

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
            <span className="mr-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Verified
            </span>
          )}
          {user.isTopRated && (
            <span className="mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
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
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt />
          Edit User
        </button>
      ),
    },
    {
      onClick: handleEditResume,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600">
          <FaFileSignature />
          Edit Resume
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
          <FaTrash />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          User Management [Admin] - OptaHire | Manage Platform Users
        </title>
        <meta
          name="description"
          content="OptaHire User Management - Efficiently manage recruiters, candidates, and interviewers. Control user permissions and platform access."
        />
        <meta
          name="keywords"
          content="OptaHire User Management, Admin Users, Recruitment Platform, User Control, Account Management"
        />
      </Helmet>

      <section className="flex min-h-screen animate-fadeIn flex-col items-center bg-light-background px-4 py-24 dark:bg-dark-background">
        {isLoading ? (
          <div className="relative w-full max-w-sm animate-fadeIn sm:max-w-md">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl animate-slideUp">
            <h1 className="mb-6 text-center text-3xl font-bold text-light-text dark:text-dark-text sm:text-4xl md:text-5xl">
              Manage{' '}
              <span className="text-light-primary dark:text-dark-primary">
                Users
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Oversee all platform users including recruiters, candidates, and
              interviewers in one centralized location.
            </p>

            {error && <Alert message={error.data?.message} />}

            {isUpdateSuccess && updatedUserData.data?.message && (
              <Alert
                message={updatedUserData.data?.message}
                isSuccess={isUpdateSuccess}
              />
            )}

            {isDeleteSuccess && deletedUserData.data?.message && (
              <Alert
                message={deletedUserData.data?.message}
                isSuccess={isDeleteSuccess}
              />
            )}

            {isResumeUpdateSuccess && updatedResumeData.data?.message && (
              <Alert
                message={updatedResumeData.data?.message}
                isSuccess={isResumeUpdateSuccess}
              />
            )}

            <Table
              columns={columns}
              data={users?.users || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <Alert message={updateError.data?.message} />}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
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

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm User Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            {deleteError && <Alert message={deleteError.data?.message} />}

            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete user {selectedUser?.firstName}{' '}
              {selectedUser?.lastName}? This action can be undone from the
              trash.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white transition-all duration-200 hover:bg-red-700"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Resume Modal */}
      <Modal
        isOpen={showEditResumeModal}
        onClose={() => setShowEditResumeModal(false)}
        title="Edit User Resume"
      >
        {resumeLoading || updatingResume ? (
          <Loader />
        ) : (
          <div className="space-y-6">
            {resumeError && <Alert message={resumeError.data?.message} />}
            {updateResumeError && (
              <Alert message={updateResumeError.data?.message} />
            )}
            {/* Overview Section */}
            <div className="space-y-4">
              <InputField
                id="resumeTitle"
                type="text"
                label="Title"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
              />
              <InputField
                id="resumeHeadline"
                type="text"
                label="Headline"
                value={resumeHeadline}
                onChange={(e) => setResumeHeadline(e.target.value)}
              />
              <InputField
                id="resumeSummary"
                type="textarea"
                label="Summary"
                value={resumeSummary}
                onChange={(e) => setResumeSummary(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {resumeSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm text-light-text dark:bg-gray-700 dark:text-dark-text"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(index)}
                      className="ml-2"
                    >
                      <FaTimes className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="mt-5 flex-1">
                  <InputField
                    id="resumeNewSkill"
                    type="text"
                    label="Add Skill"
                    value={resumeNewSkill}
                    onChange={(e) => setResumeNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (resumeNewSkill.trim() !== '') {
                          setResumeSkills([
                            ...resumeSkills,
                            resumeNewSkill.trim(),
                          ]);
                          setResumeNewSkill('');
                        }
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (resumeNewSkill.trim() !== '') {
                      setResumeSkills([...resumeSkills, resumeNewSkill.trim()]);
                      setResumeNewSkill('');
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-light-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                >
                  <FaSave />
                  <span className="hidden md:block"> Add</span>
                </button>
                {lastDeletedSkill !== null && (
                  <button
                    type="button"
                    onClick={handleUndoDelete}
                    className="flex items-center gap-1 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-yellow-600"
                  >
                    <FaUndo />
                    <span className="hidden md:block">Undo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Experience & Education Section */}
            <div className="space-y-4">
              <InputField
                id="resumeExperience"
                type="textarea"
                label="Experience"
                value={resumeExperience}
                onChange={(e) => setResumeExperience(e.target.value)}
                rows={4}
              />
              <InputField
                id="resumeEducation"
                type="textarea"
                label="Education"
                value={resumeEducation}
                onChange={(e) => setResumeEducation(e.target.value)}
                rows={4}
              />
            </div>

            {/* Additional Details Section */}
            <div className="space-y-4">
              <InputField
                id="resumeIndustry"
                type="text"
                label="Industry"
                value={resumeIndustry}
                onChange={(e) => setResumeIndustry(e.target.value)}
              />
              <InputField
                id="resumeAvailability"
                type="select"
                label="Availability"
                value={resumeAvailability}
                onChange={(e) => setResumeAvailability(e.target.value)}
                options={[
                  { value: 'Immediate', label: 'Immediate' },
                  { value: 'Two weeks', label: 'Two weeks' },
                  { value: 'One month', label: 'One month' },
                  { value: 'More than a month', label: 'More than a month' },
                  { value: 'Full-Time', label: 'Full-Time' },
                ]}
              />
              <InputField
                id="resumeCompany"
                type="text"
                label="Company"
                value={resumeCompany}
                onChange={(e) => setResumeCompany(e.target.value)}
              />
              <InputField
                id="resumeAchievements"
                type="textarea"
                label="Achievements"
                value={resumeAchievements}
                onChange={(e) => setResumeAchievements(e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-1 gap-4">
                <InputField
                  id="resumePortfolio"
                  type="text"
                  label="Portfolio URL"
                  value={resumePortfolio}
                  onChange={(e) => setResumePortfolio(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSaveResume}
                className="flex items-center gap-2 rounded-lg bg-light-primary px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
              >
                <FaSave />
                Save Resume
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
