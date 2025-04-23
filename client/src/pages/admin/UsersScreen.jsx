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

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

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
      onClick: handleEditResume,
      render: () => (
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaFileSignature />
          Resume
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaTrash />
          Delete
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
          content="OptaHire Admin - Manage users and their resumes effectively."
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
                    className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-light-text dark:text-dark-text"
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
                <div className="flex-1 mt-5">
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
                  className="px-4 py-2 bg-light-primary dark:bg-dark-primary hover:bg-light-secondary dark:hover:bg-dark-secondary text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
                >
                  <FaSave />
                  <span className="hidden md:block text-sm "> Add</span>
                </button>
                {lastDeletedSkill !== null && (
                  <button
                    type="button"
                    onClick={handleUndoDelete}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-1"
                  >
                    <FaUndo />
                    <span className="hidden md:block text-sm ">Undo</span>
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
                className="flex items-center gap-2 bg-light-primary dark:bg-dark-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-300"
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
