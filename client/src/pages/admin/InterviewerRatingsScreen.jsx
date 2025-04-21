import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaStar, FaPencilAlt, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useGetAllRatingsQuery,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
} from '../../features/interviewerRating/interviewerRatingApi';

export default function InterviewerRatingsScreen() {
  const location = useLocation();

  // Fetch all ratings
  const { data, isLoading, error, refetch } = useGetAllRatingsQuery();
  const [updateRating, { isLoading: isUpdating, error: updateError }] =
    useUpdateRatingMutation();
  const [deleteRating, { isLoading: isDeleting, error: deleteError }] =
    useDeleteRatingMutation();

  // Modal & selection state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  // Form fields
  const [ratingValue, setRatingValue] = useState('');
  const [feedback, setFeedback] = useState('');

  // Track page view
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // When a rating is selected for edit
  useEffect(() => {
    if (selectedRating) {
      setRatingValue(selectedRating.rating);
      setFeedback(selectedRating.feedback);
    }
  }, [selectedRating]);

  const handleEdit = (r) => {
    setSelectedRating(r);
    setShowEditModal(true);
    trackEvent('Edit Rating', 'User Action', `Clicked edit on rating ${r.id}`);
  };

  const handleDelete = (r) => {
    setSelectedRating(r);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Rating',
      'User Action',
      `Clicked delete on rating ${r.id}`
    );
  };

  const saveChanges = async () => {
    try {
      await updateRating({
        id: selectedRating.id,
        ratingData: { rating: ratingValue, feedback },
      }).unwrap();
      setShowEditModal(false);
      refetch();
      trackEvent(
        'Rating Updated',
        'User Action',
        `Updated rating ${selectedRating.id}`
      );
    } catch (err) {
      console.error(err);
      trackEvent(
        'Rating Update Failed',
        'User Action',
        `Failed update ${selectedRating.id}`
      );
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteRating(selectedRating.id).unwrap();
      setShowDeleteModal(false);
      refetch();
      trackEvent(
        'Rating Deleted',
        'User Action',
        `Deleted rating ${selectedRating.id}`
      );
    } catch (err) {
      console.error(err);
      trackEvent(
        'Rating Delete Failed',
        'User Action',
        `Failed delete ${selectedRating.id}`
      );
    }
  };

  // Table column definitions
  const columns = [
    { key: 'id', label: 'Rating ID' },
    {
      key: 'interviewer',
      label: 'Interviewer',
      render: (r) => `${r.interviewer.firstName} ${r.interviewer.lastName}`,
    },
    {
      key: 'recruiter',
      label: 'Recruiter',
      render: (r) => `${r.recruiter.firstName} ${r.recruiter.lastName}`,
    },
    {
      key: 'job',
      label: 'Job',
      render: (r) => r.job.title,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-1">
          <FaStar className="text-yellow-500" /> {r.rating}/5
        </span>
      ),
    },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (r) => (
        <span className="text-light-text/80 dark:text-dark-text/80">
          {r.feedback}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      onClick: handleEdit,
      render: () => (
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <FaPencilAlt /> Edit
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
        <title>Interviewer Ratings [Admin] - OptaHire</title>
        <meta
          name="description"
          content="Manage interviewer ratings in your OptaHire dashboard."
        />
        <meta name="keywords" content="OptaHire, Ratings, Admin" />
      </Helmet>

      <section className="min-h-screen flex flex-col items-center py-24 px-4 bg-light-background dark:bg-dark-background animate-fadeIn">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-light-text dark:text-dark-text">
            Interviewer Ratings
          </h1>

          {isLoading ? (
            <div className="w-full max-w-sm mx-auto">
              <Loader />
            </div>
          ) : error ? (
            <Alert
              isSuccess={false}
              message={error.data?.message || 'Failed to load ratings'}
            />
          ) : (
            <Table
              columns={columns}
              data={data?.interviewerRatings || []}
              actions={actions}
            />
          )}
        </div>
      </section>

      {/* Edit Rating Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Interviewer Rating"
      >
        {isUpdating ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {updateError && (
              <Alert
                isSuccess={false}
                message={updateError.data?.message || 'Failed to update rating'}
              />
            )}
            <InputField
              id="ratingValue"
              type="number"
              label="Rating (1–5)"
              min="1"
              max="5"
              step="0.1"
              value={ratingValue}
              onChange={(e) => setRatingValue(e.target.value)}
            />
            <InputField
              id="feedback"
              type="textarea"
              label="Feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-secondary dark:hover:bg-dark-secondary transition"
              >
                <FaSave /> Save
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Rating Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            {deleteError && (
              <Alert
                isSuccess={false}
                message={deleteError.data?.message || 'Failed to delete rating'}
              />
            )}
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete rating “{selectedRating?.id}”?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2 transition"
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
