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
  useGetAllInterviewsQuery,
  useUpdateInterviewMutation,
  useDeleteInterviewMutation,
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
  const [updateInterview, { isLoading: isUpdating, error: updateError }] =
    useUpdateInterviewMutation();
  const [deleteInterview, { isLoading: isDeleting, error: deleteError }] =
    useDeleteInterviewMutation();

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
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
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
          {interview.status}
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
          <FaTrash />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Interviews Management [Admin] - OptaHire</title>
        <meta
          name="description"
          content="OptaHire Admin Interviews Management - Manage and monitor interviews efficiently."
        />
        <meta
          name="keywords"
          content="OptaHire, Interviews, Recruitment, Administration"
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
              Interviews Management
            </h1>

            {error && <ErrorMsg errorMsg={error.data.message} />}

            <Table
              columns={columns}
              data={interviewsData?.interviews || []}
              actions={actions}
            />
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Interview"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && <ErrorMsg errorMsg={updateError.data.message} />}
            <InputField
              id="scheduledTime"
              type="datetime-local"
              label="Scheduled Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <InputField
              id="summary"
              type="textarea"
              label="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
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
              placeholder="Enter rating"
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
            {deleteError && <ErrorMsg errorMsg={deleteError.data.message} />}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this interview? This action cannot
              be undone.
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
