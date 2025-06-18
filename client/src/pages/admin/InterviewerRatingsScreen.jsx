import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaPencilAlt, FaSave, FaStar, FaTimes, FaTrash } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import Table from '../../components/ui/dashboardLayout/Table';
import InputField from '../../components/ui/mainLayout/InputField';

import { trackEvent, trackPageView } from '../../utils/analytics';

import {
  useDeleteRatingMutation,
  useGetAllRatingsQuery,
  useUpdateRatingMutation,
} from '../../features/interviewerRating/interviewerRatingApi';

export default function InterviewerRatingsScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  const [ratingValue, setRatingValue] = useState('');
  const [feedback, setFeedback] = useState('');

  const location = useLocation();

  const { data, isLoading, error, refetch } = useGetAllRatingsQuery();
  const [
    updateRating,
    { isLoading: isUpdating, error: updateError, data: updateData },
  ] = useUpdateRatingMutation();
  const [
    deleteRating,
    { isLoading: isDeleting, error: deleteError, data: deleteData },
  ] = useDeleteRatingMutation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (selectedRating) {
      setRatingValue(selectedRating.rating);
      setFeedback(selectedRating.feedback);
    }
  }, [selectedRating]);

  const handleEdit = (rating) => {
    setSelectedRating(rating);
    setShowEditModal(true);
    trackEvent(
      'Edit Rating',
      'User Action',
      `Clicked edit on rating ${rating.id}`
    );
  };

  const handleDelete = (rating) => {
    setSelectedRating(rating);
    setShowDeleteModal(true);
    trackEvent(
      'Delete Rating',
      'User Action',
      `Clicked delete on rating ${rating.id}`
    );
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
      console.error('Deletion failed:', err);
      trackEvent(
        'Rating Delete Failed',
        'User Action',
        `Failed delete ${selectedRating.id}`
      );
    }
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
      console.error('Update failed:', err);
      trackEvent(
        'Rating Update Failed',
        'User Action',
        `Failed update ${selectedRating.id}`
      );
    }
  };

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
        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
          <FaPencilAlt /> Edit
        </button>
      ),
    },
    {
      onClick: handleDelete,
      render: () => (
        <button className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700">
          <FaTrash /> Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Interviewer Ratings [Admin] - OptaHire | Monitor Interview Quality
        </title>
        <meta
          name="description"
          content="OptaHire Interviewer Ratings - Monitor and manage interviewer performance ratings to maintain high-quality interview standards."
        />
        <meta
          name="keywords"
          content="OptaHire Interviewer Ratings, Interview Quality, Performance Management, Admin Ratings"
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
                Interviewer Ratings
              </span>
            </h1>
            <p className="mb-8 text-center text-lg text-light-text/70 dark:text-dark-text/70">
              Monitor interviewer performance ratings and feedback to maintain
              exceptional interview quality standards.
            </p>

            {(error || updateError || deleteError) && (
              <Alert
                isSuccess={false}
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
              data={data?.interviewerRatings || []}
              actions={actions}
            />
          </div>
        )}
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
            <InputField
              id="ratingValue"
              type="number"
              label="Rating (1-5)"
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
                className="flex items-center gap-2 rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                disabled={isUpdating}
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center gap-2 rounded bg-light-primary px-4 py-2 text-white transition-all duration-200 hover:bg-light-secondary dark:bg-dark-primary dark:hover:bg-dark-secondary"
                disabled={isUpdating}
              >
                <FaSave /> Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Rating Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Rating Deletion"
      >
        {isDeleting ? (
          <Loader />
        ) : (
          <div>
            <p className="mb-6 text-light-text dark:text-dark-text">
              Are you sure you want to delete this rating? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded bg-gray-300 px-4 py-2 text-gray-800 transition-all duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white transition-all duration-200 hover:bg-red-700"
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
