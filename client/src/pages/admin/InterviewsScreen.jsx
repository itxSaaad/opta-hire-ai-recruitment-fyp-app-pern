import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useDeleteInterviewMutation,
  useGetAllInterviewsQuery,
  useUpdateInterviewMutation,
} from '../../features/interview/interviewApi';

export default function InterviewsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const [scheduledTime, setScheduledTime] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');

  const routeLocation = useLocation();

  const {
    data: interviewsData,
    isLoading,
    error,
    refetch,
  } = useGetAllInterviewsQuery();

  const [
    updateInterview,
    { isLoading: isUpdating, error: updateError, data: updateData },
  ] = useUpdateInterviewMutation();

  const [
    deleteInterview,
    { isLoading: isDeleting, error: deleteError, data: deleteData },
  ] = useDeleteInterviewMutation();

  useEffect(() => {
    trackPageView(routeLocation.pathname);
  }, [routeLocation.pathname]);

  useEffect(() => {
    if (selectedInterview) {
      setScheduledTime(selectedInterview.scheduledTime || '');
      setSummary(selectedInterview.summary || '');
      setStatus(selectedInterview.status || '');
      setRating(selectedInterview.rating || '');
    }
  }, [selectedInterview]);

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setShowEditModal(true);
    trackEvent(
      'Edit Interview',
      'User Action',
      'User clicked on edit interview button'
    );
  };

  const handleDelete = (interview) => {
    setSelectedInterview(interview);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Interview',
      'User Action',
      'User clicked on delete interview button'
    );
  };

  const confirmDelete = async () => {
    try {
      await deleteInterview(selectedInterview.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Delete Interview Confirmed',
        'User Action',
        `User confirmed deletion of interview ${selectedInterview.id}`
      );
    } catch (err) {
      console.error('Deletion failed:', err);
      trackEvent(
        'Delete Interview Failed',
        'User Action',
        `User failed to delete interview ${selectedInterview.id}`
      );
    }
  };

  const saveInterviewChanges = async () => {
    try {
      await updateInterview({
        id: selectedInterview.id,
        interviewData: {
          scheduledTime,
          summary,
          status,
          rating,
        },
      }).unwrap();
      setShowEditModal(false);
      refetch();
      trackEvent(
        'Update Interview',
        'User Action',
        `User updated interview ${selectedInterview.id}`
      );
    } catch (err) {
      console.error('Update failed:', err);
      trackEvent(
        'Update Interview Failed',
        'User Action',
        `User failed to update interview ${selectedInterview.id}`
      );
    }
  };

  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (interview) => interview.job.title,
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (interview) =>
        `${interview.interviewer.firstName} ${interview.interviewer.lastName}`,
    },
    {
      key: 'candidate',
      label: 'Candidate',
      render: (interview) =>
        `${interview.candidate.firstName} ${interview.candidate.lastName}`,
    },
    {
      key: 'scheduledTime',
      label: 'Scheduled Time',
      render: (interview) => new Date(interview.scheduledTime).toLocaleString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (interview) => (
        <span
          className={`rounded px-2.5 py-0.5 text-xs font-medium ${
            interview.status === 'scheduled'
              ? 'bg-blue-100 text-blue-800'
              : interview.status === 'ongoing'
                ? 'bg-green-100 text-green-800'
                : interview.status === 'completed'
                  ? 'bg-teal-100 text-teal-800'
                  : interview.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
          }`}
        >
          {interview.status.charAt(0).toUpperCase() +
            interview.status.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (interview) => new Date(interview.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      onClick: handleEdit,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt />
          Edit
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
          Interview Management [Admin] - OptaHire | Monitor All Interviews
        </title>
        <meta
          name="description"
          content="OptaHire Interview Management - Track all scheduled interviews, monitor progress, and ensure quality interview experiences."
        />
        <meta
          name="keywords"
          content="OptaHire Interview Management, Admin Interviews, Interview Tracking, Recruitment Interviews"
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
                Interviews
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Oversee all interviews across the platform and ensure high-quality
              interview experiences for all participants.
            </p>

            {(error || updateError || deleteError) && (
              <Alert
                message={
                  error?.data?.message ||
                  updateError?.data?.message ||
                  deleteError?.data?.message
                }
              />
            )}

            {(!updateData?.success && updateData?.message) ||
            (!deleteData?.success && deleteData?.message) ? (
              <Alert
                message={updateData?.message || deleteData?.message}
                isSuccess={false}
              />
            ) : null}

            {updateData?.message && updateData.success && (
              <Alert
                message={updateData?.message}
                isSuccess={updateData?.success}
              />
            )}

            {deleteData?.message && deleteData?.success && (
              <Alert
                message={deleteData?.message}
                isSuccess={deleteData?.success}
              />
            )}

            <Table
              columns={columns}
              data={interviewsData?.interviews || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Interview"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            <InputField
              id="scheduledTime"
              type="datetime-local"
              label="Scheduled Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <InputField
              id="status"
              type="select"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <InputField
              id="rating"
              type="number"
              label="Rating (0-5)"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              min="0"
              max="5"
              step="0.1"
              placeholder="Enter rating from 0 to 5"
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
                onClick={saveInterviewChanges}
                disabled={isUpdating}
              >
                <FaSave />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Interview Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this interview? This action cannot
              be undone.
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
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
